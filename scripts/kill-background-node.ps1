# WHAT: Lists every running node.exe process with its memory footprint
#       and command line, and (with -Kill) terminates them all.
# WHY:  Long Claude Code sessions stack up orphaned Node processes —
#       a Next dev server here, a jest watcher there, a hung build —
#       each holding 1–4 GB of V8 heap. Running `npm run build` on
#       top of three forgotten dev servers is what crashes Windows.
#       This script is the panic button.
#
# Usage:
#   powershell -File scripts/kill-background-node.ps1          # dry run, just lists
#   powershell -File scripts/kill-background-node.ps1 -Kill    # terminates them all
#
# Safe to run from non-interactive shells (no prompts). Default is
# dry-run so an accidental invocation never kills anything.

param([switch]$Kill)

$nodes = Get-Process node -ErrorAction SilentlyContinue
if (-not $nodes) {
    Write-Host "No node.exe processes running."
    exit 0
}

Write-Host "Running node.exe processes:"
foreach ($p in ($nodes | Sort-Object Id)) {
    $mb = [math]::Round($p.WorkingSet64 / 1MB, 0)
    $cmd = $null
    try {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($p.Id)" -ErrorAction Stop).CommandLine
    } catch { }
    if (-not $cmd) { $cmd = "(command line unavailable)" }
    if ($cmd.Length -gt 120) { $cmd = $cmd.Substring(0, 117) + "..." }
    Write-Host ("  PID {0,-6} {1,6} MB  {2}" -f $p.Id, $mb, $cmd)
}

$totalMB = [math]::Round(($nodes | Measure-Object WorkingSet64 -Sum).Sum / 1MB, 0)
Write-Host ""
Write-Host "Total: $($nodes.Count) processes, $totalMB MB resident."

if (-not $Kill) {
    Write-Host ""
    Write-Host "Dry run. Re-run with -Kill to terminate them all:"
    Write-Host "  powershell -File scripts/kill-background-node.ps1 -Kill"
    exit 0
}

$nodes | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "Killed $($nodes.Count) node.exe processes."
