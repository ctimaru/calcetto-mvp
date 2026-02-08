import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User } from '@/lib/types'
import { Trophy, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabaseClient'

interface AuthViewProps {
  onAuthenticated: (user: User) => void
}

export function AuthView({ onAuthenticated }: AuthViewProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'pro'>('intermediate')
  const [homeCity, setHomeCity] = useState('Torino')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError
      if (!data.user) throw new Error('Errore durante il login')

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, role, name, age, skill_level, home_city')
        .eq('user_id', data.user.id)
        .single()

      if (profileError) {
        console.warn('Profile not found:', profileError)
        setError('Profilo non trovato. Contatta il supporto.')
        return
      }

      const user: User = {
        id: profileData.user_id,
        email: data.user.email!,
        name: profileData.name,
        age: profileData.age,
        skillLevel: profileData.skill_level,
        homeCity: profileData.home_city,
        role: profileData.role || 'player',
        createdAt: data.user.created_at
      }

      setSuccess('Login effettuato con successo!')
      setTimeout(() => {
        onAuthenticated(user)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il login')
    } finally {
      setBusy(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)

    try {
      if (!name || !email || !password || !homeCity) {
        setError('Compila tutti i campi obbligatori')
        return
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age: age ? parseInt(age) : null,
            skill_level: skillLevel,
            home_city: homeCity,
          }
        }
      })

      if (authError) throw authError
      if (!data.user) throw new Error('Errore durante la registrazione')

      setSuccess('Registrazione completata! Controlla la tua email per confermare l\'account, poi effettua il login.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            oklch(0.45 0.12 155 / 0.05) 20px,
            oklch(0.45 0.12 155 / 0.05) 40px
          )`
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy size={48} weight="fill" className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-2">App Calcetto</h1>
          <p className="text-muted-foreground">
            Trova partite, connettiti con giocatori
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Benvenuto</CardTitle>
            <CardDescription>
              Accedi o crea un nuovo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-accent/10 border-accent/30">
                <CheckCircle size={16} weight="fill" className="text-accent-foreground" />
                <AlertDescription className="text-accent-foreground">{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Registrati</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@esempio.com"
                      required
                      disabled={busy}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={busy}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={busy}
                  >
                    {busy ? 'Accesso...' : 'Entra'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome completo *</Label>
                    <Input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mario Rossi"
                      required
                      disabled={busy}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@esempio.com"
                      required
                      disabled={busy}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={busy}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-age">Età</Label>
                      <Input
                        id="register-age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="25"
                        min="10"
                        max="99"
                        disabled={busy}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-skill">Livello</Label>
                      <Select 
                        value={skillLevel} 
                        onValueChange={(val) => setSkillLevel(val as any)}
                        disabled={busy}
                      >
                        <SelectTrigger id="register-skill">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Principiante</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzato</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-city">Città *</Label>
                    <Select 
                      value={homeCity} 
                      onValueChange={setHomeCity}
                      disabled={busy}
                    >
                      <SelectTrigger id="register-city">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Torino">Torino</SelectItem>
                        <SelectItem value="Milano">Milano</SelectItem>
                        <SelectItem value="Roma">Roma</SelectItem>
                        <SelectItem value="Napoli">Napoli</SelectItem>
                        <SelectItem value="Bologna">Bologna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={busy}
                  >
                    {busy ? 'Creazione account...' : 'Crea account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
