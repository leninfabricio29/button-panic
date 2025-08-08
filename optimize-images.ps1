# Script para optimizar imágenes pesadas
Write-Host "🖼️ Optimizando imágenes pesadas..." -ForegroundColor Green

# Lista de imágenes a optimizar
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
        Write-Host "📁 $image - Tamaño actual: $([math]::Round($size, 2)) KB"
        
        # Crear backup
        $backupPath = $fullPath + ".backup"
        Copy-Item $fullPath $backupPath -Force
        Write-Host "✅ Backup creado: $backupPath"
    } else {
        Write-Host "❌ No encontrado: $image"
    }
}

Write-Host "`n📋 Recomendaciones para optimizar:" -ForegroundColor Yellow
Write-Host "1. Usa herramientas online como TinyPNG o ImageOptim"
Write-Host "2. Reduce el tamaño de splash-icon.png a máximo 512x512px"
Write-Host "3. Reduce adaptive-icon.png a máximo 512x512px"
Write-Host "4. Convierte imágenes a WebP si es posible"
Write-Host "5. Para el icono de la app, usa tamaños específicos por densidad"
