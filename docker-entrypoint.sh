#!/bin/bash
set -euo pipefail

npm explore @secondubly/digittron-db -- npm run db:generate dev

exec "$@"