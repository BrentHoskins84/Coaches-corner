'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createTeam, getAvailableHeadCoaches } from "@/utils/actions/teams"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import Loading from "@/components/loading"

interface HeadCoach {
  id: string;
  email: string;
}

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('')
  const [headCoachId, setHeadCoachId] = useState<string | undefined>(undefined)
  const [availableHeadCoaches, setAvailableHeadCoaches] = useState<HeadCoach[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchHeadCoaches() {
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
        setAvailableHeadCoaches(data)
      }
      setIsPageLoading(false)
    }
    fetchHeadCoaches()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await createTeam({
        name: teamName,
        head_coach_id: headCoachId === 'none' ? null : headCoachId || null,
        is_active: true
      })

      if (error) throw new Error(error)

      toast({
        title: "Success",
        description: "Team created successfully.",
      })
      router.push('/teams')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center h-64">
            <Loading message="Loading..." dotSize={16} dotGap={6} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Team</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
              <Label htmlFor="headCoach">Head Coach (Optional)</Label>
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
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Team'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
