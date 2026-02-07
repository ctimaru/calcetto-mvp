import { useState } from 'react'
import { type VenueManager } from '@/lib/types'
import { Toaster } from 'sonner'
import { VenueHub } from '@/components/VenueHub'
import { VenueManagerLogin } from '@/components/VenueManagerLogin'
import { MatchReminderService } from '@/components/MatchReminderService'

function Management() {
  const [venueManager, setVenueManager] = useState<VenueManager | null>(null)

  const handleManagerLogin = (manager: VenueManager) => {
    setVenueManager(manager)
  }

  const handleLogout = () => {
    setVenueManager(null)
  }

  if (!venueManager) {
    return (
      <div className="min-h-screen bg-background">
        <Toaster richColors position="top-center" />
        <VenueManagerLogin 
          open={true}
          onLogin={handleManagerLogin}
          onClose={() => {}}
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
        currentUserId={undefined}
        manager={venueManager}
        onLogout={handleLogout}
      />
    </>
  )
}

export default Management
