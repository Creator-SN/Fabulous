#!/usr/bin/env bash

set -euo pipefail

if [[ -z "${APPLE_ID:-}" ]]; then
  echo "Missing APPLE_ID"
  exit 1
fi

if [[ -z "${APPLE_APP_SPECIFIC_PASSWORD:-}" && -z "${APPLE_PASSWORD:-}" ]]; then
  echo "Missing APPLE_APP_SPECIFIC_PASSWORD or APPLE_PASSWORD"
  exit 1
fi

if [[ -z "${APPLE_TEAM_ID:-}" && -z "${TEAM_ID:-}" ]]; then
  echo "Missing APPLE_TEAM_ID or TEAM_ID"
  exit 1
fi

export APPLE_APP_SPECIFIC_PASSWORD="${APPLE_APP_SPECIFIC_PASSWORD:-${APPLE_PASSWORD:-}}"
export APPLE_TEAM_ID="${APPLE_TEAM_ID:-${TEAM_ID:-}}"

yarn build:mac
