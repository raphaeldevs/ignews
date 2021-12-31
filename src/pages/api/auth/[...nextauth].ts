import { query as q } from 'faunadb'

import NextAuth, { User } from 'next-auth'

import Providers from 'next-auth/providers'

import { fauna } from '../../../services/faunadb'
import { github } from '../../../services/github'

interface GitHubUserEmail {
  primary: boolean
  email: string
}

interface UserSession extends User {
  accessToken: string
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
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user,user:email'
    })
  ],
  session: {
    jwt: true
  },
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY
  },
  callbacks: {
    async jwt(token, user, account) {
      try {
        if (account) {
          token.accessToken = account.accessToken
        }
  
        return token
      } catch (error) {
        console.error(`Error creating JWT`, error)
      }
    },
    async session(session, user: UserSession) {
      try {
        if (!session.user.email) {
          const email = await getUserEmail(user.accessToken)
          
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
        console.error('Error in session callback :(', error)

        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn(user, account, profile) {
      console.log('signIn')
      
      const email = user.email ?? (await getUserEmail(account.accessToken))

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

        return false
      }
    }
  }
})
