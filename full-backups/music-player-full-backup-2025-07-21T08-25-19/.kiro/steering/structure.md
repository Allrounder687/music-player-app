# Project Structure

## Directory Organization

```
my-music-app/
├── assets/                # App icons and resources
│   ├── icon.icns         # macOS app icon
│   ├── icon.ico          # Windows app icon
│   ├── icon.png          # Linux app icon
│   ├── icon.svg          # Source icon
│   └── icons/            # Additional icons
│
├── electron/              # Electron main process code
│   ├── main.js           # Main Electron process
│   └── preload.js        # Preload script for IPC
│
├── public/               # Static assets
│   ├── audio/            # Sample audio files
│   ├── images/           # Static images
│   └── index.html        # Public HTML template
│
├── scripts/              # Build and utility scripts
│   ├── copy-icon.js      # Icon generation script
│   ├── generate-icons.js # Icon generation utilities
│   └── simple-icons.js   # Icon utilities
│
├── src/                  # Application source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── renderer/         # Renderer process code
│   ├── store/            # State management
│   └── styles/           # Global styles
│
└── utils/                # Helper functions
```

## Architecture Patterns

### Component Organization

- **Components**: Reusable UI elements (buttons, inputs, etc.)
- **Pages**: Full page views composed of components
- **Store**: Global state management using Zustand
- **Styles**: Global styles and Tailwind customizations

### Electron Architecture

- **Main Process** (`electron/main.js`): Handles system integration, file access, and window management
- **Renderer Process** (`src/renderer/`): Handles UI rendering and user interaction
- **Preload Script** (`electron/preload.js`): Securely exposes IPC APIs to renderer

## File Naming Conventions

- React components: PascalCase (e.g., `MusicPlayer.jsx`)
- Utility functions: camelCase (e.g., `formatTime.js`)
- CSS modules: camelCase with `.module.css` suffix
- Test files: Same name as the file being tested with `.test.js` suffix

## Import Conventions

- Use path aliases (`@/`) for imports from the `src` directory
- Group imports in the following order:
  1. External libraries
  2. Internal modules
  3. Components
  4. Styles

## State Management

- Use Zustand for global state
- Use React hooks for component-level state
- Prefer composition over prop drilling
