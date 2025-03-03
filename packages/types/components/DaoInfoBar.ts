import { ComponentType, ReactNode } from 'react'

export interface DaoInfoBarItem {
  Icon: ComponentType<{ className: string }>
  label: string
  value: ReactNode
}

export interface DaoInfoBarProps {
  items: DaoInfoBarItem[]
  className?: string
}
