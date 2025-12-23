# Enable Git Hooks - Vibe-Coding
# Installe un hook pre-commit optionnel pour lancer standards-check.ps1

param(
    [switch]$Uninstall,
    [ValidateSet("pre-commit", "pre-push")]
    [string]$Hook = "pre-commit"
)

$hooksDir = ".git\hooks"
$hookFile = Join-Path $hooksDir $Hook
$scriptPath = "scripts/standards-check.ps1"

if (-not (Test-Path ".git")) {
    Write-Host "Erreur : Ce script doit être exécuté à la racine d'un repo Git." -ForegroundColor Red
    exit 1
}

if ($Uninstall) {
    if (Test-Path $hookFile) {
        Remove-Item $hookFile -Force
        Write-Host "Hook '$Hook' désinstallé." -ForegroundColor Green
    } else {
        Write-Host "Aucun hook '$Hook' trouvé." -ForegroundColor Yellow
    }
    exit 0
}

# Créer le dossier hooks si nécessaire
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# Contenu du hook (shell script pour compatibilité Git)
$hookContent = @"
#!/bin/sh
# Hook $Hook - Standards Check (Vibe-Coding)
# Pour désinstaller : .\scripts\enable-git-hooks.ps1 -Uninstall

echo "Running standards check..."
powershell.exe -ExecutionPolicy Bypass -File "$scriptPath"
exit_code=`$?

if [ `$exit_code -ne 0 ]; then
    echo "Standards check failed. Commit aborted."
    echo "To bypass: git commit --no-verify"
    exit 1
fi

exit 0
"@

# Écrire le hook
Set-Content -Path $hookFile -Value $hookContent -Encoding UTF8 -NoNewline

Write-Host "=== Hook Git installé ===" -ForegroundColor Cyan
Write-Host "Type     : $Hook" -ForegroundColor Green
Write-Host "Fichier  : $hookFile" -ForegroundColor Green
Write-Host ""
Write-Host "Le check sera lancé automatiquement avant chaque $Hook." -ForegroundColor Yellow
Write-Host ""
Write-Host "Pour désinstaller :" -ForegroundColor Gray
Write-Host "  .\scripts\enable-git-hooks.ps1 -Uninstall" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour bypass ponctuel :" -ForegroundColor Gray
Write-Host "  git commit --no-verify" -ForegroundColor Gray
