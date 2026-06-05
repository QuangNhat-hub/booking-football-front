const API_BASE = "http://localhost:8080/api/bookings";

// Helper function: Định dạng thời gian với padding
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// Helper function: An toàn parse JSON
function safeJsonParse(jsonString, fallback = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("JSON parse error:", error);
        return fallback;
    }
}

// Kiểm tra đăng nhập
let currentUser = localStorage.getItem("user");
if (!currentUser) {
    alert("Vui lòng đăng nhập để xem lịch sử đặt sân");
    window.location.href = "dangnhap.html";
}

let user = safeJsonParse(currentUser);

// Kiểm tra user hợp lệ
if (!user || !user.id) {
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
        // Kiểm tra và xử lý startTime
        let startTime;
        try {
            startTime = new Date(booking.startTime);
            if (isNaN(startTime.getTime())) {
                throw new Error("Thời gian không hợp lệ");
            }
        } catch (error) {
            console.error("Lỗi khi parse thời gian:", error);
            startTime = new Date(); // Fallback về thời gian hiện tại
        }
        
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
        
        // Sử dụng textContent và createElement để tránh XSS
        const pitchNameText = booking.pitchName || "N/A";
        const pitchAddressText = booking.pitchAddress || "N/A";
        const hoursText = booking.hours || "N/A";
        const totalPriceText = booking.totalPrice ? booking.totalPrice.toLocaleString() : "0";
        const bookingIdText = booking.id || "N/A";
        const cancelReasonText = booking.cancelReason || "";
        
        card.innerHTML = `
            <h3>🏟️ ${pitchNameText}</h3>
            <p><strong>Địa chỉ:</strong> ${pitchAddressText}</p>
            <p><strong>Thời gian bắt đầu:</strong> ${formattedTime} (${hoursText} giờ)</p>
            <p><strong>Tổng tiền:</strong> ${totalPriceText} VNĐ</p>
            <p><strong>Trạng thái:</strong> <span class="status ${statusClass}">${booking.status}</span></p>
            ${cancelReasonText ? `<p><strong>Lý do hủy:</strong> ${cancelReasonText}</p>` : ""}
            <p style="font-size:12px; color:gray;">Mã đơn: ${bookingIdText}</p>
            ${canCancel ? `<button class="btn-cancel" data-id="${bookingIdText}">❌ Hủy đơn</button>` : ""}
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
    
    // Kiểm tra booking ID hợp lệ
    if (!bookingId) {
        alert("❌ Lỗi: Không tìm thấy ID đơn đặt sân");
        return;
    }
    
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
