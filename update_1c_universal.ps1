<#
.SYNOPSIS
  Unattended 1C config update on 192.168.80.15. ASCII-safe (no Cyrillic literals).
  Sequential: one 1cv8 per IB. No DumpConfigToFiles (hangs). Identity via COM.
  UpdateCfg via ProcessStartInfo so /UpdateCfg is not dropped.
  Legality via COM (checkbox UI is unreliable). Close leftover 1cv8 after handlers.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)][string]$Srvr,
  [Parameter(Mandatory)][string]$Ref,
  [Parameter(Mandatory)][string]$User,
  [Parameter(Mandatory)][string]$Password,
  [string]$Platform = 'C:\Program Files\1cv8\8.3.27.2214\bin\1cv8.exe',
  [string]$UpdatesRoot = '',
  [string]$Tmplts = 'C:\zup_tmplts',
  [string]$LogDir = 'C:\temp',
  [string]$TargetVersion = '',
  [string]$ConfigName = '',
  [string]$CurrentVersion = '',
  [switch]$SkipBackup,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::GetEncoding(1251)

function U([int[]]$codes) { return -join ($codes | ForEach-Object { [char]$_ }) }

$script:HandlerProcedureName = U @(0x0417,0x0430,0x043F,0x0443,0x0441,0x0442,0x0438,0x0442,0x044C,0x041E,0x0431,0x043D,0x043E,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x0418,0x043D,0x0444,0x043E,0x0440,0x043C,0x0430,0x0446,0x0438,0x043E,0x043D,0x043D,0x043E,0x0439,0x0411,0x0430,0x0437,0x044B)
$NameZup = U @(0x0417,0x0430,0x0440,0x043F,0x043B,0x0430,0x0442,0x0430,0x0418,0x0423,0x043F,0x0440,0x0430,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x041F,0x0435,0x0440,0x0441,0x043E,0x043D,0x0430,0x043B,0x043E,0x043C)
$NameZupCorp = U @(0x0417,0x0430,0x0440,0x043F,0x043B,0x0430,0x0442,0x0430,0x0418,0x0423,0x043F,0x0440,0x0430,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x041F,0x0435,0x0440,0x0441,0x043E,0x043D,0x0430,0x043B,0x043E,0x043C,0x041A,0x041E,0x0420,0x041F)
$NameBp = U @(0x0411,0x0443,0x0445,0x0433,0x0430,0x043B,0x0442,0x0435,0x0440,0x0438,0x044F,0x041F,0x0440,0x0435,0x0434,0x043F,0x0440,0x0438,0x044F,0x0442,0x0438,0x044F)
$NameBpCorp = U @(0x0411,0x0443,0x0445,0x0433,0x0430,0x043B,0x0442,0x0435,0x0440,0x0438,0x044F,0x041F,0x0440,0x0435,0x0434,0x043F,0x0440,0x0438,0x044F,0x0442,0x0438,0x044F,0x041A,0x041E,0x0420,0x041F)
$Meta = U @(0x041C,0x0435,0x0442,0x0430,0x0434,0x0430,0x043D,0x043D,0x044B,0x0435)
$VerProp = U @(0x0412,0x0435,0x0440,0x0441,0x0438,0x044F)
$NameProp = U @(0x0418,0x043C,0x044F)
$ModSluzh = U @(0x041E,0x0431,0x043D,0x043E,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x0418,0x043D,0x0444,0x043E,0x0440,0x043C,0x0430,0x0446,0x0438,0x043E,0x043D,0x043D,0x043E,0x0439,0x0411,0x0430,0x0437,0x044B,0x0421,0x043B,0x0443,0x0436,0x0435,0x0431,0x043D,0x044B,0x0439)
$FnLegal = U @(0x0417,0x0430,0x043F,0x0438,0x0441,0x0430,0x0442,0x044C,0x041F,0x043E,0x0434,0x0442,0x0432,0x0435,0x0440,0x0436,0x0434,0x0435,0x043D,0x0438,0x0435,0x041B,0x0435,0x0433,0x0430,0x043B,0x044C,0x043D,0x043E,0x0441,0x0442,0x0438,0x041F,0x043E,0x043B,0x0443,0x0447,0x0435,0x043D,0x0438,0x044F,0x041E,0x0431,0x043D,0x043E,0x0432,0x043B,0x0435,0x043D,0x0438,0x0439)
$ModIb = U @(0x041E,0x0431,0x043D,0x043E,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x0418,0x043D,0x0444,0x043E,0x0440,0x043C,0x0430,0x0446,0x0438,0x043E,0x043D,0x043D,0x043E,0x0439,0x0411,0x0430,0x0437,0x044B)
$FnNeedUpd = U @(0x041D,0x0435,0x043E,0x0431,0x0445,0x043E,0x0434,0x0438,0x043C,0x043E,0x041E,0x0431,0x043D,0x043E,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x0418,0x043D,0x0444,0x043E,0x0440,0x043C,0x0430,0x0446,0x0438,0x043E,0x043D,0x043D,0x043E,0x0439,0x0411,0x0430,0x0437,0x044B)
$FnDeferredDone = U @(0x041E,0x0442,0x043B,0x043E,0x0436,0x0435,0x043D,0x043D,0x043E,0x0435,0x041E,0x0431,0x043D,0x043E,0x0432,0x043B,0x0435,0x043D,0x0438,0x0435,0x0417,0x0430,0x0432,0x0435,0x0440,0x0448,0x0435,0x043D,0x043E)

function Write-Log([string]$Message) {
  $line = '[{0}] {1}' -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Message
  Add-Content -LiteralPath $script:LogFile -Value $line -Encoding UTF8
  Write-Host $line
}

function Resolve-UpdatesRoot {
  if ($UpdatesRoot -and (Test-Path -LiteralPath $UpdatesRoot)) { return $UpdatesRoot }
  $found = Get-ChildItem 'D:\' -Directory -ErrorAction SilentlyContinue |
    Where-Object {
      (Test-Path (Join-Path $_.FullName 'ZUP_3.1.38.69')) -or
      (Test-Path (Join-Path $_.FullName 'ZUP_3.1.38.92')) -or
      (Test-Path (Join-Path $_.FullName 'BP_3.0.205.17')) -or
      (Test-Path (Join-Path $_.FullName 'BP_3.0.206.19'))
    } |
    Select-Object -First 1
  if (-not $found) { throw 'UpdatesRoot not found on D:\' }
  return $found.FullName
}

function Get-1CProcessesForThisIB {
  Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.Name -match '^1cv8(c)?\.exe$' -and $_.CommandLine -and
    ($_.CommandLine -like "*$Srvr*") -and ($_.CommandLine -like "*$Ref*")
  }
}

function Stop-ThisIB {
  $ours = @(Get-1CProcessesForThisIB)
  foreach ($p in $ours) {
    Write-Log ("Closing 1C window pid=$($p.ProcessId) name=$($p.Name)")
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep 1
  $left = @(Get-1CProcessesForThisIB)
  foreach ($p in $left) {
    Write-Log ("Force-kill leftover pid=$($p.ProcessId)")
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

function Wait-For1CIdle {
  param([int]$TimeoutSec = 600, [int]$PollSec = 5)
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    $ours = @(Get-1CProcessesForThisIB)
    if ($ours.Count -eq 0) { return }
    Write-Log ("Waiting exclusive: $($ours.Count) 1cv8 for $Ref")
    Start-Sleep $PollSec
  }
  Write-Log 'Leftover 1cv8 for this IB - closing so update can continue'
  Stop-ThisIB
}

function Get-ComIb {
  $conn = 'Srvr="{0}";Ref="{1}";Usr="{2}";Pwd="{3}";' -f $Srvr, $Ref, $User, $Password
  $c = New-Object -ComObject V83.COMConnector
  return $c.Connect($conn)
}

function Get-ComProp($obj, [string]$name) {
  return [System.__ComObject].InvokeMember($name, [System.Reflection.BindingFlags]::GetProperty, $null, $obj, $null)
}

function Invoke-ComMethod($obj, [string]$name) {
  return [System.__ComObject].InvokeMember($name, [System.Reflection.BindingFlags]::InvokeMethod, $null, $obj, $null)
}

function Set-ScheduledJobsDenied {
  param([bool]$Deny)
  Write-Log ("Set ScheduledJobsDenied=$Deny via cluster COM")
  try {
    $c = New-Object -ComObject V83.COMConnector
    $agent = $c.ConnectAgent($Srvr)
    $cluster = @($agent.GetClusters())[0]
    $agent.Authenticate($cluster,'','')
    $wp0 = @($agent.GetWorkingProcesses($cluster)) | Where-Object { $_.Running -eq 1 } | Select-Object -First 1
    $wp = $c.ConnectWorkingProcess(('{0}:{1}' -f $wp0.HostName, $wp0.MainPort))
    $wp.AuthenticateAdmin('','')
    try { $wp.AddAuthentication($User, $Password) } catch { Write-Log ('AddAuthentication: ' + $_.Exception.Message) }
    $found = $false
    foreach ($ib in @($wp.GetInfoBases())) {
      if ($ib.Name -ne $Ref) { continue }
      $found = $true
      $ib.ScheduledJobsDenied = $Deny
      $wp.UpdateInfoBase($ib)
      Write-Log ("IB $($ib.Name) ScheduledJobsDenied=$Deny applied")
      try {
        foreach ($cn in @($wp.GetInfoBaseConnections($ib))) {
          $app = [string]$cn.AppID
          if ($app -match 'BackgroundJob|JobScheduler|COMConsole') {
            Write-Log ("Disconnect session=$($cn.SessionNumber) App=$app")
            try { $wp.Disconnect($cn) } catch { Write-Log ('Disconnect: ' + $_.Exception.Message) }
          }
        }
      } catch { Write-Log ('GetInfoBaseConnections: ' + $_.Exception.Message) }
    }
    if (-not $found) { Write-Log "IB $Ref not found in cluster" }
  } catch {
    Write-Log ('Set-ScheduledJobsDenied failed: ' + $_.Exception.Message)
  }
}

function Test-IbHandlersFinished {
  try {
    $ib = Get-ComIb
    $mod = Get-ComProp $ib $ModIb
    $need = Invoke-ComMethod $mod $FnNeedUpd
    if ($need) {
      Write-Log 'COM: IB update still required'
      return $false
    }
    try {
      $defDone = Invoke-ComMethod $mod $FnDeferredDone
      if ($defDone -eq $false) {
        Write-Log 'COM: deferred update not finished'
        return $false
      }
    } catch {
      Write-Log ('COM deferred check: ' + $_.Exception.Message)
    }
    Write-Log 'COM: IB + deferred update finished'
    return $true
  } catch {
    Write-Log ('COM handlers-finished check: ' + $_.Exception.Message)
    return $false
  }
}

function Confirm-Legality {
  Write-Log 'COM: write update-legality confirmation (no UI click)'
  try {
    $ib = Get-ComIb
    $mod = Get-ComProp $ib $ModSluzh
    Invoke-ComMethod $mod $FnLegal | Out-Null
    Write-Log 'LEGALITY_OK COM'
  } catch {
    Write-Log ('COM legality failed: ' + $_.Exception.Message)
  }
}

function Get-ConfigIdentity {
  if ($ConfigName -and $CurrentVersion) {
    return [pscustomobject]@{ Name = $ConfigName; Version = $CurrentVersion }
  }
  Write-Log 'Detect identity via COM (no DumpConfigToFiles)'
  $ib = Get-ComIb
  $md = Get-ComProp $ib $Meta
  $n = [string](Get-ComProp $md $NameProp)
  $v = [string](Get-ComProp $md $VerProp)
  Write-Log ("COM Name=$n Version=$v")
  if (-not $n -or -not $v) { throw 'COM identity empty: Name/Version not read' }
  return [pscustomobject]@{ Name = $n; Version = $v }
}

function Invoke-1C {
  param(
    [string[]]$ArgList,
    [string]$OutLog,
    [int]$TimeoutSec = 21600,
    [ValidateSet('Designer','Enterprise')]$Kind = 'Designer'
  )
  Wait-For1CIdle
  if (Test-Path -LiteralPath $OutLog) { Remove-Item -LiteralPath $OutLog -Force -ErrorAction SilentlyContinue }
  $argStr = ($ArgList + @("/Out`"$OutLog`"")) -join ' '
  Write-Log ("1cv8 $argStr")
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $Platform
  $psi.Arguments = $argStr
  $psi.UseShellExecute = $false
  $proc = [System.Diagnostics.Process]::Start($psi)
  Start-Sleep 2
  $cl = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)" -EA SilentlyContinue).CommandLine
  Write-Log ("cmdline=$cl")
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  $idle = 0
  $lastCpu = -1
  while (-not $proc.HasExited) {
    if ((Get-Date) -gt $deadline) {
      Write-Log 'timeout - closing this IB 1cv8'
      Stop-ThisIB
      break
    }
    $txt = ''
    if (Test-Path -LiteralPath $OutLog) {
      $txt = Get-Content -LiteralPath $OutLog -Raw -Encoding Default -ErrorAction SilentlyContinue
    }
    if ($Kind -eq 'Designer' -and $txt -match 'успешно завершено') {
      Write-Log 'Designer success in log - close 1cv8'
      Start-Sleep 2
      Stop-ThisIB
      break
    }
    $proc.Refresh()
    $cpu = $proc.TotalProcessorTime.TotalSeconds
    if ($cpu -eq $lastCpu) { $idle++ } else { $idle = 0 }
    $lastCpu = $cpu
    if ($Kind -eq 'Enterprise' -and $idle -ge 2) {
      if (Test-IbHandlersFinished) {
        Write-Log 'Enterprise: handlers finished by COM - close 1C window'
        Confirm-Legality
        Start-Sleep 1
        Stop-ThisIB
        return 0
      }
    }
    if ($Kind -eq 'Designer' -and $idle -ge 20 -and -not $txt) {
      Write-Log 'Designer idle empty log - abort this step'
      Stop-ThisIB
      return 1
    }
    Start-Sleep 15
  }
  Start-Sleep 1
  if (Test-Path -LiteralPath $OutLog) {
    Get-Content -LiteralPath $OutLog -Encoding Default -EA SilentlyContinue | Select-Object -Last 30 | ForEach-Object { Write-Log ("OUT: " + $_) }
  }
  if ($Kind -eq 'Designer' -and (Test-Path -LiteralPath $OutLog)) {
    $raw = Get-Content -LiteralPath $OutLog -Raw -Encoding Default -EA SilentlyContinue
    if ($raw -match 'успешно завершено') {
      Stop-ThisIB
      return 0
    }
  }
  Stop-ThisIB
  if ($proc.HasExited) { return [int]$proc.ExitCode }
  return 0
}

function Get-VerDir([string]$ver) { return ($ver -replace '\.', '_') }

function Invoke-IBHandlers {
  param([string]$Ver)
  Confirm-Legality
  $hLog = Join-Path $LogDir ("handlers_{0}_{1}.log" -f $Ref, (Get-VerDir $Ver))
  $argsE = @('ENTERPRISE',"/S$Srvr\$Ref","/N$User","/P$Password",'/DisableStartupDialogs',('/C' + $script:HandlerProcedureName))
  $hc = Invoke-1C -ArgList $argsE -OutLog $hLog -Kind Enterprise
  Stop-ThisIB
  if ($hc -eq 0) { return 0 }
  $raw = ''
  if (Test-Path -LiteralPath $hLog) { $raw = Get-Content -LiteralPath $hLog -Raw -Encoding Default }
  if ($raw -match '\{(EF_\d+)') {
    $ext = $Matches[1]
    Write-Log "Handlers failed on $ext - DeleteCfg then one retry"
    $delLog = Join-Path $LogDir ("delete_{0}_{1}.log" -f $Ref, $ext)
    $dc = Invoke-1C -ArgList @('DESIGNER',"/S$Srvr\$Ref","/N$User","/P$Password",'/DisableStartupDialogs','/DisableStartupMessages','/DeleteCfg','-Extension',$ext) -OutLog $delLog -Kind Designer
    if ($dc -ne 0) { return $hc }
    Confirm-Legality
    $hc2 = Invoke-1C -ArgList $argsE -OutLog ($hLog + '.retry') -Kind Enterprise
    Stop-ThisIB
    return $hc2
  }
  return $hc
}

function ConvertTo-VersionObject([string]$v) {
  $parts = @(($v -split '\.') | ForEach-Object { [int]$_ })
  while ($parts.Count -lt 4) { $parts += 0 }
  return [version](($parts[0..3] -join '.'))
}

$ProductCatalog = @{
  $NameZup = @{ Prefix = 'ZUP'; TmpltsRel = '1c\hrm'; Chain = @('3.1.34.107','3.1.34.145','3.1.34.177','3.1.34.228','3.1.34.276','3.1.34.295','3.1.34.317','3.1.34.332','3.1.38.18','3.1.38.40','3.1.38.41','3.1.38.69','3.1.38.92') }
  $NameZupCorp = @{ Prefix = 'ZUP'; TmpltsRel = '1c\hrmcorp'; Chain = @('3.1.34.107','3.1.34.145','3.1.34.177','3.1.34.228','3.1.34.276','3.1.34.295','3.1.34.317','3.1.34.332','3.1.38.18','3.1.38.40','3.1.38.41','3.1.38.69','3.1.38.92') }
  $NameBp = @{ Prefix = 'BP'; TmpltsRel = '1c\Accounting'; Chain = @('3.0.195.40','3.0.196.21','3.0.200.23','3.0.202.14','3.0.203.24','3.0.204.22','3.0.205.17','3.0.205.22','3.0.206.19') }
  $NameBpCorp = @{ Prefix = 'BP'; TmpltsRel = '1c\AccountingCorp'; Chain = @('3.0.195.40','3.0.196.21','3.0.200.23','3.0.202.14','3.0.203.24','3.0.204.22','3.0.205.17','3.0.205.22','3.0.206.19') }
}

function Ensure-Cfu {
  param([string]$Ver, [string]$Prefix, [string]$TmpltsRel)
  $verDir = Get-VerDir $Ver
  $cfu = Join-Path $Tmplts (Join-Path $TmpltsRel (Join-Path $verDir '1cv8.cfu'))
  if (Test-Path -LiteralPath $cfu) { return $cfu }
  $pkgDir = Join-Path $UpdatesRoot ("{0}_{1}" -f $Prefix, $Ver)
  $zip = Get-ChildItem -LiteralPath $pkgDir -Filter '*updsetup.zip' -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $zip) { throw "No CFU and no updsetup.zip for $Prefix $Ver under $pkgDir" }
  $extract = Join-Path $pkgDir 'extracted_universal'
  if (Test-Path -LiteralPath $extract) { Remove-Item -LiteralPath $extract -Recurse -Force }
  New-Item -ItemType Directory -Path $extract -Force | Out-Null
  Write-Log "Expand $($zip.FullName)"
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [System.IO.Compression.ZipFile]::ExtractToDirectory($zip.FullName, $extract)
  $cfgPaths = @(
    (Join-Path $env:APPDATA '1C\1CEStart\1cestart.cfg'),
    'C:\Windows\SysWOW64\config\systemprofile\AppData\Roaming\1C\1CEStart\1cestart.cfg',
    'C:\Windows\System32\config\systemprofile\AppData\Roaming\1C\1CEStart\1cestart.cfg'
  )
  foreach ($cfgPath in $cfgPaths) {
    New-Item -ItemType Directory -Path (Split-Path $cfgPath) -Force | Out-Null
    Set-Content -LiteralPath $cfgPath -Value "ConfigurationTemplatesLocation=$Tmplts" -Encoding ASCII
  }
  $setup = Join-Path $extract 'setup.exe'
  $sp = Start-Process -FilePath $setup -ArgumentList '/s' -WorkingDirectory $extract -Wait -PassThru
  Write-Log ("setup exit=" + $sp.ExitCode)
  $searchRoots = @(
    $Tmplts,
    'C:\Windows\SysWOW64\config\systemprofile\AppData\Roaming\1C\1cv8\tmplts',
    'C:\Windows\System32\config\systemprofile\AppData\Roaming\1C\1cv8\tmplts'
  )
  $found = $null
  foreach ($root in $searchRoots) {
    if (-not (Test-Path -LiteralPath $root)) { continue }
    $found = Get-ChildItem -LiteralPath $root -Recurse -Filter '1cv8.cfu' -EA SilentlyContinue |
      Where-Object { $_.Directory.Name -eq $verDir } | Select-Object -First 1
    if ($found) { break }
  }
  if ($found) {
    $destDir = Split-Path $cfu
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $found.Directory.FullName '*') -Destination $destDir -Force
    Write-Log ("CFU copied from $($found.Directory.FullName)")
  }
  if (-not (Test-Path -LiteralPath $cfu)) { throw "CFU not installed for $Ver" }
  return $cfu
}

function Get-RemainingChain {
  param($Product, [string]$CurrentVersion, [string]$WantTarget)
  $cur = ConvertTo-VersionObject $CurrentVersion
  $chain = @($Product.Chain)
  if ($WantTarget) {
    $tgt = ConvertTo-VersionObject $WantTarget
    $chain = @($chain | Where-Object { (ConvertTo-VersionObject $_) -le $tgt })
  }
  $steps = @()
  $latest = $chain[-1]
  foreach ($v in $chain) {
    if ((ConvertTo-VersionObject $v) -le $cur) { continue }
    $pkg = Join-Path $UpdatesRoot ("{0}_{1}" -f $Product.Prefix, $v)
    $cfuGuess = Join-Path $Tmplts (Join-Path $Product.TmpltsRel (Join-Path (Get-VerDir $v) '1cv8.cfu'))
    if ((Test-Path -LiteralPath $pkg) -or (Test-Path -LiteralPath $cfuGuess)) { $steps += $v }
    else { Write-Log "SKIP missing intermediate package: $v" }
  }
  if ((ConvertTo-VersionObject $cur) -lt (ConvertTo-VersionObject $latest)) {
    $latestPkg = Join-Path $UpdatesRoot ("{0}_{1}" -f $Product.Prefix, $latest)
    $latestCfu = Join-Path $Tmplts (Join-Path $Product.TmpltsRel (Join-Path (Get-VerDir $latest) '1cv8.cfu'))
    if (-not ((Test-Path -LiteralPath $latestPkg) -or (Test-Path -LiteralPath $latestCfu))) {
      throw ("Latest release {0} is missing under {1} (and no CFU in tmplts). Put {2}_{0} there." -f $latest, $UpdatesRoot, $Product.Prefix)
    }
    if ($steps -notcontains $latest) { $steps += $latest }
  }
  return $steps
}

$UpdatesRoot = Resolve-UpdatesRoot
New-Item -ItemType Directory -Path $LogDir,$Tmplts -Force | Out-Null
$script:LogFile = Join-Path $LogDir ("update_1c_{0}_{1}.log" -f $Ref, (Get-Date -Format 'yyyyMMdd_HHmmss'))
Write-Log "START Srvr=$Srvr Ref=$Ref User=$User"
Write-Log "UpdatesRoot=$UpdatesRoot Tmplts=$Tmplts Target=$TargetVersion SkipBackup=$SkipBackup"

if (-not (Test-Path -LiteralPath $Platform)) { throw "Platform not found: $Platform" }
Wait-For1CIdle
$ident = Get-ConfigIdentity
if (-not $ProductCatalog.ContainsKey($ident.Name)) { throw "Unsupported configuration '$($ident.Name)'" }
$product = $ProductCatalog[$ident.Name]
$steps = @(Get-RemainingChain -Product $product -CurrentVersion $ident.Version -WantTarget $TargetVersion)
if ($steps.Count -eq 0) {
  Write-Log "Nothing to do: already at $($ident.Version)"
  Stop-ThisIB
  Write-Log 'DONE'
  exit 0
}
Write-Log ("Update plan: $($ident.Version) -> " + ($steps -join ' -> '))
if ($DryRun) { Write-Log 'DryRun'; exit 0 }

if (-not $SkipBackup) {
  $bakDir = 'D:\backup'
  New-Item -ItemType Directory -Path $bakDir -Force | Out-Null
  $dt = Join-Path $bakDir ("{0}_{1}.dt" -f $Ref, (Get-Date -Format 'yyyyMMdd_HHmmss'))
  Write-Log "Backup -> $dt"
  $bc = Invoke-1C -ArgList @('DESIGNER',"/S$Srvr\$Ref","/N$User","/P$Password",'/DisableStartupDialogs','/DisableStartupMessages',"/DumpIB`"$dt`"") -OutLog (Join-Path $LogDir "backup_$Ref.log") -Kind Designer
  if ($bc -ne 0) { throw "Backup failed exit=$bc" }
}

Confirm-Legality
Set-ScheduledJobsDenied -Deny $true
Start-Sleep 3

try {
foreach ($ver in $steps) {
  Write-Log "=== STEP $ver ==="
  $cfu = Ensure-Cfu -Ver $ver -Prefix $product.Prefix -TmpltsRel $product.TmpltsRel
  Write-Log "CFU=$cfu"
  $ucLog = Join-Path $LogDir ("updatecfg_{0}_{1}.log" -f $Ref, (Get-VerDir $ver))
  $ucArgs = @(
    'DESIGNER',"/S$Srvr\$Ref","/N$User","/P$Password",
    '/DisableStartupDialogs','/DisableStartupMessages',
    ('/UpdateCfg"' + $cfu + '"'),
    '/UpdateDBCfg','-Server'
  )
  $uc = Invoke-1C -ArgList $ucArgs -OutLog $ucLog -Kind Designer
  if ($uc -ne 0) {
    $raw = ''
    if (Test-Path -LiteralPath $ucLog) { $raw = Get-Content -LiteralPath $ucLog -Raw -Encoding Default }
    $reLock = U @(0x0431,0x043B,0x043E,0x043A,0x0438,0x0440,0x043E,0x0432)
    $reNoUpd = U @(0x043D,0x0435,0x0020,0x0441,0x043E,0x0434,0x0435,0x0440,0x0436,0x0438,0x0442)
    if ($raw -match $reLock) {
      Write-Log 'Exclusive lock - deny jobs again, disconnect background, retry UpdateCfg'
      Set-ScheduledJobsDenied -Deny $true
      Start-Sleep 5
      $uc = Invoke-1C -ArgList $ucArgs -OutLog ($ucLog + '.retry') -Kind Designer
    }
    if ($uc -ne 0 -and $raw -match $reNoUpd) {
      Write-Log 'CFU not applicable - try UpdateDBCfg only'
      $dbArgs = @('DESIGNER',"/S$Srvr\$Ref","/N$User","/P$Password",'/DisableStartupDialogs','/DisableStartupMessages','/UpdateDBCfg','-Server')
      $uc = Invoke-1C -ArgList $dbArgs -OutLog ($ucLog + '.db') -Kind Designer
    }
  }
  if ($uc -ne 0) { throw "UpdateCfg failed for $ver exit=$uc" }
  Write-Log 'Unlock scheduled jobs so deferred handlers can run'
  Set-ScheduledJobsDenied -Deny $false
  Start-Sleep 2
  Confirm-Legality
  $hc = Invoke-IBHandlers -Ver $ver
  Write-Log "Handlers exit=$hc"
  if ($hc -ne 0) { throw "IB handlers failed for $ver exit=$hc" }
  Write-Log "STEP $ver OK"
}

Write-Log 'Re-detect final version via COM...'
try {
  $final = Get-ConfigIdentity
  Write-Log ("FINAL Name=$($final.Name) Version=$($final.Version)")
} catch { Write-Log ('final detect: ' + $_.Exception.Message) }
Write-Log 'Close 1C windows for this IB'
Stop-ThisIB
Write-Log 'DONE'
} finally {
  Write-Log 'Restore ScheduledJobsDenied=False after update'
  Set-ScheduledJobsDenied -Deny $false
  Stop-ThisIB
}
exit 0
