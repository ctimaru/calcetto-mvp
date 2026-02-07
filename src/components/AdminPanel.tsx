import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, UserRole } from '@/lib/types'
import { isAdmin } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Users,
  ShieldCheck,
  UserCircle,
  Buildings,
  MagnifyingGlass,
  PencilSimple,
  Check,
  X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface AdminPanelProps {
  currentUser: User
}

export function AdminPanel({ currentUser }: AdminPanelProps) {
  const [users, setUsers] = useKV<User[]>('users', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<UserRole>('PLAYER')

  if (!isAdmin(currentUser)) {
    return (
      <div className="text-center py-12">
        <ShieldCheck size={48} weight="duotone" className="mx-auto mb-4 text-destructive" />
        <p className="text-destructive font-semibold">Accesso Negato</p>
        <p className="text-muted-foreground">Solo gli amministratori possono accedere a questa sezione.</p>
      </div>
    )
  }

  const filteredUsers = users?.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  }) || []

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditingRole(user.role)
  }

  const handleSaveRole = async (userId: string) => {
    setUsers(currentUsers =>
      (currentUsers || []).map(u =>
        u.id === userId ? { ...u, role: editingRole } : u
      )
    )
    
    const user = users?.find(u => u.id === userId)
    toast.success(`Ruolo di ${user?.firstName} ${user?.lastName} aggiornato a ${editingRole}`)
    setEditingUserId(null)
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditingRole('PLAYER')
  }

  const roleStats = {
    PLAYER: users?.filter(u => u.role === 'PLAYER').length || 0,
    MANAGER: users?.filter(u => u.role === 'MANAGER').length || 0,
    ADMIN: users?.filter(u => u.role === 'ADMIN').length || 0,
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'MANAGER':
        return 'default'
      case 'PLAYER':
        return 'secondary'
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheck size={16} weight="fill" />
      case 'MANAGER':
        return <Buildings size={16} weight="fill" />
      case 'PLAYER':
        return <UserCircle size={16} weight="fill" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-lg bg-secondary/10">
                  <UserCircle size={24} weight="duotone" className="text-secondary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{roleStats.PLAYER}</div>
              <div className="text-sm text-muted-foreground">Players</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Buildings size={24} weight="duotone" className="text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{roleStats.MANAGER}</div>
              <div className="text-sm text-muted-foreground">Managers</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="border-destructive/20 hover:border-destructive/40 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-lg bg-destructive/10">
                  <ShieldCheck size={24} weight="duotone" className="text-destructive" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{roleStats.ADMIN}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users size={20} weight="duotone" />
              Gestione Utenti
            </CardTitle>
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Cerca per nome, email o ruolo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="font-semibold truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.id === currentUser.id && (
                              <Badge variant="outline" className="text-xs">Tu</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground truncate mb-2">
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {editingUserId === user.id ? (
                              <Select value={editingRole} onValueChange={(v) => setEditingRole(v as UserRole)}>
                                <SelectTrigger className="w-[140px] h-7">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PLAYER">
                                    <div className="flex items-center gap-2">
                                      <UserCircle size={16} weight="fill" />
                                      Player
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="MANAGER">
                                    <div className="flex items-center gap-2">
                                      <Buildings size={16} weight="fill" />
                                      Manager
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="ADMIN">
                                    <div className="flex items-center gap-2">
                                      <ShieldCheck size={16} weight="fill" />
                                      Admin
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                                {getRoleIcon(user.role)}
                                {user.role}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {user.location}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {user.joinedMatches.length} partite
                            </Badge>
                            {(user.role === 'MANAGER' || user.role === 'ADMIN') && user.venueIds && user.venueIds.length > 0 && (
                              <Badge variant="outline" className="text-xs gap-1">
                                <Buildings size={12} />
                                {user.venueIds.length} venues
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingUserId === user.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSaveRole(user.id)}
                                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1"
                              >
                                <Check size={16} weight="bold" />
                                Salva
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="gap-1"
                              >
                                <X size={16} weight="bold" />
                                Annulla
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(user)}
                              disabled={user.id === currentUser.id}
                              className="gap-1 hover:bg-primary/10"
                            >
                              <PencilSimple size={16} weight="duotone" />
                              Modifica Ruolo
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nessun utente trovato
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
