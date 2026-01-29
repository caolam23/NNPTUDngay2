// ================== CẤU HÌNH API ==================
// Lưu ý: Để chạy được tính năng Thêm/Sửa/Xóa, bạn cần dùng json-server
// Câu lệnh chạy: json-server --watch db.json --port 3000
const apiUrlProducts = 'http://localhost:3000/products';
const apiUrlComments = 'http://localhost:3000/comments';

// Biến toàn cục
let allProducts = [];
let allComments = [];
const productListElement = document.getElementById('product-list');
const commentListElement = document.getElementById('comment-list');

// ================== 1. QUẢN LÝ SẢN PHẨM ==================

// --- Fetch dữ liệu ---
async function fetchProducts() {
    try {
        const response = await fetch(apiUrlProducts);
        const data = await response.json();

        // [LOGIC CODE 1] Kiểm tra cấu trúc dữ liệu an toàn
        if (Array.isArray(data)) {
            allProducts = data;
        } else if (data.products) {
            allProducts = data.products;
        } else {
            allProducts = [];
        }

        renderTable(allProducts);
    } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        productListElement.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Không thể kết nối đến server (Kiểm tra json-server)</td></tr>';
    }
}

// --- Vẽ bảng (Render) ---
function renderTable(products) {
    productListElement.innerHTML = ''; // Xóa nội dung cũ

    if (!products || products.length === 0) {
        productListElement.innerHTML = '<tr><td colspan="8" class="text-center">Không tìm thấy dữ liệu</td></tr>';
        return;
    }

    products.forEach(product => {
        // [LOGIC CODE 1] Xử lý ảnh (Parse chuỗi JSON nếu cần)
        let imageUrl = "https://via.placeholder.com/60";
        if (product.images && product.images.length > 0) {
            let imgRaw = product.images[0];
            // Kiểm tra nếu ảnh bị lưu dưới dạng string '["url"]'
            if (typeof imgRaw === 'string' && imgRaw.startsWith('["') && imgRaw.endsWith('"]')) {
                try { imageUrl = JSON.parse(imgRaw)[0]; } catch (e) { imageUrl = imgRaw; }
            } else {
                imageUrl = imgRaw;
            }
        }

        // [LOGIC CODE 2] Xử lý Soft Delete (Gạch ngang & Đổi màu)
        const isDeleted = product.isDeleted === true;
        const rowClass = isDeleted ? 'text-decoration-line-through text-muted bg-light' : '';
        const opacityStyle = isDeleted ? 'opacity: 0.6;' : '';
        
        // Badge trạng thái
        const statusBadge = isDeleted 
            ? '<span class="badge bg-danger rounded-pill">Đã xóa</span>' 
            : '<span class="badge bg-success rounded-pill">Active</span>';

        // Nút hành động: Nếu đã xóa -> Nút Khôi phục (Vàng), Chưa xóa -> Nút Xóa (Đỏ)
        const actionBtn = isDeleted 
            ? `<button class="btn btn-sm btn-warning shadow-sm" title="Khôi phục" onclick="restoreProduct('${product.id}')">
                 <i class="fas fa-undo"></i>
               </button>`
            : `<button class="btn btn-sm btn-danger shadow-sm" title="Xóa mềm" onclick="softDeleteProduct('${product.id}')">
                 <i class="fas fa-trash"></i>
               </button>`;

        const tr = document.createElement('tr');
        tr.className = rowClass;
        tr.style = opacityStyle;
        tr.innerHTML = `
            <td class="fw-bold text-secondary">#${product.id}</td>
            <td>
                <img src="${imageUrl}" class="product-img" alt="${product.title}"
                onerror="this.onerror=null; this.src='https://placehold.co/60x60?text=No+Img';">
            </td>
            <td class="fw-bold">${product.title}</td>
            <td><span class="badge badge-soft-primary">${product.category?.name || 'General'}</span></td>
            <td class="price-tag">$${product.price}</td>
            <td>${statusBadge}</td>
            <td><small class="text-muted">${product.description ? product.description.substring(0, 30) + '...' : ''}</small></td>
            <td class="text-center">
                ${actionBtn}
            </td>
        `;
        productListElement.appendChild(tr);
    });
}

// --- Thêm mới (Auto ID) ---
async function createProduct(e) {
    e.preventDefault();
    
    // [LOGIC CODE 2] Tính toán ID lớn nhất + 1
    const ids = allProducts.map(p => parseInt(p.id) || 0);
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const newId = (maxId + 1).toString();

    const newProduct = {
        id: newId,
        title: document.getElementById('newTitle').value,
        price: parseFloat(document.getElementById('newPrice').value),
        category: { id: parseInt(document.getElementById('newCategoryId').value), name: "New Category" },
        images: [document.getElementById('newImage').value],
        description: "Mô tả mặc định cho sản phẩm mới",
        isDeleted: false
    };

    try {
        await fetch(apiUrlProducts, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });
        
        alert(`Thêm thành công! ID mới: ${newId}`);
        
        // Đóng modal Bootstrap 5
        const modalEl = document.getElementById('addProductModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        // Reset form và tải lại
        document.getElementById('addProductForm').reset();
        fetchProducts();

    } catch (error) {
        alert('Lỗi khi thêm sản phẩm');
        console.error(error);
    }
}

// --- Xóa mềm (Soft Delete) ---
async function softDeleteProduct(id) {
    if (!confirm('Bạn có chắc muốn chuyển sản phẩm này vào thùng rác?')) return;

    try {
        await fetch(`${apiUrlProducts}/${id}`, {
            method: 'PATCH', // Chỉ cập nhật trường isDeleted
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: true })
        });
        fetchProducts(); // Tải lại bảng
    } catch (error) {
        console.error('Lỗi xóa mềm:', error);
    }
}

// --- Khôi phục sản phẩm ---
async function restoreProduct(id) {
    try {
        await fetch(`${apiUrlProducts}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDeleted: false })
        });
        fetchProducts();
    } catch (error) {
        console.error('Lỗi khôi phục:', error);
    }
}

// ================== 2. TÌM KIẾM & SẮP XẾP (LOGIC CODE 1) ==================

function handleSearch() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    
    if (!allProducts) return;

    const filteredProducts = allProducts.filter(product => 
        (product.title && product.title.toLowerCase().includes(keyword))
    );
    
    renderTable(filteredProducts);
}

function sortData(key, order) {
    if (!allProducts || allProducts.length === 0) return;

    // Sắp xếp trên mảng gốc hoặc mảng đang tìm kiếm
    // Ở đây ta sắp xếp mảng gốc rồi gọi lại logic tìm kiếm để đảm bảo đồng bộ
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

    // Gọi lại handleSearch để vẽ lại bảng (giữ nguyên từ khóa tìm kiếm nếu có)
    handleSearch(); 
}

// ================== 3. QUẢN LÝ COMMENTS (CRUD CODE 2) ==================

async function fetchComments() {
    try {
        const res = await fetch(apiUrlComments);
        allComments = await res.json();
        renderComments(allComments);
    } catch (error) {
        console.error('Lỗi tải comment:', error);
    }
}

function renderComments(comments) {
    commentListElement.innerHTML = '';
    comments.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge bg-secondary">${c.id}</span></td>
            <td>${c.body}</td>
            <td><span class="badge bg-info text-dark">PID: ${c.postId}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-primary me-1" onclick="editComment('${c.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteComment('${c.id}')"><i class="fas fa-times"></i></button>
            </td>
        `;
        commentListElement.appendChild(tr);
    });
}

// Xử lý Form Comment (Thêm hoặc Sửa)
async function handleCommentSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('commentId').value;
    const body = document.getElementById('commentBody').value;
    const postId = document.getElementById('commentPostId').value;

    const commentData = { body, postId: parseInt(postId) };

    try {
        if (id) {
            // Update (PUT) - Logic giữ nguyên
            await fetch(`${apiUrlComments}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
        } else {
            // === SỬA ĐOẠN NÀY ĐỂ ID TỰ TĂNG ===
            
            // 1. Lấy danh sách tất cả ID hiện có và chuyển sang số
            const currentIds = allComments.map(c => parseInt(c.id));
            
            // 2. Tìm số lớn nhất (Nếu chưa có comment nào thì mặc định là 0)
            const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
            
            // 3. ID mới = ID lớn nhất + 1
            commentData.id = (maxId + 1).toString();

            // ===================================

            await fetch(apiUrlComments, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
        }
        resetCommentForm();
        fetchComments();
    } catch (error) {
        alert('Lỗi thao tác comment');
        console.error(error);
    }
}

// Đổ dữ liệu lên form để sửa
function editComment(id) {
    const comment = allComments.find(c => c.id == id);
    if (comment) {
        document.getElementById('commentId').value = comment.id;
        document.getElementById('commentBody').value = comment.body;
        document.getElementById('commentPostId').value = comment.postId;
        // Scroll tới form
        document.getElementById('commentForm').scrollIntoView({ behavior: 'smooth' });
    }
}

// Xóa cứng Comment
async function deleteComment(id) {
    if (!confirm('Xóa vĩnh viễn bình luận này?')) return;
    try {
        await fetch(`${apiUrlComments}/${id}`, { method: 'DELETE' });
        fetchComments();
    } catch (error) {
        console.error(error);
    }
}

function resetCommentForm() {
    document.getElementById('commentForm').reset();
    document.getElementById('commentId').value = '';
}

// ================== KHỞI CHẠY ỨNG DỤNG ==================
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchComments();
});