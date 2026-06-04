
    // Vừa vào trang là lập tức lục ba lô localStorage lấy đồ ra liền
    const dataTenSan = localStorage.getItem('booking_TenSan');
    const dataGioDat = localStorage.getItem('booking_Gio');
    const dataNgayDat = localStorage.getItem('booking_Ngay');
    const dataTongTien = localStorage.getItem('booking_Tien');

    // Nếu có dữ liệu trong bộ nhớ thì đắp thẳng lên giao diện
    if (dataTenSan) document.getElementById('bill-ten-san').innerText = dataTenSan;
    if (dataNgayDat) document.getElementById('bill-ngay').innerText = dataNgayDat;
    if (dataGioDat) document.getElementById('bill-khung-gio').innerText = dataGioDat;
    if (dataTongTien) document.getElementById('bill-tong-tien').innerText = dataTongTien;
                document.getElementById("bill-tong-tien-button").innerText = dataTongTien;