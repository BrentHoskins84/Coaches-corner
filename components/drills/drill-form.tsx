'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Drill, DrillCategory, DifficultyLevel, IntensityLevel, DrillTypeConfig } from "@/types/database"
import { createDrill, updateDrill } from "@/utils/actions/drills"
import { getDrillTypes } from "@/utils/actions/drill-types"

interface DrillFormProps {
  drill?: Drill;
  mode: 'create' | 'edit';
}

export function DrillForm({ drill, mode }: DrillFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drillTypes, setDrillTypes] = useState<DrillTypeConfig[]>([])

  useEffect(() => {
    async function fetchDrillTypes() {
      const { data, error } = await getDrillTypes()
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load drill types. Please try again.",
          variant: "destructive",
        })
      } else if (data) {
        // Convert the data back to an array if it's not already
        const typesArray = Object.entries(data).map(([name, color_class]) => ({
          id: name, // Using name as id since we don't have a separate id
          name,
          color_class
        }))
        setDrillTypes(typesArray)
      }
    }
    fetchDrillTypes()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      const safeStringSplit = (value: string | null): string[] => {
        if (!value) return []
        return value.split(',').map(item => item.trim()).filter(Boolean)
      }

      const drillData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        duration: parseInt(formData.get('duration') as string),
        category: formData.get('category') as DrillCategory,
        type: formData.get('type') as string,
        difficulty_level: formData.get('difficulty_level') as DifficultyLevel,
        age_group: formData.get('age_group') as string,
        min_players: parseInt(formData.get('min_players') as string),
        max_players: parseInt(formData.get('max_players') as string),
        equipment_needed: safeStringSplit(formData.get('equipment_needed') as string),
        space_required: formData.get('space_required') as string || null,
        objectives: safeStringSplit(formData.get('objectives') as string),
        key_coaching_points: safeStringSplit(formData.get('key_coaching_points') as string),
        progression: formData.get('progression') as string || null,
        sport: formData.get('sport') as string,
        position_specificity: safeStringSplit(formData.get('position_specificity') as string),
        tactical_element: formData.get('tactical_element') as string || null,
        visual_aid: formData.get('visual_aid') as string || null,
        intensity_level: formData.get('intensity_level') as IntensityLevel || null,
        is_warm_up: formData.get('is_warm_up') === 'on',
        is_cool_down: formData.get('is_cool_down') === 'on',
        metrics_for_evaluation: safeStringSplit(formData.get('metrics_for_evaluation') as string),
        safety_considerations: formData.get('safety_considerations') as string || null,
        is_public: formData.get('is_public') === 'on',
        tags: safeStringSplit(formData.get('tags') as string)
      }

      let result;
      if (mode === 'create') {
        result = await createDrill(drillData)
      } else {
        result = await updateDrill(drill!.id, drillData)
      }

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Success",
        description: `Drill has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      })

      router.push('/drills')
      router.refresh()
    } catch (error) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} drill:`, error)
      toast({
        title: "Error",
        description: `Failed to ${mode === 'create' ? 'create' : 'update'} drill. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Add New Drill' : `Edit Drill: ${drill?.name}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Drill Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={drill?.name}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={drill?.description}
                  required
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  defaultValue={drill?.duration}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={drill?.category}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offense">Offense</SelectItem>
                    <SelectItem value="Defense">Defense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue={drill?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {drillTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select name="difficulty_level" defaultValue={drill?.difficulty_level}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age_group">Age Group</Label>
                <Input
                  id="age_group"
                  name="age_group"
                  defaultValue={drill?.age_group}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_players">Min Players</Label>
                  <Input
                    id="min_players"
                    name="min_players"
                    type="number"
                    min="1"
                    defaultValue={drill?.min_players}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max_players">Max Players</Label>
                  <Input
                    id="max_players"
                    name="max_players"
                    type="number"
                    min="1"
                    defaultValue={drill?.max_players}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="equipment_needed">Equipment Needed (comma-separated)</Label>
                <Input
                  id="equipment_needed"
                  name="equipment_needed"
                  defaultValue={drill?.equipment_needed?.join(', ')}
                />
              </div>
            </div>
          </div>

          {/* Additional Sections */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="objectives">Objectives (comma-separated)</Label>
              <Textarea
                id="objectives"
                name="objectives"
                defaultValue={drill?.objectives?.join(', ')}
                required
              />
            </div>

            <div>
              <Label htmlFor="key_coaching_points">Key Coaching Points (comma-separated)</Label>
              <Textarea
                id="key_coaching_points"
                name="key_coaching_points"
                defaultValue={drill?.key_coaching_points?.join(', ')}
                required
              />
            </div>

            <div>
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                name="sport"
                defaultValue={drill?.sport}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_public"
                name="is_public"
                defaultChecked={drill?.is_public}
              />
              <Label htmlFor="is_public">Make this drill public</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_warm_up"
                name="is_warm_up"
                defaultChecked={drill?.is_warm_up}
              />
              <Label htmlFor="is_warm_up">Suitable for warm-up</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_cool_down"
                name="is_cool_down"
                defaultChecked={drill?.is_cool_down}
              />
              <Label htmlFor="is_cool_down">Suitable for cool-down</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/drills')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? 'Create Drill' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
