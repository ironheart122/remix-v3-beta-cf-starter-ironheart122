import { createAction } from 'remix/fetch-router'

import { routes } from '../routes.ts'
import { AboutPage } from '../ui/about-page.tsx'
import { render } from '../utils/render.tsx'

export const about = createAction(routes.about, {
  handler({ request }) {
    return render(<AboutPage />, request)
  },
})
