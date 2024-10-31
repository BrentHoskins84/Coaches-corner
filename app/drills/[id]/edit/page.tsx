import { getDrillById } from "@/utils/actions/drills"
import { DrillForm } from "@/components/drills/drill-form"
import { redirect } from "next/navigation"

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditDrillPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { data: drill, error } = await getDrillById(id)

  if (error || !drill) {
    redirect('/drills')
  }

  return (
    <div className="container mx-auto py-6">
      <DrillForm mode="edit" drill={drill} />
    </div>
  )
}
