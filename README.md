# TrailTasks

TrailTasks is a hiking-themed to-do list built with Vite, React, Firebase Authentication, and Firestore. Each hiker gets their own trail checklist stored under `users/{uid}/todos`.

## Run locally

```bash
npm install
npm run dev
```

## Firebase setup

1. Create or select a Firebase project in the Firebase Console.
2. Add a new Web App and copy the configuration.
3. Update `src/firebaseConfig.js` with your Firebase configuration values.
4. In Firebase Console, enable **Authentication → Sign-in method → Email/Password**.
5. Enable **Firestore Database** (in production or test mode).
6. (Optional) Set Firestore rules so only signed-in users can read/write their own data.

If you need a basic rule, this is a starting point:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/todos/{todoId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
