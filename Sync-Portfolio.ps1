$portfolioDir = "assets/portfolio"
if (-Not (Test-Path $portfolioDir)) {
    Write-Host "Error: Could not find assets/portfolio folder."
    Pause
    Exit
}

$folders = Get-ChildItem -Path $portfolioDir -Directory

# Build Filters
$filtersHtml = '<div class="portfolio-filters-container d-flex align-items-center justify-content-center gap-2 mb-4">' + "`n"
$filtersHtml += '  <button class="filter-nav-btn filter-prev d-none"><i class="bi bi-chevron-left"></i></button>' + "`n"
$filtersHtml += '  <ul class="portfolio-filters isotope-filters mb-0" data-aos="fade-up" data-aos-delay="100">' + "`n"

# Ensure "Random" is first if it exists
$randomFolder = $folders | Where-Object { $_.Name -eq "Random" }
$otherFolders = $folders | Where-Object { $_.Name -ne "Random" } | Sort-Object Name

if ($randomFolder) {
    $filtersHtml += '            <li data-filter=".filter-random" class="filter-active">Random</li>' + "`n"
} else {
    # If no random folder, make the first one active, or just keep *
    $filtersHtml += '            <li data-filter="*" class="filter-active">All</li>' + "`n"
}

foreach ($folder in $otherFolders) {
    $filterClass = "filter-" + $folder.Name.ToLower().Replace(" ", "-").Replace("(", "").Replace(")", "")
    $filtersHtml += '            <li data-filter=".' + $filterClass + '">' + $folder.Name + '</li>' + "`n"
}
$filtersHtml += '  </ul><!-- End Portfolio Filters -->' + "`n"
$filtersHtml += '  <button class="filter-nav-btn filter-next d-none"><i class="bi bi-chevron-right"></i></button>' + "`n"
$filtersHtml += '</div><!-- End Portfolio Filters Container -->'

# Build Items
$itemsHtml = ""
foreach ($folder in $folders) {
    $filterClass = "filter-" + $folder.Name.ToLower().Replace(" ", "-").Replace("(", "").Replace(")", "")
    
    $files = Get-ChildItem -Path $folder.FullName -File
    if ($files.Count -gt 0) {
        $itemsHtml += "            <!-- ===== " + $folder.Name.ToUpper() + " ===== -->`n"
    }
    
    foreach ($file in $files) {
        $relPath = "assets/portfolio/" + $folder.Name + "/" + $file.Name
        $itemsHtml += '            <div class="col-lg-4 col-md-6 portfolio-item isotope-item ' + $filterClass + '">' + "`n"
        $itemsHtml += '              <div class="portfolio-content h-100">' + "`n"
        
        $ext = $file.Extension.ToLower()
        if ($ext -match "\.(mp4|webm|ogg)$") {
            $itemsHtml += '                <video muted playsinline preload="metadata" class="portfolio-thumb-video">' + "`n"
            $itemsHtml += '                  <source src="' + $relPath + '" type="video/mp4">' + "`n"
            $itemsHtml += '                </video>' + "`n"
            $itemsHtml += '                <div class="portfolio-info">' + "`n"
            $itemsHtml += '                  <h4>' + $folder.Name + '</h4>' + "`n"
            $itemsHtml += '                  <a href="' + $relPath + '" data-type="video" title="' + $folder.Name + '" data-gallery="portfolio-gallery-' + $filterClass.Split('-')[-1] + '" class="glightbox preview-link"><i class="bi bi-play-circle-fill"></i></a>' + "`n"
            $itemsHtml += '                </div>' + "`n"
        } else {
            $itemsHtml += '                <img src="' + $relPath + '" class="img-fluid" alt="' + $folder.Name + '">' + "`n"
            $itemsHtml += '                <div class="portfolio-info">' + "`n"
            $itemsHtml += '                  <h4>' + $folder.Name + '</h4>' + "`n"
            $itemsHtml += '                  <a href="' + $relPath + '" title="' + $folder.Name + '" data-gallery="portfolio-gallery-' + $filterClass.Split('-')[-1] + '" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>' + "`n"
            $itemsHtml += '                </div>' + "`n"
        }
        $itemsHtml += '              </div>' + "`n"
        $itemsHtml += '            </div>' + "`n`n"
    }
}

# Update index.html
$content = Get-Content "index.html" -Raw

# Replace filters
$filterStart = $content.IndexOf('<div class="portfolio-filters-container')
if ($filterStart -eq -1) {
    $filterStart = $content.IndexOf('<ul class="portfolio-filters')
}

$filterEnd = $content.IndexOf('</div><!-- End Portfolio Filters Container -->')
if ($filterEnd -eq -1) {
    $filterEnd = $content.IndexOf("</ul><!-- End Portfolio Filters -->") + 35
} else {
    $filterEnd += 46
}

$content = $content.Substring(0, $filterStart) + $filtersHtml + $content.Substring($filterEnd)

# Replace items
$containerStart = $content.IndexOf('<div class="row gy-4 isotope-container"')
$containerContentStart = $content.IndexOf(">", $containerStart) + 1
$containerEnd = $content.IndexOf("</div><!-- End Portfolio Container -->")

$content = $content.Substring(0, $containerContentStart) + "`n`n" + $itemsHtml + "          " + $content.Substring($containerEnd)

# Fix default filter
if ($randomFolder) {
    $content = $content -replace 'data-default-filter="[^"]*"', 'data-default-filter=".filter-random"'
} else {
    $content = $content -replace 'data-default-filter="[^"]*"', 'data-default-filter="*"'
}

Set-Content "index.html" $content -Encoding UTF8 -NoNewline
Write-Host "Success! Portfolio updated."
Start-Sleep -Seconds 3
