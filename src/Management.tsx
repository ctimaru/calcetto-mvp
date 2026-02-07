import { useState } from 'react'
import { type User } from '@/lib/types'
import { Toaster } from 'sonner'
import { VenueHub } from '@/components/VenueHub'
import { Login } from '@/components/Login'
import { MatchReminderService } from '@/components/MatchReminderService'

function Management() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const handleLogin = (user: User) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster richColors position="top-center" />
        <Login 
          onLogin={handleLogin}
          requireManagementAccess={true}
        />
      </div>
    )
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <MatchReminderService />
      <VenueHub 
        onBack={handleLogout}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    </>
  )
}

export default Management
