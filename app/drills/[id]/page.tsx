import { getDrillById } from "@/utils/actions/drills"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Clock,
  Users,
  Target,
  Dumbbell,
  ChevronLeft,
  Edit
} from "lucide-react"

interface DrillPageProps {
  params: { id: string }
}

export default async function DrillPage({ params }: DrillPageProps) {
  const { id } = await params
  const { data: drill, error } = await getDrillById(id)

  if (error || !drill) {
    redirect('/drills')
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/drills">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Drills
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{drill.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/drills/${drill.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Drill
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Details */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{drill.description}</p>
            </CardContent>
          </Card>

          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Duration:</span>
                <span>{drill.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Players:</span>
                <span>{drill.min_players} - {drill.max_players} players</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Difficulty:</span>
                <Badge variant={
                  drill.difficulty_level === 'Beginner' ? 'secondary' :
                  drill.difficulty_level === 'Intermediate' ? 'default' :
                  'destructive'
                }>
                  {drill.difficulty_level}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Sport:</span>
                <span>{drill.sport}</span>
              </div>
            </CardContent>
          </Card>

          {/* Objectives and Coaching Points */}
          <Card>
            <CardHeader>
              <CardTitle>Objectives & Coaching Points</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div>
                <h3 className="font-semibold mb-2">Objectives</h3>
                <ul className="list-disc list-inside space-y-1">
                  {drill.objectives?.map((objective, index) => (
                    <li key={index} className="text-muted-foreground">{objective}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Key Coaching Points</h3>
                <ul className="list-disc list-inside space-y-1">
                  {drill.key_coaching_points?.map((point, index) => (
                    <li key={index} className="text-muted-foreground">{point}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Equipment and Space */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Equipment Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {drill.equipment_needed?.map((equipment, index) => (
                    <Badge key={index} variant="outline">{equipment}</Badge>
                  ))}
                </div>
              </div>
              {drill.space_required && (
                <div>
                  <h3 className="font-semibold mb-2">Space Required</h3>
                  <p className="text-muted-foreground">{drill.space_required}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <h3 className="font-semibold mb-2">Age Group</h3>
                <p className="text-muted-foreground">{drill.age_group}</p>
              </div>
              {drill.progression && (
                <div>
                  <h3 className="font-semibold mb-2">Progression</h3>
                  <p className="text-muted-foreground">{drill.progression}</p>
                </div>
              )}
              {drill.safety_considerations && (
                <div>
                  <h3 className="font-semibold mb-2">Safety Considerations</h3>
                  <p className="text-muted-foreground">{drill.safety_considerations}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {drill.is_warm_up && (
                  <Badge variant="secondary">Suitable for Warm-up</Badge>
                )}
                {drill.is_cool_down && (
                  <Badge variant="secondary">Suitable for Cool-down</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
