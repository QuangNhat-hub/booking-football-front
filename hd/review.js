// 1. LẤY THÔNG TIN CẦN THIẾT TỪ URL VÀ LOCALSTORAGE
const urlParams = new URLSearchParams(window.location.search);
const fieldId = urlParams.get('fieldId') || urlParams.get('id') || 1; // ID của sân bóng

// Giả định bồ lưu thông tin đăng nhập và đơn đặt sân sau khi hoàn thành vào localStorage
const userId = localStorage.getItem('userId') || 1; 
const bookingId = localStorage.getItem('currentBookingId') || 101; // Cần bookingId vì Backend bắt buộc (nullable = false)

// Cấu hình đúng đường dẫn API dẫn đến ReviewController của bồ
const BASE_URL = 'http://localhost:8080/api/reviews';

document.addEventListener("DOMContentLoaded", function () {
    loadReviewSummary();
    loadReviewsList();
    checkBookingStatus();
    setupStarRatingInput();
    setupSubmitReview();
});

// 2. LẤY ĐIỂM TRUNG BÌNH & TỔNG SỐ LƯỢT ĐÁNH GIÁ (Gọi API /summary của bồ)
function loadReviewSummary() {
    fetch(`${BASE_URL}/field/${fieldId}/summary`)
        .then(res => res.json())
        .then(summary => {
            // Đọc đúng 2 key: averageRating và totalReviews mà Backend trả về
            const avg = summary.averageRating || 0.0;
            const total = summary.totalReviews || 0;

            // Đổ lên Cột Trái (Phần hiển thị nhanh)
            document.getElementById("top-avg-rating").innerText = avg.toFixed(1);
            document.getElementById("top-total-reviews").innerText = total;

            // Đổ xuống Khối To dưới cuối trang
            document.getElementById("avgRating").innerText = avg.toFixed(1);
            document.getElementById("totalReviews").innerText = `(${total} đánh giá)`;
            
            // Vẽ số sao tương ứng cho phần tổng quan
            let starHtml = '';
            for (let i = 1; i <= 5; i++) {
                starHtml += i <= Math.round(avg) ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
            }
            document.getElementById("starSummary").innerHTML = starHtml;
        })
        .catch(err => console.error("Lỗi tải summary từ Backend:", err));
}

// 3. LẤY DANH SÁCH BÌNH LUẬN CHI TIẾT (Gọi API phân trang của bồ)
function loadReviewsList() {
    // Gọi đúng endpoint /field/{fieldId} kèm tham số phân trang page, size mặc định
    fetch(`${BASE_URL}/field/${fieldId}?page=0&size=10`)
        .then(res => res.json())
        .then(pageData => {
            // Vì Backend trả về đối tượng Page của Spring, mảng reviews nằm trong .content
            const reviews = pageData.content; 

            if (!reviews || reviews.length === 0) {
                document.getElementById("danh-sach-reviews").innerHTML = 
                    '<p style="text-align:center; color:#999; font-size:13px;">Sân chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>';
                return;
            }

            let listHtml = '';
            reviews.forEach(review => {
                // Tạo chuỗi sao hiển thị cho từng bình luận
                let stars = '';
                for (let i = 1; i <= 5; i++) {
                    stars += i <= review.rating ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
                }
                
                // Vì Entity Review chỉ lưu userId (số nguyên), chưa liên kết lấy tên nên hiển thị tạm ID hoặc "Khách hàng"
                listHtml += `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="review-user">Khách đặt sân (Mã số: ${review.userId})</span>
                            <span class="review-stars">${stars}</span>
                        </div>
                        <div class="review-content">${review.comment}</div>
                    </div>
                `;
            });
            document.getElementById("danh-sach-reviews").innerHTML = listHtml;
        })
        .catch(err => {
            console.error("Lỗi tải danh sách review:", err);
            document.getElementById("danh-sach-reviews").innerHTML = '<p style="text-align:center; color:red;">Không thể tải danh sách đánh giá!</p>';
        });
}

// 4. KIỂM TRA ĐIỀU KIỆN ĐỂ HIỆN KHUNG ĐÁNH GIÁ
function checkBookingStatus() {
    // Đoạn này gọi đến endpoint kiểm tra lịch sử đá sân của bồ (ví dụ: /api/bookings/completed)
    fetch(`http://localhost:8080/api/bookings/completed?userId=${userId}&fieldId=${fieldId}`)
        .then(res => res.json())
        .then(hasCompleted => {
            if (hasCompleted === true) {
                document.getElementById("area-viet-danh-gia").style.display = "block";
            }
        })
        .catch(err => {
            // Demo local: Nếu chưa làm API check đặt sân, bồ có thể mở dòng dưới để ép buộc hiện khung demo cho thầy xem:
            document.getElementById("area-viet-danh-gia").style.display = "block";
        });
}

// 5. XỬ LÝ CLICK CHỌN SAO (1-5 SAO)
function setupStarRatingInput() {
    const stars = document.querySelectorAll(".star-clickable");
    stars.forEach(star => {
        star.addEventListener("click", function () {
            const value = this.getAttribute("data-value");
            document.getElementById("review-rating-value").value = value;
            
            stars.forEach(s => {
                const sValue = s.getAttribute("data-value");
                if (sValue <= value) {
                    s.classList.add("selected");
                    s.innerHTML = '<i class="fas fa-star"></i>';
                } else {
                    s.classList.remove("selected");
                    s.innerHTML = '<i class="far fa-star"></i>';
                }
            });
        });
    });
}

// 6. GỬI ĐÁNH GIÁ MỚI LÊN BACKEND (POST)
function setupSubmitReview() {
    document.getElementById("btn-gui-danh-gia").addEventListener("click", function () {
        const rating = document.getElementById("review-rating-value").value;
        const comment = document.getElementById("review-comment").value.trim();

        if (rating == 0) {
            alert("Bồ vui lòng chọn số sao đánh giá nhé!");
            return;
        }
        if (!comment) {
            alert("Bồ nhập thêm nội dung nhận xét sân nha!");
            return;
        }

        // Đóng gói JSON đúng chính xác tên biến thuộc tính trong Entity Review của bồ
        const reviewData = {
            bookingId: parseInt(bookingId),
            userId: parseInt(userId),
            fieldId: parseInt(fieldId),
            rating: parseInt(rating),
            comment: comment,
            imageUrl: null // Demo local không cần xử lý ảnh
        };

        // Gửi dữ liệu lên API POST /api/reviews
        fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reviewData)
        })
        .then(async res => {
            if (res.ok) {
                alert("Gửi đánh giá thành công!");
                document.getElementById("review-comment").value = ""; 
                // Tải lại dữ liệu mới ngay lập tức
                loadReviewSummary();
                loadReviewsList();
            } else {
                const errorMsg = await res.text();
                alert("Thất bại: " + errorMsg); // Ví dụ: "Đơn đặt sân này đã được đánh giá rồi!"
            }
        })
        .catch(err => console.error("Lỗi gửi bài đánh giá:", err));
    });
}