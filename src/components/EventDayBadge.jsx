import { useMemo } from 'react'

import { getEventDayStatus } from '../utils/eventDay.js'

import './EventDayBadge.css'

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

  const message =
    status.type === 'not-started'
      ? "Event hasn't started"
      : 'Event has ended'

  return (
    <div className="event-day-badge event-day-badge--status" aria-label={message}>
      <div className="event-day-badge__circle-wrap">
        <span className="event-day-badge__pulse" aria-hidden />
        <div className="event-day-badge__circle event-day-badge__circle--idle" aria-hidden />
      </div>
      <p className="event-day-badge__message">{message}</p>
    </div>
  )
}
