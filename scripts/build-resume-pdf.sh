#!/usr/bin/env bash
# Render resume/resume.html to public/resumes/Harish.Raghavendra.<MM>.<YYYY>.pdf with headless Chrome.
# Usage: scripts/build-resume-pdf.sh [MM.YYYY]   (defaults to the current month)
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
stamp="${1:-$(date +%m.%Y)}"
out="$root/public/resumes/Harish.Raghavendra.$stamp.pdf"
chrome="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

"$chrome" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$out" "file://$root/resume/resume.html" 2>/dev/null

echo "Wrote $out"
