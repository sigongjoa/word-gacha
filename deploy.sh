#!/bin/bash
# 배포 스크립트 — version.json 자동 업데이트 후 push

VERSION=$(date +%Y%m%d%H%M)
echo "{ \"v\": \"$VERSION\" }" > public/version.json
echo "✅ version.json → $VERSION"

git add public/version.json
git add -u
git commit -m "deploy: 버전 업데이트 $VERSION"
git push origin main
echo "🚀 배포 완료"
