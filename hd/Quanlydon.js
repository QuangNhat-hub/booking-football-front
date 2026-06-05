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
let allBookings = []; // Lưu tất cả bookings

async function loadBookings() {
    try {
        showLoading();
        const response = await fetch(`${API_BASE}/user/${userId}`);
        if (!response.ok) throw new Error("Lỗi khi tải dữ liệu");
        const bookings = await response.json();
        allBookings = bookings;
        hideLoading();
        
        if (bookings && bookings.length > 0) {
            document.getElementById("filterSection").style.display = "flex";
            renderBookings(bookings);
        } else {
            showEmptyState();
        }
    } catch (error) {
        hideLoading();
        showMessage("❌ Không thể kết nối đến máy chủ. Vui lòng thử lại sau.", false);
        console.error(error);
    }
}

function getStatusLabel(status) {
    const labels = {
        pending: '⏳ Chờ duyệt',
        confirmed: '✓ Đã xác nhận',
        cancelled: '✗ Đã hủy',
        completed: '✓ Hoàn thành',
        no_show: '⊘ Không đến'
    };
    return labels[status] || status;
}

function renderBookings(bookings) {
    const container = document.getElementById("bookingList");
    if (!container) {
        console.error("Phần tử bookingList không tồn tại!");
        return;
    }

    if (!bookings || !bookings.length) {
        showEmptyState();
        return;
    }

    document.getElementById("emptyState").style.display = "none";
    container.innerHTML = "";
    
    bookings.forEach(booking => {
        const startTime = new Date(booking.startTime);
        
        // Định dạng ngày tháng năm
        const day = padZero(startTime.getDate());
        const month = padZero(startTime.getMonth() + 1);
        const year = startTime.getFullYear();
        const hours = padZero(startTime.getHours());
        const minutes = padZero(startTime.getMinutes());
        const formattedDate = `${day}/${month}/${year}`;
        const formattedTime = `${hours}:${minutes}`;
        const formattedFullTime = `${day}/${month}/${year} ${hours}:${minutes}`;
        
        let statusClass = "";
        switch (booking.status) {
            case "pending": statusClass = "pending"; break;
            case "confirmed": statusClass = "confirmed"; break;
            case "cancelled": statusClass = "cancelled"; break;
            case "completed": statusClass = "completed"; break;
            case "no_show": statusClass = "no_show"; break;
            default: statusClass = "pending";
        }
        
        const now = new Date();
        const hoursDiff = (startTime - now) / (1000 * 3600);
        const canCancel = (booking.status === "pending" || booking.status === "confirmed") && hoursDiff >= 24;

        const card = document.createElement("div");
        card.className = "booking-card";
        card.innerHTML = `
            <div class="booking-header">
                <div class="booking-title">🏟️ ${booking.pitchName || "N/A"}</div>
                <span class="status ${statusClass}">${getStatusLabel(booking.status)}</span>
            </div>
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">📍 Địa chỉ</span>
                    <span class="detail-value">${booking.pitchAddress || "N/A"}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">📅 Ngày</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">⏰ Giờ</span>
                    <span class="detail-value">${formattedTime}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">⏱️ Thời lượng</span>
                    <span class="detail-value">${booking.hours || "N/A"} giờ</span>
                </div>
            </div>
            ${booking.cancelReason ? `<div class="detail-item"><span class="detail-label">📝 Lý do hủy</span><span class="detail-value">${booking.cancelReason}</span></div>` : ""}
            <div class="booking-footer">
                <div class="booking-price">${booking.totalPrice ? booking.totalPrice.toLocaleString() : "0"}đ</div>
                ${canCancel ? `<button class="btn-cancel" data-id="${booking.id}">Hủy đặt</button>` : '<button class="btn-cancel" disabled>Không thể hủy</button>'}
            </div>
            <p style="font-size:11px; color:#999; margin-top:8px;">Mã đơn: #${booking.id}</p>
        `;
        container.appendChild(card);
    });

    // Gắn event listeners cho các nút hủy
    document.querySelectorAll(".btn-cancel:not(:disabled)").forEach(btn => {
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
            showMessage("✓ Hủy đơn thành công!", true);
            loadBookings();
        } else {
            const errorText = await response.text();
            showMessage(`✗ Hủy thất bại: ${errorText}`, false);
        }
    } catch (error) {
        console.error(error);
        showMessage("✗ Lỗi kết nối đến server. Vui lòng kiểm tra lại.", false);
    }
}

// Filter function
function onFilterBookings(status) {
    if (status === 'all') {
        renderBookings(allBookings);
    } else {
        const filtered = allBookings.filter(b => b.status === status);
        if (filtered.length === 0) {
            showEmptyState();
        } else {
            renderBookings(filtered);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadBookings);
