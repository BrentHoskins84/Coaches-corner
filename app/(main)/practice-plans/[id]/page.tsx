import { use } from 'react'
import { getPracticePlanById } from "@/utils/actions/practice-plans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Clock, Users, ChevronLeft, Edit } from "lucide-react"

interface PracticePlanItem {
  id: string
  name: string
  duration: number
  description: string
  category: string
}

interface PracticePlan {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string
  objectives: string[]
  items: PracticePlanItem[]
}

export default function PracticePlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: practicePlan, error } = use(getPracticePlanById(id))

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!practicePlan) {
    return <div>Error: Practice plan not found</div>
  }

  const totalDuration = practicePlan.items?.reduce((sum: number, item: PracticePlanItem) => sum + item.duration, 0) || 0
  const formattedDate = new Date(practicePlan.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/practice-plans">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Practice Plans
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{practicePlan.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/practice-plans/${practicePlan.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Practice Plan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Practice Plan Details */}
          <Card>
            <CardHeader>
              <CardTitle>Practice Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Date:</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time:</span>
                <span>{practicePlan.start_time} - {practicePlan.end_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Total Duration:</span>
                <span>{totalDuration} minutes</span>
              </div>
            </CardContent>
          </Card>

          {/* Drills/Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Drills/Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {practicePlan.items && practicePlan.items.length > 0 ? (
                <ul className="space-y-4">
                  {practicePlan.items.map((item: PracticePlanItem, index: number) => (
                    <li key={item.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-sm text-muted-foreground">{item.duration} min</span>
                        </div>
                      </div>
                      {index < practicePlan.items.length - 1 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Next: {practicePlan.items[index + 1].name}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No drills or activities have been added to this practice plan.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              {practicePlan.objectives && practicePlan.objectives.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {practicePlan.objectives.map((objective: string, i: number) => (
                    <li key={i} className="text-muted-foreground">{objective}</li>
                  ))}
                </ul>
              ) : (
                <p>No objectives have been set for this practice plan.</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Add any additional information about the practice plan here.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
