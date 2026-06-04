// 1. Lấy ID sân bóng từ trên thanh URL (vd: ?id=1)
const urlParams = new URLSearchParams(window.location.search);
const fieldId = urlParams.get('id');

if (!fieldId) {
    alert("Không tìm thấy mã sân!");
    window.location.href = 'admin_index.html';
}

// 2. Vừa vào trang là lấy dữ liệu cũ đổ vào Form ngay
fetch(`http://localhost:8080/api/fields/${fieldId}`)
    .then(response => response.json())
    .then(field => {
        // Đổ dữ liệu vào các ô input
        document.getElementById('fieldName').value = field.fieldName;
        document.getElementById('address').value = field.address;
        document.getElementById('description').value = field.description || '';
    })
    .catch(error => {
        console.error("Lỗi khi tải thông tin sân:", error);
        alert("Không thể tải thông tin sân!");
    });

// 3. Xử lý khi Admin ấn nút "Lưu Thay Đổi"
document.getElementById('editFieldForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Chặn hành vi tải lại trang của form

    // Gói dữ liệu mới vào Object
    const updatedData = {
        fieldName: document.getElementById('fieldName').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value
    };

    // Bắn API bằng method PUT
    fetch(`http://localhost:8080/api/fields/${fieldId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(async response => {
        if (response.ok) {
            alert('Cập nhật thông tin sân thành công!');
            window.location.href = 'admin_index.html'; // Sửa xong thì quay về danh sách
        } else {
            const errorText = await response.text();
            alert('Lỗi: ' + errorText);
        }
    })
    .catch(error => {
        console.error('Lỗi khi lưu sân:', error);
        alert('Không thể kết nối đến máy chủ!');
    });
});