// Attaches the JWT from localStorage to every outgoing axios request.
// Because axios is a singleton module, setting this up once here applies
// to every `import axios from 'axios'` elsewhere in the app — no need to
// change existing component imports.
import axios from 'axios';
import { getToken, clearSession } from '../utils/auth';

axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export default axios;