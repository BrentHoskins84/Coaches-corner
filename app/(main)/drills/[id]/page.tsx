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
  params: Promise<{ id: string }>
}

interface Drill {
  id: string
  name: string
  description: string
  duration: number
  min_players: number
  max_players: number
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced'
  sport: string
  objectives: string[]
  key_coaching_points: string[]
  equipment_needed: string[]
  space_required?: string
  age_group: string
  progression?: string
  safety_considerations?: string
  is_warm_up: boolean
  is_cool_down: boolean
}

export default async function DrillPage({ params }: DrillPageProps) {
  const { id } = await params
  const { data: drill, error } = await getDrillById(id)

  if (error || !drill) {
    redirect('/drills')
  }

  const typedDrill = drill as Drill

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
          <h1 className="text-3xl font-bold">{typedDrill.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/drills/${typedDrill.id}/edit`}>
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
              <p className="text-muted-foreground">{typedDrill.description}</p>
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
                <span>{typedDrill.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Players:</span>
                <span>{typedDrill.min_players} - {typedDrill.max_players} players</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Difficulty:</span>
                <Badge variant={
                  typedDrill.difficulty_level === 'Beginner' ? 'secondary' :
                  typedDrill.difficulty_level === 'Intermediate' ? 'default' :
                  'destructive'
                }>
                  {typedDrill.difficulty_level}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Sport:</span>
                <span>{typedDrill.sport}</span>
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
                  {typedDrill.objectives.map((objective: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{objective}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Key Coaching Points</h3>
                <ul className="list-disc list-inside space-y-1">
                  {typedDrill.key_coaching_points.map((point: string, index: number) => (
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
                  {typedDrill.equipment_needed.map((equipment: string, index: number) => (
                    <Badge key={index} variant="outline">{equipment}</Badge>
                  ))}
                </div>
              </div>
              {typedDrill.space_required && (
                <div>
                  <h3 className="font-semibold mb-2">Space Required</h3>
                  <p className="text-muted-foreground">{typedDrill.space_required}</p>
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
                <p className="text-muted-foreground">{typedDrill.age_group}</p>
              </div>
              {typedDrill.progression && (
                <div>
                  <h3 className="font-semibold mb-2">Progression</h3>
                  <p className="text-muted-foreground">{typedDrill.progression}</p>
                </div>
              )}
              {typedDrill.safety_considerations && (
                <div>
                  <h3 className="font-semibold mb-2">Safety Considerations</h3>
                  <p className="text-muted-foreground">{typedDrill.safety_considerations}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {typedDrill.is_warm_up && (
                  <Badge variant="secondary">Suitable for Warm-up</Badge>
                )}
                {typedDrill.is_cool_down && (
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
