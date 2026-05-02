# Firebase Firestore Rules

Go to Firebase Console → Firestore Database → Rules tab
and paste these rules to allow the products config doc to be read/written:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document=**} {
      allow read, write: if true;
    }
    match /config/{document=**} {
      allow read, write: if true;
    }
  }
}
```

Click "Publish". This allows the product management feature to work.

NOTE: These are open rules for a simple business app.
For extra security later, you can add authentication.
