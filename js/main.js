/**
 * DELIGHT - main.js
 * WordPress オリジナルテーマ化を想定した構造
 * 各セクション別にコメントで管理
 */

'use strict';

// DOMContentLoaded 後に全処理を起動
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initDrawer();
  initSideNav();
  initWorksSlider();
  initScrollReveal();
  initPageTop();
  initContactForm();
  initSmoothScroll();
});


// ============================================================
//  HEADER
//  スクロール時にクラスを付与してシャドウを表示
// ============================================================
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const logoImg = header.querySelector('.header__logo img');
  if (logoImg) {
    const markLoaded = () => {
      if (logoImg.naturalHeight > 0) logoImg.classList.add('is-loaded');
    };
    logoImg.addEventListener('load', markLoaded);
    logoImg.addEventListener('error', () => logoImg.remove());
    markLoaded();
  }

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // 初期チェック
}


// ============================================================
//  DRAWER MENU
//  ハンバーガー + 右スライドドロワー（tab以下）
// ============================================================
function initDrawer() {
  const drawer         = document.getElementById('drawer');
  const drawerPanel    = document.getElementById('drawerPanel');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const hamburger      = document.getElementById('hamburger');
  const header         = document.getElementById('header');
  if (!drawer || !drawerPanel || !hamburger) return;

  const mq = window.matchMedia('(max-width: 1024px)');

  const isDrawerOpen = () => drawer.classList.contains('is-open');

  const setDrawerOpen = (isOpen) => {
    drawer.classList.toggle('is-open', isOpen);
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    drawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('is-menu-open', isOpen);
    header?.classList.toggle('is-menu-open', isOpen);
  };

  const closeDrawer = () => setDrawerOpen(false);

  const openDrawer = () => setDrawerOpen(true);

  const toggleDrawer = () => {
    if (!mq.matches) return;
    if (isDrawerOpen()) closeDrawer();
    else openDrawer();
  };

  hamburger.addEventListener('click', toggleDrawer);

  drawerBackdrop?.addEventListener('click', closeDrawer);

  drawerPanel.addEventListener('click', (e) => {
    if (e.target === drawerPanel) closeDrawer();
  });

  drawer.querySelectorAll('.drawer__link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen()) closeDrawer();
  });

  mq.addEventListener('change', (e) => {
    if (!e.matches) closeDrawer();
  });
}


// ============================================================
//  SIDE NAV
//  ヒーローセクション通過後に左側固定ナビを表示
// ============================================================
function initSideNav() {
  const hero = document.querySelector('.hero');
  const contact = document.querySelector('.contact');
  const sideNav = document.getElementById('sideNav');

  if (!hero || !contact || !sideNav) return;

  const contactThreshold = () => window.innerHeight * 0.2;

  const syncState = () => {
    const heroRect = hero.getBoundingClientRect();
    const heroVisible = heroRect.bottom > 0 && heroRect.top < window.innerHeight;
    const reachedContact = contact.getBoundingClientRect().top < contactThreshold();

    sideNav.classList.toggle(
      'is-visible',
      !heroVisible && !reachedContact
    );
  };

  window.addEventListener('scroll', syncState, { passive: true });
  window.addEventListener('load', syncState);
  window.addEventListener('pageshow', syncState);
  syncState();
}

// ============================================================
//  WORKS SECTION
//  カスタムスライダー（前へ / 次へ）
// ============================================================
function initWorksSlider() {
  const slider     = document.getElementById('worksSlider');
  const btnPrev    = document.getElementById('worksPrev');
  const btnNext    = document.getElementById('worksNext');
  const sliderWrap = slider?.closest('.works__slider-wrap');

  if (!slider || !btnPrev || !btnNext || !sliderWrap) return;

  let currentIndex = 0;

  const SWIPE_THRESHOLD = 50;

  const getItems = () => Array.from(slider.querySelectorAll('.works__item'));

  const getGap = () => {
    const styles = getComputedStyle(slider);
    return parseFloat(styles.columnGap || styles.gap) || 0;
  };

  const getCardWidth = () => {
    const firstItem = slider.querySelector('.works__item');
    return firstItem ? firstItem.getBoundingClientRect().width : 0;
  };

  const getVisible = () => {
    const worksSection = slider.closest('.works');
    const styles = worksSection ? getComputedStyle(worksSection) : null;
    return parseInt(styles?.getPropertyValue('--works-visible-cards'), 10) || 3;
  };

  const getMax = () => Math.max(0, getItems().length - getVisible());

  const getCenterOffset = () => {
    if (getVisible() !== 1) return 0;
    const viewport = slider.parentElement;
    const viewportWidth = viewport
      ? viewport.getBoundingClientRect().width
      : slider.getBoundingClientRect().width;
    const cardWidth = getCardWidth();
    return Math.max(0, (viewportWidth - cardWidth) / 2);
  };

  const getMoveX = (index) => (getCardWidth() + getGap()) * index;

  const setTransform = (index, dragOffset = 0, animate = true) => {
    slider.classList.toggle('is-dragging', !animate);
    const x = getMoveX(index) - getCenterOffset() - dragOffset;
    slider.style.transform = `translateX(-${x}px)`;
  };

  const update = (animate = true) => {
    currentIndex = Math.min(Math.max(currentIndex, 0), getMax());
    setTransform(currentIndex, 0, animate);

    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex >= getMax();

    btnPrev.style.opacity = btnPrev.disabled ? '0.3' : '1';
    btnNext.style.opacity = btnNext.disabled ? '0.3' : '1';
  };

  btnPrev.addEventListener('click', () => {
    currentIndex--;
    update();
  });

  btnNext.addEventListener('click', () => {
    currentIndex++;
    update();
  });

  window.addEventListener('resize', () => {
    currentIndex = 0;
    update();
  }, { passive: true });

  // タッチスワイプ
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isTouchDragging = false;
  let preventClick = false;

  sliderWrap.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchDeltaX = 0;
    isTouchDragging = false;
    preventClick = false;
  }, { passive: true });

  sliderWrap.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - touchStartX;
    const deltaY = e.touches[0].clientY - touchStartY;

    if (!isTouchDragging) {
      if (Math.abs(deltaX) <= Math.abs(deltaY) || Math.abs(deltaX) < 10) return;
      isTouchDragging = true;
    }

    e.preventDefault();

    touchDeltaX = deltaX;

    let dragOffset = touchDeltaX;
    const max = getMax();
    if (currentIndex === 0 && dragOffset > 0) dragOffset *= 0.35;
    if (currentIndex >= max && dragOffset < 0) dragOffset *= 0.35;

    setTransform(currentIndex, dragOffset, false);
  }, { passive: false });

  const finishTouch = () => {
    if (!isTouchDragging) return;

    const max = getMax();
    preventClick = Math.abs(touchDeltaX) > 10;

    if (touchDeltaX < -SWIPE_THRESHOLD && currentIndex < max) {
      currentIndex++;
    } else if (touchDeltaX > SWIPE_THRESHOLD && currentIndex > 0) {
      currentIndex--;
    }

    isTouchDragging = false;
    touchDeltaX = 0;
    update();
  };

  sliderWrap.addEventListener('touchend', finishTouch, { passive: true });
  sliderWrap.addEventListener('touchcancel', finishTouch, { passive: true });

  sliderWrap.addEventListener('click', (e) => {
    if (!preventClick) return;
    e.preventDefault();
    e.stopPropagation();
    preventClick = false;
  }, true);

  update();
}

// ============================================================
//  全セクション
//  スクロールで要素をフェードイン（IntersectionObserver）
//  WordPress テーマ側でも同じクラス名で使い回し可
// ============================================================
function initScrollReveal() {
  // js-reveal クラスが付いた要素を対象とする
  // 既存の要素に付与 + 各セクションの主要要素に自動付与
  const targets = [
    '.about__inner',
    '.service__step',
    '.clients__logo-item',
    '.contact__form',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('js-reveal');
      // アイテムが複数あるときは少しずつ遅延
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // 一度表示したら監視解除
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.js-reveal').forEach(el => observer.observe(el));
}


// ============================================================
//  ページトップボタンの表示 / 非表示
// ============================================================
function initPageTop() {
  const btn = document.getElementById('pageTop');
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggle, { passive: true });

  toggle(); // 初回実行
}


// ============================================================
//  CONTACT SECTION
//  お問い合わせフォームのバリデーション & 送信処理
//  WordPress では Contact Form 7 / WPForms に置き換え想定
// ============================================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // エラー表示用ヘルパー
  const showError = (input, msg) => {
    clearError(input);
    const err = document.createElement('p');
    err.className = 'contact__error';
    err.textContent = msg;
    err.style.cssText = 'color:#e53935;font-size:12px;margin-top:4px;';
    input.parentNode.appendChild(err);
    input.style.borderColor = '#e53935';
  };

  const clearError = (input) => {
    const existing = input.parentNode.querySelector('.contact__error');
    if (existing) existing.remove();
    input.style.borderColor = '';
  };

  // バリデーション
  const validate = () => {
    let valid = true;

    // 名前（必須）
    const nameInput = form.querySelector('#company_name');
    if (nameInput && !nameInput.value.trim()) {
      showError(nameInput, 'お名前を入力してください');
      valid = false;
    } else if (nameInput) {
      clearError(nameInput);
    }

    // メールアドレス（必須 + 形式チェック）
    const emailInput = form.querySelector('#email');
    const emailReg   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailInput) {
      if (!emailInput.value.trim()) {
        showError(emailInput, 'メールアドレスを入力してください');
        valid = false;
      } else if (!emailReg.test(emailInput.value)) {
        showError(emailInput, 'メールアドレスの形式が正しくありません');
        valid = false;
      } else {
        clearError(emailInput);
      }
    }

    // プライバシーポリシー同意チェック
    const privacyCheck = form.querySelector('#privacyCheck');
    if (privacyCheck && !privacyCheck.checked) {
      showError(privacyCheck, '個人情報の取り扱いへの同意が必要です');
      valid = false;
    } else if (privacyCheck) {
      clearError(privacyCheck);
    }

    return valid;
  };

  // リアルタイムバリデーション（inputイベント）
  form.querySelectorAll('.contact__input, .contact__textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  // 送信処理
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validate()) return;

    // 送信中の状態管理
    const submitBtn = form.querySelector('.contact__submit');
    submitBtn.disabled   = true;
    submitBtn.textContent = '送信中...';

    // ★ WordPress テーマ化時は fetch で admin-ajax.php や REST API エンドポイントに置き換え
    // 例: fetch(ajaxurl, { method: 'POST', body: new FormData(form) })
    setTimeout(() => {
      // 成功メッセージ表示
      form.innerHTML = `
        <div style="text-align:center;padding:60px 0;">
          <p style="font-size:22px;font-weight:700;color:#1a237e;margin-bottom:12px;">✓ 送信が完了しました</p>
          <p style="color:#888;font-size:14px;">お問い合わせいただきありがとうございます。<br>担当者よりご連絡いたします。</p>
        </div>
      `;
    }, 1200);
  });
}


// ============================================================
//  全セクション
//  スムーススクロール（アンカーリンク）
//  header の高さ分オフセット
// ============================================================
function initSmoothScroll() {
  const headerHeight = () => {
    const h = document.getElementById('header');
    return h ? h.offsetHeight : 64;
  };

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight();
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}
