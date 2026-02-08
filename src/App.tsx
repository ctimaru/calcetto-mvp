import { useState, useEffect } from 'react'
import { User, Field } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Plus, SignOut } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { AuthView } from '@/components/AuthView'
import { MatchList } from '@/components/MatchList'
import { MatchDetail } from '@/components/MatchDetail'
import { CreateMatchDialog } from '@/components/CreateMatchDialog'
import { getDefaultFields, getUserInitials } from '@/lib/helpers'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

type View = 'list' | 'detail'

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [view, setView] = useState<View>('list')
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initializeApp() {
      try {
        const { data } = await supabase.auth.getSession()
        
        if (data.session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('user_id, role, name, age, skill_level, home_city')
            .eq('user_id', data.session.user.id)
            .single()

          if (profileError) {
            console.warn('Profile load error:', profileError)
          } else {
            const user: User = {
              id: profileData.user_id,
              email: data.session.user.email!,
              name: profileData.name,
              age: profileData.age,
              skillLevel: profileData.skill_level,
              homeCity: profileData.home_city,
              role: profileData.role || 'player',
              createdAt: data.session.user.created_at
            }
            setCurrentUser(user)
          }
        }
      } catch (err) {
        console.error('Session load error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    initializeApp()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null)
        setView('list')
        setSelectedMatchId(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, role, name, age, skill_level, home_city')
          .eq('user_id', session.user.id)
          .single()

        if (!profileError && profileData) {
          const user: User = {
            id: profileData.user_id,
            email: session.user.email!,
            name: profileData.name,
            age: profileData.age,
            skillLevel: profileData.skill_level,
            homeCity: profileData.home_city,
            role: profileData.role || 'player',
            createdAt: session.user.created_at
          }
          setCurrentUser(user)
        }
      }
    })

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Logout effettuato con successo')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore durante il logout')
    }
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchId(matchId)
    setView('detail')
  }

  function handleBackToList() {
    setView('list')
    setSelectedMatchId(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy size={64} weight="fill" className="text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    )
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
