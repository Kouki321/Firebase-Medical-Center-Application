<template>
<div class="container">
    <div class="container-serach">
      <input v-model="searchQuery" type="text" placeholder="Search users..." class="search-input" />
    </div>
      <div class="doctors-list">
        <Loading v-if="loading" />
        <div v-else class="doctors-container">
          <DoctorCard
            v-for="doctor in filteredDoctors"
            :key="doctor.id"
            :doctor="doctor"
            @send-request="sendRequest" 
          />
        </div>
        <p v-if="error" class="error">{{ errorMsg }}</p>
      </div>
</div>
</template>

<script>
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from "../../firebase/firebaseInit";
import DoctorCard from "../patient/doctorsView.vue";
import Loading from "../../components/LoadingView.vue";
import { useToast } from 'vue-toastification';

export default {
  name: 'alldoctorsView',
  components: { DoctorCard, Loading },
  data() {
    return {
      doctors: [],
      loading: true,
      error: false,
      errorMsg: "",
      requestStatus: "",
      searchQuery: "", // New property for the search input

    };
  },
  computed: {
    userIds() {
      const user = this.$store.state.user;
      return user ? user.uid : null;  
    } , 
     email1() {
        const profile = this.$store.state.profileEmail;
        return profile ? profile : null;
      },
      profileFirstName() {
        const profile = this.$store.state.profileFirstName;
        return profile ? profile : null;
      },
      profileLastName() {
        const profile = this.$store.state.profileLastName;
        return profile ? profile : null;
      },
      profileImage() {
        const profile = this.$store.state.profileImage;
        return profile ? profile : null;
      },

    filteredDoctors() {
    // Filter doctors based on the search query
    return this.doctors.filter(doctor =>
    doctor.firstName.toLowerCase().includes(this.searchQuery.toLowerCase())||
    doctor.lastName.toLowerCase().includes(this.searchQuery.toLowerCase())||
    doctor.role.toLowerCase().includes(this.searchQuery.toLowerCase())||
    doctor.phoneNumber.toLowerCase().includes(this.searchQuery.toLowerCase())    
    );
  },
  },
  async created() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      this.doctors = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doctor => doctor.doctor);
      this.loading = false;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      this.error = true;
      this.errorMsg = 'Failed to load doctors. Please try again.';
      this.loading = false;
    }
  },
  methods: {
    async sendRequest(doctorId) {
      const toast = useToast();
      const userId = this.userIds;
      const email = this.email1;
      const firstName = this.profileFirstName;
      const lastName = this.profileLastName;
      const profileImage = this.profileImage;
      
      if (!userId || !doctorId) {
        toast.error('User ID or Doctor ID is undefined.');
        return;
      }

      try {
        const q = query(collection(db, 'requests'), 
          where('userId', '==', userId), 
          where('doctorId', '==', doctorId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast.info('Request already sent to this doctor.');
          return;
        }

        await addDoc(collection(db, 'requests'), {
          userId,
          doctorId,
          status: 'ongoing',
          email,
          lastName,
          firstName,
          profileImage,
          date:new Date(),
          dateAcceptorReject:null
        });

        toast.success('Request sent successfully!');
      } catch (error) {
        console.error('Error sending request:', error);
        toast.error('Failed to send request. Please try again.');
      }
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #fff;
  width: 1000px;
  margin: 20px auto; /* Center the container */
  box-shadow: 0px 5px 15px rgba(50, 50, 93, 0.25);
  padding: 20px;
  border-radius: 8px; /* Add rounded corners */
}

.doctors-list {
  padding: 20px;
}

.doctors-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.search-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
  width: 100%; /* Make the input full width */
}

.error {
  color: red;
  margin-top: 20px;
}

</style>
