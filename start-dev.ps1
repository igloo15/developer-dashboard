# Kill all Node.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill all Cargo processes
Get-Process -Name "cargo" -ErrorAction SilentlyContinue | Stop-Process -Force

# Kill the app if running
Get-Process -Name "developer-dashboard" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for ports to be released
Start-Sleep -Seconds 2

# Start the development server
npm run tauri dev
