<template>
  <div class="test-page" style="padding: 50px; text-align: center; color: #fff;">
    <h2>Health Check</h2>
    <button @click="testConnection" style="padding: 10px 20px; cursor: pointer;">
      Backend check
    </button>
    
    
    <div v-if="serverMessage" style="margin-top: 20px; padding: 20px; border: 1px solid #d4af37;">
      <p><strong> Server response:</strong></p>
      <p>{{ serverMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const serverMessage = ref('');

const testConnection = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/test');
    serverMessage.value = response.data.message;
  } catch (error) {
    serverMessage.value = "Connection failed! The endpoint is not running or CORS is misconfigured.";
  }
};
</script>