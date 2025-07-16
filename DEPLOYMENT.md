# Scout - GitHub Pages Deployment Guide

## Setup Instructions

### 1. Mapbox Token Configuration
For GitHub Pages deployment, you'll need to update the token in the code:

1. **Create a new Mapbox token** specifically for GitHub Pages:
   - Go to [Mapbox Account Tokens](https://account.mapbox.com/access-tokens/)
   - Create a new token with restricted scope
   - Add URL restrictions to your GitHub Pages domain (e.g., `https://yourusername.github.io`)

2. **Update token in app.js**:
   - Open `app.js` and find the `MAPBOX_TOKENS` object
   - Update the `production` token with your GitHub Pages token
   - Keep the `development` token for local development

### 2. Environment Detection
The app automatically detects the environment:
- **Local development**: Uses `development` token when hostname is `localhost`
- **GitHub Pages**: Uses `production` token when hostname contains `github.io`

### 3. Deployment Process
1. Update the production token in `app.js`
2. Push your code to GitHub
3. Enable GitHub Pages in your repository settings
4. The app will automatically use the correct token based on the environment

### 4. Security Notes
- The GitHub Pages token should be restricted to your domain in Mapbox dashboard
- Consider the token semi-public since it's in client-side code
- Use URL restrictions in Mapbox dashboard for security

## Code Location
In `app.js`, look for:
```javascript
const MAPBOX_TOKENS = {
    production: 'pk.your_github_pages_token_here',
    development: 'pk.your_local_development_token_here'
};
```

## Troubleshooting
- If maps don't load, check the browser console for token errors
- Verify the token has the correct URL restrictions
- Ensure the token has the necessary scopes for your map style