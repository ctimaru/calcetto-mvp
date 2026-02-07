import { User, UserRole } from './types'
import { hashPassword } from './auth'

export const createSeedUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: UserRole,
  location: string = 'Milano',
  age: number = 28
): Promise<User> => {
  const hashedPassword = await hashPassword(password)
  
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email,
    password: hashedPassword,
    firstName,
    lastName,
    age,
    location,
    skillLevel: 'intermedio',
    role,
    joinedMatches: [],
    createdMatches: [],
    venueIds: [],
    phone: role === 'MANAGER' || role === 'ADMIN' ? '+39 123 456 7890' : undefined,
    createdAt: new Date().toISOString(),
  }
}

export const seedInitialUsers = async (): Promise<void> => {
  const existingUsers = await window.spark.kv.get<User[]>('users')
  
  if (existingUsers && existingUsers.length > 0) {
    return
  }

  const users: User[] = []

  users.push(await createSeedUser(
    'admin@playersleague.com',
    'admin123',
    'Admin',
    'User',
    'ADMIN',
    'Roma'
  ))

  users.push(await createSeedUser(
    'manager@playersleague.com',
    'manager123',
    'Marco',
    'Rossi',
    'MANAGER',
    'Milano'
  ))

  users.push(await createSeedUser(
    'manager2@playersleague.com',
    'manager123',
    'Giuseppe',
    'Verdi',
    'MANAGER',
    'Torino'
  ))

  users.push(await createSeedUser(
    'player@playersleague.com',
    'player123',
    'Luca',
    'Bianchi',
    'PLAYER',
    'Milano',
    25
  ))

  users.push(await createSeedUser(
    'player2@playersleague.com',
    'player123',
    'Sofia',
    'Ferrari',
    'PLAYER',
    'Roma',
    23
  ))

  await window.spark.kv.set('users', users)
  console.log('✅ Seeded initial users with roles')
}
