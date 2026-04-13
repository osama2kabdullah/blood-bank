import '@/styles/components/card.css'
import '@/styles/components/common.css'
import '@/styles/components/form.css'
import '@/styles/components/button.css'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Card } from '@components/ui'
import { Button, Tag, Notification } from '@components/ui'
import { Selector } from '@components/ui/selector'
import LOCATIONS from '@store/locations'
import BLOOD_GROUPS from '@store/bloodGroups'
import type { SelectorOption } from '@components/ui'
import type { AuthDonor } from '@services/api'

interface DonorForm {
  location: string | null
  last_donation: string
}

interface DonorInfoProps {
  donor: AuthDonor | null
}

export function DonorInfo({ donor }: DonorInfoProps) {
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const form = useForm<DonorForm>({
    defaultValues: {
      location: donor?.location ?? null,
      last_donation: donor?.last_donation ?? '',
    },
  })

  const handleSubmit = async (values: DonorForm) => {
    try {
      // TODO: await donorService.update(donor!.id, values)
      console.log('update donor', values)
      setMsg({ type: 'success', text: 'Donor info updated.' })
    } catch (err) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update.' })
    }
  }

  if (!donor) {
    return (
      <Card>
        <p style={{ color: 'var(--cds-text-02)', fontSize: 'var(--cds-body-short-01-font-size)' }}>
          No donor profile linked to your account.
        </p>
      </Card>
    )
  }

  return (
    <div style={{ maxWidth: '40rem' }}>

      {/* Read-only info */}
      <Card style={{ marginBottom: 'var(--cds-spacing-06)' }}>
        <div className="donor-info-card">
          {[
            { label: 'NAME',         value: donor.name },
            { label: 'PHONE',        value: donor.phone },
            { label: 'BLOOD GROUP',  value: <Tag color="red">{donor.blood_group}</Tag> },
            { label: 'LOCATION',     value: donor.location },
            { label: 'LAST DONATION', value: donor.last_donation ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="donor-info-card__row">
              <span className="donor-info-card__label">{label}</span>
              <span className="donor-info-card__value">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Editable fields */}
      <Card>
        <h3 className="dashboard__section-title">Update Donor Info</h3>

        {msg && <Notification type={msg.type} message={msg.text} style={{ marginBottom: 'var(--cds-spacing-05)' }} />}

        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="form-group">
            <Controller
              name="location"
              control={form.control}
              render={({ field }) => (
                <Selector
                  label="Location"
                  options={LOCATIONS as SelectorOption[]}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select location"
                />
              )}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Donation Date</label>
            <input
              className="form-input"
              type="date"
              {...form.register('last_donation')}
            />
            <span className="form-helper">Leave blank if you haven't donated before.</span>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={form.formState.isSubmitting}
            >
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}