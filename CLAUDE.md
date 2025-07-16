# Scout - Project Documentation

## Project Overview
Scout is a web-based industrial sensor mapping application built for mapping sensors and equipment at large industrial sites. The application provides a comprehensive interface for placing markers on maps, searching locations, managing marker data, and organizing markers into hierarchical groups.

## Technologies Used
- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Mapping**: Mapbox GL JS v3.6.0
- **Search**: Mapbox Search Box API
- **Icons**: Material Design Icons
- **Styling**: shadcn/ui design system colors and theming
- **Development**: Docker containerized environment with http-server
- **Node.js**: v18-alpine for development server

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
- Drag-off functionality to remove markers from groups
- Visual hierarchy with left borders for grouped markers

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
- Event-driven architecture for map interactions
- Optimized for industrial use with clear, professional styling
- Responsive design with fixed sidebar layout

## File Structure
```
scout/
├── index.html          # Main HTML structure and CSS styling
├── app.js              # Core application logic and Mapbox integration
├── package.json        # Node.js dependencies and scripts
├── Dockerfile          # Docker container configuration
├── docker-compose.yml  # Docker development setup
└── CLAUDE.md          # Project documentation (this file)
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

## Current State
The application is fully functional as a comprehensive mapping tool with:
- ✅ Complete marker placement and management system
- ✅ Hierarchical marker grouping and organization
- ✅ Professional edit dialogs with GPS coordinate editing
- ✅ Marker lock/unlock system for position control
- ✅ File-based save/load with drag-and-drop support
- ✅ Full search and navigation capabilities
- ✅ Professional UI with Material Design elements
- ✅ Screenshot mode for clean exports
- ✅ Multiple marker types with custom icons (including solar panel SVG)
- ✅ Environment-based token management for GitHub Pages
- ✅ Docker development environment
- ✅ Comprehensive keyboard shortcuts and accessibility features

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
# Start development server
docker-compose up

# Install dependencies
npm install

# Run development server (inside container)
npm run dev
```

## Notes for Future Development
- The application successfully implements complex features with vanilla JavaScript
- File-based save/load system works well for data persistence without backend
- Hierarchical marker grouping demonstrates advanced UI interactions
- Current Docker setup works well for development consistency
- Mapbox integration is solid and can support additional features
- Icon system is flexible and can accommodate new marker types easily

---
*Last updated: 2025-01-16*
*Built with Claude Code assistance*
*Ready for GitHub Pages deployment*