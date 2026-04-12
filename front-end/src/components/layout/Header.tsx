import '@/styles/components/header.css'
import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '@hooks/useTheme'
import { cn } from '@utils/cn'
import logo from '@/assets/icons/logo.png'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/posts', label: 'Posts' },
  { to: '/settings', label: 'Settings' },
]

export function Header() {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="header">
      <Link to="/" className="header__name">
        <img
          src={logo}
          alt="Blood Bank BD logo"
          style={{ width: 'clamp(1.75rem, 4vw, 2.5rem)', height: 'auto', objectFit: 'contain', flexShrink: 0 }}
        />
        Blood Bank BD
      </Link>

      <nav className="header__nav" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn('header__nav-item', isActive && 'header__nav-item--active')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="header__actions">
        <button
          className="header__icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
          title="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0-2a6 6 0 1 0 0 12A6 6 0 0 0 16 10zm-1-7h2v4h-2zm0 21h2v4h-2zM4.22 6.64l1.42-1.42 2.83 2.83-1.42 1.42zm18.31 18.3 1.42-1.41 2.83 2.83-1.42 1.42zM3 15h4v2H3zm22 0h4v2h-4zM6.64 27.78l-1.42-1.42 2.83-2.83 1.42 1.42zm18.3-18.31-1.41-1.42 2.83-2.83 1.42 1.42z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M13.5 4.91A11.02 11.02 0 0 0 13 8a11 11 0 0 0 11 11 10.96 10.96 0 0 0 3.09-.45A9 9 0 1 1 13.5 4.91z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}