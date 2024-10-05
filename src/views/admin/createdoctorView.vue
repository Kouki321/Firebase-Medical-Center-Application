<template>
    <div class="cna">
        <Loading v-show="loading"></Loading>

    <div class="registration-container">

      <div class="image-section">
        <img src="../../assets/doctorimageanimatedadmin.png">
       </div>
      <div class="form-section">
        <form @submit.prevent="register">
          <h2>Doctor Registration</h2>
          <!-- Line 1: First Name and Last Name -->
          <div class="form-row">
            <div class="input-group">
              <input type="text" placeholder="First Name" v-model="firstName" />
             </div>
            <div class="input-group">
              <input type="text" placeholder="Last Name" v-model="lastName" />
             </div>
          </div>
  
          <!-- Line 2: Phone Number and Office Number -->
          <div class="form-row">
            <div class="input-group">
              <input type="text" placeholder="Phone Number" v-model="phoneNumber" />
             </div>
            <div class="input-group">
              <input type="text" placeholder="Office Number" v-model="officeNumber" />
             </div>
          </div>
  
          <!-- Line 3: Email and Password -->
          <div class="form-row">
            <div class="input-group">
              <input type="email" placeholder="Email" v-model="email" />
             </div>
            <div class="input-group">
              <input type="password" placeholder="Password" v-model="password" />
             </div>
          </div>
  
          <!-- Line 4: User Name and Role -->
          <div class="form-row">
            <div class="input-group">
              <input type="text" placeholder="User Name" v-model="userName" />
             </div>
            <div class="input-group">
              <select v-model="role">
                <option value="" disabled>Select Role</option>
                <option value="dentist">Dentist</option>
                <option value="surgeon">Surgeon</option>
                <option value="psychiatrist">Psychiatrist</option>
              </select>
            </div>
          </div>
  
          <!-- Submit Button -->
          <button type="submit">Register</button>
          <div class="error" v-show="error">{{ errorMsg }}</div>
        </form>
      </div>
    </div></div>
  </template>

<script>
import { getAuth, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, query, where, getDocs, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../../firebase/firebaseInit"; // Ensure this import is correct

import Loading from "../../components/LoadingView.vue";
export default {
  name: 'createdoctorView',
  components:{Loading},
  data() {
    return {
      email1:"",
      password1:"",
      loading: false,
      firstName: "",
      lastName: "",
      phoneNumber: "",
      officeNumber: "",
      email: "",
      password: "",
      userName: "",
      role: "",
      error: false,
      errorMsg: "",
      active: false,
      admin: false,
      patient: false,
      doctor: true,
    };
  },
  methods: {
    async register() {
      if (
        this.firstName &&
        this.lastName &&
        this.phoneNumber &&
        this.officeNumber &&
        this.email &&
        this.password &&
        this.userName &&
        this.role
      ) {
        this.error = false;
        this.errorMsg = "";
        this.loading = true;
        this.email1=this.$store.state.profileEmail;
        this.password1="123456";
        try {
          // Check if the email already exists in Firestore
          const q = query(collection(db, "users"), where("email", "==", this.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            throw new Error("This email is already registered. Please use a different email.");
          }
          const auth = getAuth();
          const { user } = await createUserWithEmailAndPassword(auth, this.email, this.password);

          const userDoc = doc(collection(db, "users"), user.uid);
          await setDoc(userDoc, {
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNumber: this.phoneNumber,
            officeNumber: this.officeNumber,
            userName: this.userName,
            role: this.role,
            active: this.active,
            admin: this.admin,
            doctor: this.doctor,
            patient: this.patient,
            profileImage: "a",
            email: this.email,
            online: false,
            lastOnline: new Date()
          });
          const adminId = ' 76LFeOLYWGhGlAb5WzC9fI0MZC62';
          const chatId = `chat_${user?.uid}_${adminId}`;

          // Check if the chat already exists
          const chatDocRef = doc(db, "chatAdmin", chatId);
          const chatDoc = await getDoc(chatDocRef);

          if (!chatDoc.exists()) {
              // Create chat document if it doesn't exist
              await setDoc(chatDocRef, {
              participants: [user.uid, adminId],
              createdAt: new Date(),
              });

              // Optional: Create initial messages in the chat
              const messagesRef = collection(chatDocRef, "messages");
              await setDoc(doc(messagesRef, 'initial'), {
              sender: adminId,
              content: 'Hello! Welcome to the chat.',
              timestamp: new Date(),
              });
          }
          signOut(auth);

            const userCredential = await signInWithEmailAndPassword(auth, this.email1, this.password1);
            const userId = userCredential.user.uid;

            // Reference to the user's document in Firestore
            const userRef = doc(db, 'users', userId);
            const userDoc1 = await getDoc(userRef);

            if (userDoc1.exists()) {
                // Check if the user's account is active
                if (userDoc1.data().active) {
                this.$router.push({ name: "createdoctorView" });
                this.error = false;
                this.errorMsg = "";
                try {
                        await updateDoc(userRef, {
                        online: true,
                        // Optionally, update lastOnline to the current timestamp when logging in
                        lastOnline: serverTimestamp(),
                        });
                        console.log('User set to online');
                    } catch (error) {
                        console.error('Error setting user online:', error);
                    } 
                } else {
                throw new Error("Your account is not active. Please contact support.");
                }
            } else {
                // Handle the case where the user document does not exist
                throw new Error("User does not exist.");
            }
            this.email1="";
            this.password1="";
            this.firstName= "";
            this.lastName= "";
            this.phoneNumber= "";
            this.officeNumber= "";
            this.email= "";
            this.password= "";
            this.userName= "";
            this.role= "";
            this.loading = false;
            window.location.pathname = '/createdoctorView';
            const usersssss = this.$store.state?.user; // Assuming user is already set in the Vuex state
                    if (usersssss) {
                    this.$store.dispatch("getCurrentser", usersssss);
                    }

        } catch (error) {
          this.error = true;
          this.errorMsg = error.message;
          console.error("Error registering doctor:", error);
          this.loading = false;
        }
        return;
      }
      this.loading = false;
      this.error = true;
      this.errorMsg = "Please fill out all the fields!";

    },
  },
};
</script>



  <style scoped>
 .cna{
    display: flex;
    align-items: center;
    justify-content: center;
      border-radius: 50px; /* Optional: rounded corners */

 }
 .registration-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh; /* Full viewport height to center vertically */
}

.registration-container {
  position: absolute;
  top: 20%;
  display: flex;
  width: 870px;
  height: 390px;
  border-radius: 20px; /* Rounded corners */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25); /* Optional: add some shadow */
  overflow: hidden; /* Ensure content respects the border radius */
}

  .image-section {
     flex: 30%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f4f4f4;
  }
  
  .image-section img {
    max-width: 120%;
    max-height: 100%;
  }
  
  .form-section {
    flex: 70%;
    padding: 20px;
    background-color: #fff;
  }
  
  .form-section h2 {
    margin-bottom: 20px;
  }
  
  .form-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }
  
  .input-group {
    flex: 1;
    position: relative;
  }
  
  .input-group input,
  .input-group select {
    width: 100%;
    padding: 8px;
    padding-left: 30px; /* Make room for the icon */
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .input-group .icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 15px;
    height: 15px;
  }
  
  button {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  .error {
    color: red;
    margin-top: 10px;
    text-align: center;
  }
  </style>
  