const apiUrl = './db.json';
const listElement = document.getElementById('product-list');

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const products = await response.json();

        // Duyệt qua từng sản phẩm trong mảng
        products.forEach(product => {
            // 1. Xử lý đường dẫn ảnh (vì dữ liệu ảnh trong db.json khá lộn xộn)
            let imageUrl = "https://via.placeholder.com/250";
            
            if (product.images && product.images.length > 0) {
                let imgRaw = product.images[0];
                // Kiểm tra nếu ảnh là chuỗi JSON bị lỗi kiểu "[\"url\"]"
                if (typeof imgRaw === 'string' && imgRaw.startsWith('["') && imgRaw.endsWith('"]')) {
                     try {
                        imageUrl = JSON.parse(imgRaw)[0]; 
                     } catch (e) {
                        imageUrl = imgRaw;
                     }
                } else {
                     imageUrl = imgRaw;
                }
            }

            // 2. Tạo thẻ div chứa sản phẩm
            const card = document.createElement('div');
            card.classList.add('product-card');

            // 3. Đổ nội dung HTML vào (Đã thêm phần xử lý lỗi ảnh onerror)
            card.innerHTML = `
                <img 
                    src="${imageUrl}" 
                    alt="${product.title}" 
                    class="product-img" 
                    onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=Anh+Bi+Loi';"
                >
                <div class="card-body">
                    <div class="category">${product.category ? product.category.name : 'Uncategorized'}</div>
                    <div class="title">${product.title}</div>
                    <div class="price">$${product.price}</div>
                    <p>${product.description ? product.description.substring(0, 50) + '...' : ''}</p>
                </div>
            `;
            
            // 4. Gắn thẻ card vào danh sách
            listElement.appendChild(card);
        });

    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        listElement.innerHTML = '<p style="text-align:center; color:red;">Không thể tải dữ liệu.</p>';
    }
}

// Chạy hàm
fetchProducts();