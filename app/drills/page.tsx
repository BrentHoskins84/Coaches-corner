import { getDrills } from "@/utils/actions/drills"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Plus, Clock, Users, Dumbbell } from "lucide-react"
import Link from "next/link"

export default async function DrillsPage() {
  const { data: drills, error } = await getDrills()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Drills</h1>
        <Button asChild>
          <Link href="/drills/add">
            <Plus className="mr-2 h-4 w-4" />
            Add New Drill
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-red-500">Error loading drills. Please try again later.</p>
          </CardContent>
        </Card>
      ) : drills?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
            <p className="text-muted-foreground">No drills found</p>
            <Button asChild>
              <Link href="/drills/add">Create your first drill</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Drills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drills?.map((drill) => (
                  <TableRow key={drill.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/drills/${drill.id}`}
                        className="hover:underline"
                      >
                        {drill.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary-foreground">
                        {drill.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {drill.duration} min
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${drill.difficulty_level === 'Beginner' ? 'bg-green-100 text-green-800' :
                          drill.difficulty_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {drill.difficulty_level}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-sm text-muted-foreground">
                        <Users className="mr-1 h-4 w-4" />
                        {drill.min_players}-{drill.max_players}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-sm text-muted-foreground">
                        <Dumbbell className="mr-1 h-4 w-4" />
                        {drill.sport}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/drills/${drill.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
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

// Loading state
export function Loading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
