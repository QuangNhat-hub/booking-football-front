// 1. Kiểm tra quyền Admin (Copy từ trang index sang để bảo mật)
try {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        window.location.href = 'dangnhap.html';
    } else {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.roleId !== 1) {
            window.location.href = 'dangnhap.html';
        }
    }
} catch (error) {
    window.location.href = 'dangnhap.html';
}

// Hàm format tiền tệ VNĐ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// 2. Tải danh sách đơn đặt sân từ Backend
function loadBookings() {
    fetch("http://localhost:8080/api/bookings") // Đảm bảo Backend của bạn có API này
        .then((response) => response.json())
        .then((data) => {
            const container = document.getElementById("booking-list");
            container.innerHTML = ""; // Xóa dòng "Đang tải..."

            if (data.length === 0) {
                container.innerHTML = '<tr><td colspan="7" style="text-align:center;">Chưa có đơn đặt sân nào.</td></tr>';
                return;
            }

data.forEach((booking) => {
                // Xử lý huy hiệu trạng thái (Giữ nguyên)
                let badgeClass = '';
                let statusText = booking.status;
                if (statusText === 'pending' || statusText === 'Chờ xác nhận') {
                    badgeClass = 'badge-pending'; statusText = 'Chờ xác nhận';
                } else if (statusText === 'confirmed' || statusText === 'Đã xác nhận') {
                    badgeClass = 'badge-confirmed'; statusText = 'Đã xác nhận';
                } else {
                    badgeClass = 'badge-cancelled'; statusText = 'Đã hủy';
                }

                // --- BỘ DỊCH TÊN BIẾN (Chỉnh lại cho khớp với Java của bạn) ---
                
                // 1. Mã đơn (Có thể backend trả về là id thay vì bookingId)
                const maDon = booking.id || booking.bookingId || 'Lỗi ID';

                // 2. Tên khách hàng (Nếu backend chỉ trả về userId chứ không trả về nguyên object User)
                let tenKhach = 'Khách vãng lai';
                if (booking.user && booking.user.fullName) {
                    tenKhach = booking.user.fullName;
                } else if (booking.userId) {
                    tenKhach = 'Mã KH: ' + booking.userId; // Tạm hiện mã nếu chưa Join bảng User
                }

                // 3. Mã sân (Java của bạn đặt là pitchId)
                const maSan = booking.pitchId || booking.fieldId || 'N/A';

                // 4. Ngày đặt (Java của bạn lưu là createdAt hoặc startTime)
                const thoiGian = booking.createdAt || booking.startTime || booking.bookingDate;
                const ngayDatHienThi = thoiGian ? new Date(thoiGian).toLocaleString('vi-VN') : 'Không rõ';

                // Vẽ từng dòng của bảng
                const rowHTML = `
                    <tr>
                        <td><strong>#${maDon}</strong></td>
                        <td>${tenKhach}</td>
                        <td>Sân ID: ${maSan}</td> 
                        <td>${ngayDatHienThi}</td>
                        <td style="color: #dc3545; font-weight: bold;">${formatCurrency(booking.totalPrice)}</td>
                        <td><span class="badge ${badgeClass}">${statusText}</span></td>
                        <td>
                            ${statusText === 'Chờ xác nhận' ? `
                                <button onclick="updateStatus(${maDon}, 'confirmed')" class="btn-action btn-approve"><i class="fas fa-check"></i> Duyệt</button>
                                <button onclick="updateStatus(${maDon}, 'cancelled')" class="btn-action btn-cancel"><i class="fas fa-times"></i> Hủy</button>
                            ` : `<span style="color: #666; font-size:12px;">Đã xử lý</span>`}
                        </td>
                    </tr>
                `;
                container.insertAdjacentHTML("beforeend", rowHTML);
            });
        })
        .catch((error) => {
            console.error("Lỗi tải danh sách đơn:", error);
            document.getElementById("booking-list").innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Lỗi khi tải dữ liệu từ máy chủ!</td></tr>';
        });
}

// Gọi hàm tải dữ liệu ngay khi mở trang
loadBookings();

// Hàm Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'dangnhap.html';
}

// Hàm cập nhật trạng thái đơn (Gọi API can thiệp)
function updateStatus(bookingId, newStatus) {
    // Dịch chữ để hiện thông báo cho thân thiện
    const actionName = newStatus === 'confirmed' ? 'Duyệt' : 'Hủy';

    if(confirm(`Bạn có chắc chắn muốn ${actionName} đơn đặt sân #${bookingId} này không?`)) {
        
        // Gọi xuống Backend
        fetch(`http://localhost:8080/api/bookings/${bookingId}/status?status=${newStatus}`, {
            method: 'PUT'
        })
        .then(async response => {
            if (response.ok) {
                alert(`${actionName} đơn thành công!`);
                // Thay vì tải lại cả trang web, ta chỉ cần gọi lại hàm load bảng cho mượt
                loadBookings(); 
            } else {
                const errorText = await response.text();
                alert('Lỗi: ' + errorText);
            }
        })
        .catch(error => {
            console.error('Lỗi khi cập nhật trạng thái:', error);
            alert('Không thể kết nối đến máy chủ Backend!');
        });
    }
}