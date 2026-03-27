// Подключение к Supabase
let supabaseClient = null;

// Инициализация Supabase клиента
function initSupabase() {
    if (typeof supabase === 'undefined') {
        console.error('❌ Supabase library not loaded');
        return null;
    }
    
    if (!window.SUPABASE_CONFIG || !window.SUPABASE_CONFIG.url || !window.SUPABASE_CONFIG.anonKey) {
        console.error('❌ Supabase config not found');
        return null;
    }
    
    try {
        supabaseClient = supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
        console.log('✅ Supabase client initialized');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return null;
    }
}

// Функция для загрузки товаров из Supabase
async function loadProductsFromSupabase() {
    if (!supabaseClient) {
        console.warn('Supabase not initialized, using local products');
        return null;
    }
    
    try {
        const { data: products, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('id');
        
        if (error) throw error;
        
        if (products && products.length > 0) {
            console.log(`✅ Loaded ${products.length} products from Supabase`);
            return products;
        } else {
            console.log('No products in Supabase, using local products');
            return null;
        }
    } catch (error) {
        console.error('Error loading products from Supabase:', error);
        return null;
    }
}

// Функция для сохранения заказа в Supabase
async function saveOrderToSupabase(orderData) {
    if (!supabaseClient) {
        console.warn('Supabase not initialized, order will not be saved');
        return null;
    }
    
    try {
        // Сохраняем заказ
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
                first_name: orderData.client.firstName,
                last_name: orderData.client.lastName,
                patronymic: orderData.client.patronymic,
                city: orderData.client.city,
                phone: orderData.client.phone,
                email: orderData.client.email,
                delivery_type: orderData.delivery,
                payment_method: orderData.paymentMethod,
                payment_timing: orderData.paymentTiming,
                total_amount: orderData.total,
                status: 'confirmed',
                verification_code: orderData.verificationCode || null,
                code_expires_at: orderData.codeExpiresAt || null
            })
            .select()
            .single();
        
        if (orderError) throw orderError;
        
        // Сохраняем позиции заказа
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            product_id: parseInt(item.id),
            product_name: item.name,
            quantity: item.quantity,
            price: item.price
        }));
        
        const { error: itemsError } = await supabaseClient
            .from('order_items')
            .insert(orderItems);
        
        if (itemsError) throw itemsError;
        
        console.log(`✅ Order #${order.id} saved to Supabase`);
        return order;
        
    } catch (error) {
        console.error('Error saving order to Supabase:', error);
        throw error;
    }
}

// Функция для сохранения сообщения из формы связи
async function saveContactMessage(name, phone, email) {
    if (!supabaseClient) {
        console.warn('Supabase not initialized, message will not be saved');
        return null;
    }
    
    try {
        const { data, error } = await supabaseClient
            .from('contact_messages')
            .insert({
                name: name || null,
                phone: phone || null,
                email: email || null,
                message: 'Быстрая связь из формы на сайте'
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Contact message saved to Supabase');
        return data;
        
    } catch (error) {
        console.error('Error saving contact message:', error);
        return null;
    }
}

// Инициализируем Supabase при загрузке
initSupabase();

// Делаем функции глобально доступными
window.supabaseClient = supabaseClient;
window.loadProductsFromSupabase = loadProductsFromSupabase;
window.saveOrderToSupabase = saveOrderToSupabase;
window.saveContactMessage = saveContactMessage;