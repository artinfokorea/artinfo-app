#!/usr/bin/env bash
# Android 릴리즈 번들(.aab) 빌드 — CI(.github/workflows/android-release.yml)와 로컬에서 같은 절차.
# 필요: ANDROID_KEYSTORE_PATH · ANDROID_KEYSTORE_PASSWORD · ANDROID_KEY_ALIAS · ANDROID_KEY_PASSWORD (업로드 키)
#       (선택) ANDROID_VERSION_CODE, google-services.json(푸시)
set -euo pipefail
cd "$(dirname "$0")/.."

: "${ANDROID_KEYSTORE_PATH:?업로드 키스토어 경로가 필요합니다 (scripts/android-keystore.sh 로 생성)}"

CI=1 npx expo prebuild --platform android --clean
grep -q 'android-signing.gradle' android/app/build.gradle || \
  printf '\napply from: "../../scripts/android-signing.gradle"\n' >> android/app/build.gradle

(cd android && ./gradlew :app:bundleRelease --no-daemon)
cp android/app/build/outputs/bundle/release/app-release.aab ./artinfo.aab
echo "→ ./artinfo.aab"
