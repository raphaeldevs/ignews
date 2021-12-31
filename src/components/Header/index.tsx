import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import { ActiveLink } from '../ActiveLink'
import SignInButton from '../SignInButton'

import styles from './styles.module.scss'

export default function Header() {
  const { data: session } = useSession()

  const { success } = useRouter().query

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="ig.news" />
        {session?.activeSubscription && (
          <span data-animation={success}>🏅</span>
        )}

        <nav>
          {!session?.activeSubscription && (
            <ActiveLink href="/" activeClassName={styles.active}>
              <a>Home</a>
            </ActiveLink>
          )}

          <ActiveLink href="/posts" activeClassName={styles.active}>
            <a>Posts</a>
          </ActiveLink>
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}
