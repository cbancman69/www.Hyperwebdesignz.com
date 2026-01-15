Param(
    [Parameter(Position=0)]
    [string]$Theme = "tech-theme",
    [Switch]$List,
    [Switch]$DryRun
)

$public = Join-Path $PSScriptRoot 'public'
if (!(Test-Path $public)) {
    Write-Error "Public directory not found at $public"
    exit 1
}

if ($List) {
    Write-Output "Available theme files in: $public"
    Get-ChildItem -Path $public -Filter '*theme*.css' -File | ForEach-Object { Write-Output $_.Name }
    exit 0
}

$themeFile = Join-Path $public ("$Theme.css")
if (!(Test-Path $themeFile)) {
    Write-Error "Theme file not found: $themeFile"
    exit 1
}

$target = Join-Path $public 'styles.css'
$timestamp = (Get-Date).ToString('yyyyMMddHHmmss')
$backup = "$target.bak.$timestamp"

if ($DryRun) {
    Write-Output "Dry run: would backup '$target' to '$backup' and copy '$themeFile' -> '$target'"
    exit 0
}

if (Test-Path $target) {
    Copy-Item -Path $target -Destination $backup -Force
    Write-Output "Backed up existing styles to: $backup"
}

Copy-Item -Path $themeFile -Destination $target -Force
Write-Output "Applied theme '$Theme' to '$target'."
