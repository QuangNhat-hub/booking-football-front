document.getElementById('registerForm').addEventListener('submit', function(event) {
    // Ngăn không cho form tải lại trang
    event.preventDefault();

    // 1. Lấy dữ liệu người dùng nhập vào
    const hoTen = document.getElementById('hoTen').value;
    const soDienThoai = document.getElementById('soDienThoai').value;
    const email = document.getElementById('email').value;
    const matKhau = document.getElementById('passInput').value;

    // 2. Gói dữ liệu lại thành cục JSON
    const dataToSend = {
        fullName: hoTen,       // Sửa thành f thường
        phone: soDienThoai,    // Sửa thành p thường
        email: email,          // Sửa thành e thường
        password: matKhau,     // Sửa thành p thường
        roleId: 2              // Sửa Role_id thành roleId
    };

    // 3. Gửi lên Backend API (Thay đường dẫn này bằng API thực tế của bạn)
    fetch('http://localhost:8080/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (response.ok) {
            alert('Đăng ký thành công!');
            // Chuyển hướng sang trang đăng nhập
            window.location.href = 'dangnhap.html'; 
        } else {
            alert('Đăng ký thất bại, email có thể đã tồn tại.');
        }
    })
    .catch(error => {
        console.error('Lỗi kết nối API:', error);
        alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại Backend!'); // Thêm dòng này
    });
    
});