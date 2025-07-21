# Troubleshooting Guide for Music Player App

## Common Issues and Solutions

### 1. "Maximum update depth exceeded" Error

**Symptoms:**

- Error message: "Warning: Maximum update depth exceeded. This can happen when a component calls setState inside useEffect..."
- App freezes or becomes unresponsive
- High CPU usage

**Causes:**

- Infinite update loops in React components
- useEffect dependencies causing continuous re-renders
- setState being called in a way that triggers another render immediately

**Solutions:**

1. **Check useEffect dependencies:**

   - Remove functions from dependency arrays that cause re-renders
   - Use useCallback for functions in dependency arrays
   - Example fix from SnakeSeekbar:

   ```javascript
   // WRONG:
   useEffect(() => {
     // Effect code...
   }, [currentTime, duration, isDragging, getWaveYPosition, updateWavePoints]);

   // CORRECT:
   useEffect(() => {
     // Effect code...
   }, [currentTime, duration, isDragging]);
   ```

2. **Use throttling for frequent updates:**

   - Limit update frequency for animations and real-time data
   - Example from AudioPlayer:

   ```javascript
   // Use setInterval instead of requestAnimationFrame
   const intervalId = setInterval(() => {
     // Update code...
   }, 100); // 10fps instead of 60fps

   return () => clearInterval(intervalId);
   ```

3. **Use refs for values that shouldn't trigger re-renders:**
   ```javascript
   const lastValueRef = useRef(initialValue);
   // Update ref without causing re-render
   lastValueRef.current = newValue;
   ```

### 2. Electron App Not Starting

**Symptoms:**

- Only web browser opens, not the Electron app
- Error messages about port in use
- Missing dependencies errors

**Solutions:**

1. **Check port configuration:**

   - Ensure all port references are consistent (package.json, vite.config.js, main.js)
   - Use the debug script to check if port is in use:

   ```
   npm run debug
   ```

2. **Check file paths:**

   - Ensure index.html is in the correct location
   - Check that main.js and preload.js exist and are correctly referenced

3. **Fix dependency issues:**

   - Remove unused imports (like PropTypes)
   - Install missing dependencies:

   ```
   npm install
   ```

4. **Clear cache and node_modules:**
   ```
   rm -rf node_modules
   npm cache clean --force
   npm install
   ```

### 3. Audio Not Playing

**Symptoms:**

- UI loads but no sound
- Error messages related to audio files
- Missing audio controls

**Solutions:**

1. **Check audio file paths:**

   - Ensure audio files exist in the correct location
   - Check that file paths are correctly referenced

2. **Check audio element:**

   - Ensure audio element is properly initialized
   - Check that volume is not muted
   - Verify that audio data is being loaded

3. **Debug audio loading:**
   - Add console logs to track audio loading process
   - Check for errors in the audio loading process

## Restoring from Backups

If you need to restore from backups:

1. **Locate backup files:**

   - Check the `backups` directory
   - Look for files with `.bak` or `.backup` extensions

2. **Restore specific components:**

   - Copy the backup file over the current file:

   ```
   copy backups\SnakeSeekbar.jsx.bak src\components\SnakeSeekbar.jsx
   ```

3. **Restore all backups:**
   - Run the restore script:
   ```
   npm run restore-backups
   ```

## Preventing Future Issues

1. **Use proper dependency management in useEffect:**

   - Only include dependencies that are actually used in the effect
   - Use useCallback for functions that are dependencies
   - Consider using useRef for values that shouldn't trigger re-renders

2. **Throttle frequent updates:**

   - Limit update frequency for animations and real-time data
   - Use requestAnimationFrame with throttling or setInterval

3. **Test in both development and production modes:**

   - Some issues only appear in development mode
   - Build and test the app in production mode before deploying

4. **Use the debug script for Electron issues:**
   - The debug script provides more detailed error messages
   - It checks for common issues before starting the app

Remember: When in doubt, check the console for error messages and use the debug script to diagnose issues.
