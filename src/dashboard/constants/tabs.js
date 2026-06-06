import {
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlinePresentationChartLine,
  HiOutlineSquares2X2,
  HiOutlineTableCells,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

export const DASHBOARD_TABS = [
  { id: 'overview', label: 'Overview', Icon: HiOutlineSquares2X2 },
  { id: 'comparison', label: 'Comparison', Icon: HiOutlineCalendarDays },
  { id: 'charts', label: 'Charts', Icon: HiOutlinePresentationChartLine },
  { id: 'users', label: 'Users', Icon: HiOutlineUserGroup },
  { id: 'tables', label: 'Connections', Icon: HiOutlineTableCells },
  { id: 'summary', label: 'Summary', Icon: HiOutlineDocumentText },
]

/** @typedef {(typeof DASHBOARD_TABS)[number]['id']} DashboardTabId */
