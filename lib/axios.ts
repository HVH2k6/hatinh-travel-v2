import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Gọi về Route Handler của Next.js thay vì Laravel
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Bắt buộc có để trình duyệt tự gửi cookie HttpOnly đi kèm
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu Route Handler của Next.js báo về là 401 (Token hết hạn hoặc không có token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gọi tới Route Handler refresh của Next.js để thử đổi token trên Server
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        // Refresh thành công, thử thực hiện lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        // ✅ TỐI ƯU TẠI ĐÂY: KHÔNG dùng window.location.href = "/" ở đây nữa!
        // Nếu refresh lỗi (khách vãng lai), chỉ cần reject để các API public chạy tiếp bình thường, không đá văng người dùng.
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;