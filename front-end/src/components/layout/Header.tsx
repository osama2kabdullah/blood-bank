import '@/styles/components/header.css'
import { useState, useEffect, useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { cn } from '@utils/cn'
import logo from '@/assets/icons/logo.png'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
]

function getAuthState() {
  const token = localStorage.getItem('authToken')
  const raw = localStorage.getItem('authUser')
  if (!token || !raw) return { isLoggedIn: false, initials: '' }
  try {
    const user = JSON.parse(raw)
    const initials = String(user.name ?? '')
      .split(' ')
      .filter(Boolean)
      .map((w: string) => w[0].toUpperCase())
      .slice(0, 2)
      .join('')
    return { isLoggedIn: true, initials: initials || '?' }
  } catch {
    return { isLoggedIn: false, initials: '' }
  }
}

export function Header() {
  const [auth, setAuth] = useState(getAuthState)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onAuth = () => setAuth(getAuthState())
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('auth-change', onAuth)
    document.addEventListener('mousedown', onClickOutside)
    return () => {
      window.removeEventListener('auth-change', onAuth)
      document.removeEventListener('mousedown', onClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    window.dispatchEvent(new Event('auth-change'))
    setIsMenuOpen(false)
    setIsMobileOpen(false)
  }

  const closeDrawer = () => setIsMobileOpen(false)

  return (
    <header className="header">
      {/* Brand */}
      <Link to="/" className="header__name">
        <img src={logo} alt="Blood Bank BD" className="header__logo" />
        Blood Bank BD
      </Link>

      {/* Desktop nav */}
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

      {/* Desktop actions */}
      <div className="header__actions">
        {auth.isLoggedIn ? (
          <div className="header__avatar-menu" ref={menuRef}>
            <button
              type="button"
              className="header__avatar-btn"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
            >
              {auth.initials}
            </button>

            {isMenuOpen && (
              <div className="header__dropdown" role="menu">
                <Link to="/dashboard" className="header__dropdown-item" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <hr className="header__dropdown-divider" />
                <button type="button" className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                cn('header__nav-item', isActive && 'header__nav-item--active')
              }
            >
              Login
            </NavLink>
            <Link to="/register" className="btn btn--primary btn--sm">
              Register
            </Link>
          </>
        )}

        {/* Hamburger */}
        <button
          type="button"
          className="header__hamburger"
          aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileOpen}
          onClick={() => setIsMobileOpen((o) => !o)}
        >
          <span aria-hidden="true">{isMobileOpen ? '✕' : '☰'}</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <>
          <div className="header__backdrop" onClick={closeDrawer} aria-hidden="true" />
          <aside className="header__drawer" aria-label="Mobile navigation">

            <div className="header__drawer-header">
              <div className="header__drawer-brand">
                <img src={logo} alt="Blood Bank BD" className="header__logo" />
                <span className="header__drawer-brand-name">Blood Bank BD</span>
              </div>
              <button type="button" className="header__drawer-close" onClick={closeDrawer} aria-label="Close menu">
                ✕
              </button>
            </div>

            <nav className="header__drawer-nav">
              {NAV_ITEMS.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn('header__drawer-item', isActive && 'header__drawer-item--active')
                  }
                  onClick={closeDrawer}
                >
                  {label}
                </NavLink>
              ))}
              {auth.isLoggedIn && (
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    cn('header__drawer-item', isActive && 'header__drawer-item--active')
                  }
                  onClick={closeDrawer}
                >
                  Dashboard
                </NavLink>
              )}
            </nav>

            <div className="header__drawer-footer">
              {auth.isLoggedIn ? (
                <>
                  <button type="button" className="header__drawer-item header__drawer-item--danger" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="header__drawer-item" onClick={closeDrawer}>
                    Login
                  </Link>
                  <Link to="/register" className="btn btn--primary w-full" onClick={closeDrawer}>
                    Register
                  </Link>
                </>
              )}
            </div>

          </aside>
        </>
      )}
    </header>
  )
}