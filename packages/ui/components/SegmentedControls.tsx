import clsx from 'clsx'
import { useState } from 'react'

import { Button } from './Button'

export interface SegmentedControlTab<T extends unknown> {
  label: string
  value: T
}

export interface SegmentedControlsProps<T extends unknown> {
  tabs: SegmentedControlTab<T>[]
  selected: T
  onSelect: (value: T) => void
  loading?: T
}

export const SegmentedControls = <T extends unknown>({
  tabs,
  selected,
  onSelect,
  loading,
}: SegmentedControlsProps<T>) => {
  const [hovering, setHovering] = useState<number>()

  return (
    <div
      className="group grid grid-flow-col auto-cols-fr bg-background-tertiary rounded-md"
      onMouseLeave={() => setHovering(undefined)}
    >
      {tabs.map(({ label, value }, index) => (
        <div key={index} className="flex flex-row items-stretch">
          <div
            className={clsx(
              'self-center w-[1px] h-4 bg-border-primary opacity-100 transition-opacity',
              {
                // Do not show left border if...
                '!opacity-0':
                  // first element.
                  index === 0 ||
                  // left tab selected.
                  selected === tabs[index - 1].value ||
                  // current tab selected.
                  selected === value ||
                  // left tab hovering.
                  hovering === index - 1 ||
                  // current tab hovering.
                  hovering === index,
              }
            )}
          ></div>

          <Button
            className={clsx(
              'flex justify-center items-center px-12 w-full',
              selected === value || hovering === index
                ? // Brighten text when selected or hovering over this tab.
                  'body-text'
                : // Dim text when not selected and not hovering over this tab.
                  'text-text-secondary',
              // Highlight background when selected. Button contains its own
              // hover background class.
              selected === value && 'bg-background-primary'
            )}
            loading={loading === value}
            onClick={() => onSelect(value)}
            onMouseOver={() => setHovering(index)}
            variant="ghost"
          >
            {label}
          </Button>
        </div>
      ))}
    </div>
  )
}
