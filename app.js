// Mapbox token configuration - automatically detects environment
const MAPBOX_TOKENS = {
    // GitHub Pages deployment token (you'll need to create a separate token for GitHub Pages)
    production: 'pk.eyJ1IjoibmdpbmVhciIsImEiOiJjbWQzeGM1YjIwOTF6MmpwcmZubzN6dzJrIn0.qH2R4t1WeBZgWJJy28A6pw',
    // Local development token
    development: 'pk.eyJ1IjoibmdpbmVhciIsImEiOiJjbWQzeGM1YjIwOTF6MmpwcmZubzN6dzJrIn0.qH2R4t1WeBZgWJJy28A6pw'
};

// Auto-detect environment based on hostname
const isProduction = window.location.hostname.includes('github.io') || window.location.hostname.includes('githubusercontent.com');
const MAPBOX_TOKEN = isProduction ? MAPBOX_TOKENS.production : MAPBOX_TOKENS.development;

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('Using token:', MAPBOX_TOKEN.substring(0, 20) + '...');

// Initialize map
mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r', // Back to your clean custom style
    center: [-98.5795, 39.8283], // Center of United States
    zoom: 4.2
});

// Store for pins
let pins = [];

// DOM elements
const recenterBtn = document.getElementById('recenter-btn');
const clearPinsBtn = document.getElementById('clear-pins-btn');
const streetBtn = document.getElementById('street-btn');
const satelliteBtn = document.getElementById('satellite-btn');
const labelsBtn = document.getElementById('labels-btn');
const zoomDisplay = document.getElementById('zoom-display');
const placedPinsList = document.getElementById('placed-pins-list');
const saveLoadBtn = document.getElementById('save-load-btn');
const screenshotModeBtn = document.getElementById('screenshot-mode-btn');
const exitScreenshotBtn = document.getElementById('exit-screenshot-btn');
const mapTitleElement = document.getElementById('map-title');
const newMapBtn = document.getElementById('new-map-btn');
const helpBtn = document.getElementById('help-btn');

// Map styles
const mapStyles = {
    street: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/nginear/clkd3dq69005u01qk6q7a6z7r' // Back to your clean custom style
};

let currentStyle = 'satellite';
let pinCounter = 0;
let draggedPinType = null;
let lastSearchLocation = null;
let mapTitle = 'Untitled Map';
let labelsVisible = false;
let screenshotMode = false;
let labelsWereVisibleBeforeScreenshot = false;
let markerGroups = {}; // { parentId: [childId1, childId2, ...] }

// Update zoom display
function updateZoomDisplay() {
    zoomDisplay.textContent = `Zoom: ${Math.round(map.getZoom() * 10) / 10}`;
}

// Add zoom event listener
map.on('zoom', updateZoomDisplay);
map.on('load', updateZoomDisplay);

// Add move event listeners to track when user navigates away
map.on('moveend', checkIfOffCenter);
map.on('zoomend', checkIfOffCenter);

// Initialize Mapbox Search Box
const searchBox = new MapboxSearchBox();
searchBox.accessToken = MAPBOX_TOKEN;
searchBox.placeholder = 'Search for address or coordinates...';
searchBox.country = 'US';
searchBox.language = 'en';
searchBox.proximity = map.getCenter();

// Add search box to the DOM
const searchContainer = document.getElementById('search-box');
searchContainer.appendChild(searchBox);

// Handle search results - listen for retrieve, select, and suggestion events
searchBox.addEventListener('retrieve', (e) => {
    console.log('Retrieve event:', e.detail);
    handleSearchResult(e.detail);
});

searchBox.addEventListener('select', (e) => {
    console.log('Select event:', e.detail);
    handleSearchResult(e.detail);
});

searchBox.addEventListener('suggestion', (e) => {
    console.log('Suggestion event:', e.detail);
    handleSearchResult(e.detail);
});

function handleSearchResult(data) {
    console.log('Full search data:', data);
    
    let feature = null;
    
    // Handle FeatureCollection from retrieve event
    if (data.type === 'FeatureCollection' && data.features && data.features.length > 0) {
        feature = data.features[0]; // Take the first result
        console.log('Using first feature from FeatureCollection:', feature);
    }
    // Handle single feature from select event or direct feature
    else if (data.geometry && data.geometry.coordinates) {
        feature = data;
        console.log('Using direct feature:', feature);
    }
    
    if (feature && feature.geometry && feature.geometry.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        
        // Build full address from available properties
        let placeName = '';
        const props = feature.properties || {};
        
        if (props.full_address) {
            placeName = props.full_address;
        } else if (props.place_name) {
            placeName = props.place_name;
        } else {
            // Build address from components
            const addressParts = [];
            if (props.address) addressParts.push(props.address);
            if (props.name && props.name !== props.address) addressParts.push(props.name);
            if (props.place) addressParts.push(props.place);
            if (props.district) addressParts.push(props.district);
            if (props.locality) addressParts.push(props.locality);
            if (props.region) addressParts.push(props.region);
            if (props.postcode) addressParts.push(props.postcode);
            if (props.country) addressParts.push(props.country);
            
            placeName = addressParts.length > 0 ? addressParts.join(', ') : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        
        console.log('Extracted place name:', placeName);
        console.log('Coordinates:', { lng, lat });
        
        lastSearchLocation = { lng, lat, zoom: 16 };
        recenterBtn.disabled = false;
        recenterBtn.classList.remove('off-center');
        
        map.flyTo({ 
            center: [lng, lat], 
            zoom: 16,
            speed: 2.0
        });
        addPin(lng, lat, placeName, 'location', null, true);
    } else {
        console.warn('Could not extract coordinates from search result:', data);
    }
}

// Add marker to map
function addPin(lng, lat, label, type = 'sensor', zoneNumber = null, isSearchResult = false, deviceIcon = null, assetIcon = null) {
    pinCounter++;
    const pinId = `pin-${pinCounter}`;
    
    // Create custom marker element
    const el = document.createElement('div');
    el.className = `custom-marker ${type}`;
    
    // Set border radius based on type
    const borderRadius = '50%';
    
    el.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: ${borderRadius};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    
    // Set background color and content based on type
    if (isSearchResult) {
        // Original pin icon for search results
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        el.innerHTML = '<span class="material-icons" style="font-size: 20px; color: hsl(222.2 84% 4.9%);">location_on</span>';
    } else if (type === 'location') {
        el.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        el.style.color = 'hsl(210 40% 98%)';
        el.textContent = zoneNumber || 'L';
    } else if (type === 'device') {
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        const icon = deviceIcon || 'memory';
        const rotationStyle = icon === 'straighten' ? ' transform: rotate(90deg);' : '';
        
        if (icon === 'solar-panel') {
            el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: hsl(222.2 84% 4.9%);">
                <path d="M4,2H20A2,2 0 0,1 22,4V14A2,2 0 0,1 20,16H15V20H18V22H13V16H11V22H6V20H9V16H4A2,2 0 0,1 2,14V4A2,2 0 0,1 4,2M4,4V8H11V4H4M4,14H11V10H4V14M20,14V10H13V14H20M20,4H13V8H20V4Z" />
            </svg>`;
        } else {
            el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: hsl(222.2 84% 4.9%);${rotationStyle}">${icon}</span>`;
        }
    } else if (type === 'assets') {
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        const icon = assetIcon || 'build';
        el.innerHTML = `<span class="material-icons" style="font-size: 16px; color: hsl(222.2 84% 4.9%);">${icon}</span>`;
    } else {
        // Fallback for any other types
        el.style.backgroundColor = 'rgb(243, 243, 243)';
        el.style.borderColor = 'hsl(214.3 31.8% 91.4%)';
        el.innerHTML = '<span class="material-icons" style="font-size: 20px; color: hsl(222.2 84% 4.9%);">memory</span>';
    }
    
    // Create popup with just the label name, positioned to the right and vertically centered
    const popup = new mapboxgl.Popup({ 
        offset: [25, 0], // More spacing to the right of the marker
        anchor: 'left', // Anchor to the left edge of the popup so it extends rightward
        closeButton: false,
        closeOnClick: false
    }).setHTML(`<div style="font-weight: 500;">${label}</div>`);
    
    const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);
    
    // Add drag end event
    marker.on('dragend', () => {
        const pin = pins.find(p => p.id === pinId);
        if (pin && !pin.locked) {
            const lngLat = marker.getLngLat();
            pin.lng = lngLat.lng;
            pin.lat = lngLat.lat;
            // Update popup content with just the label
            const newPopup = new mapboxgl.Popup({ 
                offset: [25, 0], 
                anchor: 'left',
                closeButton: false,
                closeOnClick: false
            }).setHTML(`<div style="font-weight: 500;">${pin.label}</div>`);
            marker.setPopup(newPopup);
            updatePlacedPinsList();
        } else if (pin && pin.locked) {
            // Reset to original position if locked
            marker.setLngLat([pin.lng, pin.lat]);
        }
    });
    
    const pinData = { id: pinId, marker, lng, lat, label, type, zoneNumber, isSearchResult, deviceIcon, assetIcon, locked: false };
    pins.push(pinData);
    updatePlacedPinsList();
    return pinData;
}

// Clear all pins
function clearPins() {
    if (pins.length === 0) {
        return; // Nothing to clear
    }
    
    const confirmClear = confirm(
        `You have ${pins.length} marker(s) currently placed.\n\n` +
        'Clearing will permanently remove all markers and groups.\n\n' +
        'Do you want to continue?\n\n' +
        '• Click OK to clear all markers (this cannot be undone)\n' +
        '• Click Cancel to keep your markers'
    );
    
    if (!confirmClear) {
        console.log('User cancelled clearing markers');
        return;
    }
    
    pins.forEach(pin => pin.marker.remove());
    pins = [];
    markerGroups = {}; // Also clear groups
    updatePlacedPinsList();
    console.log('All markers and groups cleared');
}


// Toggle map style
function toggleMapStyle(style) {
    if (style === currentStyle) return;
    
    currentStyle = style;
    console.log('Switching to style:', mapStyles[style]);
    
    map.setStyle(mapStyles[style]);
    
    // Update button states
    streetBtn.classList.toggle('active', style === 'street');
    satelliteBtn.classList.toggle('active', style === 'satellite');
    
    // Re-add pins after style loads
    map.once('styledata', () => {
        console.log('Style loaded successfully');
        // Markers should automatically persist through style changes
        // No need to manually re-add them
    });
    
    // Add error handling
    map.once('error', (e) => {
        console.error('Map style error:', e);
        // Only show alert for non-403 errors (403 is common for tile access)
        if (!e.error || !e.error.message || !e.error.message.includes('403')) {
            alert('Failed to load map style. Check console for details.');
        }
    });
}

// Re-center to last search location
function recenterToSearch() {
    if (lastSearchLocation) {
        map.flyTo({
            center: [lastSearchLocation.lng, lastSearchLocation.lat],
            zoom: lastSearchLocation.zoom,
            speed: 2.0
        });
        recenterBtn.classList.remove('off-center');
    }
}

// Check if map is off-center and update button
function checkIfOffCenter() {
    if (!lastSearchLocation || recenterBtn.disabled) return;
    
    const currentCenter = map.getCenter();
    const distance = Math.sqrt(
        Math.pow(currentCenter.lng - lastSearchLocation.lng, 2) + 
        Math.pow(currentCenter.lat - lastSearchLocation.lat, 2)
    );
    
    // If moved more than ~100 meters or zoom changed significantly
    const isOffCenter = distance > 0.001 || Math.abs(map.getZoom() - lastSearchLocation.zoom) > 1;
    
    if (isOffCenter) {
        recenterBtn.classList.add('off-center');
        console.log('Map moved away - button highlighted');
    } else {
        recenterBtn.classList.remove('off-center');
        console.log('Map centered - button normal');
    }
}

// File save/load functionality
function saveMapToFile() {
    // Generate suggested filename with timestamp in local timezone
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}T${hours}${minutes}${seconds}`;
    // Use map title if set, otherwise default to 'masen-map'
    const baseFilename = mapTitle && mapTitle !== 'Untitled Map' 
        ? mapTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : 'masen-map';
    const suggestedFilename = `${baseFilename}-${timestamp}`;
    
    // Prompt user for filename
    const userFilename = prompt('Enter filename for the map:', suggestedFilename);
    if (!userFilename) {
        return; // User cancelled
    }
    
    // Ensure .json extension
    const filename = userFilename.endsWith('.json') ? userFilename : `${userFilename}.json`;
    
    const mapData = {
        title: mapTitle,
        mapState: {
            center: map.getCenter(),
            zoom: map.getZoom(),
            style: currentStyle,
            lastSearchLocation: lastSearchLocation
        },
        pins: {
            type: "FeatureCollection",
            features: pins.map(pin => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [pin.lng, pin.lat]
                },
                properties: {
                    label: pin.label,
                    type: pin.type,
                    zoneNumber: pin.zoneNumber,
                    isSearchResult: pin.isSearchResult || false,
                    deviceIcon: pin.deviceIcon || null,
                    assetIcon: pin.assetIcon || null,
                    locked: pin.locked || false
                }
            }))
        },
        groups: markerGroups
    };
    
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Map saved as ${filename} to Downloads folder`);
}

// Screenshot mode functionality
function enterScreenshotMode() {
    screenshotMode = true;
    
    // Remember current label state
    labelsWereVisibleBeforeScreenshot = labelsVisible;
    
    // Force all labels to show
    if (!labelsVisible) {
        toggleLabels();
    }
    
    // Hide all UI elements
    document.body.classList.add('screenshot-mode');
    
    // Resize map to full screen
    map.resize();
    
    console.log('Entered screenshot mode - all UI hidden, labels visible');
}

function exitScreenshotMode() {
    screenshotMode = false;
    
    // Restore original label state
    if (!labelsWereVisibleBeforeScreenshot && labelsVisible) {
        toggleLabels();
    }
    
    // Show all UI elements
    document.body.classList.remove('screenshot-mode');
    
    // Resize map back to normal
    map.resize();
    
    console.log('Exited screenshot mode - UI restored');
}

function loadMapFromFile(file) {
    // Check if there's existing work to protect
    if (pins.length > 0) {
        const confirmLoad = confirm(
            `You have ${pins.length} marker(s) currently placed.\n\n` +
            'Loading a new map will replace all current work.\n\n' +
            'Do you want to continue?\n\n' +
            '• Click OK to load the new map (current work will be lost)\n' +
            '• Click Cancel to keep your current work'
        );
        
        if (!confirmLoad) {
            console.log('User cancelled map loading to preserve current work');
            return;
        }
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const mapData = JSON.parse(e.target.result);
            
            // Validate file structure
            if (!mapData.mapState || !mapData.pins) {
                throw new Error('Invalid map file format');
            }
            
            // Clear existing pins
            clearPins();
            
            // Restore title
            if (mapData.title) {
                mapTitle = mapData.title;
                mapTitleElement.textContent = mapTitle;
            } else {
                mapTitle = 'Untitled Map';
                mapTitleElement.textContent = mapTitle;
            }
            
            // Restore map state
            if (mapData.mapState.center && mapData.mapState.zoom) {
                map.flyTo({
                    center: [mapData.mapState.center.lng, mapData.mapState.center.lat],
                    zoom: mapData.mapState.zoom,
                    speed: 1.5
                });
            }
            
            // Restore map style
            if (mapData.mapState.style && mapData.mapState.style !== currentStyle) {
                toggleMapStyle(mapData.mapState.style);
            }
            
            // Restore last search location
            if (mapData.mapState.lastSearchLocation) {
                lastSearchLocation = mapData.mapState.lastSearchLocation;
                recenterBtn.disabled = false;
            }
            
            // Restore pins
            if (mapData.pins.features && mapData.pins.features.length > 0) {
                mapData.pins.features.forEach(feature => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const props = feature.properties;
                    const pin = addPin(lng, lat, props.label, props.type, props.zoneNumber, props.isSearchResult || false, props.deviceIcon, props.assetIcon);
                    
                    // Restore lock state
                    if (props.locked) {
                        pin.locked = true;
                        pin.marker.setDraggable(false);
                    }
                });
            }
            
            // Restore groups
            if (mapData.groups) {
                markerGroups = mapData.groups;
                console.log('Restored marker groups:', markerGroups);
            }
            
            console.log('Map loaded successfully');
            alert('Map loaded successfully! You can now continue working with the loaded map.');
            
        } catch (error) {
            console.error('Error loading map file:', error);
            alert('Error loading map file. Please check that the file is a valid Masen Maps export.');
        }
    };
    reader.readAsText(file);
}

// Event listeners
recenterBtn.addEventListener('click', recenterToSearch);
clearPinsBtn.addEventListener('click', clearPins);
streetBtn.addEventListener('click', () => toggleMapStyle('street'));
satelliteBtn.addEventListener('click', () => toggleMapStyle('satellite'));
labelsBtn.addEventListener('click', toggleLabels);

// Save/Load button functionality
saveLoadBtn.addEventListener('click', saveMapToFile);

// Screenshot mode functionality
screenshotModeBtn.addEventListener('click', enterScreenshotMode);
exitScreenshotBtn.addEventListener('click', exitScreenshotMode);

// Title editing functionality
mapTitleElement.addEventListener('click', editMapTitle);

// New map functionality
newMapBtn.addEventListener('click', () => {
    if (pins.length > 0) {
        const confirmNew = confirm(
            `You have ${pins.length} marker(s) currently placed.\n\n` +
            'Starting a new map will clear all current work.\n\n' +
            'Do you want to continue?\n\n' +
            '• Click OK to start new map (current work will be lost)\n' +
            '• Click Cancel to keep your current work'
        );
        
        if (!confirmNew) {
            return;
        }
    }
    
    // Hard refresh to start completely fresh
    window.location.reload(true);
});

// Help button functionality
helpBtn.addEventListener('click', () => {
    window.open('help.html', '_blank');
});

// Drag and drop functionality for loading files
saveLoadBtn.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveLoadBtn.classList.add('drag-over');
});

saveLoadBtn.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveLoadBtn.classList.remove('drag-over');
});

saveLoadBtn.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveLoadBtn.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            loadMapFromFile(file);
        } else {
            alert('Please drop a JSON file');
        }
    }
});

// Drag and drop functionality
const draggablePins = document.querySelectorAll('.draggable-pin');

draggablePins.forEach(pin => {
    pin.addEventListener('dragstart', (e) => {
        draggedPinType = {
            type: e.target.dataset.pinType,
            zoneNumber: e.target.dataset.zoneNumber || null,
            deviceIcon: e.target.dataset.deviceIcon || null,
            assetIcon: e.target.dataset.assetIcon || null
        };
        e.dataTransfer.effectAllowed = 'copy';
    });
});

const mapContainer = document.getElementById('map');

mapContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

mapContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log('Drop event triggered', draggedPinType);
    if (!draggedPinType) {
        console.log('No draggedPinType found');
        return;
    }
    
    const rect = mapContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lngLat = map.unproject([x, y]);
    console.log('Dropping at coordinates:', lngLat);
    
    let label;
    if (draggedPinType.type === 'location') {
        label = `Location ${draggedPinType.zoneNumber}`;
    } else if (draggedPinType.type === 'device') {
        label = 'Device';
    } else if (draggedPinType.type === 'assets') {
        label = 'Asset';
    } else {
        label = `${draggedPinType.type.charAt(0).toUpperCase() + draggedPinType.type.slice(1)}`;
    }
    
    console.log('Adding pin with label:', label);
    addPin(lngLat.lng, lngLat.lat, label, draggedPinType.type, draggedPinType.zoneNumber, false, draggedPinType.deviceIcon, draggedPinType.assetIcon);
    
    draggedPinType = null;
});

// Update placed markers list with grouping
function updatePlacedPinsList() {
    placedPinsList.innerHTML = '';
    
    if (pins.length === 0) {
        placedPinsList.innerHTML = '<div class="pin-item">No markers placed</div>';
        return;
    }
    
    // Get all pins that are not children of other pins
    const parentPins = pins.filter(pin => !isChildPin(pin.id));
    
    parentPins.forEach(pin => {
        // Add parent pin
        const item = createPinItem(pin, false);
        placedPinsList.appendChild(item);
        
        // Add child pins if any
        const children = markerGroups[pin.id] || [];
        children.forEach(childId => {
            const childPin = pins.find(p => p.id === childId);
            if (childPin) {
                const childItem = createPinItem(childPin, true);
                placedPinsList.appendChild(childItem);
            }
        });
    });
}

// Create a pin item element
function createPinItem(pin, isChild) {
    const item = document.createElement('div');
    item.className = `pin-item ${isChild ? 'pin-item-child' : ''}`;
    item.draggable = true;
    item.dataset.pinId = pin.id;
    
    const labelText = pin.label;
    
    const lockIcon = pin.locked ? 'lock' : 'lock_open';
    const lockTitle = pin.locked ? 'Unlock marker (allow dragging)' : 'Lock marker (prevent dragging)';
    
    item.innerHTML = `
        <div class="pin-item-text" onclick="centerOnPin('${pin.id}')" style="cursor: pointer;" title="Click to center on marker">${labelText}</div>
        <div class="pin-controls">
            <button class="pin-btn lock-btn" onclick="togglePinLock('${pin.id}')" title="${lockTitle}">
                <span class="material-icons">${lockIcon}</span>
            </button>
            <button class="pin-btn edit-btn" onclick="editPin('${pin.id}')" title="Edit marker name">
                <span class="material-icons">edit</span>
            </button>
            <button class="pin-btn delete-btn" onclick="deletePin('${pin.id}')" title="Delete marker">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `;
    
    // Add drag and drop event listeners
    item.addEventListener('dragstart', handlePinDragStart);
    item.addEventListener('dragover', handlePinDragOver);
    item.addEventListener('drop', handlePinDrop);
    item.addEventListener('dragend', handlePinDragEnd);
    
    return item;
}

// Helper function to check if a pin is a child
function isChildPin(pinId) {
    return Object.values(markerGroups).some(children => children.includes(pinId));
}

// Drag and drop handlers for grouping
let draggedPinId = null;
let dragSuccessful = false;

function handlePinDragStart(e) {
    draggedPinId = e.target.closest('.pin-item').dataset.pinId;
    dragSuccessful = false;
    e.target.closest('.pin-item').style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handlePinDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const item = e.target.closest('.pin-item');
    if (item && item.dataset.pinId !== draggedPinId) {
        item.classList.add('drag-over');
    }
}

function handlePinDrop(e) {
    e.preventDefault();
    const targetItem = e.target.closest('.pin-item');
    const targetPinId = targetItem.dataset.pinId;
    
    if (draggedPinId && targetPinId && draggedPinId !== targetPinId) {
        // Check if we're dropping onto a child pin - if so, use its parent
        let actualTargetId = targetPinId;
        if (isChildPin(targetPinId)) {
            actualTargetId = getParentPinId(targetPinId);
        }
        
        // Remove from any existing group
        removeFromGroup(draggedPinId);
        
        // Add to new group
        addToGroup(actualTargetId, draggedPinId);
        
        dragSuccessful = true;
        updatePlacedPinsList();
        console.log(`Grouped marker ${draggedPinId} under ${actualTargetId}`);
    }
    
    // Remove all drag-over styling
    document.querySelectorAll('.pin-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handlePinDragEnd(e) {
    e.target.closest('.pin-item').style.opacity = '1';
    
    // If drag was not successful and the pin is a child, remove it from group (drag-off functionality)
    if (!dragSuccessful && draggedPinId && isChildPin(draggedPinId)) {
        removeFromGroup(draggedPinId);
        updatePlacedPinsList();
        console.log(`Removed marker ${draggedPinId} from group (drag-off)`);
    }
    
    draggedPinId = null;
    
    // Remove all drag-over styling
    document.querySelectorAll('.pin-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

// Group management functions
function addToGroup(parentId, childId) {
    if (!markerGroups[parentId]) {
        markerGroups[parentId] = [];
    }
    
    if (!markerGroups[parentId].includes(childId)) {
        markerGroups[parentId].push(childId);
    }
}

function removeFromGroup(pinId) {
    Object.keys(markerGroups).forEach(parentId => {
        const index = markerGroups[parentId].indexOf(pinId);
        if (index > -1) {
            markerGroups[parentId].splice(index, 1);
            
            // Clean up empty groups
            if (markerGroups[parentId].length === 0) {
                delete markerGroups[parentId];
            }
        }
    });
}

function getParentPinId(childId) {
    for (const [parentId, children] of Object.entries(markerGroups)) {
        if (children.includes(childId)) {
            return parentId;
        }
    }
    return null;
}

// Edit individual pin
let currentEditPinId = null;

function editPin(pinId) {
    const pin = pins.find(p => p.id === pinId);
    if (!pin) return;
    
    currentEditPinId = pinId;
    
    // Populate the modal with current values
    document.getElementById('edit-marker-name').value = pin.label;
    document.getElementById('edit-marker-coords').value = `${pin.lat.toFixed(6)}, ${pin.lng.toFixed(6)}`;
    
    // Show the modal
    document.getElementById('edit-modal').classList.add('show');
    
    // Focus on the name field
    document.getElementById('edit-marker-name').focus();
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.remove('show');
    currentEditPinId = null;
}

function saveMarkerEdit() {
    if (!currentEditPinId) return;
    
    const pin = pins.find(p => p.id === currentEditPinId);
    if (!pin) return;
    
    const newLabel = document.getElementById('edit-marker-name').value.trim();
    const newCoords = document.getElementById('edit-marker-coords').value.trim();
    
    if (!newLabel) {
        alert('Please enter a marker name.');
        return;
    }
    
    // Parse coordinates
    const coordsMatch = newCoords.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
    if (coordsMatch) {
        const newLat = parseFloat(coordsMatch[1]);
        const newLng = parseFloat(coordsMatch[2]);
        
        // Validate coordinates
        if (newLat >= -90 && newLat <= 90 && newLng >= -180 && newLng <= 180) {
            // Update pin data
            pin.label = newLabel;
            pin.lat = newLat;
            pin.lng = newLng;
            
            // Update marker position
            pin.marker.setLngLat([newLng, newLat]);
            
            // Update the popup content
            const newPopup = new mapboxgl.Popup({ 
                offset: [25, 0], 
                anchor: 'left',
                closeButton: false,
                closeOnClick: false
            }).setHTML(`<div style="font-weight: 500;">${pin.label}</div>`);
            pin.marker.setPopup(newPopup);
            
            // Update the sidebar list
            updatePlacedPinsList();
            
            // Close the modal
            closeEditModal();
        } else {
            alert('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.');
        }
    } else {
        alert('Invalid coordinate format. Please use: lat, lng (e.g., 40.7128, -74.0060)');
    }
}

// Toggle pin lock state
function togglePinLock(pinId) {
    const pin = pins.find(p => p.id === pinId);
    if (!pin) return;
    
    pin.locked = !pin.locked;
    
    // Update marker draggable state
    pin.marker.setDraggable(!pin.locked);
    
    // Update the sidebar list to reflect lock state
    updatePlacedPinsList();
    
    console.log(`Marker ${pin.label} is now ${pin.locked ? 'locked' : 'unlocked'}`);
}

// Delete individual pin
function deletePin(pinId) {
    const pinIndex = pins.findIndex(p => p.id === pinId);
    if (pinIndex !== -1) {
        pins[pinIndex].marker.remove();
        pins.splice(pinIndex, 1);
        
        // If this was a parent pin, remove the group and make children independent
        if (markerGroups[pinId]) {
            delete markerGroups[pinId];
        }
        
        // If this was a child pin, remove it from its parent group
        removeFromGroup(pinId);
        
        updatePlacedPinsList();
    }
}

// Center map on specific pin
function centerOnPin(pinId) {
    const pin = pins.find(p => p.id === pinId);
    if (!pin) return;
    
    // Fly to the pin location with a nice zoom level
    map.flyTo({
        center: [pin.lng, pin.lat],
        zoom: Math.max(map.getZoom(), 16), // Zoom in to at least level 16, or keep current zoom if higher
        speed: 2.0
    });
    
    // Briefly open the popup to show which marker was selected
    setTimeout(() => {
        pin.marker.togglePopup();
    }, 500);
    
    console.log(`Centered on marker: ${pin.label}`);
}

// Toggle labels visibility
function toggleLabels() {
    labelsVisible = !labelsVisible;
    
    pins.forEach(pin => {
        if (labelsVisible) {
            pin.marker.getPopup().addTo(map);
        } else {
            pin.marker.getPopup().remove();
        }
    });
    
    // Update button state
    labelsBtn.classList.toggle('active', labelsVisible);
    
    console.log('Labels', labelsVisible ? 'shown' : 'hidden');
}

// Edit map title
function editMapTitle() {
    const newTitle = prompt('Enter map title:', mapTitle);
    if (newTitle && newTitle.trim() !== '') {
        mapTitle = newTitle.trim();
        mapTitleElement.textContent = mapTitle;
        console.log('Map title updated to:', mapTitle);
    }
}

// Make functions globally accessible
window.editPin = editPin;
window.deletePin = deletePin;
window.editMapTitle = editMapTitle;
window.centerOnPin = centerOnPin;
window.togglePinLock = togglePinLock;
window.closeEditModal = closeEditModal;
window.saveMarkerEdit = saveMarkerEdit;


// Add keyboard support for edit modal
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('edit-modal');
    if (modal.classList.contains('show')) {
        if (e.key === 'Escape') {
            closeEditModal();
        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            saveMarkerEdit();
        }
    }
});

// Initialize displays
updatePlacedPinsList();