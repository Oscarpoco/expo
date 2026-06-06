import { Fragment } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const CHART_BLUE = '#2b7fd4'
const CHART_NAVY = '#1f5fa8'
const CHART_SKY = '#5bbce4'
const CHART_COLORS = [CHART_BLUE, CHART_SKY, CHART_NAVY, '#94a3b8', '#64748b']
const CHART_HEIGHT = 280
const CHART_HEIGHT_TALL = Math.round(CHART_HEIGHT * 1.5)

const AXIS_TICK = { fontSize: 11, fill: '#64748b' }
const GRID_STROKE = '#e8edf3'

function ChartEmpty({ message }) {
  return (
    <div className="charts-empty">
      <p>{message}</p>
    </div>
  )
}

/** @param {import('recharts').TooltipProps<number, string>} props */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="charts-tooltip">
      {label ? <p className="charts-tooltip__label">{label}</p> : null}
      <ul className="charts-tooltip__list">
        {payload.map((entry) => (
          <li key={entry.name} style={{ '--swatch': entry.color || entry.fill }}>
            <span className="charts-tooltip__swatch" aria-hidden />
            <span className="charts-tooltip__name">{entry.name}</span>
            <strong className="charts-tooltip__value">{entry.value?.toLocaleString?.() ?? entry.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DailyActivityChart({ data, height = 280 }) {
  if (!data?.length) {
    return <ChartEmpty message="No daily activity recorded yet." />
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
        />
        <Line
          type="monotone"
          dataKey="connections"
          name="Connections"
          stroke={CHART_BLUE}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="registrations"
          name="Registrations"
          stroke={CHART_NAVY}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          type="monotone"
          dataKey="competitionEntries"
          name="Competition"
          stroke={CHART_SKY}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function EventDayBarChart({ data }) {
  if (!data?.length) {
    return <ChartEmpty message="No event day data available." />
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
        />
        <Bar dataKey="connections" name="Connections" fill={CHART_BLUE} radius={[0, 0, 0, 0]} />
        <Bar dataKey="registrations" name="Registrations" fill={CHART_NAVY} radius={[0, 0, 0, 0]} />
        <Bar dataKey="competition" name="Competition" fill={CHART_SKY} radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function InterestPieChart({ data }) {
  if (!data?.length) {
    return <ChartEmpty message="No interest data available." />
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT_TALL}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={88}
          outerRadius={148}
          paddingAngle={2}
          stroke="#fff"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, lineHeight: '1.6' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function InteractionDonutChart({ data }) {
  if (!data?.length) {
    return <ChartEmpty message="No interaction data available." />
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={68}
          outerRadius={98}
          paddingAngle={2}
          stroke="#fff"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function HourlyBarChart({ data }) {
  if (!data?.length) {
    return <ChartEmpty message="No hourly connection data available." />
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT_TALL}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="hour" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={2} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="count" name="Connections" fill={CHART_BLUE} radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * @param {{ heatmap: Array<{ day: number, label: string, hours: number[] }> }} props
 */
export function ConnectionHeatmap({ heatmap }) {
  const max = Math.max(1, ...heatmap.flatMap((row) => row.hours))
  const total = heatmap.reduce((sum, row) => sum + row.hours.reduce((a, b) => a + b, 0), 0)

  if (!total) {
    return <ChartEmpty message="No connection activity recorded for the heatmap yet." />
  }

  return (
    <div className="charts-heatmap-wrap">
      <div className="charts-heatmap" role="img" aria-label="Connection activity heatmap">
        <div className="charts-heatmap__corner" />
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={`h-${hour}`} className="charts-heatmap__hour-label">
            {hour % 3 === 0 ? `${hour}` : ''}
          </div>
        ))}
        {heatmap.map((row) => (
          <Fragment key={row.day}>
            <div className="charts-heatmap__day-label">{row.label}</div>
            {row.hours.map((count, hour) => {
              const intensity = count / max
              return (
                <div
                  key={`${row.day}-${hour}`}
                  className={`charts-heatmap__cell${count ? ' has-data' : ''}`}
                  title={`${row.label} ${hour}:00 — ${count} connections`}
                  style={{
                    background: count
                      ? `rgba(43, 127, 212, ${0.12 + intensity * 0.88})`
                      : undefined,
                  }}
                />
              )
            })}
          </Fragment>
        ))}
      </div>
      <div className="charts-heatmap__legend" aria-hidden>
        <span>Low</span>
        <div className="charts-heatmap__legend-bar" />
        <span>High</span>
      </div>
    </div>
  )
}
