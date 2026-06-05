const API_BASE = "http://localhost:8080/api/users";

function getCurrentUser() {
  const currentUserStr = localStorage.getItem("currentUser");

  if (currentUserStr) {
    try {
      return JSON.parse(currentUserStr);
    } catch (e) {
      console.error(e);
    }
  }

  return {
    userId: localStorage.getItem("userId"),
    fullName: localStorage.getItem("fullName"),
    phone: localStorage.getItem("phone"),
    email: localStorage.getItem("email"),
  };
}

let currentUser = getCurrentUser();
const userId = currentUser.userId || currentUser.id;

if (!localStorage.getItem("isLogin") || !userId) {
  alert("Vui lòng đăng nhập trước!");
  window.location.href = "dangnhap.html";
}

document.getElementById("fullName").value = currentUser.fullName || "";
document.getElementById("phone").value = currentUser.phone || "";
document.getElementById("email").value = currentUser.email || "";

document.querySelectorAll(".toggle-password").forEach((icon) => {
  icon.addEventListener("click", function () {
    const input = document.getElementById(this.dataset.target);

    input.type = input.type === "password" ? "text" : "password";

    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
});

document
  .getElementById("profileForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const phone = document.getElementById("phone").value.trim();

    if (!/^0\d{9}$/.test(phone)) {
      alert("Số điện thoại phải gồm 10 số và bắt đầu bằng 0!");
      return;
    }

    const dataToSend = {
      fullName: fullName,
      phone: phone,
    };

    try {
      const response = await fetch(`${API_BASE}/${userId}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const text = await response.text();

      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        result = { message: text };
      }

      if (!response.ok) {
        throw new Error(result.message || "Cập nhật thông tin thất bại!");
      }

      const updatedUser = {
        ...currentUser,
        ...result,
        userId: result.userId || result.id || userId,
        fullName: result.fullName || fullName,
        phone: result.phone || phone,
      };

      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      localStorage.setItem("userId", updatedUser.userId);
      localStorage.setItem("fullName", updatedUser.fullName);
      localStorage.setItem("phone", updatedUser.phone);
      localStorage.setItem("isLogin", "true");

      currentUser = updatedUser;

      alert(
        "Cập nhật thành công! Từ lần sau hãy đăng nhập bằng số điện thoại mới: " +
          updatedUser.phone,
      );
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      alert(error.message || "Không thể kết nối đến máy chủ Backend!");
    }
  });

document
  .getElementById("passwordForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword.length < 6) {
      alert("Mật khẩu mới nên có ít nhất 6 ký tự!");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới nhập lại không khớp!");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/${userId}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: oldPassword,
          newPassword: newPassword,
        }),
      });

      const text = await response.text();

      if (!response.ok) {
        throw new Error(text || "Đổi mật khẩu thất bại!");
      }

      alert("Đổi mật khẩu thành công!");
      document.getElementById("passwordForm").reset();
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      alert(error.message || "Không thể kết nối đến máy chủ Backend!");
    }
  });

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userId");
  localStorage.removeItem("fullName");
  localStorage.removeItem("phone");
  localStorage.removeItem("email");
  localStorage.removeItem("isLogin");

  window.location.href = "dangnhap.html";
}
