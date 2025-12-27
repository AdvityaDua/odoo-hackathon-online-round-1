# GearGuard Maintenance System

## Setup Instructions

1. **Install Dependencies**
   ```bash
   flutter pub get
   ```

2. **Configure Firebase**
   - Make sure you have the Firebase CLI installed.
   - Run the following command to connect your Flutter app to Firebase:
     ```bash
     flutterfire configure
     ```
   - This will generate `lib/firebase_options.dart`.

3. **Enable Firebase Options**
   - Open `lib/main.dart`.
   - Uncomment the `import 'firebase_options.dart';` line.
   - Update the `Firebase.initializeApp()` call:
     ```dart
     await Firebase.initializeApp(
       options: DefaultFirebaseOptions.currentPlatform,
     );
     ```

4. **Firestore Setup**
   - Create a collection named `users` in Cloud Firestore.
   - Add user documents with the following fields:
     - `uid` (Document ID should match Auth UID)
     - `email` (string)
     - `name` (string)
     - `role` (string: 'employee', 'technician', or 'manager')
     - `isActive` (boolean)
     - `teamId` (optional string)

## Features Implemented
- **Login Screen**: Professional UI with email validation, password toggle, and loading state.
- **Role-Based Auth**: Redirects employees, technicians, and managers to their respective screens.
- **State Management**: Uses `Provider` and `LoginViewModel` for clean architecture.
- **Security**: Checks `isActive` flag before allowing access.
