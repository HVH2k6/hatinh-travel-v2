import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Gọi về Route Handler của Next.js thay vì Laravel
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Bắt buộc có để trình duyệt tự gửi cookie HttpOnly đi kèm
});

// KHÔNG CẦN interceptor request để kẹp Token nữa, trình duyệt tự lo!

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu Route Handler của Next.js báo về là 401 (Token hết hạn)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi tới Route Handler refresh của Next.js để nó tự xử lý đổi token trên Server
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        // Refresh thành công, thử thực hiện lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại -> đá sang login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;