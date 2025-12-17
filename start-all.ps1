# Start Backend Services
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd api-gateway; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd auth-service; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd product-service; node index.js"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd order-service; node index.js"

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend-client; npm run dev"

Write-Host "All services started in separate windows."
