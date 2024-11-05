'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { createTeam, updateTeam, deleteTeam, getAvailableHeadCoaches } from '@/utils/actions/teams'
import { Team } from '@/types/database'

interface HeadCoach {
  id: string;
  email: string;
}

export default function TeamManagement({ initialTeams }: { initialTeams: Team[] }) {
  const [teams, setTeams] = useState<Team[]>(initialTeams)
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamHeadCoach, setNewTeamHeadCoach] = useState('')
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [availableHeadCoaches, setAvailableHeadCoaches] = useState<HeadCoach[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchAvailableHeadCoaches()
  }, [])

  const fetchAvailableHeadCoaches = async () => {
    const { data, error } = await getAvailableHeadCoaches()
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch available head coaches. Please try again.",
        variant: "destructive",
      })
      return
    }
    if (data) {
      setAvailableHeadCoaches(data.map((coach: any) => ({
        id: coach.id,
        email: coach.users.email
      })))
    } else {
      setAvailableHeadCoaches([])
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    const { data, error } = await createTeam({
      name: newTeamName.trim(),
      head_coach_id: newTeamHeadCoach || null
    })

    if (error) {
      console.error('Error creating team:', error)
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (data) {
      setTeams([...teams, data])
      setNewTeamName('')
      setNewTeamHeadCoach('')
      toast({
        title: "Success",
        description: "Team created successfully.",
      })
      router.refresh()
    }
  }

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam) return

    const { data, error } = await updateTeam(editingTeam.id, { name: editingTeam.name })

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (data) {
      setTeams(teams.map(team => team.id === editingTeam.id ? data : team))
      setEditingTeam(null)
      toast({
        title: "Success",
        description: "Team updated successfully.",
      })
      router.refresh()
    }
  }

  const handleDeleteTeam = async (teamId: string) => {
    const { data, error } = await deleteTeam(teamId)

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (data) {
      setTeams(teams.filter(team => team.id !== teamId))
      toast({
        title: "Success",
        description: "Team deleted successfully.",
      })
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
        </CardHeader>
        <form onSubmit={handleCreateTeam}>
          <CardContent className="space-y-4">
            <Input
              type="text"
              placeholder="Enter team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <Select value={newTeamHeadCoach} onValueChange={setNewTeamHeadCoach}>
              <SelectTrigger>
                <SelectValue placeholder="Select head coach" />
              </SelectTrigger>
              <SelectContent>
                {availableHeadCoaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button type="submit">Create Team</Button>
          </CardFooter>
        </form>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map(team => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle>{team.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {editingTeam?.id === team.id ? (
                <form onSubmit={handleEditTeam}>
                  <Input
                    type="text"
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="mb-2"
                  />
                  <Button type="submit" className="mr-2">Save</Button>
                  <Button variant="outline" onClick={() => setEditingTeam(null)}>Cancel</Button>
                </form>
              ) : (
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setEditingTeam(team)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDeleteTeam(team.id)}>Delete</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
