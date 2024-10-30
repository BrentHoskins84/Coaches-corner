import { getDrillById } from "@/utils/actions/drills"
import { DrillForm } from "@/components/drills/drill-form"
import { redirect } from "next/navigation"

interface EditDrillPageProps {
  params: { id: string }
}

export default async function EditDrillPage({ params }: EditDrillPageProps) {
  const { id } = params
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
