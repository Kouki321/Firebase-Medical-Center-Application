<template>
    <div class="container">
        <div class="container-serach">
          <input v-model="searchQuery" type="text" placeholder="Search users..." class="search-input" />
        </div>
          <div class="patients-list">
            <Loading v-if="loading" />
            <div v-else class="patients-container">
              <patientCard
                v-for="patient in filteredpatients"
                :key="patient.id"
                :patient="patient"
                @send-request="sendRequest" 
              />
            </div>
            <p v-if="error" class="error">{{ errorMsg }}</p>
          </div>
    </div>
    </template>
    
    <script>
    import { collection, addDoc, query, where, getDocs,doc,setDoc,getDoc } from 'firebase/firestore';
    import { db } from "../../firebase/firebaseInit";
    import patientCard from "./patientsView.vue";
    import Loading from "../../components/LoadingView.vue";
    import { useToast } from 'vue-toastification';
    
    export default {
      name: 'allPatientsView',
      components: { patientCard, Loading },
      data() {
        return {
          patients: [],
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
    
        filteredpatients() {
        // Filter patients based on the search query
        return this.patients.filter(patient =>
        patient.firstName.toLowerCase().includes(this.searchQuery.toLowerCase())||
        patient.lastName.toLowerCase().includes(this.searchQuery.toLowerCase())||
        patient.role.toLowerCase().includes(this.searchQuery.toLowerCase())||
        patient.phoneNumber.toLowerCase().includes(this.searchQuery.toLowerCase())    
        );
      },
      },
      async created() {
        try {
          const querySnapshot = await getDocs(collection(db, 'users'));
          this.patients = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(patient => patient.patient);
          this.loading = false;
        } catch (error) {
          console.error('Error fetching patients:', error);
          this.error = true;
          this.errorMsg = 'Failed to load patients. Please try again.';
          this.loading = false;
        }
      },
      methods: {
        async sendRequest(patientId) {
          const toast = useToast();
          const userIdss = this.userIds;
          
          
          if (!userIdss || !patientId) {
            toast.error('User ID or patient ID is undefined.');
            return;
          }
    
          try {
            const q = query(collection(db, 'requests'), 
              where('userId', '==', patientId), 
              where('doctorId', '==', userIdss )
            );
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
              toast.info('Request already sent to this patient.');
              return;
            }

           
          const chatId = `chat_${patientId}_${userIdss}`;
          // Check if the chat already exists
          const chatDocRef = doc(db, "chatDoctor_Patient", chatId);
          const chatDoc = await getDoc(chatDocRef);

          if (!chatDoc.exists()) {
              // Create chat document if it doesn't exist
              await setDoc(chatDocRef, {
              participants: [patientId,userIdss],
              createdAt: new Date(),
              });

              // Optional: Create initial messages in the chat
              const messagesRef = collection(chatDocRef, "messages");
              await setDoc(doc(messagesRef, 'initial'), {
              sender: userIdss,
              content: 'Hello! Welcome to the chat.',
              timestamp: new Date(),
              });
          }
            const userId =patientId;
            const doctorId =userIdss;
          
            await addDoc(collection(db, 'requests'), {
              userId,
              doctorId,
              status: 'accepted',
             
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
    
    .patients-list {
      padding: 20px;
    }
    
    .patients-container {
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
    