import { loadStripe } from '@stripe/stripe-js'

export function getStripeJs() {
  const stripeJs = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

  return stripeJs
}