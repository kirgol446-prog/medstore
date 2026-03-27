// Конфигурация Supabase
const SUPABASE_CONFIG = {
    url: 'https://nhmphxvxseifzjpiuhqo.supabase.co',
    anonKey: 'sb_publishable_YjJ6x12JTMiRc5qkCnzOgw_3gamIGrT'
};

// Делаем конфигурацию глобально доступной
window.SUPABASE_CONFIG = SUPABASE_CONFIG;

console.log('✅ Supabase config loaded');