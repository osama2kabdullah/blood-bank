import { useMemo, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Spinner } from '@components/ui'
import { DonorFilterForm } from '@components/features/donors/DonorFilterForm'
import { DonorCard } from '@components/features/donors/DonorCard'
import { useFetch } from '@hooks/useFetch'
import type { DonorFilterValues } from '@components/features/donors/DonorFilterForm'
import type { DonorSearchResult } from '@services/api'
import '@styles/pages/home.css'
import '@styles/components/pagination.css'

interface DonorDirectoryProps {
  title: string
  cacheKeyPrefix: string
  load: (params: {
    blood_group?: string
    location?: string | null
    page?: number
  }) => Promise<{ data: DonorSearchResult }>
}

export function DonorDirectory({ title, cacheKeyPrefix, load }: DonorDirectoryProps) {
  const [searchParams, setSearchParams] = useSearchParams()

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

  const { data: apiData, isLoading, isError } = useFetch<DonorSearchResult>(
    fetchKey,
    () => load({
      blood_group: filters.blood_group,
      location: filters.location,
      page: currentPage,
    }),
    { cacheTtl: 60_000 },
  )

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

  return (
    <>
      <section className="filter-section">
        <h2>{title}</h2>
        <DonorFilterForm
          initialValues={filters}
          onSubmit={handleFilterSubmit}
          isLoading={isLoading}
        />

        <div className="result-summary">
          {isError ? (
            <p style={{ color: 'var(--cds-support-01)', margin: 0 }}>
              Failed to load donors. Please try again.
            </p>
          ) : isLoading ? (
            <p>Searching...</p>
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--cds-spacing-11)' }}>
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <div style={{ padding: 'var(--cds-spacing-09)', textAlign: 'center', color: 'var(--cds-text-02)' }}>
            <p>Something went wrong. Please try again.</p>
          </div>
        ) : apiData && apiData.data.length > 0 ? (
          <div className="cards-grid">
            {apiData.data.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
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
    </>
  )
}
