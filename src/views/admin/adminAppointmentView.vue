<template>
    <div>
      <!-- Modal for Appointment Requests -->
     
          <!-- Modal for Appointment Requests -->
          <div v-if="showModalEdit" class="modal-overlay">
        <div class="modal-content-edit">
          <button class="close-button" @click="showModalEdit = false">X</button>
          <h2>Request Appointment</h2>
  
          <form @submit.prevent="submitRequestChange">
  
  
            <div class="dateA">
              <label for="appointmentDateTimeChange">Select Date and Time:</label>
              <input
                type="datetime-local"
                v-model="appointmentDateTimeChange"
                :min="minDateTime"
                
              />
            </div>
  
          
            <div class="comment">
            <label :disabled="true" for="commentChange">Comment Patient:</label>
            <textarea
               rows="4"     v-model="commentChange"
                readonly
            ></textarea>
          </div> 
          <div class="comment">
            <label for="commentChangeDoctor">Comment doctor:</label>
            <textarea
              v-model="commentChangeDoctor"
              placeholder="Add your comments here"
              rows="4" readonly
            ></textarea>
          </div>          
          <div class="comment">
            <label for="commentChangePrivate">Note:</label>
            <textarea
              v-model="commentChangePrivate"
              placeholder="Add your comments here"
              rows="4" readonly
            ></textarea>
          </div>
            
          </form>
        </div>
      </div>
      
      <!-- Displaying Appointment Requests -->
       <div class="row">
        <div class="col-12">
          <div class="card my-4">
            <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
              <div class="bg-gradient-info shadow-primary border-radius-lg pt-2 pb-2">
                <h6 class="text-white text-capitalize ps-3">Voici la liste des requests received</h6>
              </div>
            </div>
            <div class="card-body px-0 pb-2">
              <div class="ms-md-auto pe-md-3 d-flex align-items-center">
                <div class="input-group input-group-outline">
                  <input type="text" class="search-inputs" v-model="searchQueryPatient"  placeholder="Type here..." />
                 </div>
              </div>
              <div class="table-responsive p-0" style="overflow: auto; max-height: 400px;">
                <table class="table align-items-center mb-0">
                  <thead>
                    <tr>
                       <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Patient</th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Doctor</th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>
                      <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                      <th class="text-secondary opacity-7">Show</th>
                      <th class="text-secondary opacity-7">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="Appointment in filteredRequestsPatient" :key="Appointment.id" class="request-card">
                      
                      
                      <td class="text-center">
                        <div class="d-flex flex-column justify-content-center">
                        <h4 class="mb-0 text-sm">{{ Appointment.patient.firstName }}  {{ Appointment.patient.lastName }}</h4>
                        </div>
                      </td>
                      <td class="text-center">
                        <div class="d-flex flex-column justify-content-center">
                            <h4 class="mb-0 text-sm">{{ Appointment.doctor.firstName }} {{ Appointment.doctor.lastName }}</h4></div>
                      </td>
                      <td class="text-center">
                        <div class="d-flex flex-column justify-content-center">
                          <h3 class="mb-0 text-sm">{{ Appointment.appointmentDateTime }}</h3>
                        </div>
                      </td>
                      <td class="text-center">
                        <div class="d-flex flex-column justify-content-center">
                          <h4 class="mb-0 text-sm"
                          :class="{'togelac':Appointment.status==='accepted','togeldelDoctor':Appointment.status==='deleted by Doctor',
                          'togelObgoing':Appointment.status==='ongoing',
                          'togeldel':Appointment.status.includes('deleted by Patient')}">{{ Appointment.status }}</h4>
                        </div>
                      </td>
                      <td class="text-center">
                         <button @click="editAppointment(Appointment.id),showModalEdit=true"  class="btn btn-warning">Show</button>
                      </td>
                      <td class="text-center">
                        <button @click="deleteAppointment(Appointment.id)"  class="btn btn-danger">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed,onMounted } from 'vue';
  import { getFirestore, collection, getDocs, query, where,onSnapshot,deleteDoc,doc,getDoc } from 'firebase/firestore';
  import { useToast } from 'vue-toastification';
   
  export default {
  
    name: 'adminAppointmentView',
    
    setup() {
      const showModal = ref(false);
      const showModalEdit = ref(false);
      const selectedRole = ref('');
       const searchTerm = ref('');
      const searchQueryPatient = ref('');
      const patientsDoctors = ref([]);
      const hisAppointment=ref([]);
      const filteredRequestsPatient = computed(() => {
                  return hisAppointment.value.filter(Appointment =>
                  Appointment.patient.firstName.toLowerCase().includes(searchQueryPatient.value.toLowerCase()) ||
                  Appointment.patient.lastName.toLowerCase().includes(searchQueryPatient.value.toLowerCase()) ||
                  Appointment.doctor.firstName.toLowerCase().includes(searchQueryPatient.value.toLowerCase()) ||
                  Appointment.doctor.lastName.toLowerCase().includes(searchQueryPatient.value.toLowerCase())
                    );
          });
      const filteredPatient = computed(() => {
                  return patientsDoctors.value.filter(patient =>
                  patient.firstName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
                  patient.lastName.toLowerCase().includes(searchTerm.value.toLowerCase())
                  );
                });
      const toast = useToast();
      const appointmentDateTime = ref('');
      const appointmentDateTimeChange = ref('');
      const minDateTime = ref(new Date().toISOString().slice(0, 16));
      const comment = ref('');
      const commentChange = ref('');
      const commentChangePrivate = ref('');
      const commentChangeDoctor = ref('');
      const patientDetails = ref({});
      const appointmentIdChange=ref("");


////
      const fetchPatientsAppointment = async () => {
             const db = getFirestore();
            const hisAppointmentRef = collection(db, 'AppointmentRequest');

            const q = query(hisAppointmentRef, where('status', 'in', ['ongoing', 'accepted', 'deleted by Doctor','deleted by Patient']));

            // Create a map to store user data
            const userMap = new Map();

            // Fetch all user data once
            const usersRef = collection(db, 'users');
           const usersSnapshot = await getDocs(usersRef);
            usersSnapshot.docs.forEach(doc => {
           const userData = doc.data();
            // Use the document ID as the key if UID is missing
            const auid = doc.id;  // Get the document ID
            userMap.set(auid, userData);
          });


            // Using onSnapshot for real-time updates
            onSnapshot(q, (snapshot) => {
              hisAppointment.value = snapshot.docs
                .map(doc => ({
                  id: doc.id, // Include document ID
                  ...doc.data()
                }))
                .map(appointment => ({
                  ...appointment,
                  status: appointment.status,
                  commentDoctor: appointment.commentDoctor,
                  commentPatient: appointment.commentPatient,
                  appointmentDateTime: appointment.appointmentDateTime,
                  commentPrivate: appointment.commentPrivate,
                  patient: userMap.get(appointment.user), // Add patient information
                  doctor: userMap.get(appointment.doctor) // Add patient information
                }));
              
              console.log("Real-time Appointments with Patients:", hisAppointment.value);
            }, (error) => {
              console.error("Error fetching appointments in real-time:", error);
            });
          };
///


  
const editAppointment = async (appointmentId) => {
        appointmentIdChange.value = appointmentId;
        const db = getFirestore();
  
        // Use `doc` to get a reference to the specific document
        const appointmentRef = doc(db, 'AppointmentRequest', appointmentIdChange.value);
        
        try {
            // Fetch the document data
            const appointmentSnap = await getDoc(appointmentRef);
  
            if (appointmentSnap.exists()) {
                // Extract data if the document exists
                const appointmentData = appointmentSnap.data();
                commentChangePrivate.value = appointmentData.commentPrivate || '';
                commentChangeDoctor.value = appointmentData.commentDoctor || '';
                commentChange.value = appointmentData.commentPatient || '';
                appointmentDateTimeChange.value = appointmentData.appointmentDateTime || '';
            } else {
                console.log('No such document!');
            }
            console.log("appointmentDateTimeChange.value,",appointmentDateTimeChange.value,)
  
        } catch (error) {
            console.error('Error fetching appointment:', error);
        }
  
     };    
  
  
      const submitRequestChange =   () => {
        try {
    
   
          // Update the document with new values
       
          // Close the modal and reset values
          showModalEdit.value = false;
          appointmentDateTimeChange.value = '';
          commentChangeDoctor.value = '';
          commentChangePrivate.value = '';
          commentChange.value = '';

  
          // Show success notification
          toast.success('Request sent successfully!');
      } catch (error) {
            toast.error('Error submitting request:', error);
          }
        
      };
      
      /////
      
      const deleteAppointment = async (appointment) => {
        try {
          const db = getFirestore();
          console.log("appointmentId:", appointment);
  
          const appointmentRef = doc(db, 'AppointmentRequest',appointment);
   
   
          // Update the status of the appointment
        await deleteDoc(appointmentRef )
  
          toast.success('Appointment status Delted".');
        } catch (error) {
          console.error('Error updating appointment status:', error);
          toast.error('Failed to update appointment status.');
        }
      };
  /////////
      const fetchPatient = async () => {
           const db = getFirestore();
          const listofRequest = collection(db, 'requests');
          const listofRequestsnapshot = await getDocs(listofRequest);
  
          const listofthisPatientThatAcceptedDoctorID = listofRequestsnapshot.docs
            .map(doc => doc.data())
            .filter(request => request.status === "accepted")
            .map(request =>[request.userId, request.doctorId]);
  
          const doctorsRef = collection(db, 'users');
          const querySnapshot = await getDocs(doctorsRef);
  
          patientsDoctors.value = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .filter(user =>
              listofthisPatientThatAcceptedDoctorID.includes(user.id) &&
              user.active === true
            );
        
      };
///
   

 

      onMounted(() => {
      fetchPatientsAppointment();
    });
      return {
        showModal,showModalEdit,
        selectedRole,searchQueryPatient,
        searchTerm,
        patientsDoctors,deleteAppointment,editAppointment,
        hisAppointment,
        filteredPatient,
        appointmentDateTime,
        appointmentDateTimeChange,
        commentChange,
        commentChangePrivate,
        commentChangeDoctor,
        minDateTime,
        comment,appointmentIdChange,
        filteredRequestsPatient,
        patientDetails,
        fetchPatient,
        fetchPatientsAppointment,
        submitRequestChange
      };
    }
  };
  </script>
  
  
  
  <style scoped>
  
  .togeldelDoctor {
    display: inline-flex; /* Allows the background to wrap around the content */
    color: white; 
    border-radius: 8px;
    justify-content: center; 
    text-align: center;
    padding: 8px 12px; /* Adjust padding to be more consistent */
    background-color: rgb(255, 0, 0);
    width: 100%; /* Makes the element take the full width of the parent container */
    box-sizing: border-box; /* Includes padding and border in the element's total width */

    @media (max-width: 800px) {
        justify-content: center;
        align-items: center; 
        text-align: center; /* Center text on smaller screens */
    }  }
    .togelac {
    display: inline-flex; /* Allows the background to wrap around the content */
    color: white; 
    border-radius: 8px;
    justify-content: center; 
    text-align: center;
    padding: 8px 12px; /* Adjust padding to be more consistent */
    background-color: rgb(8, 208, 38);
    width: 100%; /* Makes the element take the full width of the parent container */
    box-sizing: border-box; /* Includes padding and border in the element's total width */

    @media (max-width: 800px) {
        justify-content: center;
        align-items: center; 
        text-align: center; /* Center text on smaller screens */
    }
}.togeldel {
    display: inline-flex; /* Allows the background to wrap around the content */
    color: white; 
    border-radius: 8px;
    justify-content: center; 
    text-align: center;
    padding: 8px 12px; /* Adjust padding to be more consistent */
    background-color: rgb(111, 11, 11);
    width: 100%; /* Makes the element take the full width of the parent container */
    box-sizing: border-box; /* Includes padding and border in the element's total width */

    @media (max-width: 800px) {
        justify-content: center;
        align-items: center; 
        text-align: center; /* Center text on smaller screens */
    }
}

    .togelObgoing {
      display: inline-flex; /* Allows the background to wrap around the content */
    color: white; 
    border-radius: 8px;
    justify-content: center; 
    text-align: center;
    padding: 8px 12px; /* Adjust padding to be more consistent */
    background-color: rgb(44, 16, 126);
    width: 100%; /* Makes the element take the full width of the parent container */
    box-sizing: border-box; /* Includes padding and border in the element's total width */

    @media (max-width: 800px) {
        justify-content: center;
        align-items: center; 
        text-align: center; /* Center text on smaller screens */
    }


}
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
  padding: 1rem;
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
  
  .btn-accepted {
  background-color: #28a745;
  border: 1px solid #28a745;
  color: #fff;
  }
  
  .btn-accepted:hover {
  background-color: #218838;
  border-color: #1e7e34;
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
  .search-inputs{
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    width: calc(100% - 22px); /* Adjust for padding */
    margin-bottom: 7%; /* Space between search and dropdown */
    margin-top: 0%; /* Space between search and dropdown */
    margin-left: 20%;
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
   
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6); /* Slightly darker overlay for better focus */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999; /* Ensures modal appears on top */
  }
  
  .modal-content {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    width: 100%;
    max-width: 600px;
    height: 700px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Adds a shadow for depth */
    position: relative; /* Correct positioning */
    animation: slide-down 0.3s ease-out; /* Simple animation for appearance */
    overflow-y: auto; /* Adds scroll if content exceeds height */
  }
  .modal-content-edit {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    width: 100%;
    max-width: 600px;
    height: 700px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Adds a shadow for depth */
    position: relative; /* Correct positioning */
    animation: slide-down 0.3s ease-out; /* Simple animation for appearance */
    overflow-y: auto; /* Adds scroll if content exceeds height */
  }
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ff4d4d;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s; /* Smooth background transition */
  }
  
  .close-button:hover {
    background: #ff1a1a; /* Hover effect for the close button */
  }
  
  h2 {
    margin-bottom: 20px; /* Adds space below the title */
  }
  
  form > div {
    margin-bottom: 10px; /* Reduced spacing between form elements */
  }
  
  select[v-model="selectedRole"] {
    margin-top: 10px; /* Adds space above the select role dropdown */
  }
  /* Search input */
  .search-input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    width: calc(100% - 22px); /* Adjust for padding */
    margin-bottom: 10px; /* Space between search and dropdown */
  }
  
  /* Doctor dropdown */
  .selectD {
    display: flex;
    flex-direction: column;
  }
  input[type='datetime-local'],
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    font-size: 16px;
    transition: border-color 0.3s; /* Smooth border transition */
  }
  
  input[type='datetime-local']:focus,
  textarea:focus,
  select:focus {
    border-color: #007bff; /* Focus effect */
    outline: none;
  }
  
 
  
 
  .user-image-doctor{
    width: 90px; /* Increased size for better visibility */
    height: 90px;
    border-radius: 50%;
    display: block; /* Centers the image */
    object-fit: cover;
    
  }
  .user-image {
    width: 150px; /* Increased size for better visibility */
    height: 150px;
    border-radius: 50%;
    margin-right: 10px;
    display: block; /* Centers the image */
    object-fit: cover;
    margin: 0 auto 15px; /* Centers horizontally and adds some spacing below */
    /* Ensures image covers area without distortion */
  }
  
  .disabled {
    background-color: #f0f0f0;
    color: #999;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
   
  
  @keyframes slide-down {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  </style>
  
  
  
  
  
  
  
  
  
  
  
  
  