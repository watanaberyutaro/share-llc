document.addEventListener('DOMContentLoaded', () => {
  initializePreloader();
  initializeNavigation();
  initializeAnimations();
  initializeSmoothScroll();
  initializeParallax();
});

function initializePreloader() {
  const preloader = document.querySelector('.preloader');
  if (!preloader) return;
  
  let progress = 0;
  const percentage = document.querySelector('.preloader-percentage');
  
  if (percentage) {
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          preloader.style.opacity = '0';
          setTimeout(() => {
            preloader.style.display = 'none';
            document.body.style.overflow = 'visible';
          }, 600);
        }, 400);
      }
      percentage.textContent = Math.floor(progress) + '%';
    }, 100);
  } else {
    setTimeout(() => {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    }, 1000);
  }
}

function initializeNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('nav a');
  
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
      hamburger.classList.toggle('active');
      
      const spans = hamburger.querySelectorAll('span');
      if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
      }
    });
    
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          nav.classList.remove('active');
          hamburger.classList.remove('active');
        }
      });
    });
  }
  
  const header = document.querySelector('header');
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.style.background = 'rgba(38, 50, 56, 0.98)';
      header.style.backdropFilter = 'blur(20px)';
    } else {
      header.style.background = 'rgba(38, 50, 56, 0.95)';
    }
    
    if (currentScroll > lastScroll && currentScroll > 200) {
      header.style.transform = 'translateY(-100%)';
    } else {
      header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  });
}

function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        if (entry.target.classList.contains('counter')) {
          animateCounter(entry.target);
        }
        
        if (entry.target.classList.contains('progress-bar')) {
          animateProgressBar(entry.target);
        }
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.fade-in, .slide-up, .slide-left, .slide-right').forEach(el => {
    observer.observe(el);
  });
  
  document.querySelectorAll('.counter').forEach(el => {
    observer.observe(el);
  });
  
  document.querySelectorAll('.progress-bar').forEach(el => {
    observer.observe(el);
  });
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target || element.textContent);
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current) + (element.dataset.suffix || '');
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target + (element.dataset.suffix || '');
    }
  };
  
  updateCounter();
}

function animateProgressBar(element) {
  const target = parseInt(element.dataset.progress || 0);
  const fill = element.querySelector('.progress-fill');
  
  if (fill) {
    setTimeout(() => {
      fill.style.width = target + '%';
    }, 200);
  }
}

function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function initializeParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');
  
  if (parallaxElements.length === 0) return;
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(el => {
      const speed = el.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });
}

function initializeTypingEffect() {
  const typingElements = document.querySelectorAll('.typing-effect');
  
  typingElements.forEach(el => {
    const text = el.dataset.text || el.textContent;
    el.textContent = '';
    let index = 0;
    
    const type = () => {
      if (index < text.length) {
        el.textContent += text.charAt(index);
        index++;
        setTimeout(type, 100);
      }
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          type();
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(el);
  });
}

function initializeGlitchEffect() {
  const glitchElements = document.querySelectorAll('.glitch');
  
  glitchElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.add('glitching');
      setTimeout(() => {
        el.classList.remove('glitching');
      }, 500);
    });
  });
}

function initializeMouseFollower() {
  const follower = document.createElement('div');
  follower.className = 'mouse-follower';
  document.body.appendChild(follower);
  
  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  const animate = () => {
    const dx = mouseX - followerX;
    const dy = mouseY - followerY;
    
    followerX += dx * 0.1;
    followerY += dy * 0.1;
    
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    
    requestAnimationFrame(animate);
  };
  
  animate();
  
  const interactiveElements = document.querySelectorAll('a, button, .card');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower.classList.add('hover');
    });
    
    el.addEventListener('mouseleave', () => {
      follower.classList.remove('hover');
    });
  });
}

function initializeFormValidation() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        validateInput(input);
      });
      
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateInput(input);
        }
      });
    });
    
    form.addEventListener('submit', (e) => {
      let isValid = true;
      
      inputs.forEach(input => {
        if (!validateInput(input)) {
          isValid = false;
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  });
}

function validateInput(input) {
  const value = input.value.trim();
  let isValid = true;
  
  if (input.hasAttribute('required') && !value) {
    showError(input, '必須項目です');
    isValid = false;
  } else if (input.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      showError(input, '有効なメールアドレスを入力してください');
      isValid = false;
    }
  } else if (input.type === 'tel' && value) {
    const telRegex = /^[0-9-]+$/;
    if (!telRegex.test(value)) {
      showError(input, '有効な電話番号を入力してください');
      isValid = false;
    }
  } else {
    clearError(input);
  }
  
  return isValid;
}

function showError(input, message) {
  input.classList.add('error');
  
  let errorEl = input.parentElement.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearError(input) {
  input.classList.remove('error');
  const errorEl = input.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.remove();
  }
}

window.addEventListener('load', () => {
  initializeTypingEffect();
  initializeGlitchEffect();
  initializeFormValidation();
  
  if (window.innerWidth > 768) {
    initializeMouseFollower();
  }
});