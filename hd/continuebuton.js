document.getElementById('btn-tiep-tuc').addEventListener('click', function(e) {
    e.preventDefault(); 
    
    // Móc data từ HTML ra!
    const tenSan = document.getElementById('summary-ten-san').innerText;
    const gioDat = document.getElementById('summary-gio').innerText;
    const ngayDat = document.getElementById('summary-ngay').innerText;
    const tongTien = document.getElementById('summary-tien').innerText;

    // Nhét vào ba lô localStorage
    localStorage.setItem('booking_TenSan', tenSan);
    localStorage.setItem('booking_Gio', gioDat);
    localStorage.setItem('booking_Ngay', ngayDat);
    localStorage.setItem('booking_Tien', tongTien);

    // Đá sang trang thanh toán
    window.location.href = "../giaodien/thanhtoan.html";
});