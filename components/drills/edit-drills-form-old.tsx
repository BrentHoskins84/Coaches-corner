'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Drill, DrillCategory, DifficultyLevel, IntensityLevel } from "@/types/database"
import { updateDrill } from "@/utils/actions/drills"

interface EditDrillFormProps {
  drill: Drill;
}

export function EditDrillForm({ drill }: EditDrillFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

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
        equipment_needed: (formData.get('equipment_needed') as string).split(',').map(item => item.trim()),
        space_required: formData.get('space_required') as string,
        objectives: (formData.get('objectives') as string).split(',').map(item => item.trim()),
        key_coaching_points: (formData.get('key_coaching_points') as string).split(',').map(item => item.trim()),
        progression: formData.get('progression') as string,
        sport: formData.get('sport') as string,
        position_specificity: (formData.get('position_specificity') as string).split(',').map(item => item.trim()),
        tactical_element: formData.get('tactical_element') as string,
        visual_aid: formData.get('visual_aid') as string,
        intensity_level: formData.get('intensity_level') as IntensityLevel,
        is_warm_up: formData.get('is_warm_up') === 'on',
        is_cool_down: formData.get('is_cool_down') === 'on',
        metrics_for_evaluation: (formData.get('metrics_for_evaluation') as string).split(',').map(item => item.trim()),
        safety_considerations: formData.get('safety_considerations') as string,
        is_public: formData.get('is_public') === 'on',
        tags: (formData.get('tags') as string).split(',').map(item => item.trim())
      }

      const { error } = await updateDrill(drill.id, drillData)

      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Success",
        description: "Drill has been updated successfully.",
      })

      router.push('/drills')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update drill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Drill: {drill.name}</CardTitle>
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
                defaultValue={drill.name}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={drill.description}
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
                defaultValue={drill.duration}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={drill.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warm-up">Warm-up</SelectItem>
                  <SelectItem value="Cool-down">Cool-down</SelectItem>
                  <SelectItem value="Offense">Offense</SelectItem>
                  <SelectItem value="Defense">Defense</SelectItem>
                  <SelectItem value="Conditioning">Conditioning</SelectItem>
                  <SelectItem value="Skill Development">Skill Development</SelectItem>
                  <SelectItem value="Team Building">Team Building</SelectItem>
                  <SelectItem value="Scrimmage">Scrimmage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                name="type"
                defaultValue={drill.type}
                required
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="difficulty_level">Difficulty Level</Label>
              <Select name="difficulty_level" defaultValue={drill.difficulty_level}>
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
                defaultValue={drill.age_group}
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
                  defaultValue={drill.min_players}
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
                  defaultValue={drill.max_players}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="equipment_needed">Equipment Needed (comma-separated)</Label>
              <Input
                id="equipment_needed"
                name="equipment_needed"
                defaultValue={drill.equipment_needed?.join(', ')}
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
              defaultValue={drill.objectives?.join(', ')}
              required
            />
          </div>

          <div>
            <Label htmlFor="key_coaching_points">Key Coaching Points (comma-separated)</Label>
            <Textarea
              id="key_coaching_points"
              name="key_coaching_points"
              defaultValue={drill.key_coaching_points?.join(', ')}
              required
            />
          </div>

          <div>
            <Label htmlFor="sport">Sport</Label>
            <Input
              id="sport"
              name="sport"
              defaultValue={drill.sport}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_public"
              name="is_public"
              defaultChecked={drill.is_public}
            />
            <Label htmlFor="is_public">Make this drill public</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_warm_up"
              name="is_warm_up"
              defaultChecked={drill.is_warm_up}
            />
            <Label htmlFor="is_warm_up">Suitable for warm-up</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_cool_down"
              name="is_cool_down"
              defaultChecked={drill.is_cool_down}
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
          </form>
        </CardContent>
    </Card>
  )
}
