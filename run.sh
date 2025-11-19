#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="picme-photobooth"

docker build -t "${IMAGE_NAME}" .
docker run --rm -p 8080:8080 --env-file .env.example "${IMAGE_NAME}"

