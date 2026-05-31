// ==========================================
// 1. XỬ LÝ CLICK CHỌN NGÀY TRONG LỊCH
// ==========================================
const calDays = document.querySelectorAll('.cal-day');

calDays.forEach(day => {
    day.addEventListener('click', function() {
        // Gỡ màu xanh ô cũ
        const currentActive = document.querySelector('.cal-day.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        
        // Gắn màu xanh cho ô mới
        this.classList.add('active');

        // Móc data ngày đắp xuống bảng (xóa khoảng trắng thừa bằng trim)
        const ngayClick = this.innerText.trim(); 
        const ngayDep = ngayClick.padStart(2, '0');
        const ngayHoanChinh = ngayDep + "/05/2026"; 

        document.getElementById('summary-ngay').innerText = ngayHoanChinh;
    });
});


// ==========================================
// 2. XỬ LÝ CLICK CHỌN KHUNG GIỜ
// ==========================================
// Chỉ lấy những ô giờ có class 'available'
const timeSlots = document.querySelectorAll('.time-slot.available');

timeSlots.forEach(slot => {
    slot.addEventListener('click', function() {
        // Tắt màu xanh của tất cả các ô khác
        timeSlots.forEach(s => s.classList.remove('selected'));
        
        // Bật màu xanh cho ô vừa click
        this.classList.add('selected');

        // Móc data từ thẻ HTML ra
        const gioDuocChon = this.querySelector('strong').innerText;
        const giaDuocChon = this.querySelector('span').innerText;

        // Đắp data xuống bảng tóm tắt
        document.getElementById('summary-gio').innerText = gioDuocChon; 
        document.getElementById('summary-tien').innerText = giaDuocChon + "đ";
    });
});