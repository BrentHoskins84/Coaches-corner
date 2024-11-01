import Breadcrumbs from '@/components/breadcrumbs'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-20 max-w-5xl p-5 w-full">
      <Breadcrumbs />
      {children}
    </div>
  )
}
