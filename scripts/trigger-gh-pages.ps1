param(
    [string]$Repo = 'cbancman69/www.Hyperwebdesignz.com',
    [string]$Ref = 'master'
)

if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "gh CLI not found. Please install GitHub CLI and authenticate (gh auth login)." -ForegroundColor Yellow
    exit 2
}

Write-Host "Triggering workflow 'gh-pages.yml' for repository $Repo on ref $Ref..."
gh workflow run gh-pages.yml --repo $Repo --ref $Ref
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to trigger workflow with gh CLI. You can use DEPLOY_INSTRUCTIONS.md for alternatives." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "Workflow dispatch requested. Check Actions tab in GitHub to follow progress." -ForegroundColor Green
