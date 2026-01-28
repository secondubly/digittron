#!/usr/bin/env sh

if [ -f .env.development.local ]; then
    echo '.env.development.local file found'
    export $(grep -v '^#' .env.development.local | xargs)
elif [ -f .env ]; then
    echo '.env file found'
    export $(grep -v '^#' .env | xargs)
fi

pnpm run mikro-orm schema:fresh --run --seed