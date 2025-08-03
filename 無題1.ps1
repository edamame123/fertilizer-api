  $lines = Get-Content "backup.sql"
  $batchSize = 100
  for ($i = 0; $i -lt $lines.Length; $i += $batchSize) {
      $endIndex = [math]::min($i + $batchSize - 1, $lines.Length - 1)
      $batch = $lines[$i..$endIndex] -join "`n"

      Write-Host "Processing lines $($i+1) to $($endIndex+1)..."      

      $batch | Out-File -Encoding UTF8 "temp_batch.sql"
      $result = npx wrangler d1 execute fertilizer-api --remote  --file="temp_batch.sql" 2>&1

      if ($LASTEXITCODE -ne 0) {
          Write-Host "ERROR in lines $($i+1) to $($endIndex+1):       
  $result" -ForegroundColor Red
          break
      } else {
          Write-Host "✓ Lines $($i+1) to $($endIndex+1)
  successful" -ForegroundColor Green
      }
  }