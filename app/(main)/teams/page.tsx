'use client'

import { useEffect, useState, useCallback } from 'react'
import { getTeams } from "@/utils/actions/teams"
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
import { Plus } from "lucide-react"
import { FilterBar } from "@/components/teams/filter-bar"
import Link from "next/link"
import { Team } from "@/types/database"
import Loading from "@/components/loading"

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeams() {
      try {
        const { data, error } = await getTeams()
        if (error) throw new Error(error)
        setTeams(data || [])
        setFilteredTeams(data || [])
      } catch (err) {
        setError('Failed to load teams')
        console.error('Error loading teams:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const handleFilterChange = useCallback((filters: {
    search: string
    isActive?: boolean
    hasHeadCoach?: boolean
  }) => {
    let filtered = [...teams]

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm)
      )
    }

    if (filters.isActive !== undefined) {
      filtered = filtered.filter(team => team.is_active === filters.isActive)
    }

    if (filters.hasHeadCoach !== undefined) {
      filtered = filtered.filter(team =>
        filters.hasHeadCoach ? team.head_coach_id !== null : team.head_coach_id === null
      )
    }

    setFilteredTeams(filtered)
  }, [teams])

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loading
            message="Loading teams..."
            dotSize={16}
            dotGap={6}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <Button asChild>
          <Link href="/teams/create">
            <Plus className="mr-2 h-4 w-4" />
            Add New Team
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <FilterBar teams={teams} onFilterChange={handleFilterChange} />
      </div>

      {error ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      ) : filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <p className="text-muted-foreground">No teams found</p>
            <Button asChild>
              <Link href="/teams/create">Create your first team</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Head Coach</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/teams/${team.id}`}
                        className="hover:underline"
                      >
                        {team.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {team.head_coach_id ? (
                        <Link
                          href={`/users/${team.head_coach_id}`}
                          className="hover:underline"
                        >
                          View Head Coach
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${team.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {team.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/teams/${team.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/teams/${team.id}/manage`}>
                            Manage
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
