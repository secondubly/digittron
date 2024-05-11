#!/bin/bash
set -euo pipefail


# run migrations then start bot
npm explore @secondubly/digittron-db -- npm run db:generate dev

npm start
