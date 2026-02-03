import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import '../styles/gradual-blur.css'
import '../styles/card-swap.css'
import '../styles/profile-card.css'
import '../styles/dither.css'

export default function App({ Component, pageProps }: AppProps) {
  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const trimmedBasePath = rawBasePath.replace(/^\/+/, '').replace(/\/+$/, '')
  const basePath = trimmedBasePath ? `/${trimmedBasePath}` : ''
  const fontUrl = `${basePath}/fonts/HandmadeAlphabet.otf`

  return (
    <>
      <Head>
        <style>{`
          @font-face {
            font-family: 'HandmadeAlphabet';
            src: url('${fontUrl}') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
