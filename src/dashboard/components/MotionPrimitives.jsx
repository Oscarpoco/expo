import { motion } from 'framer-motion'

import { useDashMotion } from '../motion/index.js'

/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function MotionPage({ className, children }) {
  const { page } = useDashMotion()

  return (
    <motion.div className={className} {...page}>
      {children}
    </motion.div>
  )
}

/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function MotionHero({ className, children }) {
  const { hero } = useDashMotion()

  return (
    <motion.section className={className} variants={hero.variants}>
      {children}
    </motion.section>
  )
}

/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function MotionSection({ className, children }) {
  const { section } = useDashMotion()

  return (
    <motion.section className={className} variants={section.variants}>
      {children}
    </motion.section>
  )
}

/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function MotionPanel({ className, children }) {
  const { panel } = useDashMotion()

  return (
    <motion.article className={className} variants={panel.variants}>
      {children}
    </motion.article>
  )
}

/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function MotionGrid({ className, children }) {
  const { grid } = useDashMotion()

  return (
    <motion.div className={className} variants={grid.variants}>
      {children}
    </motion.div>
  )
}

/**
 * @param {{ className?: string, children: import('react').ReactNode }} props
 */
export function MotionItem({ className, children }) {
  const { item } = useDashMotion()

  return (
    <motion.div className={className} variants={item.variants}>
      {children}
    </motion.div>
  )
}

/**
 * @param {{ className?: string, children: import('react').ReactNode } & Record<string, unknown>} props
 */
export function MotionFade({ className, children, ...rest }) {
  const { fade } = useDashMotion()

  return (
    <motion.div className={className} variants={fade.variants} {...rest}>
      {children}
    </motion.div>
  )
}
