document.getElementById('addFieldForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Chặn hành vi tải lại trang mặc định của Form

    // 1. Lấy dữ liệu từ các ô nhập liệu
    const fieldNameInput = document.getElementById('fieldName').value;
    const addressInput = document.getElementById('address').value;
    const fieldTypeIdInput = document.getElementById('fieldTypeId').value;
    const descriptionInput = document.getElementById('description').value;
    const imageUrlInput = document.getElementById('imageUrl').value;

    // 2. Đóng gói dữ liệu thành chuẩn JSON
    // Lưu ý: Do FieldType là một bảng khác liên kết bằng Khóa ngoại, 
    // ta cần bọc nó trong một object fieldType như bên dưới để Spring Boot hiểu.
    const newFieldData = {
        fieldName: fieldNameInput,
        address: addressInput,
        description: descriptionInput,
        status: true, // Mặc định sân mới tạo sẽ luôn hiển thị "Đang hoạt động"
        fieldType: {
            fieldTypeId: parseInt(fieldTypeIdInput) 
        },
        images: [
            { imageUrl: imageUrlInput }
        ]
    };

    // 3. Gửi dữ liệu qua Backend bằng method POST
    fetch('http://localhost:8080/api/fields', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newFieldData)
    })
    .then(async response => {
        if (response.ok) {
            alert('Thêm sân bóng mới thành công!');
            window.location.href = 'admin_index.html'; // Tự động quay về danh sách sân
        } else {
            const errorText = await response.text();
            alert('Lỗi khi thêm sân: ' + errorText);
        }
    })
    .catch(error => {
        console.error('Lỗi kết nối API:', error);
        alert('Không thể kết nối đến máy chủ Backend!');
    });
});

// Hàm Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'dangnhap.html';
}