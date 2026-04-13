import '@/styles/components/card.css'
import '@/styles/components/common.css'
import { Card, CardTitle, Tag } from '@components/ui'
import { MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Donor } from '@services/api'

interface DonorCardProps {
  donor: Donor
  actions?: ReactNode
}

export function DonorCard({ donor, actions }: DonorCardProps) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--cds-spacing-04)' }}>
        <CardTitle>{donor.name}</CardTitle>
        <Tag color="red">{donor.blood_group}</Tag>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cds-spacing-02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', fontSize: 'var(--cds-body-short-01-font-size)', color: 'var(--cds-text-02)' }}>
          <MapPin size={14} />
          <span>{donor.location}</span>
        </div>

        {donor.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--cds-spacing-02)', fontSize: 'var(--cds-body-short-01-font-size)', color: 'var(--cds-text-02)' }}>
            <Phone size={14} />
            <span>{donor.phone}</span>
          </div>
        )}
      </div>

      {actions && (
        <div className="donor-card__actions">
          {actions}
        </div>
      )}
    </Card>
  )
}
