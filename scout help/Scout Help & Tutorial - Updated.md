# Scout Help & Tutorial

Learn how to use Scout v3.2:

## Getting Started

Scout is a web-based industrial sensor mapping application with team workspaces and advanced customization features. Here's how to get started:

1. **Access Your Team Workspace** - Navigate to your team's Scout URL (e.g., `/your-team-name`)
2. **Team Login** - Enter your team password to access your workspace
3. **Explore the Interface** - Left sidebar for controls, right sidebar for custom marker tools, bottom controls for map settings
4. **Search for your location** - Use the search box to find your site
5. **Start placing markers** - Drag markers from your custom toolbar to the map

![image.png](Scout%20Help%20&%20Tutorial.assets/image.png)

> **Important:** Scout now automatically saves all your work to the database in real-time. No need to manually save!

## Team Workspaces

Scout v3.2 features complete team isolation with custom URLs and secure authentication:

### Team Access
- **Unique URLs** - Each team has its own workspace (e.g., `/masen`, `/acme-corp`)
- **Password Protection** - Secure team-based authentication
- **Data Isolation** - Complete separation between teams
- **Auto-Save** - All changes automatically saved to database

### Team Settings
Access your team settings to customize:
- **Custom Marker Categories** - Create your own marker types
- **Icon Libraries** - Choose from 1000+ Material Design icons
- **Category Visibility** - Show/hide categories in toolbar
- **Team Password** - Change your team access password

## Working with Custom Markers

Scout v3.2 features fully customizable marker categories instead of fixed types:

### Custom Marker Categories

Your team can create and customize unlimited marker categories:

- **Areas** - Default numbered markers (1-10) for zones and locations
- **Custom Categories** - Create categories like "Devices", "Assets", "Sensors", etc.
- **Multiple Icons per Category** - Each category can contain multiple icon options
- **Material Icons** - Access to 1000+ professional Material Design icons
- **Background Colors** - 8 color options: dark, light, blue, green, red, yellow, purple, orange

### Creating Custom Categories

1. **Go to Settings** - Click the settings icon in the left sidebar
2. **Marker Categories Section** - Manage your team's marker types
3. **Create Category** - Add new categories like "Equipment" or "Safety"
4. **Add Icons** - Create multiple icon options within each category
5. **Configure Icons** - Set name, Material icon, background color

### Placing Markers

1. **Select marker type** - Choose from your custom toolbar (right sidebar)
2. **Drag to map** - Click and drag the marker to your desired location
3. **Drop to place** - Release to place the marker on the map
4. **Auto-numbering** - Markers automatically numbered by category (e.g., "Device 1", "Device 2")

### Marker Controls

Each marker in the left sidebar has control buttons:

- **Lock/Unlock** - Prevent accidental marker movement (database-persisted)
- **Edit** - Professional dialog to change name and GPS coordinates
- **Delete** - Remove marker with confirmation dialog

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(2).png)

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(3).png)

## Advanced Marker Organization

Scout v3.2 features enhanced drag-and-drop organization with position-based ordering:

### Hierarchical Grouping

Organize markers into parent-child relationships:

1. **Drag marker in sidebar** - Click and drag a marker name in the left sidebar
2. **Drop on parent marker** - Drop it onto another marker to create a group
3. **Visual hierarchy** - Child markers appear indented with colored left border
4. **Expand/Collapse** - Groups can be collapsed for better organization

### Drag-to-Reorder

Precisely reorder markers with visual feedback:

1. **Drag between markers** - Horizontal blue insertion lines show exact placement
2. **Database persistence** - Order maintained across sessions
3. **Group reordering** - Entire groups can be moved as units

### Advanced Drag Behaviors

- **Smart detection** - System automatically determines reorder vs grouping based on mouse position
- **Visual feedback** - Blue insertion lines for reordering, blue borders for grouping
- **Position persistence** - All marker positions saved to database

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(4).png)

### Removing from Groups

To remove a marker from a group, drag it away from the parent marker in the sidebar. The marker will become independent again.

>> **Note:** Grouped markers maintain their individual controls and can still be edited, locked, or deleted independently. Only one level of grouping is supported.

## Professional Editing System

Scout v3.2 features a completely redesigned editing experience:

### Enhanced Edit Dialog

- **Professional Design** - Custom shadcn/ui styled dialogs
- **Marker Name** - Customize the display name with validation
- **GPS Coordinates** - Precise latitude and longitude positioning
- **Real-time validation** - Ensures coordinates are valid
- **Keyboard shortcuts** - `ESC` to cancel, `Enter` to save
- **Error handling** - Clear feedback for invalid inputs

### Coordinate Format

GPS coordinates should be entered as: `latitude, longitude`

Example: `40.7128, -74.0060` (New York City)

### Enhanced Locking System

Database-persisted lock states:

- **Unlocked** - Marker can be dragged on map
- **Locked** - Marker position is fixed and persisted across sessions

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(5).png)

## Navigation & Search

### Enhanced Address Search

Improved search with Mapbox Search Box API:

- Type an address, city, or place name
- Autocomplete suggestions with detailed location info
- Map automatically centers and places a search marker
- Re-center button to return to search location

### GPS Coordinate Search

Search using precise coordinates:

- Enter coordinates in format: `latitude, longitude`
- Example: `40.7128, -74.0060` (New York City)
- Press `Enter` to search
- Map centers and places marker at exact coordinates

### Advanced Map Controls

Enhanced bottom control panel:

- **Map Styles** - Toggle between Satellite and Street view
- **Labels** - Show/hide all marker labels with single click
- **Re-center** - Return to last search location
- **Zoom Display** - Current zoom level indicator
- **Screenshot Mode** - Professional fullscreen export mode

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(6).png)

### Click to Center

Click any marker name in the left sidebar to center the map on that marker with automatic zoom.

## Database-Driven Data Management

Scout v3.2 features automatic database persistence - no more manual saving required!

### Real-Time Auto-Save

- **Automatic persistence** - All changes saved immediately to database
- **No data loss** - Work is never lost, even if browser crashes
- **Team isolation** - Each team's data completely separate
- **Session persistence** - Lock states and positions maintained

### Export Functionality

Export your team's data:

1. **Go to Settings** - Access team management
2. **Export Data** - Download JSON backup
3. **Complete backup** - Includes all markers, categories, and relationships

### What's Automatically Saved

- All marker positions and names
- Custom marker categories and icons  
- Grouping relationships and precise ordering
- Lock states (persisted across sessions)
- Map title and view settings
- Category visibility settings

### Professional Screenshot Mode

Enhanced screenshot functionality:

- **CSS-based implementation** - Clean, reliable hiding of UI elements
- **All labels visible** - Professional presentation mode
- **Fullscreen view** - Complete map visibility
- **Exit button** - Clear way to return to normal mode

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(7).png)

## Team Management & Settings

### Comprehensive Settings Page

Access advanced team configuration:

- **Marker Categories** - Full CRUD operations for custom categories
- **Icon Management** - Add, edit, delete icons within categories
- **Category Visibility** - Show/hide categories in toolbar
- **Team Settings** - Change team display name
- **Password Management** - Update team access password
- **Data Export** - Download team data backups

### Material Icons Integration

- **1000+ Icons** - Complete Material Design icon library
- **Text Input Search** - Type icon names directly
- **Live Preview** - See icons as you type
- **Direct Reference** - Link to Google Fonts Material Icons

### Professional Dialog System

- **Consistent UI** - All dialogs use shadcn/ui components
- **Error Handling** - Color-coded alerts (red=error, green=success)
- **Confirmation Dialogs** - Prevent accidental destructive actions
- **Accessibility** - Full keyboard navigation and screen reader support

## Keyboard Shortcuts

### Edit Dialog
- `ESC` - Cancel editing
- `Enter` - Save changes

### General
- `F5` - Refresh page
- `Tab` - Navigate between fields

### Screenshot Mode
- Click "Exit Screenshot Mode" button to return to normal view

## Troubleshooting

### Common Issues

**Map doesn't load**
- Check your internet connection
- Refresh the page
- Try a different browser
- Verify team URL is correct

**Can't access team workspace**
- Verify team password
- Check team URL spelling
- Contact team administrator

**Markers won't place**
- Ensure you're dragging from the right sidebar
- Check if category is visible in settings
- Try refreshing the page

**Custom categories not showing**
- Go to Settings > Marker Categories
- Check category visibility toggles
- Ensure category has at least one icon

**Coordinates invalid**
- Use format: latitude, longitude
- Latitude: -90 to 90
- Longitude: -180 to 180

### Getting Help

If you continue to experience issues:

- Check the browser console for error messages
- Try using a different web browser
- Ensure JavaScript is enabled
- Clear browser cache and reload
- Contact your team administrator

## Admin Features

Scout v3.2 includes a comprehensive admin system (admin access required):

### Team Management
- Create, edit, and delete teams
- Manage team passwords and settings
- View team statistics and usage

### Analytics Dashboard
- System overview metrics
- Per-team activity tracking
- Popular categories analysis
- Recent activity monitoring

### Access Admin Panel
- Visit `/admin` on your Scout instance
- Login with admin credentials
- Manage all teams from central dashboard

## Need More Help?

Scout v3.2 is designed to be intuitive with its professional shadcn/ui interface, but if you need additional assistance, contact [jon@humancrafted.co](mailto:jon@humancrafted.co)

---

*Built with Next.js, TypeScript, and ❤️ for industrial mapping professionals*

**Scout v3.2** - *Professional Industrial Sensor Mapping with Team Workspaces*