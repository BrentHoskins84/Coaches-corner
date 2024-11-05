import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UserManagement from '@/components/users/management'
import Loading from '@/components/loading'

export const dynamic = 'force-dynamic'

async function getUserData() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: userProfile, error } = await supabase
    .from('user_profiles')
    .select('*, roles(name)')
    .eq('id', user.id)
    .single()

  if (error || !userProfile) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return {
    ...user,
    role_name: userProfile.roles.name
  }
}

export default async function UsersPage() {
  const userData = await getUserData()

  if (!userData || userData.role_name !== 'Administrator') {
    redirect('/dashboard')
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <Suspense fallback={<Loading message="Loading users..." />}>
        <UserManagement />
      </Suspense>
    </div>
  )
}
