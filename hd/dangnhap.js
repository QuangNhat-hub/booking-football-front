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
            const result = await response.json(); 
            localStorage.setItem('currentUser', JSON.stringify(result));
            alert('Đăng nhập thành công!');
            window.location.href = 'index.html'; 
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