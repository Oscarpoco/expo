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
const CHART_COLORS = ['#2b7fd4', '#5bbce4', '#1f5fa8', '#94a3b8', '#64748b']
const CHART_HEIGHT = 280
const CHART_HEIGHT_TALL = Math.round(CHART_HEIGHT * 1.5)

export function DailyActivityChart({ data, height = 280 }) {
  if (!data?.length) {
    return <p className="dashboard-panel__subtitle">No daily activity recorded yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="connections"
          name="Connections"
          stroke={CHART_BLUE}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="registrations"
          name="Registrations"
          stroke="#1f5fa8"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="competitionEntries"
          name="Competition"
          stroke="#5bbce4"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function EventDayBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip />
        <Legend />
        <Bar dataKey="connections" name="Connections" fill={CHART_BLUE} radius={[4, 4, 0, 0]} />
        <Bar dataKey="registrations" name="Registrations" fill="#1f5fa8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="competition" name="Competition" fill="#5bbce4" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function InterestPieChart({ data }) {
  if (!data?.length) {
    return <p className="dashboard-panel__subtitle">No interest data available.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT_TALL}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={82}
          outerRadius={142}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function InteractionDonutChart({ data }) {
  if (!data?.length) {
    return <p className="dashboard-panel__subtitle">No interaction data available.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function HourlyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT_TALL}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="#9ca3af" interval={2} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip />
        <Bar dataKey="count" name="Connections" fill={CHART_BLUE} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * @param {{ heatmap: Array<{ day: number, label: string, hours: number[] }> }} props
 */
export function ConnectionHeatmap({ heatmap }) {
  const max = Math.max(
    1,
    ...heatmap.flatMap((row) => row.hours),
  )

  return (
    <div className="dashboard-heatmap" role="img" aria-label="Connection activity heatmap">
      <div className="dashboard-heatmap__corner" />
      {Array.from({ length: 24 }, (_, hour) => (
        <div key={`h-${hour}`} className="dashboard-heatmap__hour-label">
          {hour % 3 === 0 ? `${hour}` : ''}
        </div>
      ))}
      {heatmap.map((row) => (
        <Fragment key={row.day}>
          <div className="dashboard-heatmap__day-label">{row.label}</div>
          {row.hours.map((count, hour) => {
            const intensity = count / max
            return (
              <div
                key={`${row.day}-${hour}`}
                className="dashboard-heatmap__cell"
                title={`${row.label} ${hour}:00 — ${count} connections`}
                style={{
                  background: count
                    ? `rgba(43, 127, 212, ${0.15 + intensity * 0.85})`
                    : '#edf2f7',
                }}
              />
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}
