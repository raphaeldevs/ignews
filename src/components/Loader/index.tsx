import { createPortal } from 'react-dom'

import { useSession } from 'next-auth/react'

import styles from './styles.module.scss'
import { useEffect, useState } from 'react'

type LoaderProps = {
  isLoading?: boolean
  sessionLoading?: boolean
}

function Loader({ isLoading = false, sessionLoading = false }: LoaderProps) {
  const [componentIsMounted, setComponentIsMounted] = useState(false)

  const { status } = useSession()

  const statusLoading = status === 'loading'

  useEffect(() => {
    setComponentIsMounted(true)

    return () => setComponentIsMounted(false)
  }, [])

  return componentIsMounted && ((sessionLoading && statusLoading) || isLoading)
    ? createPortal(
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
        </div>,
        document.getElementById('modal-root')
      )
    : null
}

export default Loader
