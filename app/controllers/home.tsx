import { createAction } from 'remix/fetch-router'

import { routes } from '../routes.ts'
import { HomePage } from '../ui/scaffold-home-page.tsx'
import { render } from '../utils/render.tsx'

export const home = createAction(routes.home, {
  handler({ request }) {
    return render(<HomePage />, request)
  },
})
