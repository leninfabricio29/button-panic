Write-Host "🧹 Iniciando limpieza completa del proyecto..." -ForegroundColor Green

# 1. Limpiar node_modules
Write-Host "`n📦 Limpiando node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✅ node_modules eliminado"
} else {
    Write-Host "⚠️ node_modules no encontrado"
}

# 2. Limpiar caches
Write-Host "`n🗂️ Limpiando caches..." -ForegroundColor Yellow

# Cache de npm
npm cache clean --force
Write-Host "✅ Cache de npm limpiado"

# Cache de Metro
if (Test-Path "$env:TEMP\metro-*") {
    Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
    Write-Host "✅ Cache de Metro limpiado"
}

# Cache de React Native
if (Test-Path "$env:TEMP\react-*") {
    Remove-Item -Recurse -Force "$env:TEMP\react-*" -ErrorAction SilentlyContinue
    Write-Host "✅ Cache de React Native limpiado"
}

# 3. Limpiar builds de Android
Write-Host "`n📱 Limpiando builds de Android..." -ForegroundColor Yellow
$androidPaths = @(
    "android\app\build",
    "android\build",
    "android\app\.cxx",
    "android\.gradle"
)

foreach ($path in $androidPaths) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        Write-Host "✅ Eliminado: $path"
    }
}

# 4. Limpiar archivos temporales
Write-Host "`n🧽 Limpiando archivos temporales..." -ForegroundColor Yellow
$tempFiles = @(
    "*.log",
    "*.tmp",
    ".expo\*",
    "*.backup"
)

foreach ($pattern in $tempFiles) {
    Get-ChildItem -Recurse -Include $pattern -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}
Write-Host "✅ Archivos temporales eliminados"

# 5. Reinstalar dependencias
Write-Host "`n📋 Reinstalando dependencias..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencias reinstaladas"

Write-Host "`n🎉 Limpieza completa terminada!" -ForegroundColor Green
Write-Host "`n📊 Tamaño actual de carpetas principales:" -ForegroundColor Cyan

# Mostrar tamaños actuales
$folders = @("android", "assets", "app", "screens", "components")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        $size = (Get-ChildItem $folder -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "$folder`: $([math]::Round($size, 2)) MB"
    }
}

Write-Host "`n💡 Próximos pasos para build optimizado:" -ForegroundColor Yellow
Write-Host "1. Optimiza las imágenes en assets/images usando TinyPNG"
Write-Host "2. Ejecuta: npx expo build:android --release-channel production"
Write-Host "3. O usa EAS Build: eas build --platform android --profile production"
