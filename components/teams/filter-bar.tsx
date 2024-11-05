import { useState, useEffect, useCallback } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Team } from "@/types/database"

interface FilterBarProps {
  teams: Team[]
  onFilterChange: (filters: { search: string, isActive?: boolean, hasHeadCoach?: boolean }) => void
}

export function FilterBar({ teams, onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState('')
  const [isActive, setIsActive] = useState<string | undefined>(undefined)
  const [hasHeadCoach, setHasHeadCoach] = useState<string | undefined>(undefined)

  const handleFilterChange = useCallback(() => {
    onFilterChange({
      search,
      isActive: isActive === undefined ? undefined : isActive === 'true',
      hasHeadCoach: hasHeadCoach === undefined ? undefined : hasHeadCoach === 'true'
    })
  }, [search, isActive, hasHeadCoach, onFilterChange])

  useEffect(() => {
    handleFilterChange()
  }, [handleFilterChange])

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">
          Search teams
        </Label>
        <Input
          id="search"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="isActive" className="sr-only">
          Active Status
        </Label>
        <Select value={isActive} onValueChange={setIsActive}>
          <SelectTrigger id="isActive" className="w-[180px]">
            <SelectValue placeholder="Active Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="hasHeadCoach" className="sr-only">
          Head Coach
        </Label>
        <Select value={hasHeadCoach} onValueChange={setHasHeadCoach}>
          <SelectTrigger id="hasHeadCoach" className="w-[180px]">
            <SelectValue placeholder="Head Coach Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Head Coach Statuses</SelectItem>
            <SelectItem value="true">Has Head Coach</SelectItem>
            <SelectItem value="false">No Head Coach</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
