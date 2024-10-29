'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createDrill } from "@/utils/actions/drills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { DrillCategory, DifficultyLevel, IntensityLevel } from "@/types/database"

export default function AddDrillPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Helper function to safely split comma-separated strings
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
        equipment_needed: safeStringSplit(formData.get('equipment_needed') as string | null),
        space_required: formData.get('space_required') as string || null,
        objectives: safeStringSplit(formData.get('objectives') as string | null),
        key_coaching_points: safeStringSplit(formData.get('key_coaching_points') as string | null),
        progression: formData.get('progression') as string || null,
        sport: formData.get('sport') as string,
        position_specificity: safeStringSplit(formData.get('position_specificity') as string | null),
        tactical_element: formData.get('tactical_element') as string || null,
        visual_aid: formData.get('visual_aid') as string || null,
        intensity_level: formData.get('intensity_level') as IntensityLevel || null,
        is_warm_up: formData.get('is_warm_up') === 'on',
        is_cool_down: formData.get('is_cool_down') === 'on',
        metrics_for_evaluation: safeStringSplit(formData.get('metrics_for_evaluation') as string | null),
        safety_considerations: formData.get('safety_considerations') as string || null,
        is_public: formData.get('is_public') === 'on',
        tags: safeStringSplit(formData.get('tags') as string | null)
      }

      const { data, error } = await createDrill(drillData)

      if (error) {
        throw new Error(error)
      }

      toast({
        title: "Success",
        description: "Drill has been created successfully.",
      })

      router.push('/drills')
    } catch (error) {
      console.error('Error creating drill:', error)
      toast({
        title: "Error",
        description: "Failed to create drill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Drill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Drill Name</Label>
                  <Input id="name" name="name" required />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input id="duration" name="duration" type="number" min="1" required />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
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
                  <Input id="type" name="type" required />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="difficulty_level">Difficulty Level</Label>
                  <Select name="difficulty_level" required>
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
                  <Input id="age_group" name="age_group" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_players">Min Players</Label>
                    <Input id="min_players" name="min_players" type="number" min="1" required />
                  </div>
                  <div>
                    <Label htmlFor="max_players">Max Players</Label>
                    <Input id="max_players" name="max_players" type="number" min="1" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="equipment_needed">Equipment Needed (comma-separated)</Label>
                  <Input id="equipment_needed" name="equipment_needed" />
                </div>
              </div>
            </div>

            {/* Additional Sections */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="objectives">Objectives (comma-separated)</Label>
                <Textarea id="objectives" name="objectives" required />
              </div>

              <div>
                <Label htmlFor="key_coaching_points">Key Coaching Points (comma-separated)</Label>
                <Textarea id="key_coaching_points" name="key_coaching_points" required />
              </div>

              <div>
                <Label htmlFor="sport">Sport</Label>
                <Input id="sport" name="sport" required />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_public" name="is_public" />
                <Label htmlFor="is_public">Make this drill public</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_warm_up" name="is_warm_up" />
                <Label htmlFor="is_warm_up">Suitable for warm-up</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="is_cool_down" name="is_cool_down" />
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
                {isSubmitting ? 'Creating...' : 'Create Drill'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
