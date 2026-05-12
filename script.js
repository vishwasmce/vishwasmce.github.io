const html = document.documentElement;
const themeIcon = document.getElementById('themeIcon');
const themeToggle = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const scrollTopBtn = document.getElementById('scrollTop');
const contactForm = document.getElementById('contactForm');
const canvas = document.getElementById('canvas3d');
const ctx = canvas ? canvas.getContext('2d') : null;

let currentTheme = localStorage.getItem('vbs-theme') || 'dark';
let particles = [];
let mouseX = 0;
let mouseY = 0;
let scrollY = 0;
let trailDots = [];
const scrollProgressBar = document.getElementById('scrollProgressBar');

// Scroll Progress Bar Animation
function updateScrollProgress() {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolledPercent = (window.scrollY / scrollHeight) * 100;
  if (scrollProgressBar) {
    scrollProgressBar.style.width = scrolledPercent + '%';
  }
}

// Mouse Trail Effect (Framer style)
function createTrailDot(x, y) {
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = x + 'px';
  dot.style.top = y + 'px';
  dot.style.width = '4px';
  dot.style.height = '4px';
  document.body.appendChild(dot);

  let life = 1;
  const fadeOut = setInterval(() => {
    life -= 0.05;
    dot.style.opacity = life;
    dot.style.transform = `scale(${life})`;

    if (life <= 0) {
      clearInterval(fadeOut);
      dot.remove();
    }
  }, 30);
}

// Text Scrambler Effect
function scrambleText(element) {
  if (!element || element.classList.contains('scrambled')) return;

  const text = element.textContent;
  element.innerHTML = '';
  element.classList.add('scrambled');

  let charIndex = 0;
  function addChar() {
    if (charIndex < text.length) {
      const span = document.createElement('span');
      span.className = 'scramble-char';
      span.textContent = text[charIndex];
      span.style.animationDelay = `${charIndex * 0.04}s`;
      element.appendChild(span);
      charIndex++;
      setTimeout(addChar, 40);
    }
  }
  addChar();
}

// Animate Numbers Counter
function animateCounter(element) {
  if (element.classList.contains('counter-animated')) return;

  const text = element.textContent.trim();
  const numberMatch = text.match(/\d+/);

  if (!numberMatch) return;

  const endNumber = parseInt(numberMatch[0]);
  const prefix = text.substring(0, numberMatch.index);
  const suffix = text.substring(numberMatch.index + numberMatch[0].length);

  let currentNumber = 0;
  const increment = Math.ceil(endNumber / 30);

  element.classList.add('counter-animated');

  const counter = setInterval(() => {
    currentNumber += increment;
    if (currentNumber >= endNumber) {
      currentNumber = endNumber;
      clearInterval(counter);
    }
    element.textContent = prefix + currentNumber + suffix;
  }, 30);
}

// Enhanced canvas setup for 3D AI neural network
function setupCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Reduce particles on mobile for better performance
  const particleCount = window.innerWidth < 768 ? 30 : 80;

  // Initialize particles with more dynamic behavior
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      depth: Math.random() * 100,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01
    });
  }
}

// Enhanced particle animation with neural network effect
function animateParticles() {
  if (!ctx || !canvas) return;

  ctx.fillStyle = getComputedStyle(html).getPropertyValue('--bg').trim();
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const accentColor = getComputedStyle(html).getPropertyValue('--accent').trim();

  particles.forEach((particle, idx) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.pulse += particle.pulseSpeed;

    // Wrap around edges
    if (particle.x < 0) particle.x = canvas.width;
    if (particle.x > canvas.width) particle.x = 0;
    if (particle.y < 0) particle.y = canvas.height;
    if (particle.y > canvas.height) particle.y = 0;

    // Calculate distance from mouse
    const dx = particle.x - mouseX;
    const dy = particle.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const repulsion = Math.max(0, (250 - distance) / 250);

    // Apply forces
    if (repulsion > 0) {
      const angle = Math.atan2(dy, dx);
      particle.vx += Math.cos(angle) * repulsion * 0.05;
      particle.vy += Math.sin(angle) * repulsion * 0.05;
    }

    // Gravity to center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const toCenterX = (centerX - particle.x) * 0.0002;
    const toCenterY = (centerY - particle.y) * 0.0002;
    particle.vx += toCenterX;
    particle.vy += toCenterY;

    // Damping
    particle.vx *= 0.98;
    particle.vy *= 0.98;

    // Pulsing effect
    const pulseAmount = Math.sin(particle.pulse) * 0.5 + 1;
    const size = particle.radius * (1 + repulsion * 0.8) * pulseAmount;
    const opacity = particle.opacity * (1 - repulsion * 0.3);

    // Determine particle color based on theme
    const isLight = html.getAttribute('data-theme') === 'light';
    const particleColor = isLight ? '184, 146, 42' : '201, 168, 76';

    // Draw particle with glow
    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, size * 2);
    gradient.addColorStop(0, `rgba(${particleColor}, ${opacity * 0.8})`);
    gradient.addColorStop(1, `rgba(${particleColor}, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw particle core
    ctx.fillStyle = `rgba(${particleColor}, ${opacity})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();

    // Draw neural connections
    const connectionDistance = 120;
    particles.forEach((otherParticle, otherIdx) => {
      if (idx >= otherIdx) return;

      const pdx = otherParticle.x - particle.x;
      if (Math.abs(pdx) > connectionDistance) return; // Fast-fail bounds check

      const pdy = otherParticle.y - particle.y;
      if (Math.abs(pdy) > connectionDistance) return; // Fast-fail bounds check

      const pdistSq = pdx * pdx + pdy * pdy;
      const connectionDistanceSq = connectionDistance * connectionDistance;

      if (pdistSq < connectionDistanceSq) {
        const pdist = Math.sqrt(pdistSq); // Only calculate expensive square root if within range
        const connectionOpacity = (1 - pdist / connectionDistance) * 0.4;
        ctx.strokeStyle = `rgba(${particleColor}, ${connectionOpacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(otherParticle.x, otherParticle.y);
        ctx.stroke();
      }
    });
  });

  requestAnimationFrame(animateParticles);
}

// Scroll tracking for parallax effects
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  updateScrollProgress();
}, { passive: true });

// Mouse tracking for 3D effects and particle interaction
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Create trail dots occasionally
  if (Math.random() > 0.7) {
    createTrailDot(e.clientX, e.clientY);
  }
}, { passive: true });

// Touch event handling for mobile devices
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  }
}, { passive: true });

// Update CSS variables for gradient positioning only on hovered cards
document.querySelectorAll('.stat-card, .card-3d').forEach((card) => {
  const updateCardMousePosition = (clientX, clientY) => {
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  };

  card.addEventListener('mousemove', (e) => updateCardMousePosition(e.clientX, e.clientY), { passive: true });
  card.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updateCardMousePosition(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
});

// Apply theme
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  localStorage.setItem('vbs-theme', theme);
  currentTheme = theme;
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  mobileMenu.hidden = true;
  hamburger.setAttribute('aria-expanded', 'false');
}

function openMobileMenu() {
  mobileMenu.hidden = false;
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
}

function toggleMobileMenu() {
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

// Animated text effect for hero
function animateHeroText() {
  const heroName = document.querySelector('.hero-name');
  if (!heroName) return;

  const text = heroName.textContent;
  heroName.innerHTML = '';

  let charIndex = 0;
  function addCharacter() {
    if (charIndex < text.length) {
      const span = document.createElement('span');
      span.className = 'letter-animate';
      span.textContent = text[charIndex];
      span.style.animationDelay = `${charIndex * 0.05}s`;
      heroName.appendChild(span);
      charIndex++;
      setTimeout(addCharacter, 50);
    }
  }

  addCharacter();
}

// Initialize
applyTheme(currentTheme);
setupCanvas();
animateParticles();

// Delay hero text animation for better effect
setTimeout(() => {
  animateHeroText();
}, 300);

// Animate stat numbers on scroll
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const numbers = entry.target.querySelectorAll('.stat-number');
      numbers.forEach(num => animateCounter(num));
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.about-stats').forEach(stats => statObserver.observe(stats));

themeToggle.addEventListener('click', () => {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

hamburger.addEventListener('click', toggleMobileMenu);
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('resize', () => {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}, { passive: true });

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
    hamburger.focus();
  }
});

// Scroll reveal animations
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add('visible');

    // Staggered animation for timeline items
    if (entry.target.classList.contains('timeline-item')) {
      const items = document.querySelectorAll('.timeline-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('visible');
        }, index * 80);
      });
    }

    // Staggered animation for reveal elements
    if (entry.target.classList.contains('reveal')) {
      const siblings = entry.target.parentElement?.querySelectorAll('.reveal') || [];
      Array.from(siblings).forEach((sibling, index) => {
        if (sibling === entry.target) {
          sibling.style.animationDelay = `${index * 0.1}s`;
        }
      });
    }

    animateSkillBars(entry.target);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .timeline-item, #skills').forEach((element) => revealObserver.observe(element));

// Contact form with animation feedback
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

  // Add success animation
  const submitBtn = contactForm.querySelector('.btn-primary');
  submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
  submitBtn.style.background = 'var(--accent)';

  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(`${message}\n\nFrom: ${email}`);
  window.location.href = `mailto:vishwasmtc27@gmail.com?subject=${subject}&body=${body}`;

  setTimeout(() => {
    contactForm.reset();
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    submitBtn.style.background = '';
  }, 2000);
});

// Smooth parallax effect with 3D depth
window.addEventListener('scroll', () => {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  parallaxElements.forEach((el) => {
    const offset = window.scrollY * 0.5;
    el.style.transform = `translateY(${offset}px)`;
  });

  // 3D parallax on cards during scroll
  const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);

  document.querySelectorAll('.timeline-card, .stat-card, .edu-card').forEach((card) => {
    const rotationX = Math.sin(scrollPercent * Math.PI * 2) * 5;
    const rotationY = Math.cos(scrollPercent * Math.PI * 2) * 5;
    const translateZ = Math.sin(scrollPercent * Math.PI * 4) * 10;

    card.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) translateZ(${translateZ}px)`;
  });
}, { passive: true });

// Enhanced 3D card hover with depth (disabled on mobile)
if (window.innerWidth >= 768) {
  document.querySelectorAll('.card-3d').forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'all 0.3s cubic-bezier(0.23, 1, 0.320, 1)';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * 15;
      const rotateY = ((centerX - x) / centerX) * 15;
      const perspective = `perspective(1200px)`;

      const target = card.querySelector('.card-3d-inner') || card;
      target.style.transform = `${perspective} rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      const target = card.querySelector('.card-3d-inner') || card;
      target.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
    });
  });
}

// Animate elements in on scroll with 3D flip
const flipObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.classList.contains('flip-animated')) {
      entry.target.classList.add('flip-animated', 'flip-in');
      entry.target.style.animationDuration = '0.8s';
      flipObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

// Add rotating 3D effect to section titles
document.querySelectorAll('.section-title').forEach((title) => {
  title.classList.add('text-depth-3d');
});

// Apply 3D floating animation to stat cards
document.querySelectorAll('.stat-card').forEach((card, index) => {
  card.classList.add('glow-pulse-3d');
  card.style.animationDelay = `${index * 0.2}s`;
});

// Apply 3D floating animation to education cards
document.querySelectorAll('.edu-card').forEach((card, index) => {
  card.classList.add('float-3d-tilt');
  card.style.animationDelay = `${index * 0.3}s`;
});

// Add interactive 3D to tech chips
document.querySelectorAll('.tech-chip').forEach((chip) => {
  chip.classList.add('interactive-3d');
  chip.addEventListener('click', () => {
    chip.style.animation = 'none';
    setTimeout(() => {
      chip.style.animation = '';
    }, 10);
  });
});

// Create dynamic 3D light effect following mouse
const lightFollower = document.createElement('div');
lightFollower.style.cssText = `
  position: fixed;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  filter: blur(40px);
  transition: opacity 0.3s ease;
`;
document.body.appendChild(lightFollower);

document.addEventListener('mousemove', (e) => {
  const x = e.clientX - 100;
  const y = e.clientY - 100;
  lightFollower.style.transform = `translate(${x}px, ${y}px)`;
  lightFollower.style.opacity = '0.15';
});

// Scroll reveal with 3D flip animation
const flip3dObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      const delay = index * 0.1;
      entry.target.style.animation = `flipInHorizontal 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}s forwards`;
      entry.target.style.perspective = '1200px';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.timeline-card, .cert-card').forEach((element) => {
  flip3dObserver.observe(element);
});

// 3D depth effect on hover for sections
document.querySelectorAll('section').forEach((section) => {
  section.addEventListener('mouseenter', () => {
    section.style.transform = 'perspective(2000px) rotateX(1deg)';
  });

  section.addEventListener('mouseleave', () => {
    section.style.transform = 'perspective(2000px) rotateX(0deg)';
  });
});

// Staggered animation for reveal elements with 3D effect
window.addEventListener('load', () => {
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach((element, index) => {
    if (!element.classList.contains('visible')) {
      element.style.animation = `fadeUp 0.7s ease both`;
      element.style.animationDelay = `${index * 0.1}s`;
      element.style.transform = 'perspective(1000px) rotateX(-10deg)';
    }
  });
});
