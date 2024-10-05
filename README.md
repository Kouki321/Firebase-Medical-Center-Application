# Firebase Medical Center Application

## Overview

The **Firebase Doctor Management Application** is a multi-user web application designed to facilitate communication between patients, doctors, and administrators. Hosted on [Firebase Hosting](https://fire-doctor.web.app/), this application provides a seamless experience for managing appointments, messaging, and user status management.

### Features

- **Multi-User Support**: The application supports multiple user roles, including:
  - **Admin**: Can create and manage doctor accounts, change user statuses, and view appointment logs.
  - **Doctors**: Can accept and reschedule appointments, communicate with patients, and manage their schedules.
  - **Patients**: Can request appointments, communicate with doctors, and view their medical history.

- **Messaging System**: 
  - Patients can message doctors who have accepted their appointments.
  - An integrated messenger for admin-to-user communication is available.

- **Appointment Management**: 
  - Patients can schedule and reschedule appointments.
  - Doctors can view and manage their appointments from a dedicated dashboard.

- **Admin Dashboard**:
  - Provides insights into user activity, including the last online status and whether users are currently online.
  - Visual statistics (line charts, donut charts) showcasing user activity and appointments.

## Technologies Used

- **Frontend**: Vue.js
- **Backend**: Firebase
- **Hosting**: Firebase Hosting



# Configure Firebase:

Create a Firebase project in your Firebase Console.
Set up Firestore and Authentication services.
In the src/firebase directory, create a configuration file (e.g., firebaseConfig.js) and add your Firebase configuration:
javascript
Copier le code
```

// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
```
## Project setup

```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
