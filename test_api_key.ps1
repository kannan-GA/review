# PowerShell script to test Supabase API Key
# Run this in PowerShell: .\test_api_key.ps1

$supabaseUrl = "https://vrxrpqsiwgfoaepyuqjw.supabase.co"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeHJwcXNpd2dmb2FlcHl1cWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTc5NTQsImV4cCI6MjA4MDM5Mzk1NH0.i8Qisf8J4JSdxdyW6H3G6p6OmF8zOzTzuO7XSBdNhSU"

Write-Host "Testing Supabase API Key..." -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl" -ForegroundColor Yellow
Write-Host "Key (first 50 chars): $($anonKey.Substring(0, 50))..." -ForegroundColor Yellow
Write-Host ""

# Test GET request (read reviews)
Write-Host "Testing GET request (read reviews)..." -ForegroundColor Cyan
try {
    $headers = @{
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/reviews?select=*" -Method Get -Headers $headers
    
    Write-Host "✅ GET request SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET request FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Testing POST request (insert review)..." -ForegroundColor Cyan

# Test POST request (insert review)
try {
    $headers = @{
        "apikey" = $anonKey
        "Authorization" = "Bearer $anonKey"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }
    
    $body = @{
        product_id = "test-product-123"
        rating = 5
        text = "Test review from PowerShell"
        author = "Test User"
        email = "test@example.com"  # Required: email column is NOT NULL
        verified_purchase = $false
        status = "pending"
        user_id = "anonymous"  # Add user_id to match table schema
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/reviews?select=*" -Method Post -Headers $headers -Body $body
    
    Write-Host "✅ POST request SUCCESS!" -ForegroundColor Green
    Write-Host "Created review ID: $($response.id)" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST request FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
        
        # Try to parse error
        try {
            $errorObj = $responseBody | ConvertFrom-Json
            Write-Host "Error Code: $($errorObj.code)" -ForegroundColor Red
            Write-Host "Error Message: $($errorObj.message)" -ForegroundColor Red
            Write-Host "Error Details: $($errorObj.details)" -ForegroundColor Red
            Write-Host "Error Hint: $($errorObj.hint)" -ForegroundColor Red
        } catch {
            Write-Host "Could not parse error response" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan

