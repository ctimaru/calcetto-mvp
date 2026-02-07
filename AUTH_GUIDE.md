# Players League - Authentication & Roles Guide

## Architecture Overview

Players League follows a **single-SaaS architecture** with unified authentication and role-based access control (RBAC).

### Key Principles
- ❌ No separate backoffice software
- ❌ No separate backend or database
- ✅ One backend + one DB + role-based access
- ✅ Different frontends only at UI level
- ✅ Same APIs for all clients with RBAC enforcement

## User Roles

### 🎮 PLAYER
**Default role for new registrations**

**Permissions:**
- View and browse matches
- Join/leave matches
- Make payments
- Chat in joined matches only
- Edit own profile
- Rate venues (after completing a match)

**Access:** Main application at `/`

### 🏢 MANAGER
**For venue managers who organize matches**

**Permissions:**
- All PLAYER permissions
- Create/edit/cancel matches (own matches only)
- Create/edit venues (own venues only)
- View participants (own matches only)
- Remove participants from matches (own matches only)
- View bookings for own venues

**Access:** Main application at `/` + Management dashboard at `/management`

### 🛡️ ADMIN
**Full system access**

**Permissions:**
- All MANAGER permissions
- Manage all users (view, edit roles, delete)
- Manage all venues (view, edit, delete)
- View all matches and participants
- Access system metrics
- Oversee all payments and refunds
- Sensitive actions are logged

**Access:** Main application at `/` + Full management dashboard at `/management` with admin panel

## Default Test Accounts

The system seeds the following test accounts on first load:

### Admin Account
- **Email:** `admin@playersleague.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Location:** Roma

### Manager Accounts
- **Email:** `manager@playersleague.com`
- **Password:** `manager123`
- **Name:** Marco Rossi
- **Role:** MANAGER
- **Location:** Milano

- **Email:** `manager2@playersleague.com`
- **Password:** `manager123`
- **Name:** Giuseppe Verdi
- **Role:** MANAGER
- **Location:** Torino

### Player Accounts
- **Email:** `player@playersleague.com`
- **Password:** `player123`
- **Name:** Luca Bianchi
- **Role:** PLAYER
- **Location:** Milano

- **Email:** `player2@playersleague.com`
- **Password:** `player123`
- **Name:** Sofia Ferrari
- **Role:** PLAYER
- **Location:** Roma

## Routes

### `/` - Main Application
- Landing page with match discovery
- Browse matches with filters
- Live matches view
- User profile and match history
- Payment processing
- Available to all roles

### `/management` - Management Dashboard
- **Access:** MANAGER and ADMIN roles only
- **Authentication:** Required - login screen appears for unauthenticated users
- **Features:**
  - Venue management (CRUD operations)
  - Booking calendar
  - Reviews and ratings
  - Notifications
  - Admin panel (ADMIN only) - User management and role assignment

## Security Features

### Password Hashing
All passwords are hashed using SHA-256 before storage. Never store plain text passwords.

### Permission Checks
- `hasPermission(user, permission)` - Check if user has specific permission
- `canAccessManagement(user)` - Check if user can access `/management`
- `isAdmin(user)` - Check if user is admin
- `isManager(user)` - Check if user is manager  
- `isPlayer(user)` - Check if user is player
- `canEditMatch(user, matchCreatorId)` - Check match edit permissions
- `canEditVenue(user, venueManagerId)` - Check venue edit permissions

### Data Isolation
- Managers see only their own venues and matches
- Players see only their joined matches in chat
- Admins have full visibility with audit logging

## Registration

### Player Registration
1. Navigate to main app
2. Click "Crea Profilo" or "Registrati"
3. Fill in personal details
4. Role automatically set to PLAYER

### Manager/Admin Registration
1. Navigate to `/management`
2. Click "Registrati" tab
3. Fill in details including phone number
4. Role automatically set to MANAGER
5. Admins must be promoted by existing admins via admin panel

## Changing User Roles

Only ADMIN users can change roles:

1. Login as admin at `/management`
2. Navigate to "Admin" tab
3. Find user in the list
4. Click "Modifica Ruolo"
5. Select new role from dropdown
6. Click "Salva"

Changes take effect immediately and persist across sessions.

## Implementation Notes

### Auth Functions (`src/lib/auth.ts`)
- `hashPassword(password)` - Hash password for storage
- `verifyPassword(password, hash)` - Verify password against hash
- `hasPermission(user, permission)` - Check user permissions
- Permission system with granular controls

### User Type (`src/lib/types.ts`)
```typescript
interface User {
  id: string
  email: string
  password?: string // hashed
  firstName: string
  lastName: string
  age: number
  skillLevel: SkillLevel
  location: string
  role: UserRole // 'PLAYER' | 'MANAGER' | 'ADMIN'
  joinedMatches: string[]
  createdMatches: string[]
  venueIds?: string[]
  phone?: string
  createdAt: string
}
```

### Seeding (`src/lib/seed.ts`)
Initial users are seeded automatically on first app load. Data persists in KV storage.

## Best Practices

1. **Always check permissions** before allowing sensitive operations
2. **Log admin actions** for audit trail
3. **Use functional updates** with `useKV` to prevent data loss
4. **Validate role requirements** at both UI and data layer
5. **Never expose passwords** in API responses or logs
6. **Test with different roles** to ensure proper access control

## Future Enhancements

- Two-factor authentication for admin accounts
- Email verification for new registrations
- Password reset flow
- Session management with automatic logout
- Detailed audit logs for admin actions
- Rate limiting for login attempts
- IP-based access controls for admin functions
