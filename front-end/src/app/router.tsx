/**
 * Router — All routes are lazy-loaded (code split per page)
 * Uses React.lazy + Suspense for zero-bundle-cost page loading
 */
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { Header } from '@components/layout/Header'
import { Footer } from '@components/layout/Footer'
import { LoadingBar } from '@components/ui/LoadingBar'
import { RouteLoadingFallback } from './RouteLoadingFallback'

/* Lazy page imports — each is a separate chunk */
const HomePage       = lazy(() => import('@pages/HomePage'))
const DashboardPage  = lazy(() => import('@pages/DashboardPage'))
const PostsPage      = lazy(() => import('@pages/PostsPage'))
const PostDetailPage = lazy(() => import('@pages/PostDetailPage'))
const SettingsPage   = lazy(() => import('@pages/SettingsPage'))
const NotFoundPage   = lazy(() => import('@pages/NotFoundPage'))

function RootLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <LoadingBar />
      <Header />
      <Suspense fallback={<RouteLoadingFallback />}>
        <Outlet />
      </Suspense>
      <Footer />
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,        element: <HomePage /> },
      { path: 'dashboard',  element: <DashboardPage /> },
      { path: 'posts',      element: <PostsPage /> },
      { path: 'posts/:id',  element: <PostDetailPage /> },
      { path: 'settings',   element: <SettingsPage /> },
      { path: '*',          element: <NotFoundPage /> },
    ],
  },
])
