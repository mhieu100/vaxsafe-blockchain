# VaxSafe Mobile App

This project is a Flutter application for VaxSafe.

## Google Login Setup

To make Google Login work, you must configure the Google Sign-In plugin:

### Android
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a project and add an Android app.
3. Download the `google-services.json` file.
4. Place it in `mobile/android/app/google-services.json`.
5. Ensure you have added the SHA-1 fingerprint of your debug keystore to the Firebase project settings.

### iOS
1. In Firebase Console, add an iOS app.
2. Download `GoogleService-Info.plist`.
3. Place it in `mobile/ios/Runner/GoogleService-Info.plist`.
4. Add the URL scheme to your `mobile/ios/Runner/Info.plist`.

For more details, see the [google_sign_in package documentation](https://pub.dev/packages/google_sign_in).

## Running the App

```bash
flutter pub get
flutter run
```

Ensure your backend is running at `http://localhost:8080`.
For Android Emulator, the app connects to `http://10.0.2.2:8080` which maps to the host's localhost.
