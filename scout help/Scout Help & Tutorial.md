# Scout Help & Tutorial

Learn how to use Scout:

## Getting Started

Scout is a web-based mapping application designed for industrial sensor mapping. Here's how to get started:

1. **Open Scout** - Navigate to the application in your web browser
2. **Explore the Interface** - Left sidebar for controls, right sidebar for marker tools, bottom controls for map settings
3. **Search for your location** - Use the search box to find your site
4. **Start placing markers** - Drag markers from the right sidebar to the map

![image.png](Scout%20Help%20&%20Tutorial.assets/image.png)



> **Important:** By refreshing the page (or closing the browser tab / window) you will lose your current work unless saved. See [Data Management](craftdocs://open?blockId=2C05C0DD-EA58-44A4-BA21-B86DB8D12925&spaceId=dfdeb251-8866-746a-4cec-0b42227ea647).

## Working with Markers

Scout supports three types of markers for different industrial applications:

### Location Markers

Numbered markers (1-10) for specific locations or zones in your facility. Perfect for marking buildings, sections, or areas.

### Device Markers

Technology-focused markers including devices, WiFi symbols, and solar panels for electronic equipment.

### Asset Markers

Industrial asset markers including tools, LAN connections, warnings or important notices, and power indicators.

### Placing Markers

    1. **Select marker type** - Choose from the right sidebar toolbar
    2. **Drag to map** - Click and drag the marker to your desired location
    3. **Drop to place** - Release to place the marker on the map

### Marker Controls

Each marker in the left sidebar has three control buttons:

    - **Lock/Unlock** - Prevent accidental marker movement
    - **Edit** - Change marker name and GPS coordinates
    - **Delete** - Remove marker from map

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(2).png)

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(3).png)

## Marker Grouping

Organize your markers into hierarchical groups for better organization:

### Creating Groups

    1. **Drag marker in sidebar** - Click and drag a marker name in the left sidebar
    2. **Drop on parent marker** - Drop it onto another marker to create a group
    3. **View hierarchy** - Child markers appear indented with a left border

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(4).png)

### Removing from Groups

To remove a marker from a group, drag it away from the parent marker in the sidebar. The marker will become independent again.



>> **Note:** Grouped markers maintain their individual controls and can still be edited, locked, or deleted independently. At this time, only one level of grouping is implemented.

## Editing Markers

Scout provides an interface for marker customization:

### Edit Dialog Features

    - **Marker Name** - Customize the display name
    - **GPS Coordinates** - Precise latitude and longitude positioning (automatically adjusts when moved around the map)
    - **Real-time validation** - Ensures coordinates are valid
    - **Keyboard shortcuts** - `ESC` to cancel, `Ctrl+Enter` to save

    ### Coordinate Format

    GPS coordinates should be entered as: `latitude, longitude`

    Example: `40.7128, -74.0060` (New York City)

    ### Locking Markers

    Use the lock button to prevent accidental marker movement:

    - **Unlocked** - Marker can be dragged on map
    - **Locked** - Marker position is fixed

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(5).png)

## Navigation & Search

### Address Search

Use the search box in the left sidebar to find locations:

    - Type an address, city, or place name
    - Select from autocomplete suggestions
    - Map automatically centers and places a search marker

    ### GPS Coordinate Search

    You can also search using GPS coordinates:

    - Enter coordinates in format: `latitude, longitude`
    - Example: `40.7128, -74.0060` (New York City)
    - Press `Enter` to search
    - Map centers and places a marker at the exact coordinates

    ### Map Controls

    - **Map Styles** - Toggle between Satellite and Street view using the bottom controls
    - **Labels** - Show/hide marker labels on the map for better visibility
    - **Re-center** - Return to your last search location quickly
    - **Zoom Display** - Current zoom level shown in bottom controls, for reference

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(6).png)

    ### Click to Center

    Click any marker name in the left sidebar to center the map on that marker with automatic zoom.

## Data Management

### Saving Your Work

    1. **Click "Save/Load Map"** - Button in the left sidebar
    2. **Enter filename** - Custom name or use auto-generated name+timestamp
        - Every save generates a new timestamp representing the date and time when the map was saved, using year-month-day followed by hour-minute-second in 24-hour format (i.e. `YYYYMMDD_HHMMSS`).  
    3. **Download starts** - JSON file saves to your Downloads folder

### Loading Saved Maps

To load a saved map:

    - **Drag and drop** - Drag a Scout-formatted JSON file onto the "Save/Load Map" button

    

    >> **Important:** Loading a map will replace your current work. You'll see a confirmation dialog if you have existing markers.

    ### What's Saved

    - All marker positions and names
    - Marker types and icons
    - Grouping relationships
    - Lock states
    - Map title and view settings

    ### Screenshot Mode

    Click the camera icon to enter screenshot mode:

    - Hides all UI elements
    - Shows all marker labels
    - Perfect for presentations or documentation
    - Click on individual markers to show/hide labels
    - Drag markers if desired
    - Move and zoom map to desired view for a screenshot
    - Take a screenshot using `⌘ + Shift + 5` on Mac, `Win + Shift + S` on Windows
    - Click "Exit Screenshot Mode" when done

![image.png](Scout%20Help%20&%20Tutorial.assets/image%20(7).png)

## Keyboard Shortcuts

### Edit Dialog

    - `ESC` - Cancel editing

    ### General

    - `F5` - Refresh (Start New Map)

        >>> **Important:** By refreshing (or closing the browser tab / window) you will lose your current work unless saved.

    - `Tab` - Navigate between fields

## Troubleshooting

### Common Issues

**Map doesn't load**

    - Check your internet connection
    - Refresh the page
    - Try a different browser

    **Markers won't place**

    - Ensure you're dragging from the right sidebar
    - Try refreshing the page
    - Check if marker is locked

    **Save/Load not working**

    - Check Downloads folder for saved files
    - Ensure file is in JSON format
    - Try a different browser

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

## Need More Help?

Scout is designed to be intuitive, but if you need additional assistance, contact [jon@humancrafted.co](mailto: jon@humancrafted.co)



*Built with ❤️ for industrial mapping professionals*