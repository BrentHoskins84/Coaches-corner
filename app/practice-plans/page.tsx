'use client'

import { useEffect, useState } from 'react'
import { getPracticePlans, deletePracticePlan } from "@/utils/actions/practice-plans"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Clock, Calendar, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Loading from "@/components/loading"

interface PracticePlanItem {
  id: string;
  duration: number;
}

interface PracticePlan {
  id: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  practice_plan_items: PracticePlanItem[];
}

export default function PracticePlansPage() {
  const [practicePlans, setPracticePlans] = useState<PracticePlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchPracticePlans() {
      try {
        const { data, error } = await getPracticePlans()
        if (error) throw error
        setPracticePlans(data || [])
      } catch (err) {
        setError('Failed to load practice plans')
        console.error('Error loading practice plans:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPracticePlans()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await deletePracticePlan(id)
      if (error) throw error
      setPracticePlans(practicePlans.filter(plan => plan.id !== id))
      toast({
        title: "Success",
        description: "Practice plan deleted successfully",
      })
    } catch (err) {
      console.error('Error deleting practice plan:', err)
      toast({
        title: "Error",
        description: "Failed to delete practice plan. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString: string) => {
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true }
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <Loading
            message="Loading drills..."
            dotSize={16}
            dotGap={6}
          />
        </div>
      </div>
    )
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Practice Plans</h1>
        <Button asChild>
          <Link href="/practice-plans/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Plan
          </Link>
        </Button>
      </div>

      {practicePlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <p className="text-muted-foreground">No practice plans found</p>
            <Button asChild>
              <Link href="/practice-plans/create">Create your first practice plan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Practice Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practicePlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <Link href={`/practice-plans/${plan.id}`} className="hover:underline">
                        {plan.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(plan.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {plan.practice_plan_items.reduce((total: number, item: PracticePlanItem) => total + item.duration, 0)} min
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/practice-plans/${plan.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the practice plan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(plan.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
