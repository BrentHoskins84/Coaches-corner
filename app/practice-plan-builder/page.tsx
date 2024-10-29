'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PlusCircle } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Drill } from "@/types/database"

interface Break {
  id: string
  duration: number
  type: 'Break'
}

const typeColors: Record<string, string> = {
  'Warm-up': 'bg-green-300',
  'Break': 'bg-gray-300',
  'Conditioning': 'bg-green-300',
  'Offense': 'bg-green-300',
  'Defense': 'bg-green-300',
  'Cool-down': 'bg-green-300',
}

export default function PracticePlanBuilder() {
  const [availableDrills, setAvailableDrills] = useState<Drill[]>([])
  const [timeline, setTimeline] = useState<(Drill | Break)[]>([])
  const [startTime, setStartTime] = useState('17:30')
  const [endTime, setEndTime] = useState('19:00')
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editedDuration, setEditedDuration] = useState('')
  const [draggedItem, setDraggedItem] = useState<Drill | Break | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    async function fetchDrills() {
      try {
        const { data: drills, error } = await supabase
          .from('drills')
          .select('*')
          .is('deleted_at', null)
          .order('name')

        if (error) {
          throw error
        }

        setAvailableDrills(drills)
      } catch (error) {
        console.error('Error fetching drills:', error)
        toast({
          title: "Error",
          description: "Failed to load drills. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrills()
  }, [])
  const onDragStart = (e: React.DragEvent, item: Drill | Break, fromTimeline: boolean = false) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, fromTimeline }))
    setDraggedItem(item)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent, targetList: 'timeline' | 'available', index?: number) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
    const item: Drill | Break = data.item
    const fromTimeline: boolean = data.fromTimeline

    if (targetList === 'timeline') {
      if (fromTimeline) {
        // Reordering within timeline
        const newTimeline = [...timeline]
        const oldIndex = newTimeline.findIndex(i => i.id === item.id)
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
        if (item.duration > availableTime) {
          const adjustedItem = { ...item, duration: availableTime }
          setTimeline([...timeline.slice(0, index), adjustedItem, ...timeline.slice(index)])
          toast({
            title: "Drill Duration Adjusted",
            description: `The duration of "${item.name}" has been adjusted from ${item.duration} to ${availableTime} minutes due to insufficient time.`,
            variant: "warning",
          })
        } else {
          setTimeline([...timeline.slice(0, index), item, ...timeline.slice(index)])
        }
        setAvailableDrills(availableDrills.filter(d => d.id !== item.id))
      }
    } else {
      // Moving from timeline to available drills
      if ('category' in item) {
        setAvailableDrills([...availableDrills, item])
        setTimeline(timeline.filter(t => t.id !== item.id))
      }
    }
    setDraggedItem(null)
  }

  const addBreak = () => {
    const newBreak: Break = {
      id: `break-${Date.now()}`,
      duration: 5,
      type: 'Break'
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
          variant: "warning",
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

  const openDrillDetails = (drill: Drill) => {
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
        item.id === selectedDrill.id ? { ...item, duration: newDuration } : item
      )
      setTimeline(updatedTimeline)
      setIsDialogOpen(false)
      toast({
        title: "Duration Updated",
        description: `The duration of "${selectedDrill.name}" has been updated to ${newDuration} minutes.`,
        variant: "success",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 text-white w-full">
      <h1 className="text-2xl font-bold mb-4">Practice Plan Builder</h1>

      <div className="flex mb-4">
        <div className="mr-4">
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-400">Start Time</label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-400">End Time</label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/4 mb-4 lg:mb-0 lg:pr-4">
          <h2 className="text-xl font-semibold mb-2">Available Drills</h2>
          <ul
            className="bg-gray-800 p-4 rounded-md min-h-[200px]"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, 'available')}
          >
            {availableDrills.map((drill) => (
              <li
                key={drill.id}
                draggable
                onDragStart={(e) => onDragStart(e, drill)}
                className={`${typeColors[drill.type] || 'bg-gray-700'} text-gray-900 p-2 mb-2 rounded shadow cursor-move`}
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
              className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-bold"
            >
              <PlusCircle className="mr-2" size={16} />
              Add Break
            </Button>
          </div>
          <div
            className="bg-gray-800 p-4 pt-7 rounded-md overflow-x-auto"
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
                        key={`${item.id}-${index}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, item, true)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, 'timeline', index)}
                        onClick={() => 'category' in item && openDrillDetails(item)}
                        className={`absolute h-14 ${typeColors[item.type] || 'bg-gray-700'} text-gray-900 rounded shadow flex flex-col justify-center items-center text-xs cursor-move overflow-hidden`}
                        style={{
                          left,
                          width,
                          top: `${index * 60}px`,
                          opacity: draggedItem === item ? 0.5 : 1,
                        }}
                      >
                        {item.type === 'Break' ? (
                          <>
                            <span className="font-semibold">{item.duration}</span>
                            <span>min</span>
                          </>
                        ) : (
                          <>
                            <span  className="font-semibold">{item.name}</span>
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
                <p className="text-gray-500 mt-8">Drag and drop drills here to build your practice plan.</p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-gray-400">Available Time: {calculateAvailableTime()} minutes</p>
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
            <p>Type: {selectedDrill?.type}</p>
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
