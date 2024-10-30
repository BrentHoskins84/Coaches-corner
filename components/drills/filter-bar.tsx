'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Drill, DrillCategory, DifficultyLevel } from "@/types/database"

interface FilterBarProps {
  drills: Drill[]
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  search: string
  category: string
  difficulty: string
  sport: string
  minPlayers: string
  maxPlayers: string
}

export function FilterBar({ drills, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    difficulty: 'all',
    sport: 'all',
    minPlayers: '',
    maxPlayers: ''
  })

  // Get unique values for select options
  const sports = Array.from(new Set(drills.map(drill => drill.sport)))
  const categories: DrillCategory[] = ['Offense', 'Defense']
  const difficulties: DifficultyLevel[] = ['Beginner', 'Intermediate', 'Advanced']

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    // Convert 'all' back to empty string for the parent component's filtering logic
    const processedFilters = {
      ...newFilters,
      category: newFilters.category === 'all' ? '' : newFilters.category,
      difficulty: newFilters.difficulty === 'all' ? '' : newFilters.difficulty,
      sport: newFilters.sport === 'all' ? '' : newFilters.sport,
    }
    onFilterChange(processedFilters)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: 'all',
      difficulty: 'all',
      sport: 'all',
      minPlayers: '',
      maxPlayers: ''
    }
    setFilters(clearedFilters)
    onFilterChange({
      search: '',
      category: '',
      difficulty: '',
      sport: '',
      minPlayers: '',
      maxPlayers: ''
    })
  }

  const hasActiveFilters = filters.search !== '' ||
    filters.category !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.sport !== 'all' ||
    filters.minPlayers !== '' ||
    filters.maxPlayers !== ''

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search drills..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="max-w-sm"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters">
          <AccordionTrigger>Advanced Filters</AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) => handleFilterChange('difficulty', value)}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All difficulties</SelectItem>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sport">Sport</Label>
                <Select
                  value={filters.sport}
                  onValueChange={(value) => handleFilterChange('sport', value)}
                >
                  <SelectTrigger id="sport">
                    <SelectValue placeholder="All sports" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sports</SelectItem>
                    {sports.map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPlayers">Min Players</Label>
                <Input
                  id="minPlayers"
                  type="number"
                  value={filters.minPlayers}
                  onChange={(e) => handleFilterChange('minPlayers', e.target.value)}
                  min="1"
                  placeholder="Min players"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Max Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  value={filters.maxPlayers}
                  onChange={(e) => handleFilterChange('maxPlayers', e.target.value)}
                  min="1"
                  placeholder="Max players"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
