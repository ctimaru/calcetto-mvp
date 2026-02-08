import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Plus, SignOut } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { AuthView } from '@/components/AuthView'
import { MatchList } from '@/components/MatchList'
import { MatchDetail } from '@/components/MatchDetail'
import { CreateMatchDialog } from '@/components/CreateMatchDialog'
import { getUserInitials } from '@/lib/helpers'
import { motion } from 'framer-motion'

type View = 'list' | 'detail'

function App() {
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null)
  const [view, setView] = useKV<View>('current-view', 'list')
  const [selectedMatchId, setSelectedMatchId] = useKV<string | null>('selected-match-id', null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useKV<boolean>('create-dialog-open', false)

  function handleLogout() {
    setCurrentUser(null)
    setView('list')
    setSelectedMatchId(null)
    toast.success('Logout effettuato con successo')
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchId(matchId)
    setView('detail')
  }

  function handleBackToList() {
    setView('list')
    setSelectedMatchId(null)
  }

  if (!currentUser) {
    return <AuthView onAuthenticated={setCurrentUser} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={handleBackToList}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy size={32} weight="fill" className="text-primary" />
              <div>
                <h1 className="text-xl font-bold">App Calcetto</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Trova la tua partita
                </p>
              </div>
            </motion.div>

            <div className="flex items-center gap-2">
              {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  size="sm"
                >
                  <Plus size={20} weight="bold" />
                  <span className="hidden sm:inline">Crea Partita</span>
                </Button>
              )}

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <Avatar className="h-8 w-8 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {getUserInitials(currentUser)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">{currentUser.name || currentUser.email}</div>
                  <Badge variant="secondary" className="text-xs h-5">
                    {currentUser.role}
                  </Badge>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-destructive/10 hover:text-destructive"
                title="Logout"
              >
                <SignOut size={20} weight="bold" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        {view === 'list' && (
          <MatchList 
            currentUser={currentUser}
            onSelectMatch={handleSelectMatch}
          />
        )}

        {view === 'detail' && selectedMatchId && (
          <MatchDetail
            matchId={selectedMatchId}
            currentUser={currentUser}
            onBack={handleBackToList}
          />
        )}
      </main>

      {currentUser && (
        <CreateMatchDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}

export default App
