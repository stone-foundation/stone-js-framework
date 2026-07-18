import { defineClientConfig } from 'vuepress/client'

export default defineClientConfig({
  enhance({ router }) {
    if (typeof window !== 'undefined') {
      let previousTheme = localStorage.getItem('vuepress-theme-hope-scheme') || 'light';

      router.beforeEach((to, from, next) => {
        if (from.path !== '/') {
          previousTheme = localStorage.getItem('vuepress-theme-hope-scheme') || 'light';
        }
        next()
      })
      
      router.afterEach((to) => {
        // Google Analytics event tracking
        if ('gtag' in window && typeof window.gtag === 'function') {
          window.gtag('event', 'page_view', {
            page_path: to.fullPath
          })
        }
        
        // Ensure the theme is set to light on root path
        if (location.pathname === '/') {
          localStorage.setItem('vuepress-theme-hope-scheme', 'light')
          document.documentElement.setAttribute('data-theme', 'light')
        } else {
          localStorage.setItem('vuepress-theme-hope-scheme', previousTheme)
          document.documentElement.setAttribute('data-theme', previousTheme)
        }
      })

      // Load your custom script
      const script = document.createElement('script')
      script.src = '/assets/js/google.features.js'
      script.async = true
      document.head.appendChild(script)
    }
  },
})