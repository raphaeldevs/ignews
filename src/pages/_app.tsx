import { AppProps } from 'next/app'

import { SessionProvider } from 'next-auth/react'

import Loader from '../components/Loader'
import Header from '../components/Header'

import '../styles/global.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Loader sessionLoading />
      <Header />
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
