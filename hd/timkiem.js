// Hàm vẽ danh sách sân bóng (Đã tích hợp đầy đủ UI Bảo trì)
function renderFields(data) {
    const container = document.getElementById("field-list");
    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <i class="fas fa-search" style="font-size: 40px; color: #ccc; margin-bottom: 15px;"></i>
                <h3 style="color: #e74c3c; font-size: 20px;">Không tìm thấy sân!</h3>
                <p style="color: #777; margin-top: 5px;">Thử đổi tên hoặc vị trí khác xem sao babi nhé.</p>
            </div>
        `;
        return;
    }

    data.forEach((field) => {
        const fieldId = field.fieldId || field.id || field.pitchId;
        const linkAnh = field.images && field.images.length > 0 ? field.images[0].imageUrl : "../hinhanh/images (1).jpg"; 
        
        // --- LOGIC XỬ LÝ BẢO TRÌ ---
        const isMaintenance = field.status === false;
        const imgStyle = isMaintenance ? "filter: grayscale(100%);" : "";
        const rating = field.averageRating ? field.averageRating.toFixed(1) : "5.0";

        // Huy hiệu Bảo trì (Màu đỏ)
        const badgeHTML = isMaintenance
            ? `<div style="position:absolute; top:10px; right:10px; background-color:#dc3545; color:white; padding:5px 10px; border-radius:5px; font-weight:bold; font-size:12px; z-index:10;">
                    Bảo trì
               </div>`
            : "";

        // Chặn click nếu đang bảo trì
        const targetLink = isMaintenance ? "javascript:void(0)" : `../giaodien/datsan.html?id=${fieldId}`;
        const clickEvent = isMaintenance ? `onclick="alert('Sân bóng này hiện đang được bảo trì. Vui lòng chọn sân khác!');"` : "";

        // Vẽ thẻ HTML
        const cardHTML = `
            <a href="${targetLink}" ${clickEvent} style="text-decoration:none; color:inherit; display:block; position:relative;">
                <div class="pitch-card">
                    ${badgeHTML}
                    <img src="${linkAnh}" alt="${field.fieldName}" class="pitch-img" style="${imgStyle}">
                    
                    <div class="pitch-info">
                        <div class="pitch-header">
                            <h3 class="pitch-name">${field.fieldName}</h3>
                            <span class="pitch-rating"><i class="fas fa-star"></i> ${rating}</span>
                        </div>
                        <div class="pitch-footer">
                            <span class="pitch-location">${field.address}</span>
                            <span class="pitch-price" style="${isMaintenance ? "color:#dc3545;font-weight:bold;" : ""}">
                                ${isMaintenance ? "Tạm ngưng phục vụ" : "Xem chi tiết"}
                                </span>
                        </div>
                    </div>
                </div>
            </a>
        `;
        container.insertAdjacentHTML("beforeend", cardHTML);
    });
}

// 1. Tải toàn bộ sân lúc mới vào
fetch("http://localhost:8080/api/fields")
  .then(res => res.json())
  .then(data => renderFields(data))
  .catch(err => console.error("Lỗi tải danh sách sân:", err));

// 2. TÌM KIẾM THEO TÊN VÀ VỊ TRÍ
document.getElementById('btn-search').addEventListener('click', function(e) {
    e.preventDefault();

    const name = document.getElementById('input-name').value.trim();
    const address = document.getElementById('input-address').value.trim();

    const queryParams = new URLSearchParams();
    if (name) queryParams.append('name', name);
    if (address) queryParams.append('address', address);

    const apiUrl = `http://localhost:8080/api/fields/search?${queryParams.toString()}`;
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) throw new Error("Lỗi Backend");
            return response.json();
        })
        .then(data => renderFields(data))
        .catch(error => console.error("Lỗi tìm kiếm:", error));
});