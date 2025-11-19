#!/usr/bin/env bash
set -e

IMAGE_NAME=picme

echo "Building Docker image..."
docker build -t $IMAGE_NAME .

echo "Running PicMe on http://localhost:8080 ..."
docker run --rm -p 8080:8080 $IMAGE_NAME
