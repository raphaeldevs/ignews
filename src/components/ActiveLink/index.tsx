import { cloneElement, ReactElement } from 'react'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'

interface ActiveLinkProps extends LinkProps {
  children: ReactElement
  activeClassName: string
}

export function ActiveLink({
  activeClassName,
  children,
  ...rest
}: ActiveLinkProps) {
  const { pathname } = useRouter()

  const className = pathname === rest.href ? activeClassName : ''

  return <Link {...rest}>{cloneElement(children, { className })}</Link>
}
