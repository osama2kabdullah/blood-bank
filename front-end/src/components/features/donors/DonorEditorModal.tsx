import '@/styles/components/form.css'
import '@/styles/components/button.css'
import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button, Notification, RadioGroup, Selector, type SelectorOption } from '@components/ui'
import { Modal } from '@components/ui/Modal'
import BLOOD_GROUPS from '@store/bloodGroups'
import LOCATIONS from '@store/locations'
import { donorService, type Donor } from '@services/api'

type EditorMode = 'add' | 'import' | 'edit'

interface DonorFormValues {
  name: string
  phone: string
  blood_group: string
  location: string | null
  last_donation: string
}

interface DonorEditorModalProps {
  isOpen: boolean
  mode: EditorMode
  donor: Donor | null
  onClose: () => void
  onSuccess: (message: string) => void
}

function getDefaultValues(donor: Donor | null): DonorFormValues {
  return {
    name: donor?.name ?? '',
    phone: donor?.phone ?? '',
    blood_group: donor?.blood_group ? donor.blood_group.toLowerCase() : 'a+',
    location: donor?.location ?? null,
    last_donation: donor?.last_donation ?? '',
  }
}

export function DonorEditorModal({
  isOpen,
  mode,
  donor,
  onClose,
  onSuccess,
}: DonorEditorModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [importSource, setImportSource] = useState<'sheets' | 'file'>('sheets')
  const [importSheetUrl, setImportSheetUrl] = useState('')
  const [importFileName, setImportFileName] = useState('')

  const title = useMemo(() => {
    if (mode === 'edit') return 'Edit Donor'
    if (mode === 'import') return 'Import Donor'
    return 'Add Donor'
  }, [mode])

  const submitLabel = mode === 'edit' ? 'Save Changes' : 'Save Donor'
  const defaultValues = useMemo(() => getDefaultValues(donor), [donor])

  const form = useForm<DonorFormValues>({ defaultValues })

  useEffect(() => {
    form.reset(defaultValues)
    setSubmitError(null)
    if (isOpen && mode === 'import') {
      setImportSource('sheets')
      setImportSheetUrl('')
      setImportFileName('')
    }
  }, [defaultValues, form, isOpen, mode])

  const onSubmit = async (values: DonorFormValues) => {
    setSubmitError(null)

    const payload = {
      name: values.name.trim() || undefined,
      phone: values.phone.trim(),
      blood_group: values.blood_group.toUpperCase(),
      location: values.location ?? '',
      last_donation: values.last_donation || null,
    }

    try {
      if (!payload.phone || !payload.blood_group || !payload.location) {
        setSubmitError('Phone, blood group, and location are required.')
        return
      }

      if (mode === 'edit') {
        if (!donor) {
          setSubmitError('Donor not found for editing.')
          return
        }
        const response = await donorService.edit({
          donor_id: donor.id,
          ...payload,
        })
        onSuccess(response.data.message)
      } else {
        const response = await donorService.add(payload)
        onSuccess(response.data.message)
      }

      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save donor.')
    }
  }

  const subtitle = mode === 'import'
    ? 'Choose a source to prepare your donor import file.'
    : 'Use the same donor fields you already use in registration.'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={mode === 'import' ? (
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled>
            Start Import (Coming Soon)
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="donor-editor-form"
            variant="primary"
            isLoading={form.formState.isSubmitting}
          >
            {submitLabel}
          </Button>
        </>
      )}
    >
      {submitError && (
        <Notification
          type="error"
          message={submitError}
        />
      )}

      {mode === 'import' ? (
        <div className="form">
          <Notification
            type="info"
            message="Import UI is ready. Backend processing will be connected later."
          />

          <div className="form-group">
            <RadioGroup
              label="Import Source"
              options={[
                { label: 'Google Sheets URL', value: 'sheets' },
                { label: 'CSV / Excel File', value: 'file' },
              ]}
              value={importSource}
              onChange={(value) => setImportSource(value as 'sheets' | 'file')}
              name="import-source"
            />
          </div>

          {importSource === 'sheets' ? (
            <div className="form-group">
              <label htmlFor="import-sheet-url" className="form-label form-label--required">Google Sheet URL</label>
              <input
                id="import-sheet-url"
                type="url"
                className="form-input"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={importSheetUrl}
                onChange={(event) => setImportSheetUrl(event.target.value)}
              />
              <span className="form-helper">Supported: shared Google Sheets links.</span>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="import-file" className="form-label form-label--required">Upload File</label>
              <input
                id="import-file"
                type="file"
                className="form-input"
                accept=".csv,.xlsx,.xls"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  setImportFileName(file?.name ?? '')
                }}
              />
              <span className="form-helper">Supported formats: CSV, XLSX, XLS.</span>
              {importFileName && (
                <span className="form-helper">Selected file: {importFileName}</span>
              )}
            </div>
          )}
        </div>
      ) : (
      <form id="donor-editor-form" className="form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="donor-name" className="form-label">Full Name</label>
          <input
            id="donor-name"
            type="text"
            className="form-input"
            placeholder="Donor name"
            {...form.register('name')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="donor-phone" className="form-label form-label--required">Phone Number</label>
          <input
            id="donor-phone"
            type="tel"
            className="form-input"
            placeholder="01XXXXXXXXX"
            {...form.register('phone', { required: true })}
          />
        </div>

        <div className="form-group">
          <Controller
            name="blood_group"
            control={form.control}
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup
                label="Blood Group"
                options={BLOOD_GROUPS as SelectorOption[]}
                value={field.value}
                onChange={field.onChange}
                name="donor-blood-group"
              />
            )}
          />
        </div>

        <div className="form-group">
          <Controller
            name="location"
            control={form.control}
            rules={{ required: true }}
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
          <label htmlFor="donor-last-donation" className="form-label">Last Donation Date</label>
          <input
            id="donor-last-donation"
            type="date"
            className="form-input"
            {...form.register('last_donation')}
          />
          <span className="form-helper">Leave blank if donor has not donated yet.</span>
        </div>
      </form>
      )}
    </Modal>
  )
}
