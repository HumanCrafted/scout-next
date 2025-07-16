# Scout

A web-based industrial application built for mapping sensors and equipment at large industrial sites.

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Mapping**: Mapbox GL JS v3.6.0
- **Search**: Mapbox Search Box API
- **Icons**: Material Design Icons + Custom SVG
- **Styling**: shadcn/ui design system colors
- **Development**: Docker containerized environment

## 🎯 Usage

### Basic Operations
- **Add markers**: Drag from right sidebar to map
- **Edit markers**: Click edit button (pencil icon) for name and GPS editing
- **Lock markers**: Click lock button to prevent accidental movement
- **Delete markers**: Click delete button (trash icon)
- **Group markers**: Drag markers in left sidebar to create hierarchies

### Advanced Features
- **Search**: Use search box for address lookup with automatic marker placement
- **Screenshot mode**: Camera icon hides UI for clean exports
- **Save/Load**: Save maps as JSON files, load by dragging files to Save/Load button
- **Map styles**: Toggle between satellite and street view

## 📋 Changelog

### v2.0.0 - Professional Polish (Current)
- ✅ **Professional edit dialog** with combined name and GPS coordinate editing
- ✅ **Marker lock system** to prevent accidental movement
- ✅ **Start New Map button** with confirmation dialog
- ✅ **Compact control buttons** (24px) for better space utilization
- ✅ **Environment-based token management** for GitHub Pages
- ✅ **Enhanced keyboard support** (ESC, Ctrl+Enter)
- ✅ **Custom solar panel SVG** icon integration

### v1.9.0 - Advanced Features
- ✅ **Hierarchical marker grouping** with drag-and-drop in sidebar
- ✅ **Drag-off functionality** to remove markers from groups
- ✅ **Visual hierarchy** with left borders for grouped markers
- ✅ **Multiple device and asset icons** with 16px standardization
- ✅ **Clear confirmation dialog** and active state fixes

### v1.8.0 - Data Persistence
- ✅ **File-based save/load system** with JSON format
- ✅ **Drag-and-drop file loading** support
- ✅ **User-customizable filenames** with automatic timestamping
- ✅ **Map title persistence** and editing functionality

### v1.7.0 - Labels & Visualization
- ✅ **Toggle-able labels** for all markers
- ✅ **Custom popup styling** with dark background
- ✅ **Screenshot mode** for clean map exports
- ✅ **Enhanced visual hierarchy** and spacing

### v1.6.0 - Marker Management
- ✅ **Individual marker editing** (rename functionality)
- ✅ **Material Design icons** for edit/delete buttons
- ✅ **Optimized toolbar width** (95px) for proper layout
- ✅ **Click-to-center** functionality for sidebar markers

### v1.5.0 - Search Enhancement
- ✅ **Mapbox Search Box integration** with autocomplete
- ✅ **Fixed search icon overlapping** issues
- ✅ **Improved address parsing** for full location details
- ✅ **Enhanced search result handling** for FeatureCollection responses

### v1.4.0 - UI/UX Refinement
- ✅ **shadcn/ui theming** for professional appearance
- ✅ **Reorganized layout** with left/right sidebars
- ✅ **Zoom display** and satellite/street view toggle
- ✅ **Re-center button** with off-center state detection

### v1.3.0 - Core Features
- ✅ **Drag-and-drop pin placement** system
- ✅ **Address search** functionality
- ✅ **Marker type system** (Locations, Devices, Assets)
- ✅ **Save/clear functionality** for markers

### v1.2.0 - Initial Setup
- ✅ **Docker containerized** development environment
- ✅ **Basic Mapbox GL JS** integration
- ✅ **Full-screen map** with basic controls

## 🔧 Configuration

### Mapbox Token Setup
The application automatically detects the environment and uses the appropriate token:
- **Local development**: Uses `development` token
- **GitHub Pages**: Uses `production` token

### Security Notes
- Mapbox tokens are visible in client-side code
- Use URL restrictions in Mapbox dashboard for security
- Create separate tokens for development and production

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)**: Comprehensive development documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)**: GitHub Pages deployment guide

## 🤝 Contributing

This project was built with Claude Code assistance. For improvements or bug reports, please create an issue or pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code) assistance
- [Mapbox](https://mapbox.com) for mapping services
- [Material Design Icons](https://fonts.google.com/icons) for UI elements
- [shadcn/ui](https://ui.shadcn.com) for design system inspiration

---
*Last updated: 2025-01-16*