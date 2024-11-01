import { Suspense } from 'react'
import PracticePlanBuilder from '@/components/practice-plan/practice-plan-builder'
import Loading from '@/components/loading'

export default function CreatePracticePlanPage() {
  return (
<Suspense fallback={
      <div className="container mx-auto py-6 flex items-center justify-center h-64">
        <Loading
          message="Preparing practice plan builder..."
          dotSize={16}
          dotGap={6}
        />
      </div>
    }>
      <PracticePlanBuilder />
    </Suspense>
  )
}
