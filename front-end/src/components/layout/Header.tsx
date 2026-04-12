import '@/styles/components/header.css'
import { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { cn } from '@utils/cn'
import logo from '@/assets/icons/logo.png'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
]

export function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedToken = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null
    setIsLoggedIn(Boolean(savedToken))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setIsMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const userInitials = 'JD'

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
        {isLoggedIn && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn('header__nav-item', isActive && 'header__nav-item--active')
            }
          >
            Dashboard
          </NavLink>
        )}
      </nav>

      <div className="header__actions">
        {!isLoggedIn ? (
          <>
            <NavLink
              key={"/login"}
              to={"/login"}
              className={({ isActive }) =>
                cn('header__nav-item', isActive && 'header__nav-item--active')
              }
            >
              Login
            </NavLink>
            <Link to="/register" className="header__button btn btn--primary">
              Register
            </Link>
          </>
        ) : (
          <div className="header__avatar-menu" ref={menuRef}>
            <button
              type="button"
              className="header__avatar-button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              {userInitials}
            </button>
            {isMenuOpen && (
              <div className="header__dropdown" role="menu">
                <Link
                  to="/dashboard"
                  className="header__dropdown-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="header__dropdown-item"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  className="header__dropdown-item header__dropdown-item--button"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
        <button
          type="button"
          className="header__mobile-toggle"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="header__drawer-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            className={cn('header__drawer', isMobileMenuOpen && 'header__drawer--open')}
            id="mobile-navigation"
            aria-label="Mobile navigation drawer"
            ref={mobileMenuRef}
          >
            <div className="header__drawer-brand-row">
              <div className="header__drawer-brand">
                <img src={logo} alt="Blood Bank BD" className="header__drawer-logo" />
                <div>
                  <span className="header__drawer-brand-title">Blood Bank BD</span>
                </div>
              </div>
              <button
                type="button"
                className="header__drawer-close"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation drawer"
              >
                ×
              </button>
            </div>

            <div className="header__drawer-content">
              <div className="header__mobile-links">
                {NAV_ITEMS.map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn('header__mobile-link', isActive && 'header__mobile-link--active')
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                ))}
                {isLoggedIn && (
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                      cn('header__mobile-link', isActive && 'header__mobile-link--active')
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                )}
              </div>

              <div className="header__mobile-actions">
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      className="header__mobile-action"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="header__mobile-action header__mobile-action--primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/settings"
                      className="header__mobile-action"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      type="button"
                      className="header__mobile-action header__mobile-action--button"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </header>
  )
}