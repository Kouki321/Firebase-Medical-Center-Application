<template>
    <Loading v-show="loading"></Loading>
    <div class="row">
    <div class="col-12">
      <div class="card my-4">
        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
          <div class="bg-gradient-info shadow-primary border-radius-lg pt-2 pb-2">
            <h6 class="text-white text-capitalize ps-3">Voici la liste des requests</h6>
          </div>
        </div>
        <div class="card-body px-0 pb-2">
          <div class="ms-md-auto pe-md-3 d-flex align-items-center">
            <div class="input-group input-group-outline">
              <input type="text" class="form-control" v-model="searchQuery" placeholder="Type here..." />
            </div>
          </div>
          <div class="table-responsive p-0" style="overflow: auto; max-height: 400px;">
            <table class="table align-items-center mb-0">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Image</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">First Name</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Last Name</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                  <th class="text-secondary opacity-7">Accept</th>
                  <th class="text-secondary opacity-7">Reject</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in filteredRequests" :key="request.id" class="request-card">

                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <img :src="request.profileImage" alt="Profile Image" class="profile-image" />
                    </div>
                  </td> <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-0 text-sm">{{ request.firstName }}</h6>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-0 text-sm">{{ request.lastName }}</h6>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-0 text-sm">{{ request.email }}</h6>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h6 class="mb-0 text-sm">{{ request.status }}</h6>
                    </div>
                  </td>
                  <td class="text-center">
                    <button @click="acceptRequest(request)" :disabled="request.status !== 'ongoing'" class="btn btn-success">Accept</button>
                  </td>
                  <td class="text-center">
                    <button @click="rejectRequest(request.id)" :disabled="request.status !== 'ongoing'" class="btn btn-danger">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, query, where, getDocs, updateDoc, doc ,setDoc,getDoc} from 'firebase/firestore';
import { db } from "../../firebase/firebaseInit";
import Loading from "../../components/LoadingView.vue";
import { useToast } from 'vue-toastification';

export default {
  name: 'DoctorRequests',
  components: { Loading },
  data() {
    return {
      requests: [],
      loading: true,
      error: false,
      searchQuery: "",  // Add searchQuery here
      errorMsg: "",
      doctorId: this.$store.state.user ? this.$store.state.user.uid : null,
    };
  },
  computed: {
   
    filteredRequests() {
    // Apply filtering based on the search query and status
    return this.requests.filter(request => {
      const matchesSearch = this.searchQuery
        ? request.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          request.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          request.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        : true;
        console.log(matchesSearch)
      return request.doctorId === this.doctorId && request.status === "ongoing" && matchesSearch;
    });
  },
  },
  async created() {
    if (!this.doctorId) {
      this.error = true;
      this.errorMsg = 'Doctor not logged in.';
      this.loading = false;
      return;
    }

    try {
      const q = query(collection(db, 'requests'), where('doctorId', '==', this.doctorId));
      const querySnapshot = await getDocs(q);
      this.requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.loading = false;
    } catch (error) {
      console.error('Error fetching requests:', error);
      this.error = true;
      this.errorMsg = 'Failed to load requests. Please try again.';
      this.loading = false;
    }
  },
  methods: {
   
    async acceptRequest(request) {
      const toast = useToast();
      try {
          const requestRef = doc(db, 'requests', request.id);
          await updateDoc(requestRef, { status: 'accepted',dateAcceptorReject:new Date() });
          this.updateRequestStatus(request.id, 'accepted');

          const chatId = `chat_${request.userId}_${request.doctorId}`;
          // Check if the chat already exists
          const chatDocRef = doc(db, "chatDoctor_Patient", chatId);
          const chatDoc = await getDoc(chatDocRef);

          if (!chatDoc.exists()) {
              // Create chat document if it doesn't exist
              await setDoc(chatDocRef, {
              participants: [request.userId, request.doctorId],
              createdAt: new Date(),
              });

              // Optional: Create initial messages in the chat
              const messagesRef = collection(chatDocRef, "messages");
              await setDoc(doc(messagesRef, 'initial'), {
              sender: request.doctorId,
              content: 'Hello! Welcome to the chat.',
              timestamp: new Date(),
              });
          }

        toast.success('Request accepted successfully!');
      } catch (error) {
        console.error('Error accepting request:', error);
        toast.error('Failed to accept request. Please try again.');
      }
    },
    async rejectRequest(requestId) {
      const toast = useToast();
      try {
        const requestRef = doc(db, 'requests', requestId);
        await updateDoc(requestRef, { status: 'rejected' });
        this.updateRequestStatus(requestId, 'rejected');
        toast.success('Request rejected successfully!');
      } catch (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject request. Please try again.');
      }
    },
    updateRequestStatus(requestId, status) {
      const request = this.requests.find(req => req.id === requestId);
      if (request) {
        request.status = status;
      }
    },
  },
};
</script>



<style lang="scss" scoped>

.profile-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col-12 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

.card {
  border: 0;
  border-radius: 1rem;
  box-shadow: 0 0.75rem 1.5rem rgba(18, 38, 63, 0.03);
  background-color: #fff;
  margin-bottom: 2rem;
}

.card-header {
  border-radius: 1rem 1rem 0 0;
  background: linear-gradient(87deg, #05c338,green);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  padding: 1rem 1.5rem;
  position: relative;
}

.bg-gradient-info {
  background: linear-gradient(87deg, #05c338,green);
}

.shadow-primary {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.border-radius-lg {
  border-radius: 1rem !important;
}

.text-capitalize {
  text-transform: capitalize !important;
}

.text-white {
  color: #fff !important;
}

.card-body {
  padding: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
  overflow-y: auto;
  max-height: 400px;
}

.table {
  margin-bottom: 1rem;
  width: 100%;
  background-color: transparent;
}

.table thead th {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td, .table th {
  padding: 0.75rem;
  vertical-align: middle;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.toggle-active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.table td h6 {
  margin-bottom: 0;
}

.d-flex {
  display: flex !important;
}

.align-items-center {
  align-items: center !important;
}

.justify-content-center {
  justify-content: center !important;
}

.my-4 {
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}

.p-0 {
  padding: 0 !important;
}

.px-0 {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.pb-2 {
  padding-bottom: 0.5rem !important;
}

.pt-2 {
  padding-top: 0.5rem !important;
}

.ps-3 {
  padding-left: 1rem !important;
}

.ms-md-auto {
  margin-left: auto !important;
}

.pe-md-3 {
  padding-right: 1rem !important;
}

.input-group-outline {
  display: flex;
  align-items: center;
}
.input-group-outline .form-label {
  margin-bottom: 0;
}

.btn {
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.5;
  padding: 0.75rem 1.5rem;
  text-align: center;
}

.btn-success {
  background-color: #28a745;
  border: 1px solid #28a745;
  color: #fff;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-danger {
  background-color: #dc3545;
  border: 1px solid #dc3545;
  color: #fff;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.request-card {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.request-card td {
  vertical-align: middle;
}

.request-card button {
  margin: 0.2rem;
}

.request-card td:first-child {
  padding-left: 1rem;
}

.request-card td:last-child {
  padding-right: 1rem;
}
</style>