// 1. Kiểm tra Quyền Truy Cập (Chỉ Admin mới được vào)
try {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        alert('Vui lòng đăng nhập trước!');
        window.location.href = 'dangnhap.html';
    } else {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser.roleId !== 1) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = 'dangnhap.html'; // Đuổi về trang đăng nhập
        } else {
            // Hiển thị tên Admin lên góc phải
            document.getElementById('adminName').innerText = 'Xin chào, ' + (currentUser.fullName || 'Admin');
        }
    }
} catch (error) {
    console.error("Lỗi xác thực:", error);
    window.location.href = 'dangnhap.html';
}

// 2. Tải danh sách sân bóng từ Backend
fetch("http://localhost:8080/api/fields")
    .then((response) => response.json())
    .then((data) => {
        const container = document.getElementById("admin-field-list");
        container.innerHTML = ""; // Xóa dữ liệu rác

        data.forEach((field) => {
            const linkAnh = field.images && field.images.length > 0 ? field.images[0].imageUrl : "../hinhanh/images (1).jpg";
            
            // 1. Xác định trạng thái hiện tại để đổi màu và chữ cho nút bấm
            // (Giả sử mặc định nếu null là Đang hoạt động)
            const currentStatus = field.status === false ? 'Bảo trì' : 'Đang hoạt động';
            const isMaintenance = currentStatus === 'Bảo trì';
            
            // Nếu đang bảo trì -> Nút sẽ có màu xanh (Mở lại), chữ "Mở hoạt động"
            // Nếu đang hoạt động -> Nút sẽ có màu cam (Khóa), chữ "Bảo trì"
            const statusColor = isMaintenance ? '#dc3545' : '#28a745'; // Đỏ hoặc Xanh lá
            const toggleStatusTo = isMaintenance ? 'Đang hoạt động' : 'Bảo trì';
            const toggleIcon = isMaintenance ? 'fa-unlock' : 'fa-lock';
            const toggleBtnColor = isMaintenance ? '#28a745' : '#fd7e14'; 

            const cardHTML = `
                <div class="pitch-card" style="cursor: default; position: relative;">
                    <div style="position: absolute; top: 10px; right: 10px; background-color: ${statusColor}; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold; font-size: 12px; z-index: 10;">
                        ${currentStatus}
                    </div>

                    <img src="${linkAnh}" alt="Sân bóng" class="pitch-img" style="${isMaintenance ? 'filter: grayscale(100%);' : ''}">
                    <div class="pitch-info">
                        <div class="pitch-header">
                            <h3 class="pitch-name">${field.fieldName}</h3>
                        </div>
                        <div class="pitch-footer" style="display:flex; justify-content: space-between; margin-top: 10px; border-top: 1px solid #eee; padding-top: 15px;">
                            
                            <div>
                                <button onclick="editField(${field.fieldId})" class="btn-admin-action btn-edit"><i class="fas fa-edit"></i></button>
                                <button onclick="deleteField(${field.fieldId})" class="btn-admin-action btn-delete"><i class="fas fa-trash"></i></button>
                            </div>

                            <button onclick="toggleFieldStatus(${field.fieldId}, '${toggleStatusTo}')" class="btn-admin-action" style="background-color: ${toggleBtnColor};">
                                <i class="fas ${toggleIcon}"></i> ${toggleStatusTo}
                            </button>
                            
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML("beforeend", cardHTML);
        });
    })
    .catch((error) => console.error("Lỗi tải danh sách sân:", error));

// 3. Các hàm chức năng cho Nút bấm
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'dangnhap.html';
}

function deleteField(id) {
    // Hiển thị hộp thoại xác nhận 2 lần cho chắc chắn (UX chuẩn của Admin)
    if(confirm('Bạn có chắc chắn muốn xóa sân bóng này không? Hành động này không thể hoàn tác!')) {
        
        // Gọi xuống Backend bằng method DELETE
        fetch(`http://localhost:8080/api/fields/${id}`, {
            method: 'DELETE'
        })
        .then(async response => {
            if (response.ok) {
                alert('Xóa sân thành công!');
                // Tải lại trang để danh sách sân cập nhật mới
                window.location.reload(); 
            } else {
                // Hứng câu thông báo lỗi từ Backend (ví dụ: "Đang có khách đặt")
                const errorText = await response.text();
                alert('Lỗi: ' + errorText);
            }
        })
        .catch(error => {
            console.error('Lỗi khi xóa sân:', error);
            alert('Không thể kết nối đến máy chủ!');
        });
    }
}

function editField(id) {
    alert('Sẽ chuyển sang trang sửa thông tin sân ID: ' + id);
    window.location.href = `admin_suasan.html?id=${id}`;
}


// Hàm gọi API đổi trạng thái sân
function toggleFieldStatus(id, newStatus) {
    if(confirm(`Bạn có chắc chắn muốn chuyển sân này sang trạng thái: ${newStatus}?`)) {
        
        fetch(`http://localhost:8080/api/fields/${id}/status?status=${newStatus}`, {
            method: 'PUT' // Dùng PUT để cập nhật
        })
        .then(async response => {
            if (response.ok) {
                alert('Cập nhật trạng thái thành công!');
                window.location.reload(); // Tải lại trang để thấy màu sắc thay đổi
            } else {
                const errorText = await response.text();
                alert('Lỗi: ' + errorText);
            }
        })
        .catch(error => {
            console.error('Lỗi khi đổi trạng thái:', error);
            alert('Không thể kết nối đến máy chủ!');
        });
    }
}