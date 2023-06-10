import axios from 'axios';
import app from './appConfig'
// import { useHistory } from 'react-router-dom';

// Create an Axios instance
const Axios = axios.create({
  baseURL: app.BACKEND_URL,
	withCredentials: true
});

// Add a request interceptor
Axios.interceptors.request.use(
  (config) => {
    // You can modify the request config here if needed
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
Axios.interceptors.response.use(
  (response) => {
    // You can modify the response data here if needed
    return response;
  },
  (error) => {
    // Handle response error
    if (error.response && error.response.status === 401) {
			localStorage.clear();
      window.location.replace("/");
			
      // You can also perform additional actions here, such as showing a notification

      // Return a new Promise to prevent the error from propagating further
      return new Promise(() => {});
    }

    return Promise.reject(error);
  }
);

export default Axios;
