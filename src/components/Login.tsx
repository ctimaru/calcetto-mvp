import { useState } from 'react'
import { User } from '@/lib/types'
import { hashPassword, verifyPassword, canAccessManagement } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LockKey, User as UserIcon, EnvelopeSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LoginProps {
  onLogin: (user: User) => void
  requireManagementAccess?: boolean
}

export function Login({ onLogin, requireManagementAccess = false }: LoginProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    age: '',
    location: '',
    phone: '',
    skillLevel: 'intermedio' as const,
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const users = await window.spark.kv.get<User[]>('users') || []
      const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase())

      if (!user) {
        toast.error('Email o password non validi')
        setIsLoading(false)
        return
      }

      if (user.password) {
        const isValid = await verifyPassword(loginPassword, user.password)
        if (!isValid) {
          toast.error('Email o password non validi')
          setIsLoading(false)
          return
        }
      }

      if (requireManagementAccess && !canAccessManagement(user)) {
        toast.error('Accesso negato. È necessario un account Manager o Admin.')
        setIsLoading(false)
        return
      }

      toast.success(`Benvenuto, ${user.firstName}!`)
      onLogin(user)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Errore durante il login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (registerData.password !== registerData.confirmPassword) {
        toast.error('Le password non corrispondono')
        setIsLoading(false)
        return
      }

      if (registerData.password.length < 6) {
        toast.error('La password deve contenere almeno 6 caratteri')
        setIsLoading(false)
        return
      }

      const age = parseInt(registerData.age)
      if (isNaN(age) || age < 13 || age > 100) {
        toast.error('Inserisci un\'età valida')
        setIsLoading(false)
        return
      }

      const users = await window.spark.kv.get<User[]>('users') || []
      
      if (users.some(u => u.email.toLowerCase() === registerData.email.toLowerCase())) {
        toast.error('Email già registrata')
        setIsLoading(false)
        return
      }

      const hashedPassword = await hashPassword(registerData.password)

      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email: registerData.email,
        password: hashedPassword,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        age,
        location: registerData.location,
        skillLevel: registerData.skillLevel,
        phone: registerData.phone || undefined,
        role: requireManagementAccess ? 'MANAGER' : 'PLAYER',
        joinedMatches: [],
        createdMatches: [],
        venueIds: [],
        createdAt: new Date().toISOString(),
      }

      await window.spark.kv.set('users', [...users, newUser])
      
      toast.success('Registrazione completata!')
      onLogin(newUser)
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Errore durante la registrazione')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 p-4">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            oklch(0.45 0.12 155 / 0.03) 10px,
            oklch(0.45 0.12 155 / 0.03) 20px
          )`
        }}
      />
      
      <Card className="w-full max-w-md relative z-10 shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <LockKey size={32} weight="duotone" className="text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {requireManagementAccess ? 'Accesso Management' : 'Players League'}
          </CardTitle>
          <CardDescription className="text-center">
            {requireManagementAccess 
              ? 'Accedi con il tuo account Manager o Admin'
              : 'Accedi o registrati per continuare'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="register">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <EnvelopeSimple 
                      size={18} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                    />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="nome@esempio.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <LockKey 
                      size={18} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                    />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Accesso in corso...' : 'Accedi'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-firstName">Nome</Label>
                    <Input
                      id="register-firstName"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-lastName">Cognome</Label>
                    <Input
                      id="register-lastName"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-age">Età</Label>
                    <Input
                      id="register-age"
                      type="number"
                      min="13"
                      max="100"
                      value={registerData.age}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, age: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-location">Città</Label>
                    <Input
                      id="register-location"
                      value={registerData.location}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, location: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {requireManagementAccess && (
                  <div className="space-y-2">
                    <Label htmlFor="register-phone">Telefono</Label>
                    <Input
                      id="register-phone"
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword">Conferma Password</Label>
                  <Input
                    id="register-confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrazione...' : 'Registrati'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
