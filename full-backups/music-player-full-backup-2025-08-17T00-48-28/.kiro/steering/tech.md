# Technology Stack

## Core Technologies

- **Electron**: Cross-platform desktop application framework
- **React**: UI library for component-based development
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: Lightweight state management

## Key Dependencies

- **Frontend**:

  - `react` & `react-dom`: v18.2.0
  - `react-router-dom`: v6.22.1 for routing
  - `react-icons`: v5.0.1 for UI icons
  - `zustand`: v4.5.1 for state management

- **Styling**:

  - `tailwindcss`: v3.4.1
  - `@tailwindcss/forms`: Form element styling
  - `@tailwindcss/typography`: Typography styling

- **Electron**:
  - `electron`: v28.1.0
  - `electron-builder`: v24.9.1 for packaging
  - `electron-squirrel-startup`: v1.0.0 for Windows installer

## Build System

- **Vite**: Main build tool with React plugin
- **PostCSS**: For CSS processing with plugins:
  - `autoprefixer`
  - `postcss-import`
  - `postcss-nesting`

## Common Commands

```bash
# Start development server (React only)
npm run dev

# Start development with Electron
npm run start

# Build React app
npm run build

# Build and package Electron app
npm run build:app

# Generate app icons
npm run generate-icons
```

## Path Aliases

- `@/` maps to the `src` directory

## Environment Configuration

- Development mode detection: `process.env.NODE_ENV === 'development' || !app.isPackaged`
- Development server runs on port 3000
