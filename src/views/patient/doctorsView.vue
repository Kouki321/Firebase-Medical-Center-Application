<!-- src/components/DoctorCard.vue -->
<template>
    <div v-show="doctor.active" class="doctor-card">
      <img :src="doctor.profileImage || 'default-image-url.png'" alt="Doctor Image" class="doctor-image">
      <h3>{{ doctor.firstName }} {{ doctor.lastName }}</h3>
      <p>Specialty: {{ doctor.role }}</p>
      <p>Phone: {{ doctor.phoneNumber }}</p>
      <p>Office: {{ doctor.officeNumber }}</p>
    <div class="button-container">
      <button @click="sendRequest" class="request-button" >Send Request</button>
    </div>
  </div>
  </template>
  
  <script>
  export default {
    name: 'doctorsView',
    props: {
      doctor: {
        type: Object,
        required: true
      }
    },
    methods: {
      sendRequest() {
        this.$emit('send-request', this.doctor.id); // Emit event with doctor ID
      }
    }
  };
  </script>
  
  <style scoped>
  .doctor-card {
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

.doctor-image {
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
  