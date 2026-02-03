# Planning Guide

A platform that simplifies organizing amateur soccer matches by connecting players, facilitating payments, and coordinating match details in an intuitive interface.

**Experience Qualities**: 
1. **Immediate** - Users can find and join matches within seconds of opening the app
2. **Trustworthy** - Clear information about matches, players, and venues creates confidence
3. **Social** - The platform fosters connection through shared passion for the sport

**Complexity Level**: Light Application (multiple features with basic state)
This is a light application because it manages multiple interconnected features (match browsing, user profiles, payments, match participation) with persistent state, but doesn't require complex multi-view navigation or advanced data relationships typical of enterprise applications.

## Essential Features

### Match Discovery
- **Functionality**: Browse available matches in the user's geographic area
- **Purpose**: Solves the core problem of finding games to join
- **Trigger**: User opens the app or navigates to matches view
- **Progression**: Open app → View match list with filters → Apply filters (date/time/level) → Browse results → Select match for details
- **Success criteria**: Users can see relevant matches within 2 seconds, filters work accurately

### Match Details & Registration
- **Functionality**: View comprehensive match information and join with payment
- **Purpose**: Enables users to make informed decisions and commit to participation
- **Trigger**: User selects a match from the list
- **Progression**: Select match → Review details (venue, time, players, level) → Click join → Complete payment → Receive confirmation
- **Success criteria**: Payment flow completes in under 30 seconds, users receive immediate confirmation

### User Profile Management
- **Functionality**: Create and edit personal profile with skill level and preferences
- **Purpose**: Enables match recommendations and helps organize appropriate skill-level games
- **Trigger**: First-time registration or profile edit action
- **Progression**: Registration prompt → Enter name/email/password → Set location → Select skill level → Save profile → Start browsing matches
- **Success criteria**: Profile creation takes under 90 seconds, information persists correctly

### Match Participant View
- **Functionality**: See who else is confirmed for a match
- **Purpose**: Creates social accountability and helps users recognize familiar players
- **Trigger**: User views a match they've joined
- **Progression**: View my matches → Select match → See participant list with names and skill levels
- **Success criteria**: Participant information loads instantly, updates when players join/leave

### Match Communication
- **Functionality**: In-match chat for coordination among confirmed players
- **Purpose**: Enables last-minute coordination and builds community
- **Trigger**: User opens a match they've joined
- **Progression**: Open joined match → View chat thread → Type message → Send → Message appears for all participants
- **Success criteria**: Messages appear within 1 second for all participants

## Edge Case Handling

- **No Matches Available**: Display encouraging empty state with "Check back soon" message and option to get notified
- **Payment Failure**: Clear error message with retry option and alternative payment method suggestion
- **Match Cancellation**: Immediate push notification to all participants with automatic refund processing
- **Location Services Disabled**: Graceful fallback to manual city selection with prominent enable-location prompt
- **Offline Access**: Display cached match data with clear "offline" indicator and queue actions for when connection returns
- **Full Match**: Prevent join attempts with waitlist option and notification when spots open
- **Minimum Players Not Met**: Notification to participants 24h before with cancellation if threshold not reached

## Design Direction

The design should evoke energy, athleticism, and Italian sporting culture - vibrant but not overwhelming, professional yet approachable. Users should feel the excitement of the game while trusting the platform's reliability. The aesthetic should mirror the experience of arriving at a well-maintained campo di calcetto: organized, inviting, and ready for action.

## Color Selection

A bold, sporty palette inspired by Italian football culture with high energy and clear visual hierarchy.

- **Primary Color**: Deep forest green `oklch(0.45 0.12 155)` - Represents the campo (field) and conveys trust, growth, and the sport itself
- **Secondary Colors**: 
  - Warm terracotta `oklch(0.62 0.14 45)` for secondary actions and accents, evoking Italian architecture and warmth
  - Cool slate blue `oklch(0.35 0.05 240)` for information panels and muted backgrounds
- **Accent Color**: Vibrant electric lime `oklch(0.82 0.18 130)` for CTAs, highlights, and active states - creates urgency and energy
- **Foreground/Background Pairings**: 
  - Primary (Forest Green): White text `oklch(0.98 0 0)` - Ratio 7.2:1 ✓
  - Accent (Electric Lime): Dark green text `oklch(0.25 0.08 155)` - Ratio 8.5:1 ✓
  - Background `oklch(0.97 0.01 155)` (soft off-white with green tint): Foreground `oklch(0.18 0.02 240)` (deep charcoal) - Ratio 12.1:1 ✓
  - Card surfaces `oklch(1 0 0)`: Primary text `oklch(0.18 0.02 240)` - Ratio 14.5:1 ✓

## Font Selection

Typography should feel dynamic and contemporary while maintaining excellent readability for quick scanning of match information.

- **Primary Font**: Space Grotesk for headings - geometric, modern, sporty without being aggressive
- **Secondary Font**: Inter for body text - exceptional readability at all sizes, professional feel

- **Typographic Hierarchy**:
  - H1 (Page Titles): Space Grotesk Bold/32px/tight (-0.02em) letter spacing
  - H2 (Section Headers): Space Grotesk SemiBold/24px/tight (-0.01em)
  - H3 (Card Titles): Space Grotesk Medium/18px/normal
  - Body Large (Match Details): Inter Regular/16px/relaxed (1.6 line height)
  - Body (General Text): Inter Regular/14px/relaxed (1.5 line height)
  - Small (Meta Info): Inter Medium/12px/normal uppercase with wider tracking (0.05em)

## Animations

Animations should feel athletic and responsive - quick, confident movements that mirror the energy of the sport without causing delays.

- **Micro-interactions**: Button presses use a subtle scale-down (0.97) with 100ms duration to feel tactile
- **Page transitions**: Smooth slide-in from right with 250ms cubic-bezier easing for forward navigation
- **Match cards**: Gentle lift on hover (4px translateY) with shadow expansion over 200ms
- **Join/Payment flow**: Progressive step indicator with animated checkmarks (300ms spring animation)
- **Chat messages**: Fade-slide in from bottom (150ms) for new messages
- **Loading states**: Pulsing shimmer effect for match card skeletons rather than spinners
- **Success confirmations**: Celebratory micro-bounce (scale 1.0 → 1.05 → 1.0) over 400ms when match join completes

## Component Selection

- **Components**:
  - **Card**: Foundation for match listings with custom hover states and subtle green border accent
  - **Button**: Primary actions use solid accent color, secondary use outline with primary color
  - **Badge**: Skill level indicators (principiante/intermedio/avanzato) with color-coded variants
  - **Avatar**: Player profile images in participant lists (fallback to initials)
  - **Dialog**: Payment flow and match details overlay
  - **Input**: Profile editing and filters with clear focus states using accent color ring
  - **Select**: Dropdown for skill level and location filters
  - **Tabs**: Switch between "Available Matches" and "My Matches"
  - **Separator**: Divides match details sections
  - **ScrollArea**: Smooth scrolling for match lists and chat
  - **Toast**: Match confirmations and error messages using Sonner

- **Customizations**:
  - **MatchCard**: Custom component combining Card with match-specific layout (venue, time, players count, skill level badges)
  - **PlayerCount**: Visual indicator showing filled vs. total spots (e.g., "8/10" with progress bar)
  - **SkillBadge**: Color-coded badges (green for principiante, yellow for intermedio, red for avanzato)
  - **PaymentSheet**: Multi-step dialog for payment flow with Stripe-style input styling

- **States**:
  - Buttons: Default has solid background, hover brightens (+10% lightness), active scales down 97%, disabled reduces opacity to 50%
  - Match Cards: Default has subtle shadow, hover lifts 4px with larger shadow, selected state has accent border
  - Inputs: Default has border, focus adds accent ring and slight border color shift, error state uses destructive color
  - Badges: Static elements with no interaction states, but use opacity variations for different skill levels

- **Icon Selection**:
  - Soccer ball (⚽ pattern or SoccerBall) for match cards
  - MapPin for venue locations
  - Clock for match times  
  - Users for participant counts
  - Star for skill level
  - CreditCard for payment actions
  - Check/CheckCircle for confirmations
  - CalendarBlank for date selection
  - FunnelSimple for filters
  - ChatCircle for match chat

- **Spacing**:
  - Cards: p-6 for match cards, p-4 for compact variants
  - Sections: gap-8 between major sections, gap-4 between related elements
  - Match list: gap-4 between cards
  - Match details: gap-6 between information groups
  - Buttons: px-6 py-3 for primary actions, px-4 py-2 for secondary
  - Page padding: px-4 md:px-8 for responsive edge spacing

- **Mobile**:
  - Single column layout for match cards on mobile (grid-cols-1), 2 columns on tablet (md:grid-cols-2), 3 on desktop (lg:grid-cols-3)
  - Bottom tab navigation on mobile for main sections
  - Full-screen dialogs on mobile (sheet slides up from bottom)
  - Sticky filter bar at top on mobile for quick access
  - Larger touch targets (min 44px height) for all interactive elements
  - Collapsible match details sections on mobile to reduce scrolling
  - Simplified participant list shows avatars only on mobile, expands to names on tablet+
