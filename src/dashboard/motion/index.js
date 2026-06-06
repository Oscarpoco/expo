import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

/** @type {import('framer-motion').Easing} */
export const DASH_EASE = [0.22, 1, 0.36, 1]

export const DASH_DURATION = {
  fast: 0.15,
  tab: 0.18,
  base: 0.24,
  hero: 0.26,
}

export const DASH_STAGGER = {
  page: 0.055,
  grid: 0.045,
}

/**
 * Shared motion tokens + variant factories for the admin dashboard.
 * Respects prefers-reduced-motion via Framer's useReducedMotion.
 */
export function useDashMotion() {
  const reduced = useReducedMotion() ?? false

  return useMemo(() => {
    const transition = (duration = DASH_DURATION.base, delay = 0) =>
      reduced ? { duration: 0, delay: 0 } : { duration, delay, ease: DASH_EASE }

    const fadeY = (distance = 12) =>
      reduced
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: distance }

    const tabExit = {
      opacity: reduced ? 1 : 0,
      transition: transition(DASH_DURATION.fast),
    }

    const menu = {
      initial: reduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: reduced ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -6, scale: 0.98 },
      transition: transition(DASH_DURATION.tab),
    }

    const loginCard = {
      initial: reduced
        ? { opacity: 1, y: 0, scale: 1 }
        : { opacity: 0, y: 10, scale: 0.994 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: transition(DASH_DURATION.hero),
    }

    const page = {
      variants: {
        hidden: { opacity: reduced ? 1 : 0 },
        show: {
          opacity: 1,
          transition: {
            ...transition(DASH_DURATION.tab),
            staggerChildren: reduced ? 0 : DASH_STAGGER.page,
            delayChildren: reduced ? 0 : 0.03,
          },
        },
      },
      initial: 'hidden',
      animate: 'show',
    }

    const hero = {
      variants: {
        hidden: fadeY(12),
        show: {
          opacity: 1,
          y: 0,
          transition: transition(DASH_DURATION.hero),
        },
      },
    }

    const section = {
      variants: {
        hidden: fadeY(10),
        show: {
          opacity: 1,
          y: 0,
          transition: transition(DASH_DURATION.base),
        },
      },
    }

    const panel = {
      variants: {
        hidden: fadeY(10),
        show: {
          opacity: 1,
          y: 0,
          transition: transition(DASH_DURATION.base),
        },
      },
    }

    const grid = {
      variants: {
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduced ? 0 : DASH_STAGGER.grid,
            delayChildren: reduced ? 0 : 0.02,
          },
        },
      },
    }

    const item = {
      variants: {
        hidden: fadeY(10),
        show: {
          opacity: 1,
          y: 0,
          transition: transition(DASH_DURATION.base),
        },
      },
    }

    const fade = {
      variants: {
        hidden: { opacity: reduced ? 1 : 0 },
        show: {
          opacity: 1,
          transition: transition(DASH_DURATION.base, 0.04),
        },
      },
    }

    return {
      reduced,
      transition,
      tabExit,
      menu,
      loginCard,
      page,
      hero,
      section,
      panel,
      grid,
      item,
      fade,
    }
  }, [reduced])
}
