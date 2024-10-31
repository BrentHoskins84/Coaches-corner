import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

declare module 'next' {
  type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP>
}

declare module 'next/app' {
  type AppPropsWithLayout<P = {}> = AppProps<P>
}
