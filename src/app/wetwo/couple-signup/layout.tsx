import { Suspense } from 'react'

export default function CoupleSignupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense>{children}</Suspense>
}
