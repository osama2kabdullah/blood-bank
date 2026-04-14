import { useEffect } from 'react'
import { useAppStore } from '@store/appStore'

export function useTheme() {
  const { theme, resolvedTheme, setTheme } = useAppStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setTheme('system') // re-resolve
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme, setTheme])

  const toggleTheme = () =>
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  return { theme, resolvedTheme, setTheme, toggleTheme }
}
