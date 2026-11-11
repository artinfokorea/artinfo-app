#!/usr/bin/env bash
# Play 업로드 키 생성 (한 번만). 키는 ~/android-keys/ 에 두고 절대 저장소에 넣지 않는다.
# 사용: ANDROID_KEYSTORE_PASSWORD='...' ANDROID_KEY_PASSWORD='...' scripts/android-keystore.sh
# 끝나면 GitHub Secrets 에 넣을 명령을 안내한다 (값은 출력하지 않는다).
set -euo pipefail
DIR="$HOME/android-keys"
FILE="$DIR/artinfo-upload.jks"
ALIAS="${ANDROID_KEY_ALIAS:-artinfo-upload}"
: "${ANDROID_KEYSTORE_PASSWORD:?키스토어 암호 환경변수가 필요합니다}"
: "${ANDROID_KEY_PASSWORD:?키 암호 환경변수가 필요합니다}"
mkdir -p "$DIR"
if [ -e "$FILE" ]; then echo "이미 있습니다: $FILE (덮어쓰지 않음)"; exit 1; fi
keytool -genkeypair -v -keystore "$FILE" -alias "$ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$ANDROID_KEYSTORE_PASSWORD" -keypass "$ANDROID_KEY_PASSWORD" \
  -dname "CN=ArtInfo, O=artinfokorea, C=KR"
echo
echo "생성됨: $FILE  (백업해 두세요 — 분실하면 Play 콘솔에서 키 재설정을 요청해야 합니다)"
echo "GitHub Secrets 등록 (artinfokorea/artinfo-app):"
echo "  base64 -i $FILE | gh secret set ANDROID_KEYSTORE_BASE64 -R artinfokorea/artinfo-app"
echo "  gh secret set ANDROID_KEYSTORE_PASSWORD -R artinfokorea/artinfo-app --body \"\$ANDROID_KEYSTORE_PASSWORD\""
echo "  gh secret set ANDROID_KEY_PASSWORD -R artinfokorea/artinfo-app --body \"\$ANDROID_KEY_PASSWORD\""
echo "  gh secret set ANDROID_KEY_ALIAS -R artinfokorea/artinfo-app --body \"$ALIAS\""
