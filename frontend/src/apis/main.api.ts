import axios from "axios";
import { appConfig } from "@/configs/app.config";

const mainApi = axios.create({
  baseURL: appConfig.baseApi,
  timeout: 10000,
  withCredentials: true,
  validateStatus: (status) => status < 500,
});

// Add a request interceptor
mainApi.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // const getToken = localStorage.getItem("token");
    // if (getToken) {
    //   const token = getToken.replace(/['""+/g, "");
    //   config.headers["Authorization"] = `Bearer ${token}`;
    //   config.headers["ngrok-skip-browser-warning"] = "69420";
    // }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
mainApi.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 401 && error.response?.data?.expired) {
      //console.log('Token has expired');
      alert('Your session has expired. Please login again.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default mainApi;
