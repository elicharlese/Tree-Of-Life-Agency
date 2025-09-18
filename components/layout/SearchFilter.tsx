import React from 'react'
import { Search, Filter } from 'lucide-react'
import { Input, Select, Card } from '@/libs/shared-ui/components'

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterOptions?: Array<{ value: string; label: string }>
  placeholder?: string
  showFilter?: boolean
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions = [],
  placeholder = "Search...",
  showFilter = true
}: SearchFilterProps) {
  return (
    <Card variant="organic" className="p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-bark-400" />
          <Input
            variant="organic"
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        {showFilter && filterOptions.length > 0 && (
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-bark-500" />
            <Select
              variant="organic"
              value={filterValue}
              onChange={(e) => onFilterChange?.(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </Card>
  )
}
