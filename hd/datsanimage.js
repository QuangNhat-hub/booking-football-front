
    const params2 = new URLSearchParams(window.location.search);
    const id2 = params.get('id');

    if (id2) {
        fetch('http://localhost:8080/api/fields/' + id)
            .then(res => res.json())
            .then(field => {
                // Đổ tên và địa chỉ (Như tối qua đã làm)
                document.getElementById('ten-san-chi-tiet').innerText = field.fieldName;
                document.getElementById('dia-chi-chi-tiet').innerText = field.address;
                
                // MỚI THÊM NÈ: Đổ hình ảnh
                if (field.images && field.images.length > 0) {
                    // Nếu sân có ảnh trong DB thì lấy tấm đầu tiên
                    document.getElementById('anh-san-chi-tiet').src = field.images[0].imageUrl;
                } else {
                    // Nếu sân không có ảnh thì xài ảnh mặc định
                    document.getElementById('anh-san-chi-tiet').src = '../hinhanh/images (1).jpg';
                }
            })
            .catch(error => console.error('Lỗi rùi bro:', error));
    }
