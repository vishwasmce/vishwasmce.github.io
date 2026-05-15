const html = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const themeToggle = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const scrollTopBtn = document.getElementById('scrollTop');
const contactForm = document.getElementById('contactForm');
const canvas = document.getElementById('canvas3d');
const ctx = canvas ? canvas.getContext('2d') : null;
const scrollProgressBar = document.getElementById('scrollProgressBar');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointerQuery = window.matchMedia('(pointer: coarse)');
const navLinks = Array.from(document.querySelectorAll('.nav-links a, .mobile-menu a'));
const sections = Array.from(document.querySelectorAll('main section[id]'));

let currentTheme = getStoredTheme();
let particles = [];
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let particleFrame = null;
let scrollTicking = false;
let resizeTimer = null;

function getStoredTheme() {
  try {
    return localStorage.getItem('vbs-theme') || 'dark';
  } catch {
    return 'dark';
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem('vbs-theme', theme);
  } catch {
    // Theme persistence is a convenience; the UI still works without storage.
  }
}

function canUseAmbientMotion() {
  return Boolean(ctx && canvas && !motionQuery.matches && !pointerQuery.matches && window.innerWidth >= 768);
}

function addQueryListener(query, handler) {
  if (query.addEventListener) {
    query.addEventListener('change', handler);
    return;
  }

  if (query.addListener) {
    query.addListener(handler);
  }
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', theme === 'dark' ? '#0d0e12' : '#f5f3ee');
  }
  storeTheme(theme);
  currentTheme = theme;
}

function updateScrollProgress() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolledPercent = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;

  if (scrollProgressBar) {
    scrollProgressBar.style.width = `${Math.min(scrolledPercent, 100)}%`;
  }

  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }

  scrollTicking = false;
}

function requestScrollUpdate() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateScrollProgress);
}

function closeMobileMenu() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.classList.remove('open');
  mobileMenu.hidden = true;
  hamburger.setAttribute('aria-expanded', 'false');
}

function openMobileMenu() {
  if (!mobileMenu || !hamburger) return;
  mobileMenu.hidden = false;
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
}

function toggleMobileMenu() {
  if (!mobileMenu) return;
  if (mobileMenu.classList.contains('open')) {
    closeMobileMenu();
    return;
  }
  openMobileMenu();
}

function animateSkillBars(scope) {
  scope.querySelectorAll('.skill-fill').forEach((bar) => {
    bar.style.width = `${bar.dataset.width}%`;
  });
}

function animateCounter(element) {
  if (element.classList.contains('counter-animated')) return;

  const text = element.textContent.trim();
  const numberMatch = text.match(/\d+/);
  if (!numberMatch) return;

  element.classList.add('counter-animated');

  if (motionQuery.matches) {
    element.textContent = text;
    return;
  }

  const endNumber = parseInt(numberMatch[0], 10);
  const prefix = text.substring(0, numberMatch.index);
  const suffix = text.substring(numberMatch.index + numberMatch[0].length);
  const increment = Math.max(1, Math.ceil(endNumber / 30));
  let currentNumber = 0;

  const counter = setInterval(() => {
    currentNumber += increment;
    if (currentNumber >= endNumber) {
      currentNumber = endNumber;
      clearInterval(counter);
    }
    element.textContent = prefix + currentNumber + suffix;
  }, 30);
}

function animateHeroText() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName || motionQuery.matches) return;

  const text = heroName.textContent.trim();
  heroName.innerHTML = '';

  text.split('').forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'letter-animate';
    span.textContent = char === ' ' ? '\u00a0' : char;
    span.style.animationDelay = `${index * 0.04}s`;
    heroName.appendChild(span);
  });
}

function setupCanvas() {
  if (!ctx || !canvas || !canUseAmbientMotion()) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.hidden = false;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const particleCount = window.innerWidth < 1024 ? 36 : 56;
  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
    radius: Math.random() * 1.8 + 0.6,
    opacity: Math.random() * 0.35 + 0.12
  }));
}

function stopParticles() {
  if (particleFrame) {
    cancelAnimationFrame(particleFrame);
    particleFrame = null;
  }
  particles = [];
  if (canvas) {
    canvas.hidden = true;
  }
}

function animateParticles() {
  if (!ctx || !canvas || !canUseAmbientMotion()) {
    stopParticles();
    return;
  }

  ctx.fillStyle = getComputedStyle(html).getPropertyValue('--bg').trim();
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  const isLight = html.getAttribute('data-theme') === 'light';
  const particleColor = isLight ? '184, 146, 42' : '201, 168, 76';
  const connectionDistance = 120;
  const connectionDistanceSq = connectionDistance * connectionDistance;

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < 0) particle.x = window.innerWidth;
    if (particle.x > window.innerWidth) particle.x = 0;
    if (particle.y < 0) particle.y = window.innerHeight;
    if (particle.y > window.innerHeight) particle.y = 0;

    const dx = particle.x - mouseX;
    const dy = particle.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const repulsion = Math.max(0, (180 - distance) / 180);

    if (repulsion > 0) {
      const angle = Math.atan2(dy, dx);
      particle.vx += Math.cos(angle) * repulsion * 0.025;
      particle.vy += Math.sin(angle) * repulsion * 0.025;
    }

    particle.vx *= 0.985;
    particle.vy *= 0.985;

    const size = particle.radius * (1 + repulsion * 0.5);
    ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();

    for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
      const other = particles[otherIndex];
      const pdx = other.x - particle.x;
      const pdy = other.y - particle.y;
      const pdistSq = pdx * pdx + pdy * pdy;

      if (pdistSq >= connectionDistanceSq) continue;

      const opacity = (1 - Math.sqrt(pdistSq) / connectionDistance) * 0.22;
      ctx.strokeStyle = `rgba(${particleColor}, ${opacity})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(other.x, other.y);
      ctx.stroke();
    }
  });

  particleFrame = requestAnimationFrame(animateParticles);
}

function startParticles() {
  stopParticles();
  if (!canUseAmbientMotion()) return;
  setupCanvas();
  animateParticles();
}

function setActiveNav(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${sectionId}`;
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function initSectionObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal, .timeline-item').forEach((element) => element.classList.add('visible'));
    const skills = document.getElementById('skills');
    if (skills) animateSkillBars(skills);
    return;
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('visible');

      if (entry.target.classList.contains('timeline-item')) {
        const items = document.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
          setTimeout(() => item.classList.add('visible'), index * 70);
        });
      }

      animateSkillBars(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .timeline-item, #skills').forEach((element) => {
    revealObserver.observe(element);
  });

  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  }, { rootMargin: '-42% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => activeObserver.observe(section));
}

function initCardSpotlights() {
  if (pointerQuery.matches) return;

  document.querySelectorAll('.stat-card, .card-3d').forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    }, { passive: true });
  });
}

function initCounters() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.stat-number').forEach((number) => animateCounter(number));
    return;
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.stat-number').forEach((number) => animateCounter(number));
      statObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.about-stats').forEach((stats) => statObserver.observe(stats));
}

function initContactForm() {
  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = (formData.get('fullName') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }

    const submitBtn = contactForm.querySelector('.btn-primary');
    const originalButtonHtml = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fa-solid fa-envelope-open-text"></i> Opening email app...';
      submitBtn.disabled = true;
    }

    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${email}`);
    window.location.href = `mailto:vishwasmtc27@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      contactForm.reset();
      if (submitBtn) {
        submitBtn.innerHTML = originalButtonHtml;
        submitBtn.disabled = false;
      }
    }, 1800);
  });
}

applyTheme(currentTheme);
updateScrollProgress();
initSectionObserver();
initCounters();
initCardSpotlights();
initContactForm();

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

if (hamburger) {
  hamburger.addEventListener('click', toggleMobileMenu);
}

if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motionQuery.matches ? 'auto' : 'smooth' });
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu?.classList.contains('open')) {
    closeMobileMenu();
    hamburger?.focus();
  }
});

document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
}, { passive: true });

window.addEventListener('scroll', requestScrollUpdate, { passive: true });

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateScrollProgress();
    startParticles();
  }, 150);
}, { passive: true });

addQueryListener(motionQuery, () => {
  if (!motionQuery.matches) {
    animateHeroText();
  }
  startParticles();
});

addQueryListener(pointerQuery, startParticles);

window.addEventListener('load', () => {
  animateHeroText();
  startParticles();
});
