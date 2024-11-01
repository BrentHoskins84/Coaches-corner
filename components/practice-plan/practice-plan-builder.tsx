'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { PlusCircle, Save, ChevronLeft } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Drill, PracticePlanItemInsert } from "@/types/database"
import { createPracticePlan, updatePracticePlan } from "@/utils/actions/practice-plans"
import { getDrillTypes } from "@/utils/actions/drill-types"
import Link from 'next/link'
import Loading from "@/components/loading"

interface TimelineItem {
  timelineId: string;
  originalId: string;
  name: string;
  duration: number;
  type: 'drill' | 'break';
  category?: string;
  description?: string;
}

interface PracticePlanBuilderProps {
  editId?: string;
  initialData?: {
    name: string;
    start_time: string;
    end_time: string;
    practice_plan_items: any[];
  };
}

export default function PracticePlanBuilder({ editId, initialData }: PracticePlanBuilderProps) {
  const [availableDrills, setAvailableDrills] = useState<Drill[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [startTime, setStartTime] = useState(initialData?.start_time || '17:30')
  const [endTime, setEndTime] = useState(initialData?.end_time || '19:00')
  const [selectedDrill, setSelectedDrill] = useState<TimelineItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editedDuration, setEditedDuration] = useState('')
  const [draggedItem, setDraggedItem] = useState<TimelineItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [planName, setPlanName] = useState(initialData?.name || '')
  const [isSaving, setIsSaving] = useState(false)
  const [typeColors, setTypeColors] = useState<Record<string, string>>({})

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch available drills
        const { data: drills, error: drillsError } = await supabase
          .from('drills')
          .select('*')
          .is('deleted_at', null)
          .order('name')

        if (drillsError) throw drillsError

        // Fetch drill type colors
        const { data: colors, error: colorsError } = await getDrillTypes()

        if (colorsError) {
          toast({
            title: "Error",
            description: "Failed to load drill type colors. Using defaults.",
            variant: "destructive",
          })
        } else if (colors) {
          setTypeColors(colors)
        }

        setAvailableDrills(drills || [])

        // If editing, set up the timeline with initial data
        if (initialData) {
          const timelineItems = initialData.practice_plan_items
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((item: any) => {
              if (item.item_type === 'break') {
                return {
                  timelineId: `break-${Date.now()}-${Math.random()}`,
                  originalId: '',
                  name: 'Break',
                  duration: item.duration,
                  type: 'break' as const
                }
              }
              return {
                timelineId: `drill-${Date.now()}-${Math.random()}`,
                originalId: item.drill.id,
                name: item.drill.name,
                duration: item.duration,
                type: 'drill' as const,
                category: item.drill.category,
                description: item.drill.description
              }
            })

          setTimeline(timelineItems)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [initialData, toast, supabase])

  const handleSave = async () => {
    if (!planName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your practice plan.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Create practice plan items from timeline
      const items: PracticePlanItemInsert[] = timeline.map((item, index) => ({
        drill_id: item.type === 'drill' ? item.originalId : undefined,
        duration: item.duration,
        order_index: index,
        item_type: item.type,
        practice_plan_id: editId || '' // This will be set by the server for new plans
      }))

      const planData = {
        name: planName,
        start_time: startTime,
        end_time: endTime,
        created_by: (await supabase.auth.getUser()).data.user!.id
      }

      const { error } = editId
        ? await updatePracticePlan(editId, planData, items)
        : await createPracticePlan(planData, items)

      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Success",
        description: `Practice plan ${editId ? 'updated' : 'created'} successfully!`,
      })

      router.push('/practice-plans')
      router.refresh()
    } catch (error) {
      console.error('Error saving practice plan:', error)
      toast({
        title: "Error",
        description: `Failed to ${editId ? 'update' : 'create'} practice plan. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onDragStart = (e: React.DragEvent, item: TimelineItem | Drill, fromTimeline: boolean = false) => {
    let dragItem: TimelineItem;

    if ('timelineId' in item) {
      dragItem = item;
    } else {
      dragItem = {
        timelineId: `drill-${Date.now()}-${Math.random()}`,
        originalId: item.id,
        name: item.name,
        duration: item.duration,
        type: 'drill',
        category: item.category,
        description: item.description
      };
    }

    e.dataTransfer.setData('text/plain', JSON.stringify({ item: dragItem, fromTimeline }))
    setDraggedItem(dragItem)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent, targetList: 'timeline' | 'available', index?: number) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    const item: TimelineItem = data.item
    const fromTimeline: boolean = data.fromTimeline

    if (targetList === 'timeline') {
      if (fromTimeline) {
        // Reordering within timeline
        const newTimeline = [...timeline]
        const oldIndex = newTimeline.findIndex(i => i.timelineId === item.timelineId)
        newTimeline.splice(oldIndex, 1)
        newTimeline.splice(index!, 0, item)
        setTimeline(newTimeline)
      } else {
        // Adding from available drills to timeline
        const availableTime = calculateAvailableTime()
        if (availableTime === 0) {
          toast({
            title: "No Time Available",
            description: `Unable to add "${item.name}". There is no time left in the practice plan.`,
            variant: "destructive",
          })
          return
        }

        const timelineItem: TimelineItem = {
          ...item,
          duration: item.duration > availableTime ? availableTime : item.duration,
        }

        if (item.duration > availableTime) {
          toast({
            title: "Drill Duration Adjusted",
            description: `The duration of "${item.name}" has been adjusted from ${item.duration} to ${availableTime} minutes due to insufficient time.`,
            variant: "destructive",
          })
        }

        setTimeline([...timeline.slice(0, index), timelineItem, ...timeline.slice(index || timeline.length)])
      }
    } else {
      // Moving from timeline to available drills
      setTimeline(timeline.filter(t => t.timelineId !== item.timelineId))
    }
    setDraggedItem(null)
  }

  const addBreak = () => {
    const newBreak: TimelineItem = {
      timelineId: `break-${Date.now()}-${Math.random()}`,
      originalId: '',
      name: 'Break',
      duration: 5,
      type: 'break'
    }

    const availableTime = calculateAvailableTime()
    if (availableTime === 0) {
      toast({
        title: "No Time Available",
        description: "Unable to add break. There is no time left in the practice plan.",
        variant: "destructive",
      })
      return
    }

    if (newBreak.duration > availableTime) {
      if (availableTime > 0) {
        newBreak.duration = availableTime
        setTimeline([...timeline, newBreak])
        toast({
          title: "Break Duration Adjusted",
          description: `The duration of the break has been adjusted to ${availableTime} minutes due to insufficient time.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Unable to Add Break",
          description: "No time remaining in the practice plan.",
          variant: "destructive",
        })
      }
    } else {
      setTimeline([...timeline, newBreak])
    }
  }

  const calculateAvailableTime = (): number => {
    const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0)
    const totalAvailableMinutes = (new Date(`2000-01-01T${endTime}`).getTime() - new Date(`2000-01-01T${startTime}`).getTime()) / 60000
    return Math.max(0, totalAvailableMinutes - totalDuration)
  }

  const formatTimelineTime = (minutes: number): string => {
    const start = new Date(`2000-01-01T${startTime}`)
    start.setMinutes(start.getMinutes() + minutes)
    return start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const calculateDrillPosition = (index: number): { left: string, width: string } => {
    const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0)
    const startPosition = timeline.slice(0, index).reduce((sum, item) => sum + item.duration, 0)
    const left = (startPosition / totalDuration) * 100
    const width = (timeline[index].duration / totalDuration) * 100
    return { left: `${left}%`, width: `${width}%` }
  }

  const renderTimeMarkers = () => {
    const totalDuration = timeline.reduce((sum, item) => sum + item.duration, 0)
    const markers = []
    for (let i = 0; i <= totalDuration; i += 15) {
      const left = (i / totalDuration) * 100
      markers.push(
        <div key={i} className="absolute top-0 h-full border-l border-gray-600" style={{ left: `${left}%` }}>
          <span className="absolute -top-6 left-0 transform -translate-x-1/2 text-xs text-gray-400">
            {formatTimelineTime(i)}
          </span>
        </div>
      )
    }
    return markers
  }

  const openDrillDetails = (drill: TimelineItem) => {
    setSelectedDrill(drill)
    setEditedDuration(drill.duration.toString())
    setIsDialogOpen(true)
  }

  const handleDurationChange = () => {
    if (selectedDrill) {
      const newDuration = parseInt(editedDuration, 10)
      if (isNaN(newDuration) || newDuration <= 0) {
        toast({
          title: "Invalid Duration",
          description: "Please enter a valid positive number for the duration.",
          variant: "destructive",
        })
        return
      }

      const currentDuration = selectedDrill.duration
      const availableTime = calculateAvailableTime() + currentDuration

      if (newDuration > availableTime) {
        toast({
          title: "Insufficient Time",
          description: `The maximum available duration is ${availableTime} minutes.`,
          variant: "destructive",
        })
        return
      }

      const updatedTimeline = timeline.map(item =>
        item.timelineId === selectedDrill.timelineId ? { ...item, duration: newDuration } : item
      )
      setTimeline(updatedTimeline)
      setIsDialogOpen(false)
      toast({
        title: "Duration Updated",
        description: `The duration of "${selectedDrill.name}" has been updated to ${newDuration} minutes.`,
      })
    }
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

  return (
    <div className="container mx-auto p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/practice-plans">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Link>
          </Button>
          <div className="space-y-1">
            <Label htmlFor="planName">Plan Name</Label>
            <Input

              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-[300px]"
              placeholder="Enter plan name..."
            />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} variant="default">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : editId ? 'Save Changes' : 'Create Plan'}
        </Button>
      </div>

      <div className="flex mb-4">
        <div className="mr-4">
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/4 mb-4 lg:mb-0 lg:pr-4">
          <h2 className="text-xl font-semibold mb-2">Available Drills</h2>
          <ul
            className="bg-card p-4 rounded-md min-h-[200px] border"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, 'available')}
          >
            {availableDrills.map((drill) => (
              <li
                key={drill.id}
                draggable
                onDragStart={(e) => onDragStart(e, drill)}
                className={`${typeColors[drill.category || ''] || 'bg-muted'} p-2 mb-2 rounded shadow cursor-move`}
              >
                {drill.name} ({drill.duration} min)
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-3/4">
          <h2 className="text-xl font-semibold mb-2">Practice Timeline</h2>
          <div className="mb-2">
            <Button
              onClick={addBreak}
              variant="outline"
              className="flex items-center"
            >
              <PlusCircle className="mr-2" size={16} />
              Add Break
            </Button>
          </div>
          <div
            className="bg-card border p-4 pt-7 rounded-md overflow-x-auto"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, 'timeline', timeline.length)}
          >
            <div className="relative" style={{ minHeight: '200px', height: `${Math.max(200, timeline.length * 60 + 40)}px`, width: '100%', minWidth: '600px' }}>
              <div className="absolute inset-0">
                {renderTimeMarkers()}
                <div className="absolute inset-0 pt-8 top-[15px]">
                  {timeline.map((item, index) => {
                    const { left, width } = calculateDrillPosition(index)
                    return (
                      <div
                        key={item.timelineId}
                        draggable
                        onDragStart={(e) => onDragStart(e, item, true)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, 'timeline', index)}
                        onClick={() => item.type === 'drill' && openDrillDetails(item)}
                        className={`absolute h-14 ${typeColors[item.category || ''] || 'bg-muted'} rounded shadow flex flex-col justify-center items-center text-xs cursor-move overflow-hidden`}
                        style={{
                          left,
                          width,
                          top: `${index * 60}px`,
                          opacity: draggedItem?.timelineId === item.timelineId ? 0.5 : 1,
                        }}
                      >
                        {item.type === 'break' ? (
                          <>
                            <span className="font-semibold">{item.duration}</span>
                            <span>min</span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">{item.name}</span>
                            <span>{item.duration} min</span>
                            <span>{formatTimelineTime(timeline.slice(0, index).reduce((sum, d) => sum + d.duration, 0))}</span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              {timeline.length === 0 && (
                <p className="text-muted-foreground mt-8">Drag and drop drills here to build your practice plan.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-muted-foreground">Available Time: {calculateAvailableTime()} minutes</p>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDrill?.name}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <p>{selectedDrill?.description}</p>
            <p>Category: {selectedDrill?.category}</p>
          </DialogDescription>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                value={editedDuration}
                onChange={(e) => setEditedDuration(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDurationChange}>Update Duration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
