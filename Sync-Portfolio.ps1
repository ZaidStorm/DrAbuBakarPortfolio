$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-Not $baseDir) { $baseDir = "." }

$portfolioDir = Join-Path $baseDir "assets/portfolio"
$indexPath = Join-Path $baseDir "index.html"
$dataJsPath = Join-Path $baseDir "assets/js/portfolio-data.js"

if (-Not (Test-Path $portfolioDir)) {
    Write-Host "Error: Could not find assets/portfolio folder."
    Pause
    Exit
}

$allFolders = Get-ChildItem -Path $portfolioDir -Directory
$folders = @()

foreach ($folder in $allFolders) {
    $files = Get-ChildItem -Path $folder.FullName -File | Where-Object { -not $_.Name.StartsWith(".") }
    if ($files.Count -gt 0) {
        $folders += $folder
    }
}

# Ensure "Random" is first if it exists
$randomFolder = $folders | Where-Object { $_.Name -eq "Random" }
$otherFolders = $folders | Where-Object { $_.Name -ne "Random" } | Sort-Object Name

$hasRandom = $null -ne $randomFolder

# Build Filters Container
$filtersHtml = '<div class="portfolio-filters-container d-flex align-items-center justify-content-center gap-2 mb-4">' + "`n"
$filtersHtml += '  <button class="filter-nav-btn filter-prev d-none"><i class="bi bi-chevron-left"></i></button>' + "`n"
$filtersHtml += '  <ul class="portfolio-filters isotope-filters mb-0" data-aos="fade-up" data-aos-delay="100">' + "`n"

if ($hasRandom) {
    $filtersHtml += '            <li data-filter=".filter-random" class="filter-active">Random</li>' + "`n"
} else {
    $filtersHtml += '            <li data-filter="*" class="filter-active">All</li>' + "`n"
}

foreach ($folder in $otherFolders) {
    $filterClass = "filter-" + $folder.Name.ToLower().Replace(" ", "-").Replace("(", "").Replace(")", "")
    $filtersHtml += '            <li data-filter=".' + $filterClass + '">' + $folder.Name + '</li>' + "`n"
}
$filtersHtml += '  </ul><!-- End Portfolio Filters -->' + "`n"
$filtersHtml += '  <button class="filter-nav-btn filter-next d-none"><i class="bi bi-chevron-right"></i></button>' + "`n"
$filtersHtml += '</div><!-- End Portfolio Filters Container -->'

# Build JSON list of items
$orderedFolders = @()
if ($hasRandom) {
    $orderedFolders += $randomFolder
}
$orderedFolders += $otherFolders

$portfolioItems = @()

foreach ($folder in $orderedFolders) {
    $filterClass = "filter-" + $folder.Name.ToLower().Replace(" ", "-").Replace("(", "").Replace(")", "")
    $gallery = "portfolio-gallery-" + $filterClass.Split("-")[-1]
    
    $files = Get-ChildItem -Path $folder.FullName -File | Where-Object { -not $_.Name.StartsWith(".") } | Sort-Object Name
    
    foreach ($file in $files) {
        $relPath = "assets/portfolio/" + $folder.Name + "/" + $file.Name
        $isVideo = $file.Extension.ToLower() -match "\.(mp4|webm|ogg)$"
        $type = if ($isVideo) { "video" } else { "image" }
        
        $item = [PSCustomObject]@{
            classes = $filterClass
            type    = $type
            src     = $relPath
            title   = $folder.Name
            link    = $relPath
            gallery = $gallery
        }
        $portfolioItems += $item
    }
}

# Convert to JSON and save to JS file
$json = $portfolioItems | ConvertTo-Json -Depth 5
$jsContent = "// Automatically generated portfolio items data`nconst portfolioItems = " + $json + ";"
Set-Content -Path $dataJsPath -Value $jsContent -Encoding UTF8

Write-Host "Successfully wrote $($portfolioItems.Count) items to $dataJsPath"

# Update index.html
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw
    
    # 1. Replace filters
    $filterStart = $content.IndexOf('<div class="portfolio-filters-container')
    if ($filterStart -eq -1) {
        $filterStart = $content.IndexOf('<ul class="portfolio-filters')
    }
    
    $filterEnd = $content.IndexOf('</div><!-- End Portfolio Filters Container -->')
    if ($filterEnd -eq -1) {
        $filterEnd = $content.IndexOf("</ul><!-- End Portfolio Filters -->")
        if ($filterEnd -ne -1) { $filterEnd += 35 }
    } else {
        $filterEnd += 46
    }
    
    if ($filterStart -ne -1 -and $filterEnd -ne -1) {
        $content = $content.Substring(0, $filterStart) + $filtersHtml + $content.Substring($filterEnd)
    }
    
    # 2. Empty container
    $containerStart = $content.IndexOf('<div class="row gy-4 isotope-container"')
    if ($containerStart -ne -1) {
        $containerContentStart = $content.IndexOf(">", $containerStart) + 1
        $containerEnd = $content.IndexOf("</div><!-- End Portfolio Container -->")
        if ($containerEnd -ne -1) {
            $content = $content.Substring(0, $containerContentStart) + "`n`n          " + $content.Substring($containerEnd)
        }
    }
    
    # 3. Default filter
    if ($hasRandom) {
        $content = $content -replace 'data-default-filter="[^"]*"', 'data-default-filter=".filter-random"'
    } else {
        $content = $content -replace 'data-default-filter="[^"]*"', 'data-default-filter="*"'
    }
    
    Set-Content $indexPath $content -Encoding UTF8 -NoNewline
    Write-Host "Success! index.html updated."
} else {
    Write-Host "Warning: Could not find index.html to update."
}

Start-Sleep -Seconds 2
