import type { Key, ReactNode } from "react"

import { cn } from "@/lib/utils"

type DynamicListProps<T> = {
  items: T[]
  getKey: (item: T, index: number) => Key
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  itemClassName?: string
  getItemClassName?: (item: T, index: number) => string | undefined
  emptyState?: ReactNode
}

export function DynamicList<T>({
  items,
  getKey,
  renderItem,
  className,
  itemClassName,
  getItemClassName,
  emptyState,
}: DynamicListProps<T>) {
  if (!items.length) {
    return emptyState ? <div className={className}>{emptyState}</div> : null
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={getKey(item, index)}
          className={cn(itemClassName, getItemClassName?.(item, index))}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
