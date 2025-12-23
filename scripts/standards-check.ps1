# Standards Check Local - Vibe-Coding
# Vérifie : JSON valide, secrets, fichiers > 350 lignes

param(
    [switch]$Quiet,
    [switch]$FailOnWarning
)

$ErrorActionPreference = "Continue"
$script:HasBlocker = $false
$script:HasWarning = $false

Write-Host "=== Standards Check ===" -ForegroundColor Cyan

# --- 1. JSON Validation ---
Write-Host "`n[1/3] JSON Validation" -ForegroundColor Yellow

$jsonFiles = @("settings.user.json", "package.json", "tsconfig.json")
foreach ($file in $jsonFiles) {
    if (Test-Path $file) {
        try {
            $null = Get-Content $file -Raw | ConvertFrom-Json
            Write-Host "  OK: $file" -ForegroundColor Green
        } catch {
            Write-Host "  BLOCKER: $file - JSON invalide" -ForegroundColor Red
            $script:HasBlocker = $true
        }
    }
}

# --- 2. Secrets Scan ---
Write-Host "`n[2/3] Secrets Scan" -ForegroundColor Yellow

$secretPatterns = @(
    @{ Pattern = "sk-[a-zA-Z0-9]{20,}"; Name = "OpenAI Key" },
    @{ Pattern = "ghp_[a-zA-Z0-9]{36,}"; Name = "GitHub PAT" },
    @{ Pattern = "gho_[a-zA-Z0-9]{36,}"; Name = "GitHub OAuth" },
    @{ Pattern = "AIza[a-zA-Z0-9_-]{35}"; Name = "Google API Key" },
    @{ Pattern = "-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"; Name = "Private Key" }
)

$excludeDirs = @(".git", "node_modules", ".venv", "dist", "build", "__pycache__")
$excludeExts = @(".lock", ".png", ".jpg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot")

$files = Get-ChildItem -Recurse -File | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($path -match [regex]::Escape("\$dir\")) { $skip = $true; break }
    }
    if (-not $skip -and $excludeExts -contains $_.Extension) { $skip = $true }
    -not $skip
}

$secretsFound = 0
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content) {
            foreach ($pattern in $secretPatterns) {
                if ($content -match $pattern.Pattern) {
                    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
                    Write-Host "  BLOCKER: Pattern '$($pattern.Name)' détecté dans $relativePath" -ForegroundColor Red
                    $secretsFound++
                    $script:HasBlocker = $true
                }
            }
        }
    } catch { }
}

if ($secretsFound -eq 0) {
    Write-Host "  OK: Aucun secret détecté" -ForegroundColor Green
}

# --- 3. File Size Check (>350 lines) ---
Write-Host "`n[3/3] File Size Check (>350 lines)" -ForegroundColor Yellow

$excludePatterns = @(
    "*.lock",
    "*.config.*",
    "*.code-profile",
    "*-lock.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml"
)
$excludeSizeDirs = @(".git", "node_modules", ".venv", "dist", "build", "__pycache__", "__snapshots__", "generated")

$codeFiles = Get-ChildItem -Recurse -File -Include "*.ps1","*.js","*.ts","*.jsx","*.tsx","*.py","*.md","*.json","*.yml","*.yaml" | Where-Object {
    $path = $_.FullName
    $skip = $false
    foreach ($dir in $excludeSizeDirs) {
        if ($path -match [regex]::Escape("\$dir\")) { $skip = $true; break }
    }
    foreach ($pattern in $excludePatterns) {
        if ($_.Name -like $pattern) { $skip = $true; break }
    }
    -not $skip
}

$oversizedFiles = @()
foreach ($file in $codeFiles) {
    try {
        $lineCount = (Get-Content $file.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        if ($lineCount -gt 350) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
            $oversizedFiles += @{ Path = $relativePath; Lines = $lineCount }
        }
    } catch { }
}

if ($oversizedFiles.Count -eq 0) {
    Write-Host "  OK: Tous les fichiers <= 350 lignes" -ForegroundColor Green
} else {
    foreach ($f in $oversizedFiles) {
        Write-Host "  WARNING: $($f.Path) ($($f.Lines) lignes)" -ForegroundColor DarkYellow
        $script:HasWarning = $true
    }
}

# --- Summary ---
Write-Host "`n=== Résumé ===" -ForegroundColor Cyan

if ($script:HasBlocker) {
    Write-Host "BLOCKERS détectés - Corriger avant commit" -ForegroundColor Red
    exit 1
} elseif ($script:HasWarning) {
    Write-Host "WARNINGS détectés - Revue recommandée" -ForegroundColor Yellow
    if ($FailOnWarning) { exit 1 }
    exit 0
} else {
    Write-Host "GO - Tout est conforme" -ForegroundColor Green
    exit 0
}
