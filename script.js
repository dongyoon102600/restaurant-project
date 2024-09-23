document.addEventListener('DOMContentLoaded', () => {
    const orderSection = document.getElementById('order');
    const infoSection = document.getElementById('info');
    const menuItems = document.getElementById('menu-items');
    const categoryList = document.getElementById('category-list');
    const adminLoginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error');
    const adminCategoryForm = document.getElementById('admin-category-form');
    const addCategoryForm = document.getElementById('add-category-form');
    const editCategoryForm = document.getElementById('edit-category-form');
    const newCategoryNameInput = document.getElementById('new-category-name');
    const editCategoryNameInput = document.getElementById('edit-category-name');
    const cancelEditCategoryButton = document.getElementById('cancel-edit-category');
    const adminMenuForm = document.getElementById('admin-menu-form');
    const addMenuItemForm = document.getElementById('add-menu-item-form');
    const editMenuItemForm = document.getElementById('edit-menu-item-form');
    const editMenuModal = document.getElementById('edit-menu-modal');
    const closeEditModalButton = document.getElementById('close-edit-modal');
    const logoutButton = document.getElementById('logout-button');
    const logoutSection = document.getElementById('logout-section');
    const newImageInput = document.getElementById('new-menu-image');
    const newImagePreview = document.getElementById('new-image-preview');
    const editImageInput = document.getElementById('edit-menu-image');
    const editImagePreview = document.getElementById('edit-image-preview');
    const menuCategorySelect = document.getElementById('menu-category-select');
    const cartCount = document.getElementById('cart-count');
    const cartTotalItems = document.getElementById('cart-total-items');
    const cartTotalPrice = document.getElementById('cart-total-price');
    let cart = [];
    let totalPrice = 0;
    let isAdmin = false; // 관리자가 로그인했는지 여부
    const adminPassword = "0000"; // 관리자 비밀번호
    let currentlyEditingItem = null; // 수정 중인 메뉴 항목
    let currentlyEditingCategory = null; // 수정 중인 카테고리 항목

    // 카테고리 데이터를 로컬 스토리지에서 가져옴
    let categoryData = JSON.parse(localStorage.getItem('categoryData')) || [
        'appetizers',
        'mainDishes',
        'desserts',
        'beverages',
        'salads',
        'soups',
        'pizza',
        'pasta'
    ];

    // 메뉴 데이터를 로컬 스토리지에서 가져옴
    let menuData = JSON.parse(localStorage.getItem('menuData')) || {
        appetizers: [
            { name: 'Spring Rolls', price: 5.00, image: 'https://via.placeholder.com/50' },
            { name: 'Nachos', price: 6.50, image: 'https://via.placeholder.com/50' },
            { name: 'Mozzarella Sticks', price: 4.50, image: 'https://via.placeholder.com/50' }
        ],
        mainDishes: [
            { name: 'Steak', price: 20.00, image: 'https://via.placeholder.com/50' },
            { name: 'Chicken Alfredo', price: 14.00, image: 'https://via.placeholder.com/50' }
        ]
    };

    // 페이지 전환 기능 추가
    function showSection(section) {
        orderSection.style.display = 'none';
        infoSection.style.display = 'none';
        section.style.display = 'block';
    }

    // Order 섹션 표시 버튼
    document.getElementById('showOrder').addEventListener('click', () => {
        showSection(orderSection);
    });

    // Restaurant Info 섹션 표시 버튼
    document.getElementById('showInfo').addEventListener('click', () => {
        showSection(infoSection);
    });

    // 페이지 로드 시 기본 Order 섹션을 표시
    showSection(orderSection);

    // 카테고리 목록을 UI에 업데이트
    function updateCategoryList() {
        categoryList.innerHTML = ''; // 기존 카테고리 리스트 비움
        menuCategorySelect.innerHTML = ''; // 메뉴 추가 시 사용하는 카테고리 선택 리스트 비움

        categoryData.forEach((category, index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category-item'); // 카테고리 아이템 클래스 추가
            categoryDiv.innerHTML = `
                <span>${category}</span>
                ${isAdmin ? '<button class="edit-category-button">Edit</button>' : ''}
            `;

            // 카테고리 수정 버튼 클릭 처리
            categoryDiv.querySelector('.edit-category-button')?.addEventListener('click', () => {
                currentlyEditingCategory = index;
                editCategoryNameInput.value = category;
                editCategoryForm.style.display = 'block';
            });

            categoryDiv.addEventListener('click', () => {
                displayMenuItems(category);
                document.querySelectorAll('.category-item').forEach(item => {
                    item.classList.remove('active');
                });
                categoryDiv.classList.add('active'); // 선택된 카테고리 스타일 적용
            });

            categoryList.appendChild(categoryDiv);

            // 메뉴 추가용 카테고리 선택 옵션 추가
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            menuCategorySelect.appendChild(option);
        });
    }

    // 카테고리 추가 폼 처리
    addCategoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newCategoryName = newCategoryNameInput.value.trim();
        if (newCategoryName && !categoryData.includes(newCategoryName)) {
            categoryData.push(newCategoryName);
            updateCategoryList(); // 카테고리 리스트 갱신
            saveCategoryData(); // 카테고리 데이터 저장
            newCategoryNameInput.value = ''; // 입력 폼 리셋
        } else {
            alert('Category already exists or invalid input');
        }
    });

    // 카테고리 수정 폼 처리
    editCategoryForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const editedCategoryName = editCategoryNameInput.value.trim();
        if (editedCategoryName && currentlyEditingCategory !== null) {
            categoryData[currentlyEditingCategory] = editedCategoryName;
            updateCategoryList(); // 카테고리 리스트 갱신
            saveCategoryData(); // 카테고리 데이터 저장
            currentlyEditingCategory = null; // 수정 중인 카테고리 리셋
            editCategoryForm.style.display = 'none'; // 수정 폼 숨기기
        } else {
            alert('Invalid category name');
        }
    });

    // 카테고리 수정 취소 버튼 처리
    cancelEditCategoryButton.addEventListener('click', () => {
        currentlyEditingCategory = null;
        editCategoryForm.style.display = 'none';
    });

    // 메뉴 데이터를 UI에 업데이트하는 함수
    function displayMenuItems(category) {
        menuItems.innerHTML = ''; // 이전 아이템들 제거
        if (!menuData[category]) {
            menuItems.innerHTML = '<p>No items available in this category.</p>'; // 카테고리에 데이터가 없는 경우 처리
            return;
        }

        menuData[category].forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <div class="menu-item">
                    <img src="${item.image}" alt="${item.name}" class="menu-item-img">
                    <span>${item.name}</span> - <span>$${item.price.toFixed(2)}</span>
                    <div class="item-actions">
                        <button class="addButton">+</button>
                        ${isAdmin ? '<button class="editButton">Edit</button>' : ''}
                    </div>
                </div>
            `;

            const addButton = itemDiv.querySelector('.addButton');
            const actionsDiv = itemDiv.querySelector('.item-actions');
            let quantity = 0;

            // "+" 버튼 클릭 시 수량 증가 및 장바구니 추가
            addButton.addEventListener('click', () => {
                quantity = 1;
                addToCart(item, 1);
                updateQuantityView(actionsDiv, item, quantity);
            });

            // 관리자인 경우에만 수정 버튼 동작 추가
            if (isAdmin) {
                const editButton = itemDiv.querySelector('.editButton');

                // 수정 버튼 처리
                editButton.addEventListener('click', () => {
                    currentlyEditingItem = { category, index };
                    document.getElementById('edit-menu-name').value = item.name;
                    document.getElementById('edit-menu-price').value = item.price;
                    editImagePreview.src = item.image;
                    editImagePreview.style.display = 'block';
                    editMenuModal.style.display = 'block'; // 수정 폼 표시
                });
            }

            menuItems.appendChild(itemDiv);
        });
    }

    // 메뉴 수정 폼 처리
    editMenuItemForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const editedName = document.getElementById('edit-menu-name').value;
        const editedPrice = parseFloat(document.getElementById('edit-menu-price').value);
        const editedImage = editImagePreview.src;

        if (currentlyEditingItem) {
            const { category, index } = currentlyEditingItem;
            if (editedName && !isNaN(editedPrice)) {
                // 메뉴 수정
                menuData[category][index].name = editedName;
                menuData[category][index].price = editedPrice;
                menuData[category][index].image = editedImage;
                saveMenuData(); // 수정된 메뉴 데이터를 저장
                displayMenuItems(category); // 메뉴 갱신
                editMenuModal.style.display = 'none'; // 수정 창 숨기기
                alert('Menu item updated successfully!');
            } else {
                alert('Please enter valid menu name and price.');
            }
        }
    });

    // 메뉴 추가 폼 처리 (관리자 모드에서)
    addMenuItemForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newItemName = document.getElementById('new-menu-item').value;
        const newItemPrice = parseFloat(document.getElementById('new-menu-price').value);
        const selectedCategory = document.getElementById('menu-category-select').value;
        const newItemImage = newImagePreview.src; // 업로드된 이미지를 사용

        if (newItemName && !isNaN(newItemPrice) && newItemImage) {
            menuData[selectedCategory].push({
                name: newItemName,
                price: newItemPrice,
                image: newItemImage
            });
            saveMenuData(); // 새로 추가된 메뉴 데이터를 저장
            alert(`New item added to ${selectedCategory}!`);
            displayMenuItems(selectedCategory); // 메뉴 갱신
            addMenuItemForm.reset(); // 폼 리셋
            newImagePreview.style.display = 'none'; // 이미지 미리보기 숨기기
        } else {
            alert('Please enter a valid menu name, price, and image.');
        }
    });

    // 이미지 파일 미리보기 로직 (신규 추가용)
    newImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                newImagePreview.src = reader.result;
                newImagePreview.style.display = 'block'; // 이미지 미리보기 표시
            };
            reader.readAsDataURL(file); // 파일을 읽어서 미리보기를 보여줌
        }
    });

    // 이미지 파일 미리보기 로직 (수정용)
    editImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                editImagePreview.src = reader.result;
                editImagePreview.style.display = 'block'; // 이미지 미리보기 표시
            };
            reader.readAsDataURL(file); // 파일을 읽어서 미리보기를 보여줌
        }
    });

    // 모달 닫기 버튼 처리
    closeEditModalButton.addEventListener('click', () => {
        editMenuModal.style.display = 'none'; // 모달 숨기기
    });

    // 장바구니 수량 업데이트
    function updateQuantityView(actionsDiv, item, quantity) {
        actionsDiv.innerHTML = `
            <button class="decreaseButton">-</button>
            <span class="quantityDisplay">${quantity}</span>
            <button class="increaseButton">+</button>
        `;

        const decreaseButton = actionsDiv.querySelector('.decreaseButton');
        const increaseButton = actionsDiv.querySelector('.increaseButton');
        const quantityDisplay = actionsDiv.querySelector('.quantityDisplay');

        // "+" 버튼 클릭 시 수량 증가 및 장바구니 추가
        increaseButton.addEventListener('click', () => {
            quantity++;
            quantityDisplay.textContent = quantity;
            addToCart(item, 1);
        });

        // "-" 버튼 클릭 시 수량 감소 및 장바구니에서 제거
        decreaseButton.addEventListener('click', () => {
            if (quantity > 0) {
                quantity--;
                quantityDisplay.textContent = quantity;
                addToCart(item, -1);
            }
            if (quantity === 0) {
                actionsDiv.innerHTML = `<button class="addButton">+</button>`;
                const addButton = actionsDiv.querySelector('.addButton');
                addButton.addEventListener('click', () => {
                    quantity = 1;
                    addToCart(item, 1);
                    updateQuantityView(actionsDiv, item, quantity);
                });
            }
        });
    }

    // 장바구니에 아이템 추가/제거
    function addToCart(item, quantityChange) {
        const existingItem = cart.find(cartItem => cartItem.item === item);
        if (existingItem) {
            existingItem.quantity += quantityChange;
            if (existingItem.quantity <= 0) {
                cart = cart.filter(cartItem => cartItem.item !== item); // 수량이 0이면 장바구니에서 제거
            }
        } else if (quantityChange > 0) {
            cart.push({ item, quantity: quantityChange });
        }
        updateCartSummary();
    }

    // 장바구니 요약 업데이트
    function updateCartSummary() {
        const totalItems = cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
        totalPrice = cart.reduce((total, cartItem) => total + (cartItem.quantity * cartItem.item.price), 0);

        cartTotalItems.textContent = `${totalItems} items`;
        cartTotalPrice.textContent = `Total: $${totalPrice.toFixed(2)}`;
        cartCount.textContent = totalItems;
    }

    // 결제 버튼 처리
    document.getElementById('checkout-button').addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty');
            return;
        }
    
        const customerName = prompt("Enter your name: ");
        if (!customerName) {
            alert('Customer name is required');
            return;
        }
    
        const orderData = {
            customerName: customerName,
            totalPrice: totalPrice,
            items: cart.map(cartItem => ({
                name: cartItem.item.name,
                price: cartItem.item.price,
                quantity: cartItem.quantity
            }))
        };
    
        // 서버로 주문 정보 전송
        fetch('http://192.168.150.110:4000/api/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => { throw new Error(error.error); });
            }
            return response.json();
        })
        .then(data => {
            alert(`Order placed successfully! Order ID: ${data.orderId}`);
            // 장바구니 초기화
            cart = [];
            updateCartSummary();
        })
        .catch((error) => {
            console.error('Error:', error.message);
            alert(`Failed to place order: ${error.message}`);
        });
        
        
        
    });
    

    // 관리자 로그인 처리
    adminLoginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const enteredPassword = document.getElementById('admin-password').value;

        if (enteredPassword === adminPassword) {
            isAdmin = true; // 관리자 모드 활성화
            adminCategoryForm.style.display = 'block'; // 관리자 카테고리 추가/수정 폼 표시
            adminMenuForm.style.display = 'block'; // 관리자 메뉴 추가 폼 표시
            logoutSection.style.display = 'block'; // 로그아웃 버튼 표시
            alert('Welcome, Admin! You can now edit and add menu items.');
            updateCategoryList(); // 관리자 모드에서는 카테고리 수정 기능을 활성화하여 리스트 갱신
        } else {
            loginError.style.display = 'block'; // 비밀번호가 틀렸을 때 오류 메시지 표시
        }
    });

    // 로그아웃 버튼 처리
    logoutButton.addEventListener('click', () => {
        isAdmin = false; // 관리자 모드 비활성화
        adminCategoryForm.style.display = 'none'; // 관리자 카테고리 폼 숨기기
        adminMenuForm.style.display = 'none'; // 관리자 메뉴 추가 폼 숨기기
        logoutSection.style.display = 'none'; // 로그아웃 버튼 숨기기
        alert('Logged out successfully.'); // 로그아웃 알림
        updateCategoryList(); // 로그아웃 후 관리자 기능 없이 카테고리 리스트 갱신
    });

    // 카테고리 데이터를 저장하는 함수
    function saveCategoryData() {
        localStorage.setItem('categoryData', JSON.stringify(categoryData));
    }

    // 메뉴 데이터를 저장하는 함수
    function saveMenuData() {
        localStorage.setItem('menuData', JSON.stringify(menuData));
    }

    // 페이지 로드 시 카테고리와 메뉴 데이터를 불러와 UI에 반영
    updateCategoryList();

    // 페이지 로드 시 기본 카테고리인 "Appetizers" 카테고리를 표시
    displayMenuItems('appetizers');
});


