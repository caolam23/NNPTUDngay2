const apiUrl = './db.json';
const listElement = document.getElementById('product-list');
let allProducts = []; // Biến toàn cục để chứa danh sách gốc

// 1. Hàm lấy dữ liệu từ db.json
async function fetchProducts() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        // --- SỬA LỖI TẠI ĐÂY ---
        // Kiểm tra xem data là Mảng [] hay là Object { products: [] }
        if (Array.isArray(data)) {
            allProducts = data; // Nếu là mảng thì lấy luôn
        } else if (data.products) {
            allProducts = data.products; // Nếu là object thì lấy thuộc tính products
        } else {
            allProducts = []; // Không tìm thấy dữ liệu
        }
        // -----------------------

        // Hiển thị ra bảng
        renderTable(allProducts);

    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        listElement.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Không thể tải dữ liệu</td></tr>';
    }
}

// 2. Hàm vẽ bảng (Render Table)
function renderTable(products) {
    listElement.innerHTML = ''; // Xóa nội dung cũ

    // Kiểm tra an toàn trước khi chạy
    if (!products || products.length === 0) {
        listElement.innerHTML = '<tr><td colspan="6" class="text-center">Không tìm thấy sản phẩm nào</td></tr>';
        return;
    }

    products.forEach(product => {
        // Xử lý ảnh (logic cũ)
        let imageUrl = "https://via.placeholder.com/80";
        if (product.images && product.images.length > 0) {
            let imgRaw = product.images[0];
            if (typeof imgRaw === 'string' && imgRaw.startsWith('["') && imgRaw.endsWith('"]')) {
                    try { imageUrl = JSON.parse(imgRaw)[0]; } catch (e) { imageUrl = imgRaw; }
            } else {
                    imageUrl = imgRaw;
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>
                <img src="${imageUrl}" class="product-img" alt="${product.title}"
                onerror="this.onerror=null; this.src='https://placehold.co/80x80?text=No+Img';">
            </td>
            <td class="fw-bold">${product.title}</td>
            <td><span class="badge bg-info text-dark">${product.category ? product.category.name : 'Khác'}</span></td>
            <td class="text-danger fw-bold">$${product.price}</td>
            <td>${product.description ? product.description.substring(0, 50) + '...' : ''}</td>
        `;
        listElement.appendChild(tr);
    });
}

// 3. Chức năng Tìm kiếm
function handleSearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    
    if (!allProducts) return; // Bảo vệ nếu chưa có dữ liệu

    const filteredProducts = allProducts.filter(product => 
        (product.title && product.title.toLowerCase().includes(keyword))
    );
    
    renderTable(filteredProducts);
}

// 4. Chức năng Sắp xếp
function sortData(key, order) {
    if (!allProducts || allProducts.length === 0) return;

    allProducts.sort((a, b) => {
        if (key === 'price') {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
        } else if (key === 'name') {
            const nameA = a.title ? a.title.toLowerCase() : '';
            const nameB = b.title ? b.title.toLowerCase() : '';
            if (nameA < nameB) return order === 'asc' ? -1 : 1;
            if (nameA > nameB) return order === 'asc' ? 1 : -1;
            return 0;
        }
    });

    // Vẽ lại bảng sau khi sắp xếp (giữ nguyên kết quả tìm kiếm nếu có)
    handleSearch(); 
}

// Chạy ứng dụng
fetchProducts();