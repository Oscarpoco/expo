import {
  MdEmojiEvents,
  MdGridView,
  MdOutlineCalendarMonth,
  MdOutlinePerson,
} from 'react-icons/md'

import './BottomTabBar.css'

const TABS = [
  { id: 'contact', label: 'Contact', Icon: MdOutlinePerson },
  { id: 'categories', label: 'Catalogues', Icon: MdGridView },
  { id: 'schedule', label: 'Schedule', Icon: MdOutlineCalendarMonth },
  { id: 'competition', label: 'Competition', Icon: MdEmojiEvents },
]

export function BottomTabBar({ activeTab, onTabChange }) {
  return (
    <nav className="expo-tab-bar" aria-label="Profile sections">
      <div className="expo-tab-bar__inner">
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              type="button"
              className={`expo-tab-bar__item${active ? ' expo-tab-bar__item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
              onClick={() => onTabChange(id)}
            >
              <Icon className="expo-tab-bar__icon" aria-hidden />
              <span className="expo-tab-bar__label">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
