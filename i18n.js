/* ============================================================
   LAFROMED — i18n.js (Dil dəstəyi sistemi)
   ============================================================
   İstifadə qaydası:
   
   HTML-də:  <span data-i18n="nav_home">Əsas Səhifə</span>
   Placeholder: <input data-i18n-placeholder="header_search_placeholder" placeholder="Axtarış..." />
   
   Bu sistem:
   1. Seçilmiş dili localStorage-dən oxuyur (default: az)
   2. lang/ qovluğundan JSON faylını yükləyir
   3. data-i18n olan bütün elementlərin mətnini dəyişir
   4. data-i18n-placeholder olan inputların placeholder-ini dəyişir
   5. Header-dəki bayraq dropdown-unu yeniləyir
   ============================================================ */

const I18n = {
  currentLang: 'az',
  translations: {},
  
  // Başlat
  async init() {
    this.currentLang = localStorage.getItem('lafromed_lang') || 'az';
    await this.loadLanguage(this.currentLang);
    this.applyTranslations();
    this.updateFlagUI();
    this.bindLangSwitchers();
  },

  // JSON faylını yüklə
  async loadLanguage(lang) {
    try {
      const response = await fetch(`lang/${lang}.json`);
      if (!response.ok) throw new Error(`Language file not found: ${lang}`);
      this.translations = await response.json();
      this.currentLang = lang;
      localStorage.setItem('lafromed_lang', lang);
      document.documentElement.lang = lang;
    } catch (err) {
      console.warn(`i18n: ${lang}.json yüklənmədi, default az istifadə olunur.`, err);
      if (lang !== 'az') {
        await this.loadLanguage('az');
      }
    }
  },

  // Bütün data-i18n elementlərini yenilə
  applyTranslations() {
    // Mətn elementləri
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.translations[key]) {
        el.textContent = this.translations[key];
      }
    });

    // innerHTML lazım olan elementlər (html daxil, məsələn <br/>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (this.translations[key]) {
        el.innerHTML = this.translations[key];
      }
    });

    // Placeholder-lar
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (this.translations[key]) {
        el.placeholder = this.translations[key];
      }
    });

    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (this.translations[key]) {
        el.setAttribute('aria-label', this.translations[key]);
      }
    });
  },

  // Bayraq dropdown UI yenilə
  updateFlagUI() {
    const flag = this.translations._flag;
    if (!flag) return;

    // Desktop bayraq
    const desktopFlag = document.getElementById('currentFlag');
    if (desktopFlag) desktopFlag.src = flag;

    // Mobil bayraq
    const mobileFlag = document.getElementById('currentFlagMob');
    if (mobileFlag) mobileFlag.src = flag;

    // Dropdown-dakı aktiv dili işarələ
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === this.currentLang);
    });
  },

  // Dil keçid butonlarını bağla
  bindLangSwitchers() {
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang');
        if (lang && lang !== this.currentLang) {
          await this.loadLanguage(lang);
          this.applyTranslations();
          this.updateFlagUI();
        }
      });
    });
  },

  // Proqrammatik dil dəyişmə (xaricdən çağırmaq üçün)
  async setLanguage(lang) {
    await this.loadLanguage(lang);
    this.applyTranslations();
    this.updateFlagUI();
  },

  // Tək bir açar sözün tərcüməsini al
  t(key) {
    return this.translations[key] || key;
  }
};

// Səhifə yüklənəndə başlat
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
});
