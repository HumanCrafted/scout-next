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

### 📍 Advanced Marker System
- **Three marker types**:
  - **Locations**: Numbered 1-10 with dark background
  - **Devices**: Multiple icons (memory, wifi, solar-panel) with light background
  - **Assets**: Multiple icons (build, lan, warning, power) with light background
- Drag-and-drop placement from sidebar toolbar
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
- **Right sidebar**: Draggable marker toolbar (95px width)
- **Bottom controls**: Zoom display, map style toggle, labels toggle, re-center button
- Material Design icons (16px for markers, 12px for controls) for compact, intuitive controls
- Consistent shadcn/ui theming throughout
- **Screenshot mode**: Hides all UI elements and shows all labels for clean screenshots
- **Professional modal dialogs**: Custom-styled edit dialogs with keyboard support

### 💾 Data Management
- **File-based save/load system**: JSON format with drag-and-drop support
- User-customizable filenames with automatic timestamping
- Local timezone timestamps (format: YYYY-MM-DDTHHMMSS)
- Map title persistence in saved files
- Marker grouping data preserved in save files
- Clear confirmation dialog to prevent accidental data loss

### 🏷️ Labels & Visualization
- Toggle-able labels for all markers
- Custom popup styling with dark background
- Positioned to the right of markers with proper spacing
- Click-to-center functionality for markers in sidebar
- Screenshot mode for clean map exports

### ⚙️ Technical Features
- Icon-specific data persistence (deviceIcon, assetIcon fields)
- Hierarchical marker organization with parent-child relationships
- **Position-based ordering system**: Database fields for position tracking and drag-to-reorder
- **Advanced drag detection**: Mouse position analysis and height threshold system (25% edge zones)
- **Dual drag behaviors**: Distinct visual feedback for reordering vs grouping operations
- **Group reordering**: Complete groups can be dragged and reordered as atomic units
- **Smart operation restrictions**: Groups can only reorder, individual markers can reorder or group
- **Child marker protection**: Only root/parent markers can accept grouping operations
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

---
*Last updated: 2025-01-20*
*Built with Claude Code assistance*
*Next.js migration completed successfully!*
*Advanced drag & drop system implemented!*
*Currently deployed with Vercel and database integration*