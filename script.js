const apiUrl = './db.json';
const listElement = document.getElementById('product-list');

async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const products = await response.json();

        // Duyệt qua từng sản phẩm trong mảng
        products.forEach(product => {
            // Xử lý ảnh: Lấy ảnh đầu tiên trong mảng images, nếu không có thì dùng ảnh mặc định
            let imageUrl = "https://via.placeholder.com/250";
            if (product.images && product.images.length > 0) {
                // Xử lý trường hợp chuỗi ảnh bị lỗi ngoặc vuông (một số API trả về chuỗi "[\"url\"]")
                let imgRaw = product.images[0];
                if (imgRaw.startsWith('["') && imgRaw.endsWith('"]')) {
                     imageUrl = JSON.parse(imgRaw)[0]; 
                } else {
                     imageUrl = imgRaw;
                }
            }

            const card = document.createElement('div');
            card.classList.add('product-card');

            card.innerHTML = `
                <img src="${imageUrl}" alt="${product.title}" class="product-img" onerror="this.src='https://via.placeholder.com/250'">
                <div class="card-body">
                    <div class="category">${product.category ? product.category.name : 'Uncategorized'}</div>
                    <div class="title">${product.title}</div>
                    <div class="price">$${product.price}</div>
                    <p>${product.description.substring(0, 50)}...</p>
                </div>
            `;
            listElement.appendChild(card);
        });

    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        listElement.innerHTML = '<p style="text-align:center; color:red;">Không thể tải dữ liệu.</p>';
    }
}

fetchProducts();