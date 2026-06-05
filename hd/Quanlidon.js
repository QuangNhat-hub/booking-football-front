const API_BASE = "http://localhost:8080/api/bookings";

// Helper function: Định dạng thời gian với padding
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// Kiểm tra đăng nhập
let currentUser = localStorage.getItem("user");
if (!currentUser) {
    alert("Vui lòng đăng nhập để xem lịch sử đặt sân");
    window.location.href = "dangnhap.html";
}

let user;
try {
    user = JSON.parse(currentUser);
    if (!user || !user.id) throw new Error("Dữ liệu người dùng không hợp lệ");
} catch (error) {
    alert("Lỗi: Dữ liệu đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
    localStorage.removeItem("user");
    window.location.href = "dangnhap.html";
}

const userId = user.id;

async function loadBookings() {
    try {
        const response = await fetch(`${API_BASE}/user/${userId}`);
        if (!response.ok) throw new Error("Lỗi khi tải dữ liệu");
        const bookings = await response.json();
        renderBookings(bookings);
    } catch (error) {
        const messageEl = document.getElementById("message");
        if (messageEl) {
            messageEl.innerText = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
        }
        console.error(error);
    }
}

function renderBookings(bookings) {
    const container = document.getElementById("bookingList");
    if (!container) {
        console.error("Phần tử bookingList không tồn tại!");
        return;
    }

    if (!bookings || !bookings.length) {
        container.innerHTML = "<p>Bạn chưa có đơn đặt sân nào.</p>";
        return;
    }

    container.innerHTML = "";
    
    bookings.forEach(booking => {
        const startTime = new Date(booking.startTime);
        
        // Sửa lỗi định dạng thời gian - thêm padding 0
        const day = padZero(startTime.getDate());
        const month = padZero(startTime.getMonth() + 1);
        const year = startTime.getFullYear();
        const hours = padZero(startTime.getHours());
        const minutes = padZero(startTime.getMinutes());
        const formattedTime = `${day}/${month}/${year} ${hours}:${minutes}`;
        
        let statusClass = "";
        switch (booking.status) {
            case "pending": statusClass = "pending"; break;
            case "confirmed": statusClass = "confirmed"; break;
            case "cancelled": statusClass = "cancelled"; break;
            case "completed": statusClass = "completed"; break;
            case "no_show": statusClass = "no_show"; break;
            default: statusClass = "unknown";
        }
        
        const now = new Date();
        const hoursDiff = (startTime - now) / (1000 * 3600);
        const canCancel = (booking.status === "pending" || booking.status === "confirmed") && hoursDiff >= 24;

        const card = document.createElement("div");
        card.className = "booking-card";
        card.innerHTML = `
            <h3>🏟️ ${booking.pitchName || "N/A"}</h3>
            <p><strong>Địa chỉ:</strong> ${booking.pitchAddress || "N/A"}</p>
            <p><strong>Thời gian bắt đầu:</strong> ${formattedTime} (${booking.hours || "N/A"} giờ)</p>
            <p><strong>Tổng tiền:</strong> ${booking.totalPrice ? booking.totalPrice.toLocaleString() : "0"} VNĐ</p>
            <p><strong>Trạng thái:</strong> <span class="status ${statusClass}">${booking.status}</span></p>
            ${booking.cancelReason ? `<p><strong>Lý do hủy:</strong> ${booking.cancelReason}</p>` : ""}
            <p style="font-size:12px; color:gray;">Mã đơn: ${booking.id}</p>
            ${canCancel ? `<button class="btn-cancel" data-id="${booking.id}">❌ Hủy đơn</button>` : ""}
        `;
        container.appendChild(card);
    });

    // Gắn event listeners cho các nút hủy (chỉ một lần)
    document.querySelectorAll(".btn-cancel").forEach(btn => {
        btn.addEventListener("click", handleCancelClick);
    });
}

async function handleCancelClick(event) {
    const btn = event.currentTarget;
    const bookingId = btn.getAttribute("data-id");
    const reason = prompt("Nhập lý do hủy sân (không bắt buộc):");
    
    // Nếu user nhấn Cancel hoặc không nhập gì
    if (reason === null) return;
    
    await cancelBooking(bookingId, reason || "Không có lý do");
}

async function cancelBooking(bookingId, reason) {
    try {
        const response = await fetch(`${API_BASE}/${bookingId}/cancel`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: reason })
        });
        
        if (response.ok) {
            alert("✅ Hủy đơn thành công!");
            loadBookings();
        } else {
            const errorText = await response.text();
            alert(`❌ Hủy thất bại: ${errorText}`);
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối đến server. Vui lòng kiểm tra lại.");
    }
}

document.addEventListener("DOMContentLoaded", loadBookings);
