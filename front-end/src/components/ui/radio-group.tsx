import '@/styles/components/form.css'
import { cn } from '@utils/cn'
import { useId } from 'react'

interface RadioOption<T extends string = string> {
  label: string
  value: T
}

interface RadioGroupProps<T extends string = string> {
  label?: string
  options: RadioOption<T>[]
  value: T
  onChange: (value: T) => void
  name?: string
  className?: string
  optionClassName?: string
}

export function RadioGroup<T extends string = string>({
  label,
  options,
  value,
  onChange,
  name,
  className,
  optionClassName,
}: RadioGroupProps<T>) {
  const generatedName = useId()
  const groupName = name ?? generatedName

  const handleKeyDown = (e: React.KeyboardEvent, optionValue: T) => {
    const currentIndex = options.findIndex((o) => o.value === value)
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(options[(currentIndex + 1) % options.length].value)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(options[(currentIndex - 1 + options.length) % options.length].value)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(optionValue)
    }
  }

  return (
    <fieldset className={cn('radio-group', className)}>
      {label && <legend className="radio-group__label">{label}</legend>}
      <div className="radio-group__options" role="radiogroup">
        {options.map((option) => {
          const isSelected = option.value === value
          return (
            <label
              key={option.value}
              className={cn(
                'radio-group__option',
                isSelected && 'radio-group__option--selected',
                optionClassName,
              )}
            >
              <input
                type="radio"
                className="radio-group__input"
                name={groupName}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                onKeyDown={(e) => handleKeyDown(e, option.value)}
                aria-checked={isSelected}
              />
              <span className="radio-group__option-label">{option.label}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}