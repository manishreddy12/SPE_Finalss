import axios from "axios";

const AUTH_BASE_URL = "http://localhost:3000/auth";

export const loginApi = (payload) => {
  return axios.post(`${AUTH_BASE_URL}/login`, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


// import axios from "axios";

// const authClient = axios.create({
//   baseURL: "http://localhost:3000/auth",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// export const loginApi = async (data) => {
//   return authClient.post("/login", data);
// };


// import axios from 'axios';

// const AUTH_BASE_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3000/auth';

// export const loginApi = async (username, password) => {
//   // Example login; adapt to your real auth service.
//   // Expected response: { token: 'jwt', user: { id, username, isAdmin } }
//   const res = await axios.post(`${AUTH_BASE_URL}/login`, {
//     email: username,
//     password
//   });
//   return res.data;
// };
