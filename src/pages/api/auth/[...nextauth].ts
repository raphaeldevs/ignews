import { query as q } from 'faunadb'

import NextAuth from 'next-auth'

import GithubProvider from 'next-auth/providers/github'

import { fauna } from '../../../services/faunadb'
import { github } from '../../../services/github'

interface GitHubUserEmail {
  primary: boolean
  email: string
}

async function getUserEmail(accessToken: string) {
  try {
    console.log(`Trying to get user email from GitHub`, accessToken)

    const response = await github.get('user/emails', {
      headers: {
        Authorization: `token ${accessToken}`
      }
    })

    const { email } = response.data.find(
      (email: GitHubUserEmail) => email.primary
    )

    console.log(`Found user email`, email)

    return email
  } catch (error) {
    console.error(`Error getting user email from GitHub`, error)
    return null
  }
}

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user,user:email'
        }
      }
    })
  ],
  secret: process.env.JWT_SIGNING_PRIVATE_KEY,
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }

      return token
    },
    async session({ session, user, token }) {
      session.accessToken = token.accessToken
      
      try {
        if (!session.user.email) {
          const email = await getUserEmail(user.accessToken as string)

          if (!email) {
            throw new Error('No email found')
          }

          session.user.email = email
        }

        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index('subscription_by_status'), 'active')
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch (error) {
        if (error?.requestResult?.statusCode !== 404) {
          console.error('Error in session callback :(', error)
        }

        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn({ user, account }) {
      console.log('signIn')

      const email =
        user.email ?? (await getUserEmail(account.accessToken as string))

      if (!email) {
        throw new Error('No email found')
      }

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index('user_by_email'), q.Casefold(email))
                )
            ),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(email)
              )
            )
          )
        )

        console.log('User created or found', email)

        return true
      } catch (error) {
        console.error('Error in signIn callback :(', error)

        return '/?error=true'
      }
    }
  }
})
