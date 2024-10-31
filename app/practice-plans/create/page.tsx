import { Suspense } from 'react'
import PracticePlanBuilder from '@/components/practice-plan/practice-plan-builder'

export default function CreatePracticePlanPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6 flex items-center justify-center h-64">
      <p className="text-muted-foreground">Loading...</p>
    </div>}>
      <PracticePlanBuilder />
    </Suspense>
  )
}
