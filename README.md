# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Android 빌드·배포 (아트인포)

iOS 와 같은 코드를 쓰고 Apple 로그인만 iOS 에서만 보인다. 아이콘은 `components/ui/Icon.tsx` 의 표로 SF Symbols → Ionicons/Material 로 바뀐다.

- **빌드**: `gh workflow run android-release.yml` → artifact `artinfo-android-aab` 의 `artinfo.aab`. 시크릿이 모두 있으면 Play Console 내부 테스트 트랙에 자동 업로드.
- **업로드 키** (한 번만): `ANDROID_KEYSTORE_PASSWORD=… ANDROID_KEY_PASSWORD=… scripts/android-keystore.sh` → 안내대로 `gh secret set` 4개 (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`). 키 파일은 `~/android-keys/` 에만 둔다.
- **푸시(FCM)**: Firebase 콘솔에 Android 앱(`com.artinfokorea.app`) 추가 → `google-services.json` 을 프로젝트 루트에 두고(커밋 금지) 내용을 `GOOGLE_SERVICES_JSON` 시크릿으로. Expo 푸시 서비스가 FCM 으로 보내려면 `npx eas-cli credentials -p android` 에서 FCM V1 서비스 계정 키도 올려야 한다.
- **Play 자동 업로드**: Play Console 에서 앱을 만들고 첫 `.aab` 는 손으로 올린 뒤, API 서비스 계정 키 JSON 을 `PLAY_SERVICE_ACCOUNT_JSON` 시크릿으로.
- **로컬 실행**: Android Studio + SDK 설치 후 `npx expo run:android`. 서명 빌드는 `scripts/android-release.sh`.
