import { getTeamById, getAvailableHeadCoaches } from "@/utils/actions/teams"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EditTeamForm from '@/components/teams/edit-team-form'

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  const { data: team, error: teamError } = await getTeamById(params.id)
  const { data: availableHeadCoaches, error: coachesError } = await getAvailableHeadCoaches()

  if (teamError || coachesError) {
    console.error('Team Error:', teamError)
    console.error('Coaches Error:', coachesError)
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
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Team: {team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <EditTeamForm team={team} availableHeadCoaches={availableHeadCoaches || []} />
        </CardContent>
      </Card>
    </div>
  )
}
