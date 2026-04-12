import '@/styles/components/form.css'
import '@/styles/components/button.css'
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { RadioGroup } from '@components/ui/radio-group'
import { Selector } from '@components/ui/selector'
import { Button } from '@components/ui'
import LOCATIONS from '@store/locations'
import BLOOD_GROUPS from '@store/bloodGroups'
import type { SelectorOption } from '@components/ui'

const BLOOD_GROUP_OPTIONS = [{ label: 'ALL', value: 'all' }, ...BLOOD_GROUPS]
const LOCATIONS_OPTIONS = [{ label: 'All Bangladesh', value: 'all bangladesh' }, ...LOCATIONS]

export interface DonorFilterValues {
  blood_group: string
  location: string | null
}

interface DonorFilterFormProps {
  onSubmit: (values: DonorFilterValues) => void
  isLoading?: boolean
  initialValues?: DonorFilterValues
}

export function DonorFilterForm({
  onSubmit,
  isLoading = false,
  initialValues,
}: DonorFilterFormProps) {
  const { control, handleSubmit, reset } = useForm<DonorFilterValues>({
    defaultValues: initialValues ?? {
      blood_group: 'all',
      location: null,
    },
  })

  useEffect(() => {
    reset(
      initialValues ?? {
        blood_group: 'all',
        location: null,
      },
    )
  }, [initialValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="donor-filter-form">
      <div className="form-group">
        <Controller
          name="blood_group"
          control={control}
          render={({ field }) => (
            <RadioGroup
              label="Blood Group"
              options={BLOOD_GROUP_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              name="blood-group"
            />
          )}
        />
      </div>

      <div className="form-group" style={{ minWidth: '240px', flex: 1 }}>
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <Selector
              label="Location"
              options={LOCATIONS_OPTIONS as SelectorOption[]}
              value={field.value}
              onChange={field.onChange}
              placeholder="Khulna, Dhaka ..."
            />
          )}
        />
      </div>

      <div style={{ alignSelf: 'flex-end' }}>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          size="field"
        >
          Search
        </Button>
      </div>
    </form>
  )
}