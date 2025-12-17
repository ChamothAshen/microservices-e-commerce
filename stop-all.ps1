# Stop all Node.js processes
Write-Host "Stopping all Node.js processes..."
Stop-Process -Name node -ErrorAction SilentlyContinue
Write-Host "All Node.js processes stopped."
