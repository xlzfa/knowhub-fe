import axios from "axios";

const request = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("knowhub_token");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export default request;
