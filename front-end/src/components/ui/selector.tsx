import '@/styles/components/selector.css'
import { cn } from '@utils/cn'
import {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { MapPin } from 'lucide-react'

export interface SelectorOption<T extends string = string> {
  label: string
  value: T
}

interface SelectorProps<T extends string = string> {
  label?: string
  options?: SelectorOption<T>[]
  value: T | null
  onChange: (value: T) => void
  placeholder?: string
  loading?: boolean
  className?: string
  loadOptions?: (query: string) => Promise<SelectorOption<T>[]>
}

export function Selector<T extends string = string>({
  label,
  options: staticOptions = [],
  value,
  onChange,
  placeholder = 'Search…',
  loading: externalLoading = false,
  className,
  loadOptions,
}: SelectorProps<T>) {
  const inputId = useId()
  const listboxId = useId()

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [asyncOptions, setAsyncOptions] = useState<SelectorOption<T>[]>([])
  const [asyncLoading, setAsyncLoading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = externalLoading || asyncLoading
  const options = loadOptions ? asyncOptions : staticOptions
  const filtered = loadOptions
    ? options
    : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
  const selectedOption = options.find((o) => o.value === value) ?? null

  useEffect(() => {
    if (!loadOptions) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setAsyncLoading(true)
      try {
        const result = await loadOptions(query)
        setAsyncOptions(result)
      } finally {
        setAsyncLoading(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, loadOptions])

  useEffect(() => {
    setActiveIndex(-1)
  }, [filtered.length, isOpen])

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openDropdown = useCallback(() => {
    setIsOpen(true)
    setQuery(selectedOption?.label ?? '')
  }, [selectedOption])

  const selectOption = useCallback(
    (option: SelectorOption<T>) => {
      onChange(option.value)
      setQuery(option.label)
      setIsOpen(false)
      inputRef.current?.blur()
    },
    [onChange]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        openDropdown()
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        if (activeIndex >= 0 && filtered[activeIndex]) {
          e.preventDefault()
          selectOption(filtered[activeIndex])
        } else {
          setIsOpen(false)
        }
        break
      case 'Escape':
      case 'Tab':
        setIsOpen(false)
        break
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn('selector', isOpen && 'selector--open', className)}
    >
      {label && (
        <label htmlFor={inputId} className="selector__label">
          {label}
        </label>
      )}

      <div className="selector__control">
        <span className="selector__icon" aria-hidden="true">
          <MapPin size={16} />
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          placeholder={placeholder}
          value={isOpen ? query : (selectedOption?.label ?? '')}
          onFocus={openDropdown}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />

        {value && (
          <button
            type="button"
            className="selector__clear"
            aria-label="Clear selection"
            onMouseDown={(e) => {
              e.preventDefault()
              onChange('' as T)
              setQuery('')
              setTimeout(() => setIsOpen(true), 0)
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="selector__dropdown"
          aria-label={label}
        >
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <li key={i} className="selector__skeleton">
                <span className="selector__skeleton-line" />
              </li>
            ))
          ) : filtered.length === 0 ? (
            <li className="selector__state selector__state--empty">
              No results found
            </li>
          ) : (
            filtered.map((option, index) => (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={cn(
                  'selector__option',
                  option.value === value && 'selector__option--selected',
                  index === activeIndex && 'selector__option--active'
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectOption(option)
                }}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}