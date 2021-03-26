import { NextApiRequest, NextApiResponse } from 'next'

import { getSession } from 'next-auth/client'

import { stripe } from '../../services/stripe'

import { query as q } from 'faunadb'
import { fauna } from '../../services/faunadb'

type User = {
  ref: {
    id: string
  },
  data: {
    stripe_customer_id: string
  }
}

export default async (request: NextApiRequest, response: NextApiResponse) => {
  if (request.method === 'POST') {
    const session = await getSession({ req: request })

    const user = await fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('user_by_email'), 
          q.Casefold(session.user.email)
        )
      )
    )

    let customerId = user.data.stripe_customer_id

    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: session.user.email
        // metadata
      })

      await fauna.query(
        q.Update(q.Ref(q.Collection('users'), user.ref.id), {
          data: {
            stripe_customer_id: stripeCustomer.id
          }
        })
      )

      customerId = stripeCustomer.id
    }

    const success_url = process.env.NODE_ENV === 'development' 
      ? process.env.STRIPE_SUCCESS_URL
      : `${process.env.NEXT_PUBLIC_VERCEL_URL}/posts`

    const cancel_url = process.env.NODE_ENV === 'development' 
      ? process.env.STRIPE_CANCEL_URL
      : `${process.env.NEXT_PUBLIC_VERCEL_URL}`

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      billing_address_collection: 'required',
      line_items: [{ price: process.env.STRIPE_SUBSCRIPTION_PRICEID, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url,
      cancel_url
    })

    return response.status(200).json({ sessionId: stripeCheckoutSession.id })
  } else {
    response.setHeader('Allow', 'POST')
    response.status(405).end('Methot not allowed')
  }
}
