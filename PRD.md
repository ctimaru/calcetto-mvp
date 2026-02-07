# Planning Guide

A modern platform that connects amateur soccer players, helps them discover and join matches, track their progress, and build a community around the sport they love.

**Experience Qualities**: 
1. **Dynamic** - The interface feels alive with energy and motion, reflecting the excitement of the sport
2. **Welcoming** - New players feel immediately at home with clear pathways to get started
3. **Professional** - Despite being for amateurs, the platform feels polished and trustworthy

**Complexity Level**: Light Application (multiple features with basic state)
This is a light application because it manages multiple interconnected features (match browsing, user profiles, payments, match participation) with persistent state, but doesn't require complex multi-view navigation or advanced data relationships typical of enterprise applications.

## Essential Features

### Live Matches View
- **Functionality**: Real-time display of currently active matches with live scores, player movements, and match events
- **Purpose**: Creates excitement and engagement by showing the dynamic nature of the platform, gives users visibility into ongoing matches
- **Trigger**: User clicks on the "Live Matches" stat card on home page (when count > 0) or navigates directly
- **Progression**: Click live matches → View grid of all active matches with live scores → Select match for detailed view → See real-time match progress, elapsed time, score updates, player roster, and event timeline (goals, player joins)
- **Success criteria**: Matches show within matches scheduled time window (start time to +90 minutes), scores and elapsed time update automatically, event timeline displays in chronological order, users can quickly identify match status (first half, halftime, second half)

### Match Creation
- **Functionality**: Multi-step wizard for creating new matches with venue selection or creation
- **Purpose**: Enables users to organize their own matches and invite other players
- **Trigger**: User clicks "Crea Partita" button in header (requires authentication)
- **Progression**: Click create → Step 1: Select or add venue → Step 2: Choose date and time → Step 3: Set details (skill level, player count, price, description) → Submit → Match created and user auto-joined
- **Success criteria**: Creation takes under 2 minutes, venue data persists for reuse, creator is automatically added as first participant, match appears in browse listing immediately

### Browse Matches Page
- **Functionality**: Comprehensive match browsing with real-time search and multi-criteria filtering
- **Purpose**: Enables users to quickly discover relevant matches based on their preferences
- **Trigger**: User clicks "Sfoglia Partite" button from home page or navigation
- **Progression**: Click browse → View full match listing → Apply filters (skill level/city/date) → Enter search terms → Review filtered results → Select match for details
- **Success criteria**: Search responds instantly as user types, filters can be combined effectively, match list displays within 1 second, mobile filters are accessible via collapsible panel

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
- **Progression**: Select match → Review details (venue, time, players, level) → Click join → Select payment method → Enter payment details → Confirm payment → Receive confirmation
- **Success criteria**: Payment flow completes in under 30 seconds, users receive immediate confirmation, transaction is recorded in history

### Payment Processing
- **Functionality**: Secure payment handling with multiple payment methods (credit/debit card, PayPal, bank transfer) with full validation
- **Purpose**: Enables safe and reliable payment processing for match participation fees
- **Trigger**: User clicks "Unisciti alla Partita" from match details dialog
- **Progression**: Click join → Payment dialog opens → Select payment method → Enter payment details (card number, expiry, CVC, cardholder name) → Review order summary → Confirm payment → Processing animation → Success confirmation with transaction receipt
- **Success criteria**: Payment completes within 2 seconds, card validation works correctly, users see clear payment summary before confirming, transaction is immediately visible in transaction history, failed payments show clear error messages

### Transaction History
- **Functionality**: Comprehensive view of all financial transactions including payments, refunds, bonuses, and cancellation fees with detailed metadata
- **Purpose**: Provides full transparency of user's financial activity and enables easy tracking of match-related expenses
- **Trigger**: User navigates to "Transazioni" tab in profile view
- **Progression**: Open profile → Click transactions tab → View transaction summary cards (total spent, refunds, bonuses) → Scroll through chronological transaction list → View transaction details including venue, date, payment method
- **Success criteria**: All transactions display correctly with proper icons and colors, summary totals are accurate, transactions are sorted by date (newest first), transaction metadata shows complete match information

### User Profile Management
- **Functionality**: Create and edit personal profile with skill level and preferences; view match history and statistics
- **Purpose**: Enables match recommendations, helps organize appropriate skill-level games, and provides users with their activity overview
- **Trigger**: First-time app load (automatic) or clicking profile button/avatar in header
- **Progression**: App launch → Profile creation dialog appears (3-step wizard) → Enter name/email → Enter age/location → Select skill level → Save profile → Redirected to home page with profile available in header
- **Success criteria**: Profile creation takes under 90 seconds, information persists correctly, users can view their upcoming and past matches, edit profile anytime from profile page

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

### Venue Ratings and Reviews
- **Functionality**: Users can rate and review venues after participating in matches
- **Purpose**: Provides transparency about venue quality and helps users make informed decisions about which matches to join
- **Trigger**: User views past matches they've participated in
- **Progression**: View my past matches → Select completed match → Click "Valuta il Campo" → Rate overall experience (1-5 stars) → Rate specific aspects (cleanliness, quality, facilities, location) → Add optional comment → Submit review
- **Success criteria**: Reviews appear on venue details immediately, average ratings update correctly across all matches at that venue, users can view all reviews for a venue

### Role Selection on Landing Page
- **Functionality**: Initial role selection screen that allows users to choose between accessing the platform as a player or as a venue manager
- **Purpose**: Creates clear separation between player and manager experiences, ensures proper authentication flows for each role
- **Trigger**: First time user opens the application (when no role has been chosen and no user/manager is logged in)
- **Progression**: Open app → View role selection screen with two options → Click "Sono un Giocatore" → Profile creation dialog opens → Complete profile → Access player features OR Click "Sono un Manager" → Manager login dialog opens → Login/signup → Access management dashboard
- **Success criteria**: Role selection appears only on first access, choice is persisted across sessions, users can logout and return to role selection, clear visual distinction between player and manager options

### Venue Management (Manager Login Required)
- **Functionality**: Comprehensive venue management dashboard for venue managers with add, edit, delete, and analytics capabilities
- **Purpose**: Enables venue managers to manage their venues, maintain accurate venue information, monitor venue performance, booking conflicts, and handle reservations
- **Trigger**: User clicks "Management" button in header and completes manager authentication (login or signup)
- **Progression**: Click Management → Manager login/signup dialog appears → Complete authentication → View dashboard with statistics (total venues, average rating, bookings today) → Browse/search venue list → Add new venue via dialog → Edit existing venue details → View venue statistics (rating distribution, aspect ratings, recent reviews) → Manage bookings and conflicts → Delete venues with confirmation → Logout to return to role selection
- **Success criteria**: ALL users must authenticate as managers to access management area, managers can only see/edit their own venues, authentication persists during session, logout returns to role selection screen, all CRUD operations persist correctly, statistics update in real-time

### Booking Conflict Detection
- **Functionality**: Automatic detection of scheduling conflicts when creating matches or bookings at the same venue for overlapping time slots (assuming 90-minute match duration)
- **Purpose**: Prevents double-booking of venues, ensures match organizers are aware of conflicts before finalizing bookings, maintains data integrity of the booking system
- **Trigger**: User attempts to create a match at a venue where another match or booking already exists for the same date and overlapping time
- **Progression**: Complete match creation steps → Submit match → System detects conflict → Conflict dialog displays showing conflicting matches/bookings with full details → User can cancel or proceed anyway (admin override)
- **Success criteria**: All conflicts detected accurately within 500ms, conflict details show venue name, date, time range, and affected matches, system creates booking records to track venue usage, no false positives or missed conflicts

### Notification System
- **Functionality**: Comprehensive push notification system for match-related events including creation, player joins, match full status, cancellations, match reminders (1 hour before), and booking conflicts
- **Purpose**: Keeps users informed of important match updates, increases engagement and attendance rates, provides real-time communication about booking conflicts
- **Trigger**: Various automated events (match created, player joined, match full, match approaching, conflict detected)
- **Progression**: Event occurs → System creates notification record → Notification appears in bell icon with badge count → User clicks bell → Notification panel slides in → View all notifications with timestamps → Click notification to mark as read → Click "Mark all as read" to clear unread status
- **Success criteria**: Notifications deliver instantly (<1s), unread count displays accurately on bell icon, notification panel shows chronological list with proper icons and colors, users can mark individual or all notifications as read, notifications persist across sessions, match reminders sent automatically 1 hour before match time

## Edge Case Handling

- **No Matches Available**: Display encouraging empty state with "Check back soon" message and option to get notified
- **Payment Failure**: Clear error message with retry option and alternative payment method suggestion
- **Invalid Card Details**: Real-time validation of card number format (16 digits), expiry date format (MM/YY), and CVC (3 digits) with specific error messages
- **Processing Timeout**: If payment takes longer than expected, show reassuring message that transaction is being processed
- **Duplicate Transaction Prevention**: Disable payment button during processing to prevent double-charging
- **Match Cancellation**: Immediate push notification to all participants with automatic refund processing, refund transaction appears in transaction history
- **Location Services Disabled**: Graceful fallback to manual city selection with prominent enable-location prompt
- **Offline Access**: Display cached match data with clear "offline" indicator and queue actions for when connection returns
- **Full Match**: Prevent join attempts with waitlist option and notification when spots open
- **Minimum Players Not Met**: Notification to participants 24h before with cancellation if threshold not reached
- **Empty Transaction History**: Show encouraging empty state explaining that transactions will appear after joining matches
- **No Reviews Yet**: Empty state encouraging users to be the first to review after playing at the venue
- **Review Before Match Completion**: Prevent users from reviewing venues until after the match has occurred
- **Multiple Reviews**: Limit users to one review per match at each venue to prevent spam
- **Creating Match Without Profile**: Redirect users to profile creation if they attempt to create a match without being logged in
- **Invalid Venue Data**: Validate all venue fields before allowing creation, show specific error messages
- **Past Date Selection**: Prevent users from selecting dates in the past for new matches
- **Unrealistic Player Counts**: Enforce min/max player limits (2-22) with helpful guidance for typical match sizes
- **Transaction Filtering**: Future enhancement to filter transactions by type, status, or date range
- **No Role Selected**: Show role selection screen when no user or manager is logged in and no role has been chosen
- **Accessing Management Without Login**: Always show manager login dialog, even for app owner (no bypass)
- **Manager Logout**: Clear manager session and return to role selection screen allowing switch between roles
- **Empty Venue List**: Display helpful empty state with call-to-action to add first venue
- **No Search Results**: Show "no venues found" message when search query returns no results
- **Venue Deletion with Active Matches**: Future enhancement to warn or prevent deletion of venues with upcoming matches
- **No Venue Reviews**: Display empty state in venue stats when venue has no reviews yet
- **Booking Conflict Detected**: Display detailed conflict dialog showing all overlapping matches and bookings, allow admin override to proceed anyway, send notifications to affected users
- **Multiple Simultaneous Bookings**: System uses transaction-safe operations to prevent race conditions when multiple users attempt to book the same time slot
- **No Notifications**: Display empty state with bell icon and encouraging message in notification panel
- **Notification Overflow**: Panel scrolls smoothly with infinite scroll, older notifications remain accessible
- **Failed Notification Delivery**: System retries notification creation and logs errors for debugging

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
  - **Badge**: Skill level indicators (principiante/intermedio/avanzato) with color-coded variants, transaction status badges
  - **Avatar**: Player profile images in participant lists and header (fallback to initials)
  - **Dialog**: Payment flow, match details overlay, match creation wizard, and profile creation/editing
  - **Input**: Profile editing, filters, match creation forms, and payment card details with clear focus states using accent color ring
  - **Select**: Dropdown for skill level, location filters, venue selection, and payment method selection
  - **RadioGroup**: Payment method selection with visual cards for each option
  - **Tabs**: Switch between "Available Matches" and "My Matches" in profile, upcoming/past matches, and transaction history
  - **Separator**: Divides match details sections, profile information groups, and payment summary sections
  - **ScrollArea**: Smooth scrolling for match lists, chat, and transaction history
  - **Toast**: Match confirmations, profile updates, match creation success, payment confirmations, and error messages using Sonner
  - **Progress**: Visual indicator for rating distribution in venue reviews, match creation progress, and payment processing
  - **Textarea**: Multi-line input for review comments and match descriptions

- **Customizations**:
  - **MatchCard**: Custom component combining Card with match-specific layout (venue, time, players count, skill level badges, venue rating)
  - **PlayerCount**: Visual indicator showing filled vs. total spots (e.g., "8/10" with progress bar)
  - **SkillBadge**: Color-coded badges (green for principiante, yellow for intermedio, red for avanzato) with size variants (sm, md, lg)
  - **PaymentDialog**: Multi-step payment dialog with payment method selection (card, PayPal, bank transfer), card detail inputs with format validation, order summary, and secure payment confirmation with processing animation
  - **TransactionHistory**: Comprehensive transaction list with summary cards showing total spent/refunded/bonuses, chronological transaction cards with type/status badges, payment method display, and transaction metadata (venue, date, time)
  - **StarRating**: Interactive and display-only star rating component supporting partial stars
  - **VenueReviewCard**: Card displaying individual review with ratings, aspects, and helpful votes
  - **AddReviewDialog**: Multi-section dialog for submitting venue reviews with overall and aspect ratings
  - **VenueReviewsDialog**: Full-page dialog showing venue rating summary, distribution, and all reviews
  - **ProfileCreationDialog**: Multi-step wizard for creating/editing user profiles with validation and smooth transitions
  - **ProfileView**: Comprehensive profile page showing user info, statistics, and match history with tabs for upcoming/past matches and transaction history
  - **CreateMatchDialog**: 3-step wizard for match creation (venue selection/creation, date/time, match details) with progress indicator and validation
  - **VenueManagement**: Admin-only full-page venue management interface with statistics dashboard, city distribution chart, searchable venue list, and CRUD operations
  - **AddVenueDialog**: Form dialog for adding new venues with validation (name, address, city, phone)
  - **EditVenueDialog**: Form dialog for editing existing venue details with pre-populated fields
  - **VenueStatsDialog**: Comprehensive analytics dialog showing venue statistics including rating distribution, aspect ratings, review list, and match count

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
  - User for profile sections
  - Star for ratings and skill level
  - CreditCard for payment actions and card payment method
  - Bank for PayPal and bank transfer payment methods
  - Receipt for transaction history
  - ArrowCircleUp for payment/expense transactions
  - ArrowCircleDown for refund transactions
  - Gift for bonus transactions
  - WarningCircle for cancellation fees and warnings
  - CheckCircle for confirmations and completed status
  - XCircle for failed transactions
  - Check/CheckCircle for confirmations
  - CalendarBlank for date selection
  - Calendar for match dates
  - FunnelSimple for filters
  - ChatCircle for match chat
  - ThumbsUp for marking reviews as helpful
  - PencilSimple for edit actions
  - Trophy for achievements and skill
  - TrendUp for statistics
  - EnvelopeSimple for email display
  - ArrowLeft for back navigation
  - Plus for create actions (new match, new venue)
  - X for close/cancel actions
  - CurrencyEur for pricing information
  - LockKey for secure payment processing animation
  - ShieldCheck for payment security badge
  - Buildings for venues and venue management
  - ChartBar for statistics and analytics
  - Trash for delete actions
  - MagnifyingGlass for search functionality
  - Phone for venue contact information
  - Sparkle for quality/feature highlights

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
