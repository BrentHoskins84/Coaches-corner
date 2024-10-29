import { getDrillById } from "@/utils/actions/drills"
import { EditDrillForm } from "@/components/drills/edit-drills-form"
import { redirect } from "next/navigation"

interface EditDrillPageProps {
  params: { id: string }
}

export default async function EditDrillPage({ params }: EditDrillPageProps) {
    const { id } = await params
  const { data: drill, error } = await getDrillById(id)

  if (error || !drill) {
    redirect('/drills')
  }

  return (
    <div className="container mx-auto py-6">
      <EditDrillForm drill={drill} />
    </div>
  )
}
