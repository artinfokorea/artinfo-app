/* global __dirname, require, module, process */
// app.json 위에 환경에 따라 달라지는 값만 얹는다 (타입 검사 대상에서 빼려고 .js).
// - Android 푸시(FCM): google-services.json 은 Firebase 콘솔에서 받은 파일로, 퍼블릭 저장소라 커밋하지 않는다(.gitignore).
//   로컬은 프로젝트 루트에 두고, CI 는 GOOGLE_SERVICES_JSON 시크릿으로 만든다. 없으면 푸시만 빠진 채 빌드된다.
// - Android versionCode: CI 가 ANDROID_VERSION_CODE(GitHub run number)로 올린다. iOS 빌드 번호와 같은 방식.
const { existsSync } = require("fs")
const { join } = require("path")

/** @param {{ config: import("expo/config").ExpoConfig }} ctx */
module.exports = ({ config }) => {
  const googleServices = join(__dirname, "google-services.json")
  const versionCode = Number(process.env.ANDROID_VERSION_CODE)
  return {
    ...config,
    android: {
      ...config.android,
      ...(existsSync(googleServices) ? { googleServicesFile: "./google-services.json" } : {}),
      ...(Number.isInteger(versionCode) && versionCode > 0 ? { versionCode } : {}),
    },
  }
}
