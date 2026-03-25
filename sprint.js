// --------------------------------------------------------------
// 1. РАСШИРЕННЫЙ КАТАЛОГ (20+ товаров)
// --------------------------------------------------------------
const productsCatalog = [
    { id: "1", name: "Аппарат МРТ High-Field (3.0 Тл)", price: 50000000, desc: "Система с высокой пропускной способностью для нейровизуализации.", features: "3.0 Тесла, AI-интерфейс" },
    { id: "2", name: "Хирургический Робот-Ассистент", price: 95500000, desc: "Минимально инвазивные операции с высочайшей точностью.", features: "7 степеней свободы, 4K видеомодуль" },
    { id: "3", name: "УЗИ Сканер Портативный", price: 1250000, desc: "Высокомобильный аппарат для экстренной диагностики.", features: "Беспроводная передача данных" },
    { id: "4", name: "Ангиограф с С-дугой", price: 32800000, desc: "Цифровая система для сосудистых вмешательств.", features: "Низкодозовый режим" },
    { id: "5", name: "Лазерный Терапевтический Комплекс", price: 4500000, desc: "Малоинвазивная терапия.", features: "Длина волны 1064 нм" },
    { id: "6", name: "Монитор Пациента HD-X", price: 350000, desc: "15-дюймовый, 12 параметров.", features: "ЭКГ, SpO2, НИАД" },
    { id: "7", name: "Аппарат ИВЛ Про", price: 2100000, desc: "Автоматизированный ИВЛ экспертного класса.", features: "Режимы VC-CMV, PRVC" },
    { id: "8", name: "Электрохирургический блок ESB-200", price: 850000, desc: "Моно- и биполярный блок.", features: "Режимы CUT, COAG" },
    { id: "9", name: "Автоклав Класс B 24л", price: 420000, desc: "Паровой стерилизатор с вакуумной сушкой.", features: "Фракционный вакуум" },
    { id: "10", name: "ЭКГ-аппарат 12 отв.", price: 180000, desc: "Цифровой 12-канальный с интерпретацией.", features: "Печать на А4" },
    { id: "11", name: "Инфузионный Насос (4 канала)", price: 250000, desc: "Программируемое введение лекарств.", features: "Сигнализация" },
    { id: "12", name: "Дефибриллятор с Монитором", price: 750000, desc: "Бифазный, с режимом ЭКГ.", features: "Ручной/автоматический" },
    { id: "13", name: "Центральный Пульсоксиметр", price: 140000, desc: "Мониторинг сатурации для ОРИТ.", features: "До 16 кроватей" },
    { id: "14", name: "Эндоскопическая Стойка 4K", price: 18900000, desc: "Система 4K для гастроскопии.", features: "Флуоресцентная визуализация" },
    { id: "15", name: "Гематологический Анализатор 3-diff", price: 990000, desc: "20 параметров крови.", features: "60 образцов/час" },
    { id: "16", name: "CO2-инсуффлятор", price: 480000, desc: "Для лапароскопии.", features: "Подогрев газа" },
    { id: "17", name: "Аппарат Искусственной Почки", price: 3500000, desc: "Гемодиализная система.", features: "Профилирование ультрафильтрации" },
    { id: "18", name: "Электромиограф", price: 510000, desc: "4 канала, диагностика нервной системы.", features: "Игольчатая стимуляция" },
    { id: "19", name: "Реанимационный Стол с Весами", price: 220000, desc: "Многофункциональный стол.", features: "Встроенные весы" },
    { id: "20", name: "Стерилизатор Холодный Плазменный", price: 1100000, desc: "Для термочувствительных инструментов.", features: "Цикл 30 минут" },
    { id: "21", name: "Система для ЭКО (Лабораторная)", price: 7800000, desc: "Высокоточное оборудование для репродуктологии.", features: "Инкубатор с CO2" }
];

// --------------------------------------------------------------
// 2. КОРЗИНА С поддержкой количества
// --------------------------------------------------------------
let cartItems = [];

function saveCartToLocal() {
    localStorage.setItem('mtp_cart', JSON.stringify(cartItems));
}

function loadCartFromLocal() {
    const saved = localStorage.getItem('mtp_cart');
    if (saved) {
        try {
            cartItems = JSON.parse(saved);
            if (!Array.isArray(cartItems)) cartItems = [];
        } catch (e) { cartItems = []; }
    } else cartItems = [];
    updateCartUI();
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
    saveCartToLocal();
}

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

    // события для изменения количества
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            if (cartItems[idx].quantity > 1) {
                cartItems[idx].quantity--;
            } else {
                if (confirm('Удалить товар из корзины?')) cartItems.splice(idx, 1);
            }
            updateCartUI();
            saveCartToLocal();
        });
    });
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            cartItems[idx].quantity++;
            updateCartUI();
            saveCartToLocal();
        });
    });
    document.querySelectorAll('.remove-single').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            cartItems.splice(idx, 1);
            updateCartUI();
            saveCartToLocal();
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

function clearCart() {
    if (cartItems.length && confirm('Вы уверены, что хотите удалить все товары из корзины?')) {
        cartItems = [];
        updateCartUI();
        saveCartToLocal();
    }
}

function openCartCheckout() {
    if (!cartItems.length) {
        alert('Корзина пуста. Добавьте товары для оформления.');
        return;
    }
    openCheckoutModalForCartItems([...cartItems]);
}

// Модальное окно
let currentOrderItems = [];

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

// Рендер каталога
function renderCatalog() {
    const container = document.getElementById('product-list');
    container.innerHTML = '';
    productsCatalog.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = prod.id;
        card.dataset.name = prod.name;
        card.dataset.price = prod.price;
        card.innerHTML = `
                <h3>${prod.name}</h3>
                <p><strong>Описание:</strong> ${prod.desc}</p>
                <p><strong>Функции:</strong> ${prod.features}</p>
                <span class="price">${prod.price.toLocaleString('ru-RU')} RUB</span>
                <div style="display:flex; gap:8px; margin-top:10px;">
                    <button class="btn-cart add-to-cart-btn" data-id="${prod.id}">🛒 Добавить в корзину</button>
                    <button class="btn-buy buy-now-btn" data-id="${prod.id}">⚡ Купить сразу</button>
                </div>
            `;
        container.appendChild(card);
    });
    // привязываем события динамически
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    renderCatalog();
    loadCartFromLocal();

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

    // Кнопка очистки корзины
    document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);

    // Кнопка оформления всей корзины
    document.getElementById('checkoutFromCartBtn')?.addEventListener('click', openCartCheckout);

    // Закрытие модалки
    document.querySelector('.close-button').onclick = closeModal;
    window.onclick = function (event) {
        if (event.target == document.getElementById('checkoutModal')) closeModal();
    };

    // Обработка отправки формы заказа
    document.getElementById('orderForm').addEventListener('submit', function (e) {
        e.preventDefault();
        if (!currentOrderItems.length) {
            alert('Нет товаров для оформления');
            closeModal();
            return;
        }
        const formData = new FormData(this);
        const orderInfo = {
            items: currentOrderItems,
            client: {
                firstName: formData.get('first_name'),
                lastName: formData.get('last_name'),
                patronymic: formData.get('patronymic') || '',
                city: formData.get('city'),
                phone: formData.get('phone'),
                email: formData.get('email')
            },
            delivery: formData.get('delivery_type'),
            paymentMethod: formData.get('payment_method'),
            paymentTiming: formData.get('payment_timing'),
            total: currentOrderItems.reduce((s, it) => s + it.price * it.quantity, 0)
        };
        alert(`✅ Заказ оформлен успешно!\nКлиент: ${orderInfo.client.firstName} ${orderInfo.client.lastName}\nТоваров: ${orderInfo.items.length} позиций\nСумма: ${orderInfo.total.toLocaleString('ru-RU')} RUB\nСвяжемся с вами по телефону ${orderInfo.client.phone}`);

        // Если оформление было из корзины (удаляем оформленные товары)
        const idsToRemove = currentOrderItems.map(it => it.id);
        cartItems = cartItems.filter(cartItem => !idsToRemove.includes(cartItem.id));
        updateCartUI();
        saveCartToLocal();
        closeModal();
    });

    // Активируем главную вкладку
    document.querySelector('#home').classList.add('active');
    updateCartUI();
});