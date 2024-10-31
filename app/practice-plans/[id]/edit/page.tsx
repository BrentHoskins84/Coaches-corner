import { createClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import PracticePlanBuilder from '@/components/practice-plan/practice-plan-builder'

type PageProps = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic'

async function getPracticePlan(id: string) {
  const supabase = await createClient();

  const { data: plan, error } = await supabase
    .from('practice_plans')
    .select(`
      *,
      practice_plan_items (
        *,
        drill:drills (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching practice plan:', error)
    return null
  }

  return plan
}

export default async function EditPracticePlanPage({ params, searchParams }: PageProps) {
    const { id } = await params
  const plan = await getPracticePlan(id)

  if (!plan) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="container mx-auto py-6 flex items-center justify-center h-64">
      <p className="text-muted-foreground">Loading...</p>
    </div>}>
      <PracticePlanBuilder editId={id} initialData={plan} />
    </Suspense>
  )
}
