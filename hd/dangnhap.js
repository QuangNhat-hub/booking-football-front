document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. Lấy Số điện thoại và Mật khẩu (Nhớ đảm bảo HTML có id="soDienThoai" và id="passInput")
    const soDienThoai = document.getElementById('soDienThoai').value;
    const matKhau = document.getElementById('passInput').value;

    // 2. Gói dữ liệu gửi đi (Dùng key là "phone" để Java hiểu được)
    const dataToSend = {
        phone: soDienThoai, 
        password: matKhau
    };

    // 3. Gửi request
    fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    })
    .then(async response => {
        if (response.ok) {
            // Lấy thông tin user từ Backend gửi về
            const result = await response.json(); 
            
            // Lưu thông tin vào bộ nhớ tạm
            localStorage.setItem('currentUser', JSON.stringify(result));
            alert('Đăng nhập thành công!');
            localStorage.setItem("userId", result.userId);
            localStorage.setItem("fullName", result.fullName);
            localStorage.setItem("phone", result.phone);
            localStorage.setItem("isLogin", "true");
            // BẮT ĐẦU BẺ NHÁNH DỰA VÀO ROLE_ID:
            if (result.roleId === 1) { 
                // Nếu là Admin -> Chuyển hướng sang trang Quản trị
                window.location.href = 'admin_index.html'; 
            } else {
                // Nếu là User (roleId === 2) -> Chuyển hướng sang trang chủ Đặt sân
                window.location.href = 'index.html'; 
            }
            
        } else {
            const errorText = await response.text();
            alert('Đăng nhập thất bại: ' + errorText);
        }
    })
    .catch(error => {
        console.error('Lỗi kết nối API:', error);
        alert('Không thể kết nối đến máy chủ Backend!');
    });
}); 