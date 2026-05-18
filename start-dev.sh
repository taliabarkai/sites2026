#!/bin/sh
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
exec /usr/local/bin/node node_modules/next/dist/bin/next dev --port 3333
