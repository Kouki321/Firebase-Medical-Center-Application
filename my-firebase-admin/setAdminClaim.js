const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Ensure the path is correct

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Function to set custom claims
async function setAdminClaim(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("Custom claim set successfully.");
  } catch (error) {
    console.error("Error setting custom claim:", error);
  }
}

// Replace with the actual UID of the user
setAdminClaim(userUID);
