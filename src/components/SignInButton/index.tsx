import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'

import styles from './styles.module.scss'

export default function SignInButton() {
  const isUserLoggedIn = true

  return isUserLoggedIn ? (
    <button type="button" className={styles.signInButton}>
      <FaGithub color='#EBA417'/>
      raphaeldevs
      <FiX color="#737373" className={styles.closeButton} />
    </button>
  ) : (
    <button type="button" className={styles.signInButton}>
      <FaGithub color='#EBA417'/>
      Sign In with GitHub
    </button>
  )
}