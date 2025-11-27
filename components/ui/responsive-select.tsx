'use client'

import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface ResponsiveSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  title?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
  icon?: React.ReactNode
}

/**
 * A responsive select that shows as a regular select dropdown on desktop
 * and converts to a bottom sheet on mobile for better usability.
 */
export function ResponsiveSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  title,
  className,
  triggerClassName,
  disabled,
  icon,
}: ResponsiveSelectProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)

  const selectedOption = options.find(opt => opt.value === value)

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => !disabled && setOpen(true)}
          disabled={disabled}
          className={cn(
            'border-input data-[placeholder]:text-muted-foreground flex w-full items-center justify-between gap-2 rounded-xl border bg-transparent px-3 py-2 text-sm shadow-sm min-h-[44px]',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            triggerClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {icon}
            {selectedOption?.label || placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50 shrink-0"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="bottom" className={cn('pb-safe max-h-[70vh]', className)}>
            {title && (
              <SheetHeader className="text-left">
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
            )}
            <div className="mt-4 space-y-1 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (!option.disabled) {
                      onValueChange(option.value)
                      setOpen(false)
                    }
                  }}
                  disabled={option.disabled}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors min-h-[44px]',
                    'hover:bg-accent focus:bg-accent focus:outline-none',
                    option.disabled && 'pointer-events-none opacity-50',
                    value === option.value && 'bg-accent'
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.value && (
                    <CheckIcon className="h-4 w-4 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn('min-h-[44px]', triggerClassName)}>
        {icon && <span className="mr-2">{icon}</span>}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { ResponsiveSelect as default }
