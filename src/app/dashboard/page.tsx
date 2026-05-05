import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Scanner } from '@/components/scanner/Scanner'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/sign-in')

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] mx-auto w-full">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-white">
            Welcome back, {session.user?.name?.split(' ')[0] || 'Developer'} 👋
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Scan your code for security vulnerabilities powered by Pranav Jasyal.
          </p>
        </div>
        <div className="h-[calc(100vh-180px)] min-h-[600px]">
          <Scanner />
        </div>
      </main>
    </div>
  )
}
