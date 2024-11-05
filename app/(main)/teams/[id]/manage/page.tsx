import { getTeamById, getTeamMembers } from "@/utils/actions/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default async function TeamManagementPage({ params }: { params: { id: string } }) {
  const { id } = await params

  const { data: team, error: teamError } = await getTeamById(id)
  const { data: teamMembers, error: membersError } = await getTeamMembers(id)

  if (teamError || membersError) {
    console.error('Team Error:', teamError)
    console.error('Members Error:', membersError)
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-red-500">Error loading data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p>Team not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Team Management: {team.name}</CardTitle>
          <Link href={`/teams/${team.id}/edit`}>
            <Button variant="outline">Edit Team</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Head Coach:</p>
              <p>{team.head_coach?.email || 'No head coach assigned'}</p>
            </div>
            <div>
              <p className="font-semibold">Status:</p>
              <Badge variant={team.is_active ? "default" : "secondary"}>
                {team.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers && teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback>{member.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <Badge>{member.role}</Badge>
                </div>
              ))
            ) : (
              <p>No team members found.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Add/Remove team members functionality will be implemented here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Team-specific settings and preferences will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
