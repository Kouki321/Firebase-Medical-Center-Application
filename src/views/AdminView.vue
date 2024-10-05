<template>
  <div class="admin">
    <div class="container">
      <h2>Administration</h2>
      <div class="admin-info">
        <h2>Add Admin</h2>
        <div class="input">
          <input 
            placeholder="Enter user email to make them an admin" 
            type="text" 
            id="addAdmins" 
            v-model="adminEmail" 
          />
        </div>
        <span>{{ functionMsg }}</span>
        <button class="button" @click="addAdmin">Submit</button>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseInit";

export default {
  name: "AdminView",
  data() {
    return {
      adminEmail: "",
      functionMsg: null,
    };
  },
  methods: {
    async addAdmin() {
      // Clear previous message
      this.functionMsg = null;
      
      if (this.adminEmail.trim() === "") {
        this.functionMsg = "Please enter an email.";
        return;
      }

      try {
        // Find user by email
        const userQuery = query(collection(db, "users"), where("email", "==", this.adminEmail.trim()));
        const querySnapshot = await getDocs(userQuery);

        if (querySnapshot.empty) {
          this.functionMsg = "User not found.";
          return;
        }

        // Assuming there's only one user with the email
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;

        // Update the user's admin status
        await updateDoc(doc(db, 'users', userId), { admin: true });

        this.functionMsg = "User promoted to admin successfully!";
      } catch (error) {
        this.functionMsg = "Error updating user: " + error.message;
        console.error('Error updating user:', error);
      }
    }
  }
};
</script>

<style scoped>
.admin {
  padding: 20px;
}
.container {
  max-width: 600px;
  margin: 0 auto;
}
.input {
  margin-bottom: 20px;
}
.button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
}
.button:hover {
  background-color: #0056b3;
}
</style>
