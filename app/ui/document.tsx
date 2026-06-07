import type { Handle, RemixNode } from 'remix/ui'
import { css } from 'remix/ui'

export interface DocumentProps {
  children?: RemixNode
  head?: RemixNode
  title?: string
}

const DEFAULT_TITLE = readAppDisplayName('My%20Remix%20App')

// Dev: Vite serves the unbundled entry. Prod: the built bundle from vite build.
const CLIENT_ENTRY_SRC = import.meta.env.DEV ? '/client.ts' : '/assets/client.js'

export function Document(handle: Handle<DocumentProps>) {
  return () => {
    let { children, head, title = DEFAULT_TITLE } = handle.props

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <title>{title}</title>
          {head}
        </head>
        <body mix={css({ margin: 0 })}>
          {children}
          <script type="module" src={CLIENT_ENTRY_SRC}></script>
        </body>
      </html>
    )
  }
}

function readAppDisplayName(value: string): string {
  return value.startsWith('%%') ? 'Remix App' : decodeURIComponent(value)
}
