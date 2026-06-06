import { useEffect, useState } from 'react'

import blueLogo from '../../assets/blueLogo.png'

export function MobileGate({ children }) {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 901px)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(min-width: 901px)')
    const onChange = (event) => setIsDesktop(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  if (!isDesktop) {
    return (
      <div className="dashboard-mobile-gate">
        <img src={blueLogo} alt="WWISE" className="dashboard-mobile-gate__logo" />
        <h1>Desktop access required</h1>
        <p>
          The admin analytics dashboard is designed for laptop and desktop screens.
          Please open this page on a larger device to view event analytics.
        </p>
      </div>
    )
  }

  return children
}
