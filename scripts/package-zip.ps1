# Build the latest production bundle
npm run build

# Path setup
$root = Get-Location
$distPath = Join-Path $root "dist"
$zipPath = Join-Path $root "domain-hosting-upload.zip"

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($distPath, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

Write-Host "Created domain-hosting-upload.zip successfully."
$zipSize = (Get-Item $zipPath).Length
Write-Host "File size: $([math]::Round($zipSize / 1MB, 2)) MB"

$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
Write-Host "Total entries in zip: $($zip.Entries.Count)"
$zip.Entries | Select-Object -First 10 -Property FullName, Length | Format-Table -AutoSize
$zip.Dispose()
