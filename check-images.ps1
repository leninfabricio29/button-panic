Write-Host "Analizando imagenes pesadas..." -ForegroundColor Green

$images = @(
    "assets\images\adaptive-icon.png",
    "assets\images\splash-icon.png", 
    "assets\images\icon.png",
    "assets\images\softkilla_pub.png"
)

foreach ($image in $images) {
    $fullPath = Join-Path $PWD $image
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length / 1KB
        Write-Host "$image - Size: $([math]::Round($size, 2)) KB"
    }
}

Write-Host "`nRecomendaciones:" -ForegroundColor Yellow
Write-Host "1. Usa TinyPNG para comprimir"
Write-Host "2. Reduce splash-icon.png a 512x512px max"
Write-Host "3. Reduce adaptive-icon.png a 512x512px max"
