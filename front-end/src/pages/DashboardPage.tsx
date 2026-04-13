import '@/styles/pages/dashboard.css'
import '@/styles/components/card.css'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { PageShell } from '@components/layout'
import AccountSettings from '@components/features/dashboard/AccountSettings'
import { MyDonors } from '@components/features/dashboard/MyDonors'
import { cn } from '@utils/cn'

function getUser() {
  try {
    const raw = localStorage.getItem('authUser')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

type Tab = 'myDonors' | 'account'

const TABS: { id: Tab; label: string }[] = [
  { id: 'myDonors', label: 'My Donors' },
  { id: 'account', label: 'Account Settings' },
]

function getTabFromQuery(tab: string | null): Tab {
  return tab === 'account' ? 'account' : 'myDonors'
}

function getTabQueryValue(tab: Tab): string {
  return tab === 'account' ? 'account' : 'my-donors'
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const [searchParams, setSearchParams] = useSearchParams()

  const user = getUser()
  const activeTab = getTabFromQuery(searchParams.get('tab'))

  useEffect(() => {
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: getTabQueryValue('myDonors') }, { replace: true })
    }
  }, [searchParams, setSearchParams])

  if (!user) {
    return (
      <PageShell>
        <div className="container">
          <p style={{ paddingBlock: 'var(--cds-spacing-09)', color: 'var(--cds-text-02)' }}>
            You are not logged in.
          </p>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="container">
        <div className="dashboard">
          {/* Tabs */}
          <div className="dashboard__tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={cn('dashboard__tab', activeTab === tab.id && 'dashboard__tab--active')}
                onClick={() => setSearchParams({ tab: getTabQueryValue(tab.id) })}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === 'myDonors' && (
            <MyDonors />
          )}

          {activeTab === 'account' && (
            <AccountSettings user={user} />
          )}

        </div>
      </div>
    </PageShell>
  )
}
