[CmdletBinding()]
param(
    [string]$RepositoryName = "daycraft-planner",
    [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Windows PowerShell 5.1 needs explicit UTF-8 console settings.
try {
    [Console]::InputEncoding = New-Object System.Text.UTF8Encoding($false)
    [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    $OutputEncoding = [Console]::OutputEncoding
} catch {}

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Description = "아이들이 직접 만들고 꾸미고 공유하는 생활계획표 스튜디오 · PNG/WebP/SVG/PDF 출력 · 편집 가능한 공유 링크 · GitHub Pages"
$Topics = @(
    "kids", "planner", "schedule", "education", "github-pages",
    "pwa", "svg", "pdf", "vanilla-javascript", "korean"
)

function Write-Step([string]$Message) {
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Write-Ok([string]$Message) {
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Find-Executable {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [string[]]$KnownPaths = @()
    )

    $found = Get-Command $Command -ErrorAction SilentlyContinue
    if ($found) { return $found.Source }

    foreach ($path in $KnownPaths) {
        if ($path -and (Test-Path $path)) { return $path }
    }
    return $null
}

function Ensure-WingetPackage {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [Parameter(Mandatory = $true)][string]$PackageId,
        [Parameter(Mandatory = $true)][string]$DisplayName,
        [string[]]$KnownPaths = @()
    )

    $exe = Find-Executable -Command $Command -KnownPaths $KnownPaths
    if ($exe) { return $exe }

    $winget = Find-Executable -Command "winget.exe"
    if (-not $winget) {
        throw "$DisplayName is not installed and winget was not found. Install $DisplayName and run this file again."
    }

    Write-Step "Installing $DisplayName"
    & $winget install --id $PackageId -e --source winget --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) { throw "Failed to install $DisplayName automatically." }

    Start-Sleep -Seconds 2
    $exe = Find-Executable -Command $Command -KnownPaths $KnownPaths
    if (-not $exe) {
        throw "$DisplayName was installed, but this window cannot see it yet. Close this window and run 배포하기.cmd again."
    }
    return $exe
}

function Run {
    param(
        [Parameter(Mandatory = $true)][string]$Exe,
        [Parameter(ValueFromRemainingArguments = $true)][string[]]$NativeArgs
    )
    & $Exe @NativeArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed: $Exe $($NativeArgs -join ' ')"
    }
}

function Get-OwnedRepoExists {
    param(
        [Parameter(Mandatory = $true)][string]$Gh,
        [Parameter(Mandatory = $true)][string]$Owner,
        [Parameter(Mandatory = $true)][string]$RepositoryName
    )

    # Important: do not probe a missing repo with `gh repo view` under
    # ErrorActionPreference=Stop. A normal 404 can terminate Windows PowerShell.
    $json = & $Gh repo list $Owner --limit 1000 --json name
    if ($LASTEXITCODE -ne 0) { throw "Could not list repositories for $Owner." }
    if (-not $json) { return $false }

    $items = $json | ConvertFrom-Json
    return [bool]($items | Where-Object { $_.name -eq $RepositoryName } | Select-Object -First 1)
}

try {
    Set-Location $ProjectRoot
    Write-Host "DayCraft Planner - GitHub automatic deployment" -ForegroundColor Yellow
    Write-Host "Project: $ProjectRoot"

    $Git = Ensure-WingetPackage -Command "git.exe" -PackageId "Git.Git" -DisplayName "Git" -KnownPaths @(
        "$env:ProgramFiles\Git\cmd\git.exe",
        "${env:ProgramFiles(x86)}\Git\cmd\git.exe"
    )

    $Gh = Ensure-WingetPackage -Command "gh.exe" -PackageId "GitHub.cli" -DisplayName "GitHub CLI" -KnownPaths @(
        "$env:ProgramFiles\GitHub CLI\gh.exe",
        "${env:ProgramFiles(x86)}\GitHub CLI\gh.exe"
    )

    Write-Step "Checking GitHub login"
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & $Gh auth status --hostname github.com
    $authOk = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $oldEap

    if (-not $authOk) {
        Write-Host "A GitHub login page will open. Complete the official browser login." -ForegroundColor Yellow
        Run $Gh auth login --hostname github.com --git-protocol https --web
    }
    Write-Ok "GitHub authentication is ready"

    $Owner = (& $Gh api user --jq .login).Trim()
    if (-not $Owner) { throw "Could not determine the GitHub account name." }

    $Repo = "$Owner/$RepositoryName"
    $RepoUrl = "https://github.com/$Repo"
    $PagesUrl = "https://$Owner.github.io/$RepositoryName/"

    Write-Step "Updating project links for $Repo"
    $readmePath = Join-Path $ProjectRoot "README.md"
    if (Test-Path $readmePath) {
        $readme = Get-Content $readmePath -Raw -Encoding UTF8
        $readme = $readme.Replace("https://github.com/USERNAME/daycraft-planner.git", "$RepoUrl.git")
        $readme = $readme.Replace("https://USERNAME.github.io/daycraft-planner/", $PagesUrl)
        Set-Content $readmePath $readme -Encoding UTF8
    }

    Write-Step "Preparing local Git repository"
    if (-not (Test-Path (Join-Path $ProjectRoot ".git"))) { Run $Git init }
    Run $Git branch -M main

    $gitName = (& $Git config --get user.name 2>$null)
    if (-not $gitName) { Run $Git config user.name $Owner }
    $gitEmail = (& $Git config --get user.email 2>$null)
    if (-not $gitEmail) { Run $Git config user.email "$Owner@users.noreply.github.com" }

    Write-Step "Checking whether $Repo already exists"
    $RepoExists = Get-OwnedRepoExists -Gh $Gh -Owner $Owner -RepositoryName $RepositoryName
    if (-not $RepoExists) {
        Write-Host "Creating new $Visibility repository: $Repo" -ForegroundColor Yellow
        $createArgs = @("repo", "create", $Repo, "--$Visibility", "--description", $Description, "--homepage", $PagesUrl)
        Run $Gh @createArgs
        Write-Ok "Repository created"
    } else {
        Write-Ok "Using existing repository: $Repo"
    }

    # Check remote names with a command that succeeds even when origin is absent.
    $remoteNames = @(& $Git remote)
    if ($LASTEXITCODE -ne 0) { throw "Could not inspect local Git remotes." }
    if ($remoteNames -notcontains "origin") {
        Run $Git remote add origin "$RepoUrl.git"
    } else {
        $originUrl = (& $Git remote get-url origin).Trim()
        if ($LASTEXITCODE -ne 0) { throw "Could not read the origin remote URL." }
        if ($originUrl -ne "$RepoUrl.git") {
            Write-Host "Updating origin to $RepoUrl.git" -ForegroundColor Yellow
            Run $Git remote set-url origin "$RepoUrl.git"
        }
    }

    Write-Step "Creating commit"
    Run $Git add -A
    & $Git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        Run $Git commit -m "feat: launch DayCraft planner studio"
        Write-Ok "Commit created"
    } else {
        Write-Ok "No new changes to commit"
    }

    Write-Step "Pushing main branch to GitHub"
    & $Git push -u origin main
    if ($LASTEXITCODE -ne 0) {
        throw "Push failed. If the remote repository already contains unrelated commits, this script will not force-push over them."
    }
    Write-Ok "main branch pushed"

    Write-Step "Configuring repository About and Topics"
    $editArgs = @(
        "repo", "edit", $Repo,
        "--description", $Description,
        "--homepage", $PagesUrl,
        "--enable-issues=true",
        "--enable-wiki=false"
    )
    foreach ($topic in $Topics) { $editArgs += @("--add-topic", $topic) }
    Run $Gh @editArgs
    Write-Ok "About, homepage and Topics configured"

    Write-Step "Enabling GitHub Pages with GitHub Actions"
    # At this point the repository definitely exists. Query repo metadata instead
    # of intentionally requesting a possibly missing /pages endpoint (404).
    $hasPagesText = (& $Gh api "repos/$Repo" --jq '.has_pages').Trim()
    $hasPages = ($hasPagesText -eq "true")

    if ($hasPages) {
        & $Gh api --method PUT "repos/$Repo/pages" -f build_type=workflow 1>$null
        if ($LASTEXITCODE -ne 0) { throw "Could not switch Pages to GitHub Actions." }
    } else {
        & $Gh api --method POST "repos/$Repo/pages" -f build_type=workflow 1>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Could not enable GitHub Pages. Open $RepoUrl/settings/pages once, or run: gh auth refresh -h github.com -s repo,workflow"
        }
    }
    Write-Ok "Pages source is GitHub Actions"

    Write-Step "Starting / checking Pages deployment workflow"
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    & $Gh workflow run deploy.yml --repo $Repo
    $dispatchOk = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $oldEap
    if (-not $dispatchOk) {
        Write-Host "Manual dispatch was not available yet; checking the run started by the push." -ForegroundColor Yellow
    }

    Start-Sleep -Seconds 5
    $runJson = & $Gh run list --repo $Repo --workflow deploy.yml --limit 1 --json databaseId,status,conclusion,url,createdAt
    if ($LASTEXITCODE -eq 0 -and $runJson) {
        $run = $runJson | ConvertFrom-Json | Select-Object -First 1
        if ($run -and $run.databaseId) {
            Write-Host "Actions: $($run.url)"
            & $Gh run watch $run.databaseId --repo $Repo --exit-status
            if ($LASTEXITCODE -ne 0) { throw "GitHub Actions deployment failed. Open the Actions URL above for details." }
            Write-Ok "GitHub Actions deployment succeeded"
        }
    }

    $actualPagesUrl = $PagesUrl
    $oldEap = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $pageValue = & $Gh api "repos/$Repo/pages" --jq .html_url 2>$null
    if ($LASTEXITCODE -eq 0 -and $pageValue) { $actualPagesUrl = $pageValue.Trim() }
    $ErrorActionPreference = $oldEap

    $resultText = @"
DayCraft GitHub deployment complete

Repository: $RepoUrl
GitHub Pages: $actualPagesUrl
Actions: $RepoUrl/actions
Settings / Pages: $RepoUrl/settings/pages

Deployment time: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
    Set-Content (Join-Path $ProjectRoot "DEPLOY_RESULT.txt") $resultText -Encoding UTF8

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " Deployment completed successfully" -ForegroundColor Green
    Write-Host " Repository : $RepoUrl" -ForegroundColor Green
    Write-Host " GitHub Pages: $actualPagesUrl" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green

    Start-Process $RepoUrl
    Start-Process $actualPagesUrl
}
catch {
    Write-Host ""
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can safely run 배포하기.cmd again after fixing the issue." -ForegroundColor Yellow
    exit 1
}
finally {
    Set-Location $ProjectRoot
}
