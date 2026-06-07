import { css } from 'remix/ui'

import { routes } from '../routes.ts'
import { Document } from './document.tsx'

const FONT_STACK =
  "'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace"

export function AboutPage() {
  return () => (
    <Document title="About — My Remix App">
      <main mix={pageStyle}>
        <section mix={cardStyle}>
          <h1 mix={css({ margin: 0, fontSize: '28px', letterSpacing: '-0.01em' })}>About</h1>
          <p mix={css({ margin: 0, color: 'var(--text-tertiary)', maxWidth: '40ch' })}>
            This page is served by its own controller (<code>app/controllers/about.tsx</code>),
            mapped to the <code>about</code> route. It shares the same streaming SSR pipeline as the
            home page — each route just gets its own <code>createAction</code> and its own{' '}
            <code>router.map()</code> call.
          </p>
          <a href={routes.home.href()} mix={linkStyle}>
            ← Back home
          </a>
        </section>
      </main>
    </Document>
  )
}

const pageStyle = css({
  '--surface-0': '#dee2e6',
  '--surface-4': '#f7fbff',
  '--text-primary': '#313539',
  '--text-tertiary': '#94989c',
  '--brand-blue': '#2dacf9',
  '@media (prefers-color-scheme: dark)': {
    '--surface-0': '#1e2226',
    '--surface-4': '#363a3e',
    '--text-primary': '#dee2e6',
  },
  '& *, & *::before, & *::after': { boxSizing: 'border-box' },
  margin: 0,
  padding: '48px 24px',
  minHeight: '100vh',
  background: 'var(--surface-0)',
  color: 'var(--text-primary)',
  fontFamily: FONT_STACK,
  fontSize: '14px',
  lineHeight: 1.6,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const cardStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '40px',
  borderRadius: '16px',
  background: 'var(--surface-4)',
  maxWidth: '520px',
})

const linkStyle = css({
  color: 'var(--brand-blue)',
  textDecoration: 'none',
  fontSize: '14px',
  width: 'fit-content',
  '&:hover, &:focus-visible': { textDecoration: 'underline', outline: 'none' },
})
