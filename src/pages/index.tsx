import { GetStaticProps } from 'next'
import Head from 'next/head'

import SubscribeButton from '../components/SubscribeButton'

import { stripe } from '../services/stripe'

import styles from '../styles/home.module.scss'

interface HomeProps {
  product: {
    amount: number
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>

      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👋 Hey, welcome!</span>
          <h1>
            News about the <span>React</span> world.
          </h1>
          <p>
            Get acess to all publications <br />
            <span>for {product.amount} month</span>
          </p>

          <SubscribeButton />
        </section>

        <img src="/images/avatar.svg" alt="girl coding" />
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const price = await stripe.prices.retrieve(
    process.env.STRIPE_SUBSCRIPTION_PRICEID
  )

  const product = {
    amount: new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency'
    }).format(price.unit_amount / 100)
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24 // 24 hours
  }
}
