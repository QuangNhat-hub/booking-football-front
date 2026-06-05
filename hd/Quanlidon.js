const API_BASE = "http://localhost:8080/api/bookings";

// Helper function: Định dạng thời gian với padding
function padZero(num) {
    return num.toString().padStart(2, '0');
}

// ==========================================
// KIỂM TRA ĐĂNG NHẬP & LẤY ID KHÁCH HÀNG
// ==========================================
let currentUser = localStorage.getItem("currentUser");
let userId = null;

if (!currentUser) {
    alert("Vui lòng đăng nhập để xem lịch sử đặt sân");
    window.location.href = "dangnhap.html";
} else {
    try {
        let user = JSON.parse(currentUser);
        // Linh hoạt lấy id hoặc userId từ localStorage
        userId = user.id || user.userId; 
        
        if (!userId) {
            throw new Error("Không tìm thấy ID người dùng");
        }
    } catch (error) {
        alert("Lỗi: Dữ liệu đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
        localStorage.removeItem("currentUser");
        window.location.href = "dangnhap.html";
    }
}

// ==========================================
// CÁC HÀM XỬ LÝ CHÍNH
// ==========================================
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
            messageEl.style.display = "block";
        }
        console.error(error);
    }
}

function renderBookings(bookings) {
    const container = document.getElementById("bookingList");
    const loadingEl = document.getElementById("loading");
    
    // Ẩn dòng chữ "Đang tải dữ liệu..."
    if (loadingEl) loadingEl.style.display = "none";

    if (!container) {
        console.error("Phần tử bookingList không tồn tại!");
        return;
    }

    if (!bookings || !bookings.length) {
        container.innerHTML = "<p style='text-align:center; width:100%; color:#666;'>Bạn chưa có đơn đặt sân nào.</p>";
        return;
    }

    container.innerHTML = ""; // Xóa rỗng container trước khi vẽ thẻ mới
    
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
        let statusText = booking.status;
        switch (booking.status) {
            case "pending": 
                statusClass = "pending"; 
                statusText = "Đang chờ duyệt";
                break;
            case "confirmed": 
                statusClass = "confirmed"; 
                statusText = "Đã chốt sân";
                break;
            case "cancelled": 
                statusClass = "cancelled"; 
                statusText = "Đã hủy";
                break;
            case "completed": 
                statusClass = "completed"; 
                statusText = "Đã hoàn thành";
                break;
            case "no_show": 
                statusClass = "no_show"; 
                statusText = "Khách không đến";
                break;
            default: statusClass = "unknown";
        }
        
        const now = new Date();
        const hoursDiff = (startTime - now) / (1000 * 3600);
        // Chỉ cho phép hủy nếu đơn chưa đá và còn cách giờ đá >= 24 tiếng
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
            <h3>🏟️ Sân ID: ${booking.pitchId || "N/A"}</h3>
            <p><strong>Thời gian đá:</strong> ${formattedTime} (${booking.hours || "N/A"} giờ)</p>
            <p><strong>Tổng tiền:</strong> <span style="color:#dc3545; font-weight:bold;">${booking.totalPrice ? booking.totalPrice.toLocaleString() : "0"} VNĐ</span></p>
            <p><strong>Trạng thái:</strong> <span class="status ${statusClass}">${statusText}</span></p>
            ${booking.cancelReason ? `<p><strong>Lý do hủy:</strong> ${booking.cancelReason}</p>` : ""}
            <p style="font-size:12px; color:gray; margin-top:15px;">Mã đơn: #${booking.id}</p>
            ${canCancel ? `<button class="btn-cancel" data-id="${booking.id}">❌ Hủy đơn</button>` : ""}
        `;
        container.appendChild(card);
    });

    // Gắn sự kiện click cho các nút hủy
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
    
    // Nếu user bấm Cancel trên hộp thoại prompt
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
            loadBookings(); // Tải lại danh sách để cập nhật giao diện
        } else {
            const errorText = await response.text();
            alert(`❌ Hủy thất bại: ${errorText}`);
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối đến server. Vui lòng kiểm tra lại.");
    }
}

// Khởi chạy khi load xong trang (Chỉ chạy nếu có ID)
if (userId) {
    document.addEventListener("DOMContentLoaded", loadBookings);
}