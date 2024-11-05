'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateTeam } from "@/utils/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Team } from "@/types/database"
import Loading from "@/components/loading"

interface HeadCoach {
  id: string;
  email: string;
}

interface EditTeamFormProps {
  team: Team;
  availableHeadCoaches: HeadCoach[];
}

export default function EditTeamForm({ team, availableHeadCoaches }: EditTeamFormProps) {
  const [teamName, setTeamName] = useState(team.name)
  const [headCoachId, setHeadCoachId] = useState<string | undefined>(team.head_coach_id || undefined)
  const [isActive, setIsActive] = useState(team.is_active)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await updateTeam(team.id, {
        name: teamName,
        head_coach_id: headCoachId === 'none' ? null : headCoachId || null,
        is_active: isActive
      })

      if (error) throw new Error(error)

      toast({
        title: "Success",
        description: "Team updated successfully.",
      })
      router.push('/teams')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loading message="Updating team..." dotSize={16} dotGap={6} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="teamName">Team Name</Label>
        <Input
          id="teamName"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="headCoach">Head Coach</Label>
        <Select value={headCoachId} onValueChange={setHeadCoachId}>
          <SelectTrigger id="headCoach">
            <SelectValue placeholder="Select a head coach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No head coach</SelectItem>
            {availableHeadCoaches.map((coach) => (
              <SelectItem key={coach.id} value={coach.id}>
                {coach.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <Button type="submit">
        Update Team
      </Button>
    </form>
  )
}
