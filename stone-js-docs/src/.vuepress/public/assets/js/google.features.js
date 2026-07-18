// Google Analytics tracking for VuePress site features
// This script tracks various user interactions on the site using Google Analytics (gtag).
// Ensure gtag is defined
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if gtag is defined
    if (typeof gtag !== 'function') {
      console.warn('gtag function is not defined. Google Analytics tracking will not work.');
    }
  });
})();

// Track cli command copy events
(function () {
  document.addEventListener('click', (event) => {
    const el = event.target;
    if (el.classList.contains('vp-copy-code-button')) {
      const code = el?.nextElementSibling?.textContent?.trim();
      if (typeof gtag === 'function' && code?.startsWith('npm i')) {
        gtag('event', 'cli_copy', {
          command: code,
          page_path: location.pathname,
        });
      }
    }
  });
})();

// Track theme toggling
(function () {
  const observer = new MutationObserver(() => {
    const theme = document.documentElement.getAttribute('data-theme');
    if (typeof gtag === 'function') {
      gtag('event', 'toggle_theme', {
        mode: theme,
        page_path: location.pathname,
      });
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
})();

// Track scroll depth
(function () {
  const reached = new Set();
  const milestones = [25, 50, 75, 90, 100];

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = Math.floor((scrollTop / docHeight) * 100);

    milestones.forEach((m) => {
      if (percent >= m && !reached.has(m)) {
        reached.add(m);
        if (typeof gtag === 'function') {
          gtag('event', 'scroll', {
            percent_scrolled: m,
            page_path: location.pathname,
          });
        }
      }
    });
  });
})();

// Track outbound and anchor link clicks
(function () {
  document.addEventListener('click', (event) => {
    const el = event.target.closest('a');
    if (!el) return;
    const href = el.href;

    // only track if outbound
    if (!href?.startsWith(location.origin) && !href?.startsWith('/') && !href?.startsWith('#')) {
      if (typeof gtag === 'function') {
        gtag('event', 'outbound_click', {
          url: href,
          page_path: location.pathname,
        });
      }
    } else if (href?.startsWith('#')) {
      if (typeof gtag === 'function') {
        gtag('event', 'anchor_click', {
          anchor: href,
          page_path: location.pathname,
        });
      }
    }
  });
})();
