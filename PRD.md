# Planning Guide

A soccer match booking platform that connects players to organize and join pickup games, manage field reservations, handle payments, and facilitate real-time communication between participants.

**Experience Qualities**: 
1. **Trustworthy** - Clear payment flows and booking confirmations build confidence in the platform
2. **Immediate** - Real-time updates on match availability and participant status keep users informed
3. **Community-driven** - Social features like chat and player profiles foster connection between soccer enthusiasts

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-faceted platform with authentication, match management, payment processing, real-time chat, role-based permissions (player/manager/admin), and complex state management across multiple views.

## Essential Features

### User Authentication & Profiles
- **Functionality**: Email/password registration and login with persistent user profiles
- **Purpose**: Secure access control and personalized experience for each user
- **Trigger**: Landing page displays auth form for unauthenticated users
- **Progression**: Enter credentials → Submit → Profile auto-created → Access main app
- **Success criteria**: Users can register, login, logout, and profile data persists across sessions

### Match Listing & Filtering
- **Functionality**: Display available matches filtered by city with key details (time, skill level, price, field)
- **Purpose**: Help players find suitable games to join in their area
- **Trigger**: Authenticated user views main dashboard
- **Progression**: Load matches → Display cards with details → Filter by user's home city → Click for details
- **Success criteria**: Published matches display correctly with accurate field information and pricing

### Match Detail & Registration
- **Functionality**: View comprehensive match information and join with payment reservation
- **Purpose**: Enable players to commit to matches and reserve their spot
- **Trigger**: User clicks "Dettaglio" button on match card
- **Progression**: View details → Click "Partecipa" → Create participation record with "pending_payment" status → Show payment prompt
- **Success criteria**: Users can join once per match, duplicate prevention works, status updates reflect correctly

### Match Creation (Manager/Admin)
- **Functionality**: Create new matches with field selection, pricing, and scheduling
- **Purpose**: Allow venue managers to list available game slots
- **Trigger**: Manager/admin user clicks "Create Match" button
- **Progression**: Open dialog → Fill form (field, date, time, skill level, players needed, price) → Submit → Match appears in listing
- **Success criteria**: Created matches are immediately available for players to join

### Payment Processing
- **Functionality**: Mock payment flow to confirm match participation
- **Purpose**: Simulate real payment before confirming attendance
- **Trigger**: User has "pending_payment" participation status
- **Progression**: View payment prompt → Click "Pay Now" → Process mock payment → Status updates to "confirmed"
- **Success criteria**: Payment confirmation updates participation status and unlocks chat access

### Real-time Match Chat
- **Functionality**: Live chat for confirmed participants of each match
- **Purpose**: Enable coordination between players (arrival time, team selection, etc.)
- **Trigger**: User has "confirmed" participation status and views match detail
- **Progression**: View match detail → See chat panel → Type message → Send → All confirmed participants see message in real-time
- **Success criteria**: Messages appear instantly for all participants, chat is isolated per match

### Field Management
- **Functionality**: Venue managers can add/edit soccer fields with details
- **Purpose**: Maintain accurate field information for match creation
- **Trigger**: Manager accesses admin panel
- **Progression**: View fields list → Add/edit field → Enter name, address, surface type → Save → Available for match creation
- **Success criteria**: Fields persist and populate correctly in match creation forms

## Edge Case Handling

- **Duplicate Participation**: System prevents joining same match twice with friendly error message
- **Missing Profile Data**: Falls back to email display if profile name unavailable
- **Match Capacity**: Shows remaining spots (future enhancement - current MVP reserves but doesn't enforce capacity)
- **Past Matches**: Filter logic can be extended to hide expired matches
- **Network Errors**: All async operations have error handling with user-friendly messages
- **Empty States**: Helpful messages when no matches available or no fields configured

## Design Direction

The design should evoke a grassroots, energetic soccer community feeling - accessible, sporty, and action-oriented. Think neighborhood pickup games with professional organization. The interface should feel fast, responsive, and confident, reflecting the dynamic nature of soccer itself.

## Color Selection

A vibrant, athletic palette inspired by soccer fields and team energy.

- **Primary Color**: Deep Forest Green (oklch(0.45 0.12 155)) - Represents the soccer field, nature, and growth. Conveys reliability and community.
- **Secondary Colors**: 
  - Energetic Orange (oklch(0.62 0.14 45)) - Action, enthusiasm, game-day excitement
  - Fresh Mint (oklch(0.82 0.18 130)) - Freshness, energy, positive outcomes
- **Accent Color**: Bright Lime (oklch(0.82 0.18 130)) - Calls attention to primary actions like joining matches or confirming payments
- **Foreground/Background Pairings**: 
  - Background Light (oklch(0.97 0.01 155)): Dark Navy text (oklch(0.18 0.02 240)) - Ratio 11.2:1 ✓
  - Primary Green (oklch(0.45 0.12 155)): White text (oklch(0.98 0 0)) - Ratio 6.8:1 ✓
  - Secondary Orange (oklch(0.62 0.14 45)): White text (oklch(0.98 0 0)) - Ratio 4.9:1 ✓
  - Accent Lime (oklch(0.82 0.18 130)): Dark text (oklch(0.25 0.08 155)) - Ratio 8.1:1 ✓

## Font Selection

Typefaces should communicate athletic energy and modern clarity, balancing technical precision with approachable warmth.

- **Typographic Hierarchy**: 
  - H1 (App Title): Space Grotesk Bold/32px/tight letter spacing (-0.02em) - Strong, geometric, sports-tech aesthetic
  - H2 (Section Headers): Space Grotesk SemiBold/24px/tight spacing - Clear hierarchy
  - H3 (Card Titles): Space Grotesk Medium/18px/normal spacing - Approachable weight
  - Body Text: Inter Regular/16px/1.5 line-height - Excellent readability for match details
  - Small Text (Metadata): Inter Regular/14px/1.5 line-height - Clear secondary information
  - Button Text: Inter SemiBold/16px - Action-oriented confidence

## Animations

Animations should feel snappy and athletic - quick transitions that maintain energy without slowing down task completion. Use motion to guide attention to match updates, successful bookings, and new chat messages.

- Quick button feedback (100ms scale transforms) reinforces interactivity
- Smooth page transitions (300ms) maintain spatial context between views
- Subtle entrance animations (fade + slide) for match cards create polish
- Success confirmations use gentle pulse/scale to celebrate booking completion
- Chat messages slide in with spring physics for lively communication feel
- Loading states use minimal spinners - prefer skeleton screens where possible

## Component Selection

- **Components**: 
  - Dialog (auth, match creation, payment) - Modal contexts for focused tasks
  - Card - Match listings, field cards, profile summary
  - Button - Primary (join match), Secondary (back navigation), Ghost (profile menu)
  - Input, Label - Form fields for auth and match creation
  - Badge - Match status, skill level indicators, role display
  - Avatar - User profile display in header
  - Separator - Visual breaks between match detail sections
  - Toast (sonner) - Success/error notifications for actions
  - Tabs - Switching between available matches and user's bookings
  - Scroll Area - Chat message container with smooth scrolling

- **Customizations**: 
  - Match cards get hover elevation effect (shadow + scale) to feel interactive
  - Status badges use semantic colors (yellow for pending_payment, green for confirmed)
  - Payment dialog includes mock card input with visual formatting
  - Chat bubbles distinguish own messages vs others with alignment and color
  - Field selection uses custom grid layout with images (future enhancement)

- **States**: 
  - Buttons: Default has solid primary color, hover brightens slightly, active scales down, disabled grays out
  - Inputs: Focus state shows accent ring, error state shows red border with icon
  - Match cards: Default shadow, hover lifts with larger shadow, active state subtle scale
  - Status indicators: Pending pulses gently, confirmed shows checkmark icon

- **Icon Selection**: 
  - Trophy (Phosphor duotone) - App branding, match success
  - Users - Player count, participant management
  - Calendar - Match scheduling, date selection
  - MapPin - Location, field address
  - CreditCard - Payment flows
  - ChatCircle - Real-time messaging
  - Plus - Create match, add field
  - ArrowLeft - Back navigation
  - CheckCircle - Confirmed status
  - Clock - Time/duration indicators

- **Spacing**: 
  - Container padding: px-6 (24px) on mobile, px-8 (32px) on desktop
  - Card internal padding: p-6 (24px)
  - Section gaps: gap-8 (32px) between major sections
  - Element gaps: gap-4 (16px) within components
  - Button padding: px-6 py-3 (24px horizontal, 12px vertical)
  - Consistent 8px grid system throughout

- **Mobile**: 
  - Single column layout for match cards below 768px
  - Sticky header collapses to icon + hamburger menu
  - Dialog forms stack vertically with full-width inputs
  - Chat interface takes full screen on mobile with floating input
  - Bottom navigation bar for main actions (browse, bookings, profile)
  - Match detail cards show condensed info with expandable sections
  - Touch targets minimum 44px for easy tapping
