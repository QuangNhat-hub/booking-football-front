document.getElementById('addFieldForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Dùng FormData để chứa cả chữ lẫn file (hình ảnh)
    const formData = new FormData();
    formData.append('fieldName', document.getElementById('fieldName').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('fieldTypeId', document.getElementById('fieldTypeId').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('status', true);

    // Lấy file ảnh Admin vừa chọn nhét vào hộp
    const fileInput = document.getElementById('imageFile');
    if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
    }

    // Gửi qua Backend (Lưu ý: KHÔNG set headers Content-Type, trình duyệt sẽ tự động lo việc này)
    fetch('http://localhost:8080/api/fields/upload', {
        method: 'POST',
        body: formData
    })
    .then(async response => {
        if (response.ok) {
            alert('Thêm sân bóng thành công!');
            window.location.href = 'admin_index.html';
        } else {
            const errorText = await response.text();
            alert('Lỗi: ' + errorText);
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Không thể kết nối máy chủ!');
    });
});
// Hàm Đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'dangnhap.html';
}