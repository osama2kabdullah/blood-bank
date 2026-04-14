import { useMemo, useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Modal, Notification, SkeletonCard, Spinner } from '@components/ui'
import { DonorFilterForm } from '@components/features/donors/DonorFilterForm'
import { DonorCard } from '@components/features/donors/DonorCard'
import { DonorEditorModal } from '@components/features/donors/DonorEditorModal'
import { useFetch } from '@hooks/useFetch'
import { donorService, type Donor, type DonorSearchResult } from '@services/api'
import { notifyDonorDataChanged, subscribeDonorDataChanged } from '@utils/donorSync'
import type { DonorFilterValues } from '@components/features/donors/DonorFilterForm'
import '@styles/pages/home.css'
import '@styles/components/pagination.css'

type EditorMode = 'add' | 'import' | 'edit'

interface DonorDirectoryProps {
  title: string
  titleAs?: 'h1' | 'h2'
  cacheKeyPrefix: string
  load: (params: {
    blood_group?: string
    location?: string | null
    page?: number
  }) => Promise<{ data: DonorSearchResult }>
  showCreateActions?: boolean
  ownershipScope?: 'all' | 'mine'
}

interface AuthSnapshot {
  isLoggedIn: boolean
  userId: string | null
  ownDonorId: number | null
}

function readAuthSnapshot(): AuthSnapshot {
  const token = localStorage.getItem('authToken')
  const rawUser = localStorage.getItem('authUser')
  const rawDonor = localStorage.getItem('authDonor')

  if (!token || !rawUser) {
    return { isLoggedIn: false, userId: null, ownDonorId: null }
  }

  try {
    const user = JSON.parse(rawUser)
    const donor = rawDonor ? JSON.parse(rawDonor) : null
    return {
      isLoggedIn: true,
      userId: user?.id ? String(user.id) : null,
      ownDonorId: donor?.id ? Number(donor.id) : null,
    }
  } catch {
    return { isLoggedIn: false, userId: null, ownDonorId: null }
  }
}

function normalizeId(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null
  return String(value)
}

function canManageDonor(donor: Donor, userId: string | null): boolean {
  if (!userId) return false

  const claimedBy = normalizeId(donor.claimed_by_user_id)
  if (claimedBy) return claimedBy === userId

  const addedBy = normalizeId(donor.added_by_user_id)
  if (addedBy) return addedBy === userId

  return false
}

export function DonorDirectory({
  title,
  titleAs = 'h2',
  cacheKeyPrefix,
  load,
  showCreateActions = false,
  ownershipScope = 'all',
}: DonorDirectoryProps) {
  const TitleTag = titleAs
  const [searchParams, setSearchParams] = useSearchParams()
  const [auth, setAuth] = useState<AuthSnapshot>(readAuthSnapshot)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<EditorMode>('add')
  const [editorDonor, setEditorDonor] = useState<Donor | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Donor | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const onAuthChange = () => setAuth(readAuthSnapshot())
    window.addEventListener('auth-change', onAuthChange)
    return () => window.removeEventListener('auth-change', onAuthChange)
  }, [])

  const filters = useMemo<DonorFilterValues>(() => {
    const blood_group = searchParams.get('blood_group') ?? 'all'
    const location = searchParams.get('location')
    return {
      blood_group,
      location: location === null || location === '' ? null : location,
    }
  }, [searchParams])

  const currentPage = useMemo(() => {
    const page = Number(searchParams.get('page') ?? '1')
    return Number.isFinite(page) && page > 0 ? page : 1
  }, [searchParams])

  const fetchKey = `${cacheKeyPrefix}-${filters.blood_group}-${filters.location ?? ''}-${currentPage}`

  const { data: apiData, isLoading, isError, refetch } = useFetch<DonorSearchResult>(
    fetchKey,
    () => load({
      blood_group: filters.blood_group,
      location: filters.location,
      page: currentPage,
    }),
    { cacheTtl: 60_000 },
  )

  useEffect(() => {
    return subscribeDonorDataChanged(() => {
      refetch()
    })
  }, [refetch])

  const handleFilterSubmit = useCallback(
    (values: DonorFilterValues) => {
      const params = new URLSearchParams(searchParams)

      if (values.blood_group && values.blood_group !== 'all') {
        params.set('blood_group', values.blood_group)
      } else {
        params.delete('blood_group')
      }

      if (values.location) {
        params.set('location', values.location)
      } else {
        params.delete('location')
      }

      params.delete('page')
      setSearchParams(params)
    },
    [searchParams, setSearchParams],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      if (!apiData) return

      const nextPage = Math.max(1, Math.min(page, apiData.total_pages))
      const params = new URLSearchParams(searchParams)

      if (nextPage > 1) {
        params.set('page', nextPage.toString())
      } else {
        params.delete('page')
      }

      setSearchParams(params)
    },
    [apiData, searchParams, setSearchParams],
  )

  const openEditor = (mode: EditorMode, donor: Donor | null = null) => {
    setActionMessage(null)
    setEditorMode(mode)
    setEditorDonor(donor)
    setIsEditorOpen(true)
  }

  const closeEditor = () => {
    setIsEditorOpen(false)
    setEditorDonor(null)
  }

  const handleEditorSuccess = async (message: string) => {
    setActionMessage({ type: 'success', text: message })
    notifyDonorDataChanged()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      const response = await donorService.delete({ donor_id: deleteTarget.id })
      setActionMessage({ type: 'success', text: response.data.message })
      setDeleteTarget(null)
      notifyDonorDataChanged()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete donor.')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <>
      <section className="filter-section">
        <div className="donor-directory__header">
          <TitleTag>{title}</TitleTag>

          {showCreateActions && auth.isLoggedIn && (
            <div className="donor-directory__actions">
              <Button type="button" variant="secondary" size="sm" onClick={() => openEditor('import')}>
                Import Donors
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={() => openEditor('add')}>
                Add Donor
              </Button>
            </div>
          )}
        </div>

        <DonorFilterForm
          initialValues={filters}
          onSubmit={handleFilterSubmit}
          isLoading={isLoading}
        />

        {actionMessage && (
          <Notification
            type={actionMessage.type}
            message={actionMessage.text}
            className="donor-directory__notice"
          />
        )}

        <div className="result-summary">
          {isError ? (
            <p style={{ color: 'var(--cds-support-01)', margin: 0 }}>
              Failed to load donors. Please try again.
            </p>
          ) : isLoading ? (
            <p className="donor-directory__summary-loading">
              <Spinner size="sm" />
              <span>Searching...</span>
            </p>
          ) : apiData ? (
            <p>
              Showing <strong>{apiData.data.length}</strong> of{' '}
              <strong>{apiData.total}</strong> donors
              {filters.location && <> in <strong>{filters.location}</strong></>}
              {filters.blood_group !== 'all' && <> - Blood group <strong>{filters.blood_group}</strong></>}
            </p>
          ) : null}
        </div>
      </section>

      <hr className="divider" />

      <section className="cards-section">
        {isLoading ? (
          <div className="cards-grid" aria-label="Loading donors">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={`donor-skeleton-${index}`} />
            ))}
          </div>
        ) : isError ? (
          <div style={{ padding: 'var(--cds-spacing-09)', textAlign: 'center', color: 'var(--cds-text-02)' }}>
            <p>Something went wrong. Please try again.</p>
          </div>
        ) : apiData && apiData.data.length > 0 ? (
          <div className="cards-grid">
            {apiData.data.map((donor) => {
              const isOwnDonor = auth.ownDonorId !== null && donor.id === auth.ownDonorId
              const hasManageAccess = ownershipScope === 'mine'
                ? auth.isLoggedIn
                : canManageDonor(donor, auth.userId)
              const canEdit = auth.isLoggedIn && (isOwnDonor || hasManageAccess)
              const canDelete = auth.isLoggedIn && !isOwnDonor && hasManageAccess

              return (
                <DonorCard
                  key={donor.id}
                  donor={donor}
                  actions={auth.isLoggedIn && (canEdit || canDelete) ? (
                    <>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditor('edit', donor)}
                        >
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteTarget(donor)
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  ) : null}
                />
              )
            })}
          </div>
        ) : apiData && apiData.data.length === 0 ? (
          <div style={{ padding: 'var(--cds-spacing-09)', textAlign: 'center', color: 'var(--cds-text-02)' }}>
            <p style={{ marginBottom: 'var(--cds-spacing-03)' }}>No donors found.</p>
            <p style={{ fontSize: 'var(--cds-label-01-font-size)' }}>Try adjusting the blood group or location filters.</p>
          </div>
        ) : null}
      </section>

      {apiData && apiData.total_pages > 1 && (
        <section className="pagination-section">
          <div className="pagination">
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              {'<- Previous'}
            </button>

            <span className="pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{apiData.total_pages}</strong>
            </span>

            <button
              className="btn btn--secondary btn--sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === apiData.total_pages || isLoading}
            >
              {'Next ->'}
            </button>
          </div>
        </section>
      )}

      <DonorEditorModal
        isOpen={isEditorOpen}
        mode={editorMode}
        donor={editorMode === 'edit' ? editorDonor : null}
        onClose={closeEditor}
        onSuccess={handleEditorSuccess}
      />

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteError(null)
          setDeleteTarget(null)
        }}
        title="Delete donor?"
        subtitle="This action cannot be undone."
        variant="danger"
        size="sm"
        footer={(
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDeleteError(null)
                setDeleteTarget(null)
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="danger" isLoading={deleteSubmitting} onClick={handleDelete}>
              Delete
            </Button>
          </>
        )}
      >
        <>
          {deleteError && (
            <Notification
              type="error"
              message={deleteError}
              className="donor-directory__notice"
            />
          )}
          <p style={{ margin: 0, color: 'var(--cds-text-02)' }}>
            {deleteTarget ? `Are you sure you want to delete ${deleteTarget.name || 'this donor'}?` : 'Confirm delete.'}
          </p>
        </>
      </Modal>
    </>
  )
}
