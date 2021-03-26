import NextAuth, { User } from 'next-auth'
import Providers from 'next-auth/providers'

import { query as q } from 'faunadb'
import { fauna } from '../../../services/faunadb'

import { github } from '../../../services/github'

interface GitHubUserEmail {
  primary: boolean
  email: string
}

interface UserSession extends User {
  accessToken: string
}

export async function getUserEmail(accessToken: string) {
  const response = await github.get('user/emails', {
    headers: {
      Authorization: `token ${accessToken}`
    }
  })
  
  const { email } = response.data.find(
    (email: GitHubUserEmail) => email.primary
  )

  return email
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
      if (account) {
        token.accessToken = account.accessToken
      }

      return token
    },
    async session(session, user: UserSession) {
      if (!session.user.email) {
        session.user.email = await getUserEmail(user.accessToken)
      }

      try {
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
              q.Match(
                q.Index('subscription_by_status'), 
                'active'
              )
            ])
          )
        )
        
        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }

    },
    async signIn(user, account, profile) {
      const email = user.email ?? await getUserEmail(account.accessToken)
      
      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(q.Index('user_by_email'), q.Casefold(email))
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

        return true
      } catch (error) {
        console.error(error)

        return false
      }
    }
  }
})
