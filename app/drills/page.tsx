'use client'

import { useEffect, useState } from 'react'
import { getDrills } from "@/utils/actions/drills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Plus, Clock, Users, Dumbbell } from "lucide-react"
import { FilterBar } from "@/components/drills/filter-bar"
import Link from "next/link"
import { Drill } from "@/types/database"

const categoryColors = {
  'Offense': 'bg-blue-500/20 text-blue-500',
  'Defense': 'bg-red-500/20 text-red-500'
}

export default function DrillsPage() {
  const [drills, setDrills] = useState<Drill[]>([])
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDrills() {
      try {
        const { data, error } = await getDrills()
        if (error) throw error
        setDrills(data || [])
        setFilteredDrills(data || [])
      } catch (err) {
        setError('Failed to load drills')
        console.error('Error loading drills:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDrills()
  }, [])

  const handleFilterChange = (filters: {
    search: string
    category: string
    difficulty: string
    sport: string
    minPlayers: string
    maxPlayers: string
  }) => {
    let filtered = [...drills]

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(drill =>
        drill.name.toLowerCase().includes(searchTerm) ||
        drill.description.toLowerCase().includes(searchTerm)
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(drill => drill.category === filters.category)
    }

    // Apply difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(drill => drill.difficulty_level === filters.difficulty)
    }

    // Apply sport filter
    if (filters.sport) {
      filtered = filtered.filter(drill => drill.sport === filters.sport)
    }

    // Apply player count filters
    if (filters.minPlayers) {
      const min = parseInt(filters.minPlayers)
      filtered = filtered.filter(drill => drill.min_players >= min)
    }
    if (filters.maxPlayers) {
      const max = parseInt(filters.maxPlayers)
      filtered = filtered.filter(drill => drill.max_players <= max)
    }

    setFilteredDrills(filtered)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Drills</h1>
        <Button asChild>
          <Link href="/drills/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Drill
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <FilterBar drills={drills} onFilterChange={handleFilterChange} />
      </div>

      {error ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : filteredDrills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <p className="text-muted-foreground">No drills found</p>
            <Button asChild>
              <Link href="/drills/add">Create your first drill</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Drills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrills.map((drill) => (
                  <TableRow key={drill.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/drills/${drill.id}`}
                        className="hover:underline"
                      >
                        {drill.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[drill.category] || 'bg-gray-700'}`}>
                        {drill.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {drill.duration} min
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${drill.difficulty_level === 'Beginner' ? 'bg-emerald-500/10 text-emerald-500' :
                          drill.difficulty_level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'}`}>
                        {drill.difficulty_level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        {drill.min_players}-{drill.max_players}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-sm text-muted-foreground">
                        <Dumbbell className="mr-1 h-4 w-4" />
                        {drill.sport}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/drills/${drill.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
