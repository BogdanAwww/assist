#!/bin/bash

#if [ "$CI_COMMIT_TAG" != "" ];
#then VERSION="$CI_COMMIT_TAG"
#else
VERSION=$(node -p "require('./version.json').version");
#fi;

TAG="$TARGET"

echo "VERSION: $TAG $VERSION"

DOCKER_BUILDKIT=1 docker build --no-cache --platform linux/amd64 -f="tools/docker/Dockerfile.${TARGET}" -t="wantstobechak/assist:${TAG}-${VERSION}" .
docker push wantstobechak/assist:${TAG}-${VERSION}
