import { getPracticePlanById } from "@/utils/actions/practice-plans"
import { getDrillTypes } from "@/utils/actions/drill-types"
import { getUserFullName } from "@/utils/getUserData"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChevronLeft,
  Clock,
  Calendar,
  Edit,
  Info
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface PracticePlanPageProps {
  params: { id: string }
}

export default async function PracticePlanPage({ params }: PracticePlanPageProps) {
  const { id } = await params
  const { data: plan, error } = await getPracticePlanById(id)
  const { data: typeColors } = await getDrillTypes()

  if (error || !plan) {
    notFound()
  }

  const createdByName = await getUserFullName(plan.created_by)
  const totalDuration = plan.practice_plan_items.reduce((sum, item) => sum + item.duration, 0)

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/practice-plans">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            <p className="text-muted-foreground">
              Created by {createdByName}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/practice-plans/create?edit=${plan.id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{totalDuration} minutes total</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>
                  {plan.practice_plan_items.filter(item => item.item_type === 'drill').length} drills
                </div>
                <div>
                  {plan.practice_plan_items.filter(item => item.item_type === 'break').length} breaks
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Practice Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.practice_plan_items.map((item, index) => {
                  const startMinutes = plan.practice_plan_items
                    .slice(0, index)
                    .reduce((sum, i) => sum + i.duration, 0)

                  const startTime = new Date(`2000-01-01T${plan.start_time}`)
                  startTime.setMinutes(startTime.getMinutes() + startMinutes)

                  return (
                    <div
                      key={item.id}
                      className="relative flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <div className="flex-shrink-0 w-20 text-sm text-muted-foreground">
                        {startTime.toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </div>

                      {item.item_type === 'break' ? (
                        <div className="flex-grow">
                          <div className="font-medium">Break</div>
                          <div className="text-sm text-muted-foreground">
                            {item.duration} minutes
                          </div>
                        </div>
                      ) : item.drill ? (
                        <div className="flex-grow">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${typeColors?.[item.drill.category] || 'bg-gray-700'}`} />
                            <span className="font-medium">{item.drill.name}</span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Info className="h-4 w-4" />
                                  <span className="sr-only">Drill Details</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{item.drill.name}</DialogTitle>
                                  <DialogDescription>
                                    {item.drill.description}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="font-medium">Category:</span>
                                    <span className="col-span-3">{item.drill.category}</span>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <span className="font-medium">Duration:</span>
                                    <span className="col-span-3">{item.duration} minutes</span>
                                  </div>
                                  {item.drill.objectives && (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <span className="font-medium">Objectives:</span>
                                      <div className="col-span-3">
                                        <ul className="list-disc list-inside">
                                          {item.drill.objectives.map((objective, i) => (
                                            <li key={i}>{objective}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.duration} minutes
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
