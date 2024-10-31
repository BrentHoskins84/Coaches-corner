import { Suspense } from 'react'
import SignUpForm from '@/components/signup/sign-up-form'

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpForm />
    </Suspense>
  )
}
