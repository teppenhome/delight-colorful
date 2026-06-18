Add-Type -AssemblyName System.Drawing

function Save-ArrowPng {
  param(
    [string]$Path,
    [bool]$PointLeft
  )

  $width = 32
  $height = 42
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 52, 52, 52)), 2
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

  if ($PointLeft) {
    $points = @(
      [System.Drawing.PointF]::new(9, 21),
      [System.Drawing.PointF]::new(24, 9),
      [System.Drawing.PointF]::new(24, 33)
    )
  }
  else {
    $points = @(
      [System.Drawing.PointF]::new(23, 21),
      [System.Drawing.PointF]::new(8, 9),
      [System.Drawing.PointF]::new(8, 33)
    )
  }

  $graphics.FillPolygon($brush, $points)
  $graphics.DrawPolygon($pen, $points)
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $graphics.Dispose()
  $bitmap.Dispose()
}

$base = Join-Path $PSScriptRoot "..\images"
Save-ArrowPng (Join-Path $base "works-slider-arrow-prev.png") $true
Save-ArrowPng (Join-Path $base "works-slider-arrow-next.png") $false

Write-Output "Created placeholder PNG arrows in images/"
