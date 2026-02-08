import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Plus, SignOut, User, ChartLine, Briefcase } from '@phosphor-icons/react'
import { Toaster, toast } from 'sonner'
import { AuthView } from '@/components/AuthView'
import { MatchList } from '@/components/MatchList'
import { MatchDetail } from '@/components/MatchDetail'
import { CreateMatchDialog } from '@/components/CreateMatchDialog'
import { ManagerDashboard } from '@/components/ManagerDashboard'
import { CreateMatchForm } from '@/components/CreateMatchForm'
import { motion } from 'framer-motion'
import { getProfile, logout } from '@/lib/api'

type View = 'list' | 'detail'
type Route = 'player' | 'manager' | 'admin'

interface Profile {
  user_id: string
  role: string
  name?: string
  age?: number
  skill_level?: string
  home_city?: string
}

function getRouteFromHash(): Route {
  const h = (window.location.hash || '#/').toLowerCase()
  if (h.startsWith('#/manager')) return 'manager'
  if (h.startsWith('#/admin')) return 'admin'
  return 'player'
}

function App() {
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [view, setView] = useState<View>('list')
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false)
  const [route, setRoute] = useState<Route>(getRouteFromHash())
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, newSession) => {
      setSession(newSession ?? null)
      setProfile(null)
      if (newSession) {
        setView('list')
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onHash = () => setRoute(getRouteFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) return
      try {
        const p = await getProfile(session.user.id)
        setProfile(p)
      } catch (e: any) {
        console.warn('Profile fetch error:', e)
      }
    })()
  }, [session?.user?.id])

  async function handleLogout() {
    try {
      await logout()
      setView('list')
      setSelectedMatchId(null)
      setShowCreateForm(false)
      window.location.hash = '#/'
      toast.success('Logout effettuato con successo')
    } catch (e: any) {
      toast.error(e.message ?? 'Errore durante il logout')
    }
  }

  function handleNavigate(newRoute: Route) {
    window.location.hash = `#/${newRoute === 'player' ? '' : newRoute}`
    setView('list')
    setSelectedMatchId(null)
    setShowCreateForm(false)
  }

  function handleSelectMatch(matchId: string) {
    setSelectedMatchId(matchId)
    setView('detail')
  }

  function handleBackToList() {
    setView('list')
    setSelectedMatchId(null)
  }

  function getUserInitials(email?: string, name?: string) {
    if (name) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.slice(0, 2).toUpperCase()
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return '??'
  }

  if (!session) {
    return <AuthView onAuthenticated={() => {}} />
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavigate('player')}
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
              <div className="hidden md:flex items-center gap-1 mr-2">
                <Button
                  variant={route === 'player' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleNavigate('player')}
                  className="gap-2"
                >
                  <User size={18} weight="bold" />
                  Player
                </Button>

                {(profile?.role === 'manager' || profile?.role === 'admin') && (
                  <Button
                    variant={route === 'manager' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavigate('manager')}
                    className="gap-2"
                  >
                    <Briefcase size={18} weight="bold" />
                    Manager
                  </Button>
                )}

                {profile?.role === 'admin' && (
                  <Button
                    variant={route === 'admin' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavigate('admin')}
                    className="gap-2"
                  >
                    <ChartLine size={18} weight="bold" />
                    Admin
                  </Button>
                )}
              </div>

              {route === 'player' && (profile?.role === 'manager' || profile?.role === 'admin') && (
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
                    {getUserInitials(session.user.email, profile?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">
                    {profile?.name || session.user.email}
                  </div>
                  {profile?.role && (
                    <Badge variant="secondary" className="text-xs h-5">
                      {profile.role}
                    </Badge>
                  )}
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
        {route === 'player' && (
          <>
            {view === 'list' && session.user && (
              <MatchList 
                userId={session.user.id}
                city={profile?.home_city || 'Torino'}
                onSelectMatch={handleSelectMatch}
              />
            )}

            {view === 'detail' && selectedMatchId && session.user && (
              <MatchDetail
                matchId={selectedMatchId}
                userId={session.user.id}
                onBack={handleBackToList}
              />
            )}
          </>
        )}

        {route === 'manager' && session.user && (
          <>
            {!showCreateForm ? (
              <ManagerDashboard onCreate={() => setShowCreateForm(true)} />
            ) : (
              <CreateMatchForm
                userId={session.user.id}
                onDone={() => {
                  setShowCreateForm(false)
                }}
              />
            )}
          </>
        )}

        {route === 'admin' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-muted-foreground mt-2">Coming soon...</p>
          </div>
        )}
      </main>

      {session.user && profile && route === 'player' && (
        <CreateMatchDialog
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          currentUser={{
            id: session.user.id,
            email: session.user.email || '',
            role: profile.role as any,
            name: profile.name,
          }}
        />
      )}
    </div>
  )
}

export default App
