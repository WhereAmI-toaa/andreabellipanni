import dynamic from 'next/dynamic'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/router'
import GradualBlur from '../components/GradualBlur'
import CardSwap, { Card } from '../components/CardSwap'
import styles from '../styles/HomePage.module.css'

const Lanyard = dynamic(() => import('../components/Lanyard'), { ssr: false })
const Dither = dynamic(() => import('../components/Dither'), { ssr: false })
export default function Home() {
  const router = useRouter()
  const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const trimmedBasePath = rawBasePath.replace(/^\/+/, '').replace(/\/+$/, '')
  const basePath = trimmedBasePath ? `/${trimmedBasePath}` : ''
  const calloutStyle = {
    '--callout-arrow': `url(${basePath}/images/hand-arrow.png)`
  } as CSSProperties
  const clarusImage = `${basePath}/images/clarus.png`

  return (
    <main className={styles.page}>
      <div className={styles.ditherBackground}>
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>
      <div className={styles.heroCallout} aria-hidden="true" style={calloutStyle}>
        <span className={styles.heroCalloutText}>Click me</span>
        <span className={styles.heroCalloutArrow} />
      </div>
      <section className={styles.hero}>
        <Lanyard position={[0, 0, 24]} gravity={[0, -40, 0]} onSelect={() => router.push('/profile')} />
        <p className={styles.heroHint}>Scroll Down.</p>
      </section>

      <section className={styles.cardSwapSection}>
        <div className={styles.cardSwapCopy}>
          <h2 className={styles.cardSwapTitle}>Projects I&apos;ve worked on</h2>
          <p className={styles.cardSwapSubtitle}>Just one click away</p>
        </div>
        <div className={styles.cardSwapStage}>
          <CardSwap
            width={1020}
            height={560}
            cardDistance={70}
            verticalDistance={60}
            delay={5200}
            pauseOnHover={true}
            skewAmount={0}
          >
            <Card customClass={styles.swapCardShell}>
              <div className={styles.swapCardTools}>
                <span className={`${styles.swapCardCircle} ${styles.swapCardRed}`} />
                <span className={`${styles.swapCardCircle} ${styles.swapCardYellow}`} />
                <span className={`${styles.swapCardCircle} ${styles.swapCardGreen}`} />
              </div>
              <div className={styles.swapCardContentArea}>
                <div
                  className={styles.swapCardScreenshot}
                  style={{ backgroundImage: `url(${clarusImage})` }}
                />
              </div>
            </Card>
            <Card customClass={styles.swapCardShell}>
              <div className={styles.swapCardTools}>
                <span className={`${styles.swapCardCircle} ${styles.swapCardRed}`} />
                <span className={`${styles.swapCardCircle} ${styles.swapCardYellow}`} />
                <span className={`${styles.swapCardCircle} ${styles.swapCardGreen}`} />
              </div>
              <div className={styles.swapCardContentArea}>
                <div className={styles.swapCardArt} />
              </div>
            </Card>
            <Card customClass={styles.swapCardShell}>
              <div className={styles.swapCardTools}>
                <span className={`${styles.swapCardCircle} ${styles.swapCardRed}`} />
                <span className={`${styles.swapCardCircle} ${styles.swapCardYellow}`} />
                <span className={`${styles.swapCardCircle} ${styles.swapCardGreen}`} />
              </div>
              <div className={styles.swapCardContentArea}>
                <div className={styles.swapCardArtAlt} />
              </div>
            </Card>
          </CardSwap>
        </div>
        <GradualBlur
          target="page"
          position="bottom"
          height="9rem"
          strength={3}
          divCount={10}
          curve="ease-in-out"
          exponential
          opacity={1}
          zIndex={1}
        />
      </section>
    </main>
  )
}
