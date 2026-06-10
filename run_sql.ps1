$SUPABASE_URL = "https://lurgyauxaiqcnbotpiie.supabase.co"
$SUPABASE_ANON_KEY = "sb_publishable_Rho85F-X0OA2p16pOZXCMQ_jaf82U0u"

# Read schema.sql
$sql = Get-Content -Path ".\schema.sql" -Raw -Encoding UTF8

# Execute via Supabase SQL REST endpoint (requires service_role key)
# We'll use the Supabase Management API
Write-Host "Reading schema.sql ..." -ForegroundColor Cyan
Write-Host "SQL length: $($sql.Length) chars" -ForegroundColor Green

$body = @{ query = $sql } | ConvertTo-Json -Depth 5

$headers = @{
    "Content-Type"  = "application/json"
    "apikey"        = $SUPABASE_ANON_KEY
    "Authorization" = "Bearer $SUPABASE_ANON_KEY"
}

Write-Host "Sending SQL to Supabase..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod `
        -Uri "$SUPABASE_URL/rest/v1/rpc/exec_sql" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop
    Write-Host "SUCCESS!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Direct exec failed. Trying pg-meta endpoint..." -ForegroundColor Yellow
    Write-Host $_.Exception.Message -ForegroundColor Red
}
