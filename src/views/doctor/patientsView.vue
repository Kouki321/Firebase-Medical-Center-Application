<!-- src/components/patientCard.vue -->
<template>
    <div v-show="patient.active" class="patient-card">
      <img :src="patient.profileImage || 'default-image-url.png'" alt="Patient Image" class="patient-image">
      <h3>{{ patient.firstName }} {{ patient.lastName }}</h3>
      <p>email: {{ patient.email }}</p>
    <div class="button-container">
      <button @click="sendRequest" class="request-button" >Send Request</button>
    </div>
  </div>
  </template>
  
  <script>
  export default {
    name: 'patientsView',
    props: {
      patient: {
        type: Object,
        required: true
      }
    },
    methods: {
      sendRequest() {
        this.$emit('send-request', this.patient.id); // Emit event with patient ID
      }
    }
  };
  </script>
  
  <style scoped>
  .patient-card {
  display: flex;
  flex-direction: column; /* Arrange items vertically */
  justify-content: space-between; /* Pushes content apart, button goes to the bottom */
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
  width: 200px;
  text-align: center;
  box-shadow: 0px 15px 20px rgba(0,0,0,0.27);
}

.patient-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 8px;
  margin: 0px 20% 5%; /* Add margin to separate from the text */

}

.button-container {
  margin-top: auto; /* Pushes the button container to the bottom */
  display: flex;
  justify-content: center; /* Centers the button horizontally */
}

.request-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}

.request-button:hover {
  background-color: #0056b3;
}

  </style>
  