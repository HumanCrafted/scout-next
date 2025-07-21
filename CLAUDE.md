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

Scout has evolved through several major phases:

### Legacy Phases (Pre-v2.0)
- **Phase 1-9**: Initial setup, core features, UI refinement, search enhancement, marker management, labels/visualization, data persistence, advanced features, and professional polish in vanilla JavaScript

### Next.js Migration (v2.0) - COMPLETED ✅
- Migrated from vanilla JS to Next.js 15.4.2 with React 19.1.0 and TypeScript
- Implemented Vercel Postgres with Prisma ORM for data persistence
- Added team authentication system with secure password hashing
- Complete shadcn/ui component integration with Tailwind CSS
- Professional fullscreen screenshot mode and database-persisted marker lock states
- RESTful API architecture with full CRUD operations

### Advanced Drag & Drop System (v2.1) - COMPLETED ✅
- Position-based ordering with database fields (`position`, `childPosition`)
- Dual drag behaviors: drag-to-reorder vs drag-to-group with distinct visual feedback
- Smart operation detection based on mouse position analysis
- Enhanced visual feedback with insertion lines and border highlighting
- Complete group reordering as atomic units

### Custom Marker Category System (v3.0) - COMPLETED ✅
- Renamed "Locations" to "Areas" to eliminate search confusion
- Multi-icon category architecture (1:many relationship)
- Comprehensive settings UI with Material Icons picker
- Dynamic toolbar generation from team's custom categories
- Smart auto-numbering algorithm per category

### Professional Dialog System (v3.2) - COMPLETED ✅
- Replaced all 30+ `alert()`/`confirm()` calls with shadcn/ui dialogs
- Enhanced icon selection with text input and live preview
- Professional error handling with color-coded dialog types
- Full Material Icons catalog access (1000+ icons)

## Current Architecture

### Core Technologies
- **Framework**: Next.js 15.4.2 with React 19.1.0 and TypeScript
- **Database**: Vercel Postgres with Prisma ORM
- **UI**: shadcn/ui with Radix primitives and Tailwind CSS
- **Authentication**: Team-based login with bcrypt password hashing
- **Deployment**: Vercel with serverless architecture

### Key Features
- **Custom Marker Categories**: Fully customizable team-specific marker types
- **Advanced Drag & Drop**: Position-based ordering with dual drag behaviors
- **Professional UI**: Consistent shadcn/ui components throughout
- **Team Workspaces**: URL-based team access with complete data isolation
- **Real-time Persistence**: Auto-save to database with optimistic updates
- **Mobile Responsive**: Touch-optimized interface design
- **Screenshot Mode**: Clean fullscreen export functionality

### Technical Infrastructure
- **API Routes**: RESTful endpoints with proper validation
- **Database Schema**: Normalized tables with relationships and indexes
- **Component Architecture**: Modular React components with TypeScript
- **State Management**: React hooks with optimistic updates
- **Form Handling**: React Hook Form with Zod validation

## Key Design Decisions

### Technology Choices
- **Next.js 15.4.2**: Modern React framework with TypeScript for type safety
- **Vercel Postgres**: Scalable database with Prisma ORM
- **Mapbox GL JS**: Industrial-grade mapping with custom styling
- **shadcn/ui**: Professional component library with accessibility
- **Material Design Icons**: 1000+ icons with intuitive design

### Architecture Decisions
- **Team-based authentication**: Per-team password protection with session isolation
- **Database-driven persistence**: All changes auto-saved to Vercel Postgres
- **Component architecture**: Modular React components with TypeScript interfaces
- **Position-based ordering**: Database fields for precise drag-and-drop control
- **Custom category system**: Fully customizable marker types per team

## Future Considerations
- **Real-time Collaboration**: Live updates across team members
- **Advanced Features**: Layer management, measurement tools, additional export formats
- **Mobile Optimization**: Enhanced touch-friendly interactions
- **Custom Icon Upload**: Team-specific icon libraries
- **Undo/Redo System**: Command pattern with action history

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


## Recent Updates

### 🎨 Professional Dialog System & Icon Selection Enhancement (v3.2) - 2025-07-21
Comprehensive UI standardization and improved user experience:

#### **Enhanced Icon Selection System**
- **Simplified Input**: Replaced dropdown with text input and live preview
- **Full Material Icons Catalog**: Access to 1000+ icons with direct Google Fonts link
- **Better Mobile Experience**: Simple input without scrolling limitations
- **Fixed Scrolling Issues**: Resolved double scrollbar problems

#### **Complete shadcn/ui Dialog Migration**
- **Replaced 30+ Alerts**: All `alert()` and `confirm()` calls converted to professional dialogs
- **Color-Coded Types**: Red (error), orange (warning), green (success)
- **Enhanced Error Messages**: Clear titles, detailed descriptions, actionable guidance
- **Accessibility**: ESC key dismissal, focus management, screen reader support


### 🎨 Enhanced Settings & UI Improvements (v3.1) - 2025-07-21
User experience refinements following custom marker category system:

#### **Settings Page Reorganization** 
- **Category Name Editing**: Edit buttons for all categories with validation
- **Section Reordering**: Logical flow from markers → team → security → data
- **Default Category**: "Areas" renamed to "Area" (singular) for consistency

#### **Persistent Category Visibility**
- **Database Integration**: `isVisible` field with proper migration
- **API Implementation**: Visibility toggle endpoint with validation
- **Toolbar Filtering**: Respects visibility settings across page refreshes

#### **Toolbar Layout Enhancement**
- **Two-Column Grid**: Natural width sizing with responsive design
- **Better Spacing**: Improved icon and label spacing for touch targets

### 🎨 Custom Marker Category System (v3.0) - 2025-01-20/21
Major restructuring for fully customizable marker categories:

#### **System Restructuring**
- **"Locations" → "Areas"**: Eliminated confusion with search pins
- **Multi-Icon Categories**: 1:many relationship (categories contain multiple icons)
- **Dynamic Toolbar**: Rendered from team's custom definitions (not hardcoded)

#### **Enhanced Database Schema** 
- **New `CategoryIcon` model**: Icons within categories with rich configuration
- **Updated `Marker` model**: References both `categoryId` and `categoryIconId`
- **Smart Auto-numbering**: Category-specific numbering ("Device 1", "Area 1")

#### **Comprehensive Settings UI**
- **Category Management**: Create custom categories with multiple icons
- **Material Icons Picker**: Searchable interface with 150+ icons
- **Professional Interface**: shadcn/ui components throughout

#### **Migration Benefits**
✅ No more hardcoded marker types - fully customizable
✅ Eliminates location/search confusion
✅ Rich icon configuration with Material Icons
✅ Smart auto-numbering per category

### 🔧 Critical Bug Fixes & Improvements (2025-01-21)
Comprehensive fixes based on user feedback:

#### **Major Issues Resolved**
1. **Marker Icon Persistence**: Fixed icons disappearing after page refresh
2. **Icon Picker Scrolling**: Resolved mouse wheel scrolling in Material Icons picker  
3. **Areas Category Protection**: Made Areas immutable with auto-creation for all teams
4. **Color Persistence**: Fixed markers reverting to grey backgrounds
5. **Full Icon Editing**: Added complete CRUD operations for icon management
6. **Logout Functionality**: Added secure logout with session cleanup

#### **Technical Improvements**
- **Database Scripts**: Created cleanup scripts for data integrity
- **Comprehensive Color Support**: All 8 background colors working throughout app
- **Error Handling**: Enhanced validation and user feedback
- **Legacy Data Migration**: Scripts to fix malformed marker labels

---
*Last updated: 2025-07-21*
*Scout v3.2 - Professional industrial sensor mapping application*
*Built with Next.js 15.4.2, Vercel Postgres, and shadcn/ui*
*Deployed on Vercel with team-based authentication and custom marker categories*