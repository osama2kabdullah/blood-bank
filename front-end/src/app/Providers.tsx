/**
 * Providers — Wraps the app with all required context providers
 * Keep this lean: only global providers live here
 */
import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import { router } from './router'
import { useAppStore } from '@store/appStore'

function ThemeInit() {
  const resolvedTheme = useAppStore((s) => s.resolvedTheme)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])
  return null
}

export function Providers() {
  return (
    <>
      <ThemeInit />
      <RouterProvider router={router} />
    </>
  )
}
