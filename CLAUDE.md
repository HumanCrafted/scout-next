# Scout - Project Documentation

## Project Overview
Scout is a web-based industrial sensor mapping application built for mapping sensors and equipment at large industrial sites. The application provides a comprehensive interface for placing markers on maps, searching locations, managing marker data, and organizing markers into hierarchical groups.

## Technologies Used
- **Frontend**: Next.js 15.4.2 with React 19.1.0 and TypeScript
- **Database**: Vercel Postgres with Prisma ORM
- **Mapping**: Mapbox GL JS v3.13.0
- **Search**: Mapbox Search Box API
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with CSS animations
- **Icons**: Material Design Icons
- **Forms**: React Hook Form with Zod validation
- **Authentication**: bcrypt.js for password hashing
- **Development**: ESLint, PostCSS, TypeScript compiler

## Key Features

### 🗺️ Core Map Functionality
- Full-screen Mapbox map interface
- Satellite and street view toggle with proper active states
- Zoom level display
- Re-center functionality for search locations
- Fast zoom animations (2.0x speed) for search results

### 🔍 Search & Navigation
- Address search with autocomplete using Mapbox Search Box
- Coordinate-based search support
- Automatic map centering and pin placement for search results
- Re-center button to return to last search location

### 📍 Advanced Custom Marker System
- **Fully Customizable Categories**: Teams create their own marker categories and icons
- **Multi-Icon Categories**: Each category (e.g., "Areas", "Devices", "Assets") can contain multiple icons
- **Material Icons Integration**: 150+ Material Design icons available with searchable picker
- **Flexible Marker Types**:
  - **Areas**: Numbered 1-10 with dark background (renamed from "Locations" to avoid search pin confusion)
  - **Custom Categories**: Team-defined categories with multiple icon options
  - **Auto-numbering**: New markers automatically numbered by category (e.g., "Device 1", "Device 2")
- **Team Settings Management**: Complete category and icon customization through Settings page
- **Icon Configuration**: Each icon has name, Material Icon, background color, and numbering options
- Drag-and-drop placement from dynamically generated sidebar toolbar
- **Advanced marker management**:
  - Professional edit dialog with name and GPS coordinate fields
  - Lock/unlock functionality to prevent accidental marker movement
  - Delete functionality with confirmation
  - Compact control buttons to save sidebar space
- Draggable markers on map for repositioning (when unlocked)
- **Hierarchical grouping**: Drag markers in sidebar to create parent-child relationships
- **Advanced drag behaviors**:
  - **Drag-to-reorder**: Horizontal blue insertion lines show exact placement position
  - **Drag-to-group**: Blue border highlight on target marker for grouping
  - **Group reordering**: Whole groups can be dragged to reorder as complete units
  - **Smart detection**: Mouse position and marker type automatically determine operation type
  - **Height threshold system**: 25% edge zones for reordering, center zone for grouping
- **Position-based ordering**: Database-persisted marker positions for consistent ordering
- Drag-off functionality to remove markers from groups
- Visual hierarchy with left borders for grouped markers
- Collapsible groups with expand/collapse functionality

### 🎨 User Interface
- **Left sidebar**: Start New Map button, search box, map title editor, and placed markers list
- **Right sidebar**: Dynamic marker toolbar (95px width) rendering team's custom categories and icons
- **Bottom controls**: Zoom display, map style toggle, labels toggle, re-center button
- Material Design icons (16px for markers, 12px for controls) for compact, intuitive controls
- Consistent shadcn/ui theming throughout
- **Screenshot mode**: Hides all UI elements and shows all labels for clean screenshots
- **Professional modal dialogs**: Custom-styled edit dialogs with keyboard support
- **Settings page**: Comprehensive team settings with marker category and icon management

### 💾 Data Management
- **Database-driven persistence**: All data stored in Vercel Postgres with real-time updates
- **Team isolation**: Complete data separation between teams with secure authentication
- **Custom marker categories**: Team-specific category and icon definitions
- **Auto-save functionality**: Changes automatically persisted to database
- **Export capabilities**: JSON export functionality for backup and migration
- **Position-based ordering**: Database fields for drag-and-drop marker reordering
- **Legacy support**: Backward compatibility with existing marker data

### 🏷️ Labels & Visualization
- Toggle-able labels for all markers
- Custom popup styling with dark background
- Positioned to the right of markers with proper spacing
- Click-to-center functionality for markers in sidebar
- Screenshot mode for clean map exports

### ⚙️ Technical Features
- **Custom category system**: Database-driven marker categories with multiple icons per category
- **Dynamic toolbar generation**: Toolbar rendered from team's custom category and icon definitions
- **Material Icons integration**: Searchable icon picker with 150+ Material Design icons
- **Auto-numbering algorithm**: Smart number assignment based on existing markers in category
- Hierarchical marker organization with parent-child relationships
- **Position-based ordering system**: Database fields for position tracking and drag-to-reorder
- **Advanced drag detection**: Mouse position analysis and height threshold system (25% edge zones)
- **Dual drag behaviors**: Distinct visual feedback for reordering vs grouping operations
- **Group reordering**: Complete groups can be dragged and reordered as atomic units
- **Smart operation restrictions**: Groups can only reorder, individual markers can reorder or group
- **Child marker protection**: Only root/parent markers can accept grouping operations
- **Database schema**: Normalized tables for categories, icons, and markers with proper relationships
- **API architecture**: RESTful endpoints for category and icon management
- Event-driven architecture for map interactions
- Optimized for industrial use with clear, professional styling
- Responsive design with fixed sidebar layout

## File Structure
```
scout-next/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes for backend functionality
│   │   │   ├── auth/               # Authentication endpoints
│   │   │   ├── maps/               # Map CRUD operations
│   │   │   ├── markers/            # Marker CRUD operations
│   │   │   └── teams/              # Team management
│   │   ├── [team]/                 # Dynamic team routes (e.g., /masen)
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── map/
│   │   │   └── MapContainer.tsx    # Main map component
│   │   └── ui/                     # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   └── lib/
│       ├── auth.ts                 # Authentication utilities
│       ├── db.ts                   # Database connection
│       └── utils.ts                # Shared utilities
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
└── CLAUDE.md                       # Project documentation (this file)
```

## Development History

### Phase 1: Initial Setup
- Created Docker containerized development environment
- Set up basic Mapbox GL JS integration
- Implemented full-screen map with basic controls

### Phase 2: Core Features
- Added drag-and-drop pin placement system
- Implemented address search functionality
- Created marker type system (Locations, Devices, Assets)
- Added save/clear functionality for markers

### Phase 3: UI/UX Refinement
- Applied shadcn/ui theming for professional appearance
- Reorganized layout with left/right sidebars
- Added zoom display and satellite/street view toggle
- Implemented re-center button with off-center state detection

### Phase 4: Search Enhancement
- Integrated Mapbox Search Box for autocomplete
- Fixed search icon overlapping issues
- Improved address parsing for full location details
- Enhanced search result handling for FeatureCollection responses

### Phase 5: Marker Management
- Added individual marker editing (rename functionality)
- Implemented Material Design icons for edit/delete buttons
- Optimized toolbar width (95px) for proper marker layout
- Added click-to-center functionality for sidebar markers

### Phase 6: Labels & Visualization
- Implemented toggle-able labels for all markers
- Custom popup styling with dark background and right positioning
- Added screenshot mode for clean map exports
- Enhanced visual hierarchy and spacing

### Phase 7: Data Persistence
- Implemented file-based save/load system with JSON format
- Added drag-and-drop file loading support
- User-customizable filenames with automatic timestamping
- Map title persistence and editing functionality

### Phase 8: Advanced Features
- **Hierarchical marker grouping**: Drag markers in sidebar to create parent-child relationships
- Drag-off functionality to remove markers from groups
- Visual hierarchy with left borders for grouped markers
- Multiple device icons (memory, wifi, solar-panel) and asset icons (build, lan, warning, power)
- Icon-specific data persistence and 16px sizing standardization
- Clear confirmation dialog and active state fixes

### Phase 9: Professional Polish
- **Professional edit dialog**: Combined name and GPS coordinate editing in single modal
- **Marker lock system**: Lock/unlock functionality to prevent accidental movement
- **Start New Map button**: Quick refresh functionality with confirmation dialog
- **Compact controls**: Reduced button sizes (24px) for better space utilization
- **Environment-based token management**: Automatic detection for GitHub Pages deployment
- **Enhanced keyboard support**: ESC and Ctrl+Enter shortcuts for modal dialogs

### Phase 10: Next.js Migration (v2.0) - COMPLETED ✅
- **Framework Migration**: Successfully migrated from vanilla JS to Next.js 15.4.2
- **Database Integration**: Implemented Vercel Postgres with Prisma ORM
- **Team Authentication**: Per-team login system with secure password hashing
- **Modern UI**: Complete shadcn/ui component integration with Tailwind CSS
- **Slot Labels**: Implemented beautiful slot-shaped labels with concentric marker positioning
- **Advanced Scrolling**: Fixed header/search/footer with scrollable maps section only
- **Screenshot Mode**: Professional fullscreen export functionality
- **Lock System**: Database-persisted marker lock states
- **API Architecture**: RESTful endpoints for all CRUD operations
- **TypeScript**: Full type safety with interfaces and validation

### Phase 11: Advanced Drag & Drop System (2025-01-20) - COMPLETED ✅
- **Position-Based Ordering**: Implemented database fields for marker position tracking
  - `position` field for root-level marker ordering
  - `childPosition` field for child marker ordering within groups
  - Database migration: `20250720165624_add_marker_positions`
- **Enhanced Drag Behaviors**: Separated drag-to-reorder from drag-to-group operations
  - **Drag-to-reorder**: Shows horizontal blue insertion lines between markers
  - **Drag-to-group**: Shows blue border highlight on target marker
  - **Smart operation detection**: Mouse position analysis determines intent
- **Visual Feedback Improvements**: 
  - Insertion lines appear above/below markers during reorder operations
  - Border highlighting for grouping operations on both parent and child markers
  - Clear distinction between operation types
- **Database Schema Updates**: 
  - Added `position` and `childPosition` fields to Marker model
  - Updated API endpoints to handle position updates
  - Automatic position assignment for new markers
- **UI/UX Enhancements**:
  - CSS-based screenshot mode implementation (fixed white box issues)
  - Fixed add button icon display (Material Icons integration)
  - Prevention of double nesting (groups cannot be dragged onto other groups)
  - Mouse position-based insertion point calculation
- **API Improvements**:
  - Enhanced marker creation to auto-assign positions
  - Position-based ordering in database queries
  - Support for position updates during grouping/ungrouping operations

## Current State (Next.js Migration Complete!)
The application has been successfully migrated to Next.js with significant enhancements:

### ✅ Next.js Architecture (v2.0)
- **Framework**: Next.js 15.4.2 with React 19.1.0 and TypeScript
- **Database**: Vercel Postgres with Prisma ORM for data persistence
- **UI Components**: shadcn/ui with Radix UI primitives and Tailwind CSS
- **Authentication**: Team-based login system with bcrypt password hashing
- **Modern Tooling**: ESLint, PostCSS, and comprehensive TypeScript support

### ✅ Enhanced Features
- **Slot-shaped labels**: Beautiful new label design with markers appearing inside slots
- **Advanced sidebar scrolling**: Fixed header/search/footer with scrollable maps section
- **Marker lock/unlock system**: Database-persisted lock states to prevent accidental movement
- **Screenshot mode**: Clean fullscreen map export with all UI elements hidden
- **Professional transitions**: Smooth 300ms animations throughout the interface
- **Team workspaces**: URL-based team access (`/masen`, `/move`, etc.)
- **Real-time persistence**: All changes automatically saved to Vercel Postgres
- **Responsive design**: Mobile-optimized interface with touch support
- **Advanced drag & drop**: 
  - Position-based ordering with database persistence
  - Dual drag behaviors (reorder vs group) with distinct visual feedback
  - Smart operation detection based on mouse position
  - Horizontal insertion lines for precise reordering
  - Blue border highlighting for grouping operations

### ✅ Technical Infrastructure
- **API Routes**: RESTful endpoints for maps, markers, teams, and authentication
- **Database Schema**: Properly normalized tables with relationships and indexes
- **Component Architecture**: Modular React components with TypeScript interfaces
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React hooks with optimistic updates
- **Build Pipeline**: Automated Prisma generation and Next.js optimization

## Key Design Decisions

### Technology Choices
- **Vanilla JavaScript**: Chosen for simplicity and direct control
- **Mapbox GL JS**: Selected for robust mapping capabilities and industrial-grade performance
- **Material Design Icons**: Used for intuitive, space-efficient controls
- **shadcn/ui Colors**: Applied for consistent, professional theming

### Architecture Decisions
- **Session-based state**: Prioritized stability over persistence
- **Event-driven design**: Used Mapbox event system for responsive interactions
- **Modular functions**: Organized code for maintainability
- **Fixed sidebar layout**: Optimized for industrial workflow patterns

## Future Considerations
- **Backend Integration**: API integration for data persistence and sharing
- **Advanced Features**: Layer management, measurement tools, additional export formats
- **Mobile Optimization**: Touch-friendly interactions for tablet use
- **Additional Marker Types**: Custom marker creation and icon upload
- **Collaborative Features**: Real-time sharing and multi-user editing

## Development Commands
```bash
# Install dependencies
npm install

# Generate Prisma client and start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Generate Prisma client only
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed database with initial data
npm run db:seed

# Lint code
npm run lint
```

## Notes for Future Development
- **Next.js Architecture**: Modern React-based framework provides excellent developer experience
- **Database Integration**: Vercel Postgres with Prisma ORM enables robust data persistence
- **Team System**: URL-based team workspaces provide excellent multi-tenancy
- **Component Architecture**: shadcn/ui provides consistent, accessible UI components
- **TypeScript**: Full type safety improves code reliability and developer experience
- **Vercel Deployment**: Serverless architecture scales automatically
- **Mapbox Integration**: Solid foundation supports additional mapping features
- **Slot Labels**: Beautiful new label design enhances visual hierarchy

## Next.js Migration Plan (Advanced Scout App v2)

### Overview
This documents the planned migration from the current vanilla JavaScript Scout app to a Next.js application with team collaboration, real-time database, and advanced state management including undo/redo functionality.

### Development Strategy: Fork-Based Approach

#### Why Fork?
- **Preserve Original**: Keep v1 (vanilla JS) intact and functional
- **Parallel Development**: Work on v2 without affecting current users
- **Risk Mitigation**: Original remains unaffected if migration encounters issues
- **Version Control**: Clean separation between v1 and v2 architectures
- **Deployment Flexibility**: Run both versions simultaneously

#### Repository Structure
```
scout/                           # Original vanilla JS app (v1)
├── index.html                  # Current implementation
├── app.js                      # Current implementation
└── CLAUDE.md                   # This documentation

scout-nextjs/                   # New Next.js fork (v2)
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── [team]/
│   │   │   ├── page.tsx       # Team workspace
│   │   │   └── layout.tsx     # Team-specific layout
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── map/               # Map-related components
│   │   └── team/              # Team-specific components
│   ├── lib/
│   │   ├── database.ts        # Database utilities
│   │   ├── auth.ts            # Authentication logic
│   │   └── realtime.ts        # Real-time functionality
│   └── hooks/                 # Custom React hooks
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── README.md                  # v2 documentation
```

#### Deployment Strategy
- **Current (v1)**: `scout.humancrafted.co` (GitHub Pages)
- **New (v2)**: `scout-v2.humancrafted.co` or `scout.humancrafted.co` (Vercel)
- **Migration**: Gradual user migration when v2 is ready

### Key Objectives
- **Team Workspaces**: URL-based team access with per-team passwords
- **Real-time Collaboration**: Live updates across team members
- **Database Integration**: Replace JSON file storage with Vercel Postgres
- **State Management**: Implement undo/redo functionality and auto-save
- **Modern UI**: Migrate to shadcn/ui component system
- **Enhanced UX**: Better mobile experience and accessibility

### Technical Stack Migration
- **From**: Vanilla JS, HTML/CSS, Docker, http-server
- **To**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Vercel

### Database & Real-time Architecture
- **Database**: Vercel Postgres (PostgreSQL with Neon)
- **ORM**: Prisma or Drizzle ORM
- **Real-time**: Pusher or Socket.io for live collaboration
- **Deployment**: Vercel (unified ecosystem)

### Team Access Architecture
- **URL Structure**: `scout.humancrafted.co/[team]` (e.g., `/masen`, `/move`)
- **Authentication**: Per-team password protection
- **Session Management**: Team-specific session isolation
- **Data Isolation**: Complete separation between team workspaces

### Migration Phases

#### Phase 1: Next.js Foundation & Setup
1. **Create Next.js 14 App**
   - Initialize with TypeScript, Tailwind CSS, and ESLint
   - Configure for deployment on Vercel
   - Set up project structure with proper folder organization

2. **shadcn/ui Integration**
   - Install and configure shadcn/ui with proper theming
   - Set up components: Button, Input, Dialog, Popover, Tooltip, etc.
   - Migrate existing color tokens to shadcn/ui theme system
   - Implement dark/light mode support

3. **Vercel Postgres Setup**
   - Provision Vercel Postgres database
   - Configure Prisma/Drizzle ORM
   - Set up database schema for maps, markers, and user sessions
   - Environment variable configuration

4. **Authentication System**
   - Implement per-team password authentication using shadcn/ui forms
   - Create middleware for route protection and team validation
   - Session management for authenticated team members
   - Team-specific password validation and session isolation

#### Phase 2: Real-time Architecture
1. **Real-time Layer Implementation**
   - Choose between Pusher or Socket.io for real-time features
   - Set up WebSocket connections for live collaboration
   - Implement conflict resolution for simultaneous edits

2. **Database Design**
   - Design schema for maps, markers, user sessions, and action history
   - Set up proper indexing for performance
   - Implement soft deletes for undo functionality

#### Phase 3: Core Application Migration
1. **Component Architecture with shadcn/ui**
   - Convert existing HTML/CSS to React components using shadcn/ui
   - Implement MapBox GL JS integration with Next.js
   - Create custom map controls using shadcn/ui primitives
   - Build responsive sidebar layouts with shadcn/ui components

2. **UI Component Migration**
   - Replace custom buttons with shadcn/ui Button variants
   - Convert edit modals to shadcn/ui Dialog components
   - Use shadcn/ui DropdownMenu for map controls
   - Implement shadcn/ui Tabs for different marker types
   - Add shadcn/ui Tooltips for better UX

3. **State Management**
   - Implement Redux Toolkit or Zustand for global state
   - Set up state persistence to Vercel Postgres
   - Auto-save functionality with debouncing
   - Loading states using shadcn/ui Skeleton components

4. **Undo/Redo System**
   - Implement command pattern for all map operations
   - Create undo/redo stack with action history stored in database
   - Integrate with browser back/forward buttons
   - Visual feedback using shadcn/ui components

#### Phase 4: Advanced Features
1. **Enhanced Team Features**
   - User presence indicators with shadcn/ui Avatar components
   - Real-time marker updates with smooth animations
   - Team member activity feed using shadcn/ui Card components
   - Collaborative editing locks with visual indicators

2. **Data Persistence & Sync**
   - Replace JSON file system with Vercel Postgres storage
   - Implement offline-first approach with sync
   - Version control for map states
   - Export/import functionality with shadcn/ui file upload

3. **Additional Enhancements**
   - Improved mobile responsiveness using shadcn/ui responsive design
   - Better error handling with shadcn/ui Alert components
   - Performance optimizations
   - Accessibility improvements with shadcn/ui focus management

#### Phase 5: Deployment & Testing
1. **Vercel Deployment**
   - Configure build settings and environment variables
   - Set up custom domain and SSL
   - Implement proper CI/CD pipeline

2. **Testing & Quality Assurance**
   - Unit tests for components and utilities
   - Integration tests for database operations
   - E2E tests for critical user flows

### Key shadcn/ui Components to Implement
- **Button**: Replace all custom buttons with proper variants
- **Dialog**: For edit modals and confirmations
- **Input**: For search, editing, and form inputs
- **DropdownMenu**: For map controls and options
- **Tooltip**: For better UX on controls
- **Card**: For marker lists and team features
- **Tabs**: For organizing marker types
- **Toast**: For real-time notifications
- **Skeleton**: For loading states
- **Avatar**: For team member presence
- **Alert**: For error and success messages

### Database Schema Design
```sql
-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,     -- URL slug: 'masen', 'move', etc.
  display_name TEXT NOT NULL,           -- Human-readable name
  password_hash TEXT NOT NULL,          -- Hashed team password
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Team sessions for authentication
CREATE TABLE team_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  user_identifier TEXT,                 -- Optional user tracking
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maps table (updated with team reference)
CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  zoom DECIMAL(4, 2),
  style TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Markers table
CREATE TABLE markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES maps(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  type TEXT NOT NULL,
  zone_number INTEGER,
  device_icon TEXT,
  asset_icon TEXT,
  locked BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES markers(id),
  position INTEGER,                       -- Overall position in the map (for root markers)
  child_position INTEGER,                 -- Position within parent group (for child markers)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Action history for undo/redo
CREATE TABLE action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID REFERENCES maps(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  user_identifier TEXT,                 -- Track who made the action
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_team_sessions_token ON team_sessions(session_token);
CREATE INDEX idx_team_sessions_expires ON team_sessions(expires_at);
CREATE INDEX idx_maps_team_id ON maps(team_id);
CREATE INDEX idx_markers_map_id ON markers(map_id);
CREATE INDEX idx_action_history_map_id ON action_history(map_id);
```

### Authentication Flow
1. **Team Access**: User visits `scout.humancrafted.co/[team]`
2. **Session Check**: Check for valid team session
3. **Password Prompt**: If not authenticated, show shadcn/ui Dialog with password input
4. **Validation**: Hash and compare against team's password_hash
5. **Session Creation**: Create team_sessions record with expiration
6. **Access Grant**: User gains access to team workspace
7. **Real-time Join**: Connect to team's real-time channel

### Environment Variables
```env
# Database
POSTGRES_URL=your_vercel_postgres_connection_string

# Mapbox
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Authentication
NEXTAUTH_SECRET=your_session_secret_key
SESSION_DURATION=86400  # 24 hours in seconds

# Real-time (if using Pusher)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Team Management (Initial setup)
ADMIN_PASSWORD=your_admin_interface_password
```

### Team Management
Teams can be managed through:
1. **Database Direct**: Insert teams directly into database
2. **Environment Setup**: Pre-configure teams in deployment
3. **Admin Interface**: Optional simple admin page for team management

Example team setup:
```sql
INSERT INTO teams (name, display_name, password_hash) VALUES 
('masen', 'Masen Team', '$2b$10$hashed_password_here'),
('move', 'Move Team', '$2b$10$another_hashed_password_here');
```

### Implementation Details

#### Real-time Architecture
- **Pusher Integration**: Channel naming: `team-[teamId]`
- **Event Types**: `marker-added`, `marker-updated`, `marker-deleted`, `marker-moved`
- **Conflict Resolution**: Last-write-wins with timestamp comparison
- **Presence**: Show active team members with cursors

#### State Management
- **Zustand Store**: Global state for maps, markers, and team data
- **Optimistic Updates**: Immediate UI updates with server sync
- **Auto-save**: Debounced saves every 2 seconds
- **Offline Support**: Queue actions when offline, sync when online

#### Component Architecture
```
src/components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── ...
├── map/
│   ├── MapContainer.tsx    # Main map component
│   ├── MarkerToolbar.tsx   # Draggable marker toolbar
│   ├── MarkerList.tsx      # Sidebar marker list
│   └── MarkerDialog.tsx    # Edit marker dialog
├── team/
│   ├── TeamLogin.tsx       # Password authentication
│   ├── TeamPresence.tsx    # Show online members
│   └── TeamActivity.tsx    # Activity feed
└── layout/
    ├── Sidebar.tsx         # Left sidebar layout
    └── Controls.tsx        # Bottom controls
```

#### API Routes
```
src/app/api/
├── teams/
│   ├── [team]/
│   │   ├── auth/route.ts       # Team authentication
│   │   ├── maps/route.ts       # Team maps CRUD
│   │   └── markers/route.ts    # Team markers CRUD
│   └── route.ts                # List teams (admin)
├── maps/
│   ├── [id]/route.ts          # Individual map operations
│   └── route.ts               # Maps listing
└── auth/
    ├── session/route.ts       # Session management
    └── validate/route.ts      # Token validation
```

#### Middleware
- **Team Authentication**: Validate team sessions on protected routes
- **Rate Limiting**: Prevent abuse of real-time updates
- **CORS**: Configure for cross-origin requests

### Expected Outcomes
- **Multi-user Collaboration**: Real-time updates across team members
- **Team Isolation**: Complete data separation between teams
- **Automatic Persistence**: All changes saved to Vercel Postgres
- **Undo/Redo System**: Database-backed action history
- **Enhanced Performance**: Optimized loading and caching
- **Mobile Experience**: Responsive design with touch support
- **Security**: Per-team password protection with hashed storage
- **Professional UI**: Consistent shadcn/ui design system
- **Accessibility**: WCAG compliant components
- **Scalability**: Serverless architecture on Vercel

### Preserved Features
- **All Map Functionality**: Markers, grouping, search, screenshot mode
- **Mapbox Integration**: GL JS with existing custom styles
- **Industrial Design**: Professional styling for industrial use
- **Export Capabilities**: JSON export/import functionality
- **Hierarchical Organization**: Drag-and-drop marker grouping
- **Advanced Controls**: Lock/unlock, edit coordinates, labels

### Migration Checklist
#### Phase 1: Setup
- [ ] Create scout-nextjs repository fork
- [ ] Initialize Next.js 14 with TypeScript
- [ ] Set up Tailwind CSS and shadcn/ui
- [ ] Configure Vercel deployment
- [ ] Set up Vercel Postgres database
- [ ] Configure Prisma ORM

#### Phase 2: Core Features
- [ ] Implement team authentication system
- [ ] Create dynamic [team] routes
- [ ] Build map container with Mapbox GL JS
- [ ] Convert marker system to React components
- [ ] Implement database operations (CRUD)
- [ ] Set up real-time with Pusher/Socket.io

#### Phase 3: Advanced Features
- [ ] Build undo/redo system
- [ ] Implement auto-save functionality
- [ ] Add team presence indicators
- [ ] Create activity feed
- [ ] Add offline support
- [ ] Implement export/import

#### Phase 4: Polish
- [ ] Mobile responsive design
- [ ] Accessibility improvements
- [ ] Performance optimizations
- [ ] Error handling and loading states
- [ ] Testing (unit, integration, E2E)
- [ ] Documentation and deployment

## Recent Updates (2025-01-20)

### 🔄 Advanced Drag & Drop System Implementation
Today's work focused on implementing a comprehensive position-based ordering system with enhanced drag behaviors:

#### **Position-Based Ordering System**
- **Database Schema**: Added `position` and `childPosition` fields to markers table
- **Migration**: Created migration `20250720165624_add_marker_positions`
- **API Updates**: Enhanced all marker endpoints to handle position updates
- **Auto-assignment**: New markers automatically receive appropriate positions

#### **Dual Drag Behaviors**
1. **Drag-to-Reorder**:
   - **Visual Feedback**: Horizontal blue insertion lines
   - **Detection**: Mouse position relative to element middle
   - **Scope**: Works within same parent context (root-to-root, child-to-child)
   - **Database**: Updates position/childPosition fields accordingly

2. **Drag-to-Group**:
   - **Visual Feedback**: Blue left border highlight on target marker
   - **Detection**: Different parent context between dragged and target markers
   - **Scope**: Dragging individual markers onto other markers to create groups
   - **Database**: Updates parentId and childPosition fields

#### **Smart Operation Detection**
- **Mouse Position Analysis**: `e.clientY` vs `elementMiddle` determines reorder position
- **Parent Context Comparison**: `draggedMarker.parentId === targetMarker.parentId`
- **Automatic Operation Type**: Sets `dragOperation` state ('reorder' vs 'group')
- **Visual State Management**: Separate state for insertion position and target highlighting

#### **Technical Implementation Details**
- **State Management**: Added `dragInsertPosition`, `dragOperation` state variables
- **Event Handlers**: Enhanced `handleMarkerDragOver` with position detection logic
- **UI Components**: Insertion line components with absolute positioning
- **CSS Integration**: Blue primary color styling for both insertion lines and grouping highlights
- **Database Operations**: Position recalculation during grouping/ungrouping operations

#### **Bug Fixes & Improvements**
- **Screenshot Mode**: Fixed CSS-based implementation (resolved white box issues)
- **Add Button Icon**: Fixed Material Icons display (was showing text instead of icon)
- **Child Marker Highlighting**: Added grouping highlight support for child markers
- **Double Nesting Prevention**: Initially prevented group dragging, later enabled with restrictions
- **JSX Structure**: Fixed missing closing div tags in child marker rendering
- **Drag-to-Group Logic**: Fixed parent context detection (null === null issue)
- **Child Marker Restrictions**: Prevented grouping onto child markers (only root/parent markers accept groups)
- **Group Dragging**: Enabled whole group reordering while preventing groups from being grouped

#### **Deployment & Testing**
- **Build Verification**: Successful compilation with TypeScript validation
- **Vercel CLI Deployment**: Used `npx vercel --prod` for production deployment
- **Live Testing**: Verified both drag behaviors work correctly in production
- **Final URL**: https://scout-next-fwp4a9v8e-jon-humancrafteds-projects.vercel.app

#### **Iterative Improvements & Bug Fixes**
1. **Drag-to-Group Detection Fix**:
   - **Issue**: Root markers (parentId: null) were always treated as same parent context
   - **Solution**: Added 25% height threshold system for operation detection
   - **Result**: Center area triggers grouping, edge areas trigger reordering

2. **Child Marker Grouping Restriction**:
   - **Issue**: Could drag markers onto child markers to create nested groups
   - **Solution**: Added parentId === null validation for group targets
   - **Result**: Only root/parent markers can accept group drops

3. **Group Reordering Feature**:
   - **Issue**: Groups (markers with children) couldn't be dragged at all
   - **Solution**: Removed drag prevention, added group-specific operation logic
   - **Result**: Groups can be dragged to reorder as complete units
   - **Restrictions**: Groups can only reorder, cannot be grouped with other markers

#### **Final Feature Set**
✅ **Position-based ordering fully functional**
✅ **Dual drag behaviors with proper detection logic**
✅ **Height threshold system for intuitive operation selection**
✅ **Child marker protection from grouping operations**
✅ **Group reordering as complete units**
✅ **Visual feedback working for all operations**
✅ **Database persistence confirmed**
✅ **No breaking changes to existing functionality**

## Recent Updates (2025-07-21) - Fourth Session

### 🎨 Professional Dialog System & Icon Selection Enhancement (v3.2)
This session focused on UI consistency and improved user experience with comprehensive dialog standardization:

#### **Enhanced Icon Selection System**
1. **Simplified Icon Input**: 
   - Replaced complex dropdown with text input field
   - Live preview box shows icon as you type
   - Access to full Material Icons catalog (1000+ icons)
   - Direct link to Google Fonts Material Icons reference
   - Fixed double scrollbar issues in previous dropdown implementation

2. **Improved User Experience**:
   - Faster icon selection - just type the name
   - No scrolling through limited lists
   - Visual feedback with immediate preview
   - Better mobile experience with simple input

#### **Comprehensive Dialog Standardization**
1. **Complete shadcn/ui Migration**:
   - Replaced all 30+ `alert()` and `confirm()` calls across the application
   - Implemented consistent AlertDialog components throughout
   - Professional confirmation dialogs for all destructive actions
   - Enhanced error messaging with proper styling

2. **Component Coverage**:
   - **MarkerCategoryManager**: 14 alerts + 2 confirmations → shadcn/ui dialogs
   - **MapContainer**: 13 alerts + 3 confirmations → shadcn/ui dialogs  
   - **SettingsPage**: 1 confirmation → shadcn/ui dialog

3. **Enhanced User Feedback**:
   - Color-coded dialog types (red=error, orange=warning, green=success)
   - Detailed error messages with context and guidance
   - Multi-line text support with proper formatting
   - Professional button styling with destructive variants

#### **Technical Implementation**
- **Reusable Helper Functions**: `showAlert()` and `showConfirm()` across components
- **TypeScript Integration**: Proper interfaces and state management
- **Accessibility**: ESC key dismissal, focus management, screen reader support
- **Consistent Styling**: All dialogs match shadcn/ui design system

#### **User Experience Improvements**
- **Professional Error Handling**: Clear titles, detailed descriptions, actionable guidance
- **Enhanced Confirmations**: Descriptive titles, consequence explanations, clear button labels
- **Consistent Interactions**: All dialogs follow same patterns and styling
- **Better Mobile Support**: Touch-friendly dialogs with proper sizing

## Previous Updates (2025-07-21) - Third Session

### 🎨 Enhanced Settings & UI Improvements (v3.1)
Following the successful custom marker category system, this session focused on user experience refinements:

#### **Settings Page Reorganization**
1. **Category Name Editing**: 
   - Added edit button for all categories including "Area"
   - Dialog-based editing with validation and duplicate name checking
   - API integration with PUT endpoint for category updates
   - Real-time category list refresh after edits

2. **Section Reordering**:
   - Moved "Marker Categories" section above "Team Settings"
   - Improved logical flow for better user experience
   - Enhanced settings page hierarchy and organization

3. **Default Category Renaming**:
   - Changed default category from "Areas" to "Area" (singular)
   - Updated API to create "Area" category for new teams
   - Maintains protection from deletion for default category

#### **Persistent Category Visibility System**
1. **Database Integration**:
   - Added `isVisible` field to MarkerCategory model
   - Migration `20250721140701_add_category_visibility`
   - Default visibility set to true for all categories

2. **API Implementation**:
   - New endpoint `/api/teams/[team]/categories/[categoryId]/visibility`
   - PUT method for updating visibility state
   - Proper error handling and validation

3. **Frontend Integration**:
   - Switch component properly saves state to database
   - Toolbar filtering respects visibility settings
   - Settings page reflects current visibility state across page refreshes

#### **Toolbar Layout Enhancement**
1. **Two-Column Grid Design**:
   - Replaced fixed width constraints with natural sizing
   - `grid grid-cols-2 gap-2` for responsive two-column layout
   - Removed hardcoded width restrictions for better content fitting

2. **Improved Responsiveness**:
   - Natural width based on content and padding
   - Better icon and label spacing
   - Maintains professional appearance with improved usability

#### **Technical Improvements**
- **Area Category Special Treatment**: Proper UI differentiation from regular categories
- **Icon Display Fix**: Shows numbered area icon (1) instead of generic location icon
- **Validation Enhancement**: Comprehensive duplicate name checking for category edits
- **State Management**: Proper loading and error states throughout settings interface

#### **User Experience Enhancements**
- **Intuitive Category Management**: Clear distinction between default and custom categories
- **Persistent Settings**: All toggle states properly saved to database
- **Professional UI**: Consistent shadcn/ui components with proper spacing and feedback
- **Logical Organization**: Settings sections arranged in order of typical user workflow

## Previous Updates (2025-01-20/21)

### 🎨 Custom Marker Category System Implementation (v3.0)
Major restructuring to implement fully customizable marker categories:

#### **System Restructuring**
1. **Renamed "Locations" to "Areas"**: 
   - Eliminated confusion with search location pins
   - Updated database migration to rename existing categories
   - "Areas" better represents numbered zone markers (1-10)

2. **Multi-Icon Category Architecture**:
   - **Before**: Each category had one icon (1:1 relationship)
   - **After**: Categories contain multiple icons (1:many relationship)
   - Teams create categories like "Devices" and add multiple device icons within it

#### **Enhanced Database Schema**
- **New `CategoryIcon` model**: Stores icons within categories
  - Fields: `name`, `icon`, `backgroundColor`, `isNumbered`, `displayOrder`
  - Supports both numbered (1-10) and regular auto-numbered icons
- **Updated `Marker` model**: References both `categoryId` and `categoryIconId`
- **Migration `20250720235500_restructure_categories_with_multiple_icons`**: 
  - Preserves existing data during conversion
  - Creates icons from existing categories
  - Handles "Locations" → "Areas" renaming

#### **Comprehensive Settings UI**
- **Category Management**: Create categories like "Areas", "Devices", "Assets"
- **Icon Management**: Add multiple icons to each category with rich configuration
- **Material Icons Picker**: Searchable interface with 150+ Material Design icons
- **Icon Configuration**: Name, icon, background color, numbered option per icon
- **Intuitive Interface**: Nested cards showing categories with their icons in tables

#### **New API Architecture**
```
/api/teams/[team]/categories                          # Category CRUD
/api/teams/[team]/categories/[categoryId]/icons       # Icon CRUD within category  
/api/teams/[team]/categories/[categoryId]/icons/[iconId] # Individual icon management
```

#### **Auto-Numbering Enhancement**
- **Smart Algorithm**: Finds highest existing number per category and increments
- **Category-Specific**: "Device 1", "Device 2" vs "Area 1", "Area 2"
- **Numbered vs Regular**: Special handling for numbered icons (1-10) vs unlimited auto-numbering

#### **Dynamic Toolbar Generation**
- Toolbar now renders from team's custom categories and icons (not hardcoded)
- Each category appears as a section with all its icons
- Maintains drag-and-drop functionality with new category/icon structure
- Supports both numbered area icons and regular category icons

#### **Technical Improvements**
- **Type Safety**: Updated interfaces for CategoryIcon and MarkerCategory
- **Error Handling**: ESLint compliance with proper quote escaping
- **Route Structure**: Consistent parameter naming (`categoryId` vs `id`)
- **Database Relations**: Proper foreign keys and cascade deletes
- **Legacy Support**: Backward compatibility with existing marker data

#### **User Experience**
- **Clear Workflow**: Create category → Add icons → Use in toolbar
- **Flexible System**: Teams can have one category with many icons, or many categories
- **Professional UI**: shadcn/ui components throughout settings interface
- **Intuitive Controls**: Material Icons with preview, background color selection

#### **Migration Benefits**
✅ **No more hardcoded marker types** - Fully team-customizable
✅ **Eliminates location/search confusion** - "Areas" vs search "Locations"  
✅ **Multi-icon categories** - Teams can organize as they prefer
✅ **Rich icon configuration** - Material Icons with full customization
✅ **Auto-numbering system** - Smart category-aware numbering
✅ **Professional settings interface** - Complete team control

## Bug Fixes & Improvements (2025-01-21)

### 🔧 Critical Bug Fixes - User Feedback Response
Based on user testing feedback, addressed 6 major issues with the custom marker category system:

#### **1. Marker Icons Disappearing on Page Refresh** ✅
- **Issue**: New markers showed labels but no visual icons after page refresh/navigation
- **Root Cause**: `renderExistingMarkers` function using old hardcoded type system instead of categoryIcon data
- **Solution**: 
  - Updated Marker interface to include `category` and `categoryIcon` relations
  - Modified `renderExistingMarkers` to use `marker.categoryIcon` for styling
  - Added fallback logic for legacy markers without categoryIcon data
  - Fixed both map markers and sidebar icon display
- **Result**: All marker icons now persist correctly across page refreshes

#### **2. Removed Unnecessary Numbered Option** ✅  
- **Issue**: "Show numbers (1-10)" option appeared when creating regular icons
- **Intended**: Only Areas category should use numbered markers
- **Solution**: 
  - Removed Switch component and isNumbered state from icon creation dialog
  - Hardcoded `isNumbered: false` for all regular icon creation
  - Removed "Numbered" column from icons table display
- **Result**: Cleaner UI, numbered markers only for Areas as intended

#### **3. Fixed Dropdown Scrolling Issue** ✅
- **Issue**: Material Icons picker couldn't scroll with mouse wheel, only scrollbar drag
- **Root Cause**: shadcn/ui Command component missing proper scroll handling
- **Solution**: Added `className="max-h-60 overflow-y-auto"` to CommandList
- **Result**: Mouse wheel scrolling now works perfectly in icon picker

#### **4. Areas as Default Immutable Category** ✅
- **Issue**: Teams could delete the Areas category, breaking numbered zone functionality
- **Solution**: 
  - **API Auto-Creation**: Teams with no categories automatically get "Areas" with 10 numbered icons
  - **UI Protection**: Delete button hidden for Areas category in settings
  - **Backend Protection**: DELETE endpoint returns 400 error for Areas category
  - **Default Icons**: Auto-created Area 1-10 icons with dark background and `location_on` icon
- **Result**: Every team guaranteed to have Areas category with numbered zones

#### **5. Added Full Icon Edit Functionality** ✅
- **Issue**: No way to modify existing icons after creation
- **Implementation**:
  - **New UI**: Edit button for each icon in settings table
  - **Edit Dialog**: Full interface to modify name, Material icon, and background color
  - **API Integration**: Uses existing PUT endpoint for icon updates
  - **State Management**: Separate edit state variables and picker for editing
  - **Validation**: Name uniqueness checking within category
- **Result**: Complete CRUD operations for icon management

#### **6. Auto-save UX Clarification** ⏸️
- **Issue**: "Save Changes" button immediately greys out, confusing users about save status
- **Analysis**: System actually auto-saves changes immediately, button state is correct
- **Status**: Low priority UX improvement for future consideration

### 🛠 Technical Improvements
- **Error Handling**: Better error messages for all CRUD operations
- **Code Organization**: Separated create/edit state management for cleaner code
- **Build Validation**: All changes pass TypeScript compilation and build process
- **API Robustness**: Enhanced validation and error responses

### 📊 System Status After Fixes
- ✅ **Marker persistence**: Icons display correctly across all app states
- ✅ **Category management**: Full CRUD with proper defaults and restrictions  
- ✅ **Icon management**: Complete edit capabilities with intuitive UI
- ✅ **User experience**: Smoother interactions and expected behaviors
- ✅ **Data integrity**: Protected default categories and proper validation

### 🔧 Final Bug Resolution Session (2025-01-21 - Session 2)
Addressed remaining critical issues reported after initial fixes:

#### **Critical Fixes Applied**
1. **Icon Picker Scrolling**: Fixed mouse wheel not working in Material Icons picker
   - **Solution**: Wrapper div with `onWheel={(e) => e.stopPropagation()}` event handling
   - **Location**: `MarkerCategoryManager.tsx:CommandList`

2. **Duplicate Area Markers**: Fixed multiple Area 1-10 sets appearing in toolbar  
   - **Root Cause**: 10 separate database icons vs single numbered icon
   - **Solution**: Database restructure to single "Area" icon with `isNumbered: true`
   - **Scripts**: `fix-areas-category.js` and `add-areas-category.js`

3. **Marker Label Corruption**: Fixed "Area 2 1" labels appearing instead of "Area 1"
   - **Cause**: Legacy malformed data from previous implementations  
   - **Fix**: `fix-marker-labels.js` script with regex pattern `/^Area\s+(\d+)\s+(\d+)$/`

4. **Color Persistence**: Fixed markers reverting to grey background on map
   - **Issue**: Incomplete color mapping in `addMarkerToMap` and `renderExistingMarkers`
   - **Solution**: Comprehensive `getMarkerBackgroundColor()` for all 8 color options

5. **Logout Functionality**: Added logout button with confirmation to settings page
   - **Features**: Session cleanup, localStorage clearing, redirect to login
   - **API**: `/api/auth/logout` endpoint with proper error handling

#### **Database Scripts Created**
- `scripts/fix-areas-category.js`: Converts multiple Area icons to single numbered icon
- `scripts/fix-marker-labels.js`: Corrects malformed Area marker labels
- `scripts/add-areas-category.js`: Ensures all teams have default Areas category

#### **Technical Improvements**  
- **Comprehensive Color Support**: All 8 background colors (dark, light, blue, green, red, yellow, purple, orange) now work throughout app
- **Event Handling**: Proper scroll event propagation in Command components
- **Error Handling**: Robust logout functionality with fallback behavior
- **Data Integrity**: Database cleanup scripts ensure consistent marker labeling

#### **Final Deployment Status** ✅
- All fixes successfully deployed to Vercel production
- Database cleanup scripts executed successfully  
- User feedback indicates all reported issues resolved
- System fully operational with comprehensive marker category functionality

#### **Complete Feature Status** ✅
- **Settings Page Enhancement**: All reorganization and editing features working
- **Persistent Visibility**: Database-backed toggle state with proper toolbar filtering  
- **Two-Column Toolbar**: Grid-based layout with natural width sizing
- **Category Name Editing**: Full CRUD operations with validation and conflict detection
- **Professional UI**: Consistent shadcn/ui components throughout

#### **Deployment & Status**
- **Production Ready**: All features tested and deployed successfully
- **Database Migrations**: Applied and verified in production environment
- **User Testing**: Confirmed all requested functionality working as expected
- **No Breaking Changes**: Backward compatibility maintained throughout

#### **Current State Summary**
The Scout application now features a fully customizable marker category system with:
1. ✅ Complete category and icon management in settings
2. ✅ Persistent visibility toggles with database backing
3. ✅ Professional two-column toolbar layout
4. ✅ Comprehensive category name editing with validation
5. ✅ Proper Area/default category handling and protection
6. ✅ Intuitive settings page organization and user flow
- **API Architecture**: RESTful visibility toggle endpoint with team validation
- **State Management**: Removed local state, uses database values for toggle position
- **TypeScript Updates**: Enhanced interfaces with `isVisible` and editing state properties
- **Error Handling**: Comprehensive validation and user feedback for all operations

#### **User Experience Improvements**
- **Persistent Settings**: Category visibility survives page refreshes and navigation
- **Full Customization**: All category names editable including protected "Area" category  
- **Logical Flow**: Settings organized from markers → team → security → data
- **Better Toolbar**: Two-column layout with natural sizing and improved touch targets
- **Professional UI**: Consistent shadcn/ui styling with proper loading states

---
*Last updated: 2025-07-21*
*Built with Claude Code assistance*
*Next.js migration completed successfully!*
*Advanced drag & drop system implemented!*
*Custom marker category system with comprehensive bug fixes!*
*Professional dialog system with shadcn/ui standardization!*
*Enhanced icon selection with full Material Icons catalog access!*
*All critical user-reported issues resolved!*
*Currently deployed with Vercel and database integration*