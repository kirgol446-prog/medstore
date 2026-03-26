// Конфигурация Supabase 
const SUPABASE_URL = 'https://wzepxtrxdhvpluobbrg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_t8WfokVHSHirrwzS7WWKA_kV30hRfk';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Глобальные переменные
let currentUser = null;
let productsCatalog = [];

// Загрузка товаров из Supabase
async function loadProductsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            productsCatalog = data;
        } else {
            // Если товаров нет, загружаем тестовые данные
            await loadTestProducts();
        }
        
        renderCatalog();
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        alert('Ошибка загрузки каталога. Используются тестовые данные.');
        await loadTestProducts();
        renderCatalog();
    }
}

// Загрузка тестовых товаров 
async function loadTestProducts() {
    const testProducts = [
        { id: "1", name: "Аппарат МРТ High-Field (3.0 Тл)", price: 50000000, description: "Система с высокой пропускной способностью для нейровизуализации.", features: "3.0 Тесла, AI-интерфейс", stock_quantity: 10 },
        { id: "2", name: "Хирургический Робот-Ассистент", price: 95500000, description: "Минимально инвазивные операции с высочайшей точностью.", features: "7 степеней свободы, 4K видеомодуль", stock_quantity: 5 },
        { id: "3", name: "УЗИ Сканер Портативный", price: 1250000, description: "Высокомобильный аппарат для экстренной диагностики.", features: "Беспроводная передача данных", stock_quantity: 20 },
        { id: "4", name: "Ангиограф с С-дугой", price: 32800000, description: "Цифровая система для сосудистых вмешательств.", features: "Низкодозовый режим", stock_quantity: 8 },
        { id: "5", name: "Лазерный Терапевтический Комплекс", price: 4500000, description: "Малоинвазивная терапия.", features: "Длина волны 1064 нм", stock_quantity: 15 },
        { id: "6", name: "Монитор Пациента HD-X", price: 350000, description: "15-дюймовый, 12 параметров.", features: "ЭКГ, SpO2, НИАД", stock_quantity: 30 },
        { id: "7", name: "Аппарат ИВЛ Про", price: 2100000, description: "Автоматизированный ИВЛ экспертного класса.", features: "Режимы VC-CMV, PRVC", stock_quantity: 12 },
        { id: "8", name: "Электрохирургический блок ESB-200", price: 850000, description: "Моно- и биполярный блок.", features: "Режимы CUT, COAG", stock_quantity: 18 },
        { id: "9", name: "Автоклав Класс B 24л", price: 420000, description: "Паровой стерилизатор с вакуумной сушкой.", features: "Фракционный вакуум", stock_quantity: 25 },
        { id: "10", name: "ЭКГ-аппарат 12 отв.", price: 180000, description: "Цифровой 12-канальный с интерпретацией.", features: "Печать на А4", stock_quantity: 40 }
    ];
    
    productsCatalog = testProducts;
    
    // Сохраняем тестовые товары в Supabase
    for (const product of testProducts) {
        const { error } = await supabase
            .from('products')
            .upsert(product, { onConflict: 'id' });
        
        if (error) console.error('Ошибка сохранения товара:', error);
    }
}

// Загрузка корзины из Supabase
async function loadCartFromSupabase() {
    if (!currentUser) return [];
    
    try {
        const { data, error } = await supabase
            .from('cart_items')
            .select(`
                *,
                products:product_id (
                    name,
                    price
                )
            `)
            .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        if (data) {
            return data.map(item => ({
                id: item.product_id,
                name: item.products.name,
                price: item.products.price,
                quantity: item.quantity,
                cart_id: item.id
            }));
        }
    } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
    }
    
    return [];
}

// Сохранение корзины в Supabase
async function saveCartToSupabase(cartItems) {
    if (!currentUser) return;
    
    try {
        // Удаляем все текущие элементы корзины пользователя
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', currentUser.id);
        
        // Добавляем новые элементы
        for (const item of cartItems) {
            await supabase
                .from('cart_items')
                .insert({
                    user_id: currentUser.id,
                    product_id: item.id,
                    quantity: item.quantity
                });
        }
    } catch (error) {
        console.error('Ошибка сохранения корзины:', error);
    }
}

// Регистрация/авторизация пользователя
async function registerOrLoginUser(email, firstName, lastName, phone, city) {
    try {
        // Проверяем, существует ли пользователь
        const { data: existingUser, error: findError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (findError && findError.code !== 'PGRST116') {
            throw findError;
        }
        
        if (existingUser) {
            // Пользователь существует
            currentUser = existingUser;
            alert(`С возвращением, ${currentUser.first_name || firstName}!`);
        } else {
            // Создаем нового пользователя
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert({
                    email: email,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    city: city
                })
                .select()
                .single();
            
            if (insertError) throw insertError;
            
            currentUser = newUser;
            alert(`Добро пожаловать, ${firstName}! Аккаунт создан.`);
        }
        
        // Загружаем корзину пользователя
        const savedCart = await loadCartFromSupabase();
        if (savedCart.length > 0) {
            window.cartItems = savedCart;
            updateCartUI();
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        alert('Ошибка авторизации. Пожалуйста, попробуйте позже.');
        return false;
    }
}

// Создание заказа
async function createOrder(orderData) {
    if (!currentUser) {
        alert('Пожалуйста, авторизуйтесь перед оформлением заказа');
        return false;
    }
    
    try {
        // Генерируем номер заказа
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Создаем заказ
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: currentUser.id,
                total_amount: orderData.total,
                delivery_type: orderData.delivery,
                payment_method: orderData.paymentMethod,
                payment_timing: orderData.paymentTiming,
                order_number: orderNumber,
                status: 'pending'
            })
            .select()
            .single();
        
        if (orderError) throw orderError;
        
        // Добавляем товары в заказ
        for (const item of orderData.items) {
            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: order.id,
                    product_id: item.id,
                    product_name: item.name,
                    quantity: item.quantity,
                    price_at_time: item.price
                });
            
            if (itemError) throw itemError;
            
            // Обновляем количество товара на складе
            const { data: product } = await supabase
                .from('products')
                .select('stock_quantity')
                .eq('id', item.id)
                .single();
            
            if (product) {
                await supabase
                    .from('products')
                    .update({ stock_quantity: product.stock_quantity - item.quantity })
                    .eq('id', item.id);
            }
        }
        
        // Очищаем корзину после оформления заказа
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', currentUser.id);
        
        window.cartItems = [];
        updateCartUI();
        
        alert(`✅ ЗАКАЗ #${orderNumber} ПОДТВЕРЖДЕН!\n\nСумма: ${orderData.total.toLocaleString('ru-RU')} RUB\n\nСпасибо за покупку! Свяжемся с вами в ближайшее время.`);
        
        return true;
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        alert('Ошибка при создании заказа. Пожалуйста, попробуйте позже.');
        return false;
    }
}

// Обновление UI корзины
let cartItems = [];

function updateCartUI() {
    const cartCountSpan = document.getElementById('cart-count');
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;

    const container = document.getElementById('cart-items-container');
    const summaryArea = document.getElementById('cart-summary-area');

    if (!cartItems.length) {
        container.innerHTML = '<div id="empty-cart-message" class="empty-cart-message">🛒 Корзина пуста. Добавьте товары из каталога.</div>';
        summaryArea.style.display = 'none';
        return;
    }

    container.innerHTML = '';
    cartItems.forEach((item, idx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toLocaleString('ru-RU')} RUB / шт</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-control">
                    <button class="qty-minus" data-idx="${idx}">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-plus" data-idx="${idx}">+</button>
                </div>
                <button class="btn-remove-cart remove-single" data-idx="${idx}">🗑 Удалить</button>
                <button class="btn-checkout-single checkout-one" data-idx="${idx}">📦 Оформить</button>
            </div>
        `;
        container.appendChild(itemDiv);
    });

    // События для изменения количества
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const idx = parseInt(btn.dataset.idx);
            if (cartItems[idx].quantity > 1) {
                cartItems[idx].quantity--;
            } else {
                if (confirm('Удалить товар из корзины?')) cartItems.splice(idx, 1);
            }
            updateCartUI();
            if (currentUser) await saveCartToSupabase(cartItems);
        });
    });
    
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const idx = parseInt(btn.dataset.idx);
            cartItems[idx].quantity++;
            updateCartUI();
            if (currentUser) await saveCartToSupabase(cartItems);
        });
    });
    
    document.querySelectorAll('.remove-single').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const idx = parseInt(btn.dataset.idx);
            cartItems.splice(idx, 1);
            updateCartUI();
            if (currentUser) await saveCartToSupabase(cartItems);
        });
    });
    
    document.querySelectorAll('.checkout-one').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            const singleItem = { ...cartItems[idx] };
            openCheckoutModalForCartItems([singleItem]);
        });
    });

    const total = cartItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    document.getElementById('cart-total').textContent = total.toLocaleString('ru-RU', { minimumFractionDigits: 2 });
    summaryArea.style.display = 'block';
}

function addToCart(product) {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
        alert(`➕ Увеличено количество "${product.name}" до ${existing.quantity} шт.`);
    } else {
        cartItems.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
        alert(`✅ Товар "${product.name}" добавлен в корзину.`);
    }
    updateCartUI();
    if (currentUser) saveCartToSupabase(cartItems);
}

function clearCart() {
    if (cartItems.length && confirm('Вы уверены, что хотите удалить все товары из корзины?')) {
        cartItems = [];
        updateCartUI();
        if (currentUser) saveCartToSupabase(cartItems);
    }
}

function openCartCheckout() {
    if (!cartItems.length) {
        alert('Корзина пуста. Добавьте товары для оформления.');
        return;
    }
    openCheckoutModalForCartItems([...cartItems]);
}

// Система подтверждения по email
let currentOrderItems = [];
let pendingOrderData = null;
let verificationCode = null;
let codeExpiryTime = null;

function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationCode(email, code) {
    console.log(`📧 Отправка кода ${code} на email: ${email}`);
    
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`🔐 Код подтверждения: ${code}`);
            alert(`📧 Код подтверждения отправлен на ${email}\n🔐 Для тестирования: ${code}`);
            resolve(true);
        }, 500);
    });
}

function openVerificationModal(email) {
    document.getElementById('verifyEmailDisplay').textContent = email;
    document.getElementById('verificationCode').value = '';
    document.getElementById('verifyCodeModal').style.display = 'block';
}

function closeVerificationModal() {
    document.getElementById('verifyCodeModal').style.display = 'none';
    verificationCode = null;
    codeExpiryTime = null;
    pendingOrderData = null;
}

function verifyCode(inputCode) {
    if (!verificationCode || !codeExpiryTime) {
        alert('❌ Код не был отправлен или истек срок действия. Запросите новый код.');
        return false;
    }
    
    if (new Date() > codeExpiryTime) {
        alert('⏰ Срок действия кода истек. Запросите новый код.');
        verificationCode = null;
        codeExpiryTime = null;
        return false;
    }
    
    if (inputCode === verificationCode) {
        return true;
    } else {
        alert('❌ Неверный код подтверждения. Попробуйте еще раз.');
        return false;
    }
}

async function finalizeOrder() {
    if (!pendingOrderData) {
        alert('Ошибка: данные заказа не найдены');
        return;
    }
    
    const success = await createOrder(pendingOrderData);
    
    if (success) {
        closeModal();
        closeVerificationModal();
        pendingOrderData = null;
    }
}

async function initiateVerification(orderData) {
    if (!currentUser) {
        const shouldRegister = confirm('Для оформления заказа необходимо зарегистрироваться. Хотите продолжить?');
        if (shouldRegister) {
            window.pendingOrderAfterAuth = orderData;
            showAuthModal();
        }
        return;
    }
    
    const email = orderData.client.email;
    const code = generateVerificationCode();
    
    verificationCode = code;
    codeExpiryTime = new Date(Date.now() + 5 * 60 * 1000);
    pendingOrderData = orderData;
    
    await sendVerificationCode(email, code);
    openVerificationModal(email);
}

// Модальное окно авторизации
function showAuthModal() {
    const authHtml = `
        <div id="authModal" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 450px;">
                <span class="close-button" onclick="closeAuthModal()">&times;</span>
                <h2>Авторизация</h2>
                <p>Для оформления заказа войдите в свой аккаунт или зарегистрируйтесь</p>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="authEmail" required>
                </div>
                <div class="form-group">
                    <label>Имя *</label>
                    <input type="text" id="authFirstName" required>
                </div>
                <div class="form-group">
                    <label>Фамилия</label>
                    <input type="text" id="authLastName">
                </div>
                <div class="form-group">
                    <label>Телефон *</label>
                    <input type="tel" id="authPhone" required>
                </div>
                <div class="form-group">
                    <label>Город *</label>
                    <input type="text" id="authCity" required>
                </div>
                <button id="authSubmitBtn" class="btn-submit-order">Войти / Зарегистрироваться</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', authHtml);
    
    document.getElementById('authSubmitBtn').addEventListener('click', async () => {
        const email = document.getElementById('authEmail').value.trim();
        const firstName = document.getElementById('authFirstName').value.trim();
        const lastName = document.getElementById('authLastName').value.trim();
        const phone = document.getElementById('authPhone').value.trim();
        const city = document.getElementById('authCity').value.trim();
        
        if (!email || !firstName || !phone || !city) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        const success = await registerOrLoginUser(email, firstName, lastName, phone, city);
        
        if (success && window.pendingOrderAfterAuth) {
            closeAuthModal();
            initiateVerification(window.pendingOrderAfterAuth);
            window.pendingOrderAfterAuth = null;
        }
    });
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.remove();
}

function renderCatalog() {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    container.innerHTML = '';
    productsCatalog.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = prod.id;
        card.dataset.name = prod.name;
        card.dataset.price = prod.price;
        card.innerHTML = `
            <h3>${prod.name}</h3>
            <p><strong>Описание:</strong> ${prod.description || prod.desc}</p>
            <p><strong>Функции:</strong> ${prod.features || 'Современное медицинское оборудование'}</p>
            <p><strong>В наличии:</strong> ${prod.stock_quantity || 'уточняйте'} шт.</p>
            <span class="price">${prod.price.toLocaleString('ru-RU')} RUB</span>
            <div style="display:flex; gap:8px; margin-top:10px;">
                <button class="btn-cart add-to-cart-btn" data-id="${prod.id}">🛒 Добавить в корзину</button>
                <button class="btn-buy buy-now-btn" data-id="${prod.id}">⚡ Купить сразу</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const product = productsCatalog.find(p => p.id === id);
            if (product) addToCart(product);
        });
    });
    
    document.querySelectorAll('.buy-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const product = productsCatalog.find(p => p.id === id);
            if (product) openCheckoutModalForSingle(product);
        });
    });
}

function openCheckoutModalForCartItems(items) {
    currentOrderItems = items.map(it => ({ ...it }));
    const totalSum = currentOrderItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const modalSummary = document.getElementById('modal-order-summary');
    let itemsHtml = `<strong>Состав заказа:</strong><div class="order-items-list">`;
    currentOrderItems.forEach(it => {
        itemsHtml += `<div class="order-item-row">${it.name} x ${it.quantity} шт = ${(it.price * it.quantity).toLocaleString('ru-RU')} RUB</div>`;
    });
    itemsHtml += `</div><hr><div style="font-size:1.2rem;"><strong>ИТОГО: ${totalSum.toLocaleString('ru-RU')} RUB</strong></div>`;
    modalSummary.innerHTML = itemsHtml;
    document.getElementById('orderForm').reset();
    document.getElementById('checkoutModal').style.display = "block";
}

function openCheckoutModalForSingle(product) {
    const itemArray = [{ id: product.id, name: product.name, price: product.price, quantity: 1 }];
    openCheckoutModalForCartItems(itemArray);
}

function closeModal() {
    document.getElementById('checkoutModal').style.display = "none";
    currentOrderItems = [];
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    await loadProductsFromSupabase();
    
    const savedUser = localStorage.getItem('mtp_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            const savedCart = await loadCartFromSupabase();
            cartItems = savedCart;
            updateCartUI();
        } catch (e) {
            console.error('Ошибка загрузки сохраненного пользователя:', e);
        }
    }
    
    // Вкладки
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.querySelector(targetId).classList.add('active');
            if (targetId === '#cart') updateCartUI();
        });
    });
    
    document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);
    document.getElementById('checkoutFromCartBtn')?.addEventListener('click', openCartCheckout);
    
    document.getElementById('sendCodeBtn')?.addEventListener('click', function() {
        const firstName = document.getElementById('first_name')?.value.trim();
        const lastName = document.getElementById('last_name')?.value.trim();
        const city = document.getElementById('city')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const deliveryType = document.querySelector('input[name="delivery_type"]:checked')?.value;
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value;
        const paymentTiming = document.querySelector('input[name="payment_timing"]:checked')?.value;
        
        if (!firstName) { alert('Введите имя'); return; }
        if (!lastName) { alert('Введите фамилию'); return; }
        if (!city) { alert('Введите город'); return; }
        if (!phone) { alert('Введите телефон'); return; }
        if (!email) { alert('Введите email'); return; }
        if (!deliveryType) { alert('Выберите способ получения'); return; }
        if (!paymentMethod) { alert('Выберите способ оплаты'); return; }
        if (!paymentTiming) { alert('Выберите вариант оплаты'); return; }
        
        if (!currentOrderItems.length) {
            alert('Нет товаров для оформления');
            return;
        }
        
        const orderData = {
            items: currentOrderItems,
            client: {
                firstName: firstName,
                lastName: lastName,
                patronymic: document.getElementById('patronymic')?.value.trim() || '',
                city: city,
                phone: phone,
                email: email
            },
            delivery: deliveryType,
            paymentMethod: paymentMethod,
            paymentTiming: paymentTiming,
            total: currentOrderItems.reduce((s, it) => s + it.price * it.quantity, 0)
        };
        
        initiateVerification(orderData);
    });
    
    document.getElementById('verifyCodeBtn')?.addEventListener('click', function() {
        const inputCode = document.getElementById('verificationCode')?.value.trim();
        if (!inputCode) {
            alert('Введите код подтверждения');
            return;
        }
        
        if (verifyCode(inputCode)) {
            finalizeOrder();
        }
    });
    
    document.getElementById('resendCodeBtn')?.addEventListener('click', async function() {
        if (pendingOrderData) {
            const newCode = generateVerificationCode();
            verificationCode = newCode;
            codeExpiryTime = new Date(Date.now() + 5 * 60 * 1000);
            await sendVerificationCode(pendingOrderData.client.email, newCode);
            alert('🔐 Новый код отправлен на ваш email');
        } else {
            alert('Ошибка: данные заказа не найдены');
        }
    });
    
    document.getElementById('quickSubmitBtn')?.addEventListener('click', function() {
        const name = document.getElementById('quickName')?.value.trim();
        const phone = document.getElementById('quickPhone')?.value.trim();
        const email = document.getElementById('quickEmail')?.value.trim();
        
        if (!name && !phone && !email) {
            alert('Заполните хотя бы одно поле для связи');
            return;
        }
        
        alert(`✅ Спасибо, ${name || 'уважаемый клиент'}! Наш менеджер свяжется с вами в ближайшее время.\n\nКонтактные данные:\nТелефон: ${phone || 'не указан'}\nEmail: ${email || 'не указан'}`);
        
        document.getElementById('quickName').value = '';
        document.getElementById('quickPhone').value = '';
        document.getElementById('quickEmail').value = '';
    });
    
    document.querySelector('#checkoutModal .close-button')?.addEventListener('click', closeModal);
    document.querySelector('#verifyCodeModal .verify-close')?.addEventListener('click', closeVerificationModal);
    
    window.onclick = function (event) {
        if (event.target == document.getElementById('checkoutModal')) closeModal();
        if (event.target == document.getElementById('verifyCodeModal')) closeVerificationModal();
    };
    
    document.querySelector('#home').classList.add('active');
    updateCartUI();
});

function saveCurrentUser() {
    if (currentUser) {
        localStorage.setItem('mtp_user', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('mtp_user');
    }
}

Object.defineProperty(window, 'currentUser', {
    set: function(value) {
        window._currentUser = value;
        if (value) {
            localStorage.setItem('mtp_user', JSON.stringify(value));
        } else {
            localStorage.removeItem('mtp_user');
        }
    },
    get: function() {
        return window._currentUser;
    }
});