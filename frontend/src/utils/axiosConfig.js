import axios from 'axios';
import store from '../redux/store';
import { setUser } from '../redux/userSlice';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and it's not a retry already, AND it's not the login or refresh route
    const isAuthRoute = originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh-token') || originalRequest.url.includes('/signup');
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const state = store.getState();
        const oldUser = state.user?.user; // wait, let's check what user slice is called
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(`${import.meta.env.VITE_URL}/api/v1/user/refresh-token`, {
          refreshToken: refreshToken
        });

        if (data.success) {
          localStorage.setItem("accessToken", data.token);
          localStorage.setItem("refreshToken", data.refreshToken);
          
          if (oldUser) {
             store.dispatch(setUser({ ...oldUser, token: data.token, refreshToken: data.refreshToken }));
          }

          processQueue(null, data.token);

          originalRequest.headers['Authorization'] = 'Bearer ' + data.token;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        store.dispatch(setUser(null));
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
