import { useMemo } from 'react'

import { getEventDayStatus } from '../utils/eventDay.js'

import './EventDayBadge.css'

const STATUS_LINES = {
  'not-started': ['Event', "hasn't", 'started'],
  ended: ['Event', 'has', 'ended'],
}

export function EventDayBadge() {
  const status = useMemo(() => getEventDayStatus(), [])

  if (status.type === 'active') {
    return (
      <div className="event-day-badge" aria-label={`Event day ${status.day}`}>
        <div className="event-day-badge__circle-wrap">
          <span className="event-day-badge__pulse" aria-hidden />
          <div className="event-day-badge__circle">
            <span className="event-day-badge__label">Day</span>
            <span className="event-day-badge__number">{status.day}</span>
          </div>
        </div>
      </div>
    )
  }

  const messageLines = STATUS_LINES[status.type]
  const message = messageLines.join(' ')

  return (
    <div className="event-day-badge event-day-badge--status" aria-label={message}>
      <p className="event-day-badge__message">
        {messageLines.map((line, index) => (
          <span key={`${line}-${index}`} className="event-day-badge__message-line">
            {line}
          </span>
        ))}
      </p>
      <div className="event-day-badge__circle-wrap">
        <span className="event-day-badge__pulse" aria-hidden />
        <div className="event-day-badge__circle event-day-badge__circle--idle" aria-hidden />
      </div>
    </div>
  )
}
