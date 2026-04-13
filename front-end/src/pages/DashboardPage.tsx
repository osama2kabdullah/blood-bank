import '@/styles/pages/dashboard.css'
import '@/styles/components/card.css'
import { useState } from 'react'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { PageShell } from '@components/layout'
import AccountSettings from '@components/features/dashboard/AccountSettings'
import { DonorInfo } from '@components/features/dashboard/DonorInfo'
import { cn } from '@utils/cn'

function getUser() {
  try {
    const raw = localStorage.getItem('authUser')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function getDonor() {
  try {
    const raw = localStorage.getItem('authDonor')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

type Tab = 'donor' | 'account'

const TABS: { id: Tab; label: string }[] = [
  { id: 'donor',   label: 'Donor Info' },
  { id: 'account', label: 'Account Settings' },
]

export default function DashboardPage() {
  useDocumentTitle('Dashboard')
  const [activeTab, setActiveTab] = useState<Tab>('donor')

  const user = getUser()
  const donor = getDonor()

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

          {/* Header */}
          <div className="dashboard__header">
            <h2 className="dashboard__title" style={{ fontWeight: 300 }}>Dashboard</h2>
            <p className="dashboard__subtitle">Welcome back, {user.name}</p>
          </div>

          {/* Tabs */}
          <div className="dashboard__tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                className={cn('dashboard__tab', activeTab === tab.id && 'dashboard__tab--active')}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab panels */}
          {activeTab === 'donor' && (
            <DonorInfo donor={donor} />
          )}

          {activeTab === 'account' && (
            <AccountSettings user={user} />
          )}

        </div>
      </div>
    </PageShell>
  )
}