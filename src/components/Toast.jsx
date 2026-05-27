import './Toast.css'

/**
 * Brief bottom inset notice (controlled by App).
 *
 * @param {{ message: string, variant?: 'success' | 'error' | 'info', onDismiss: () => void }} props
 */
export function Toast({ message, variant = 'info', onDismiss }) {
  return (
    <div
      className={`toast toast--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
    >
      <p className="toast__body">{message}</p>
      <button type="button" className="toast__close" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  )
}
