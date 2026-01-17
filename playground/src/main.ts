import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './stores';

import './main.css';

// Update document head for SEO testing
const updateHead = () => {
  const route = router.currentRoute.value;
  const baseUrl = window.location.origin;

  // Update title
  const titles: Record<string, string> = {
    '/': 'Universal DevTools - Framework-Agnostic Debugging Suite',
    '/about': 'About - Universal DevTools',
    '/settings': 'Settings - Universal DevTools',
  };
  document.title = titles[route.path] || 'Universal DevTools';

  // Update meta description
  const descriptions: Record<string, string> = {
    '/': 'The framework-agnostic DevTools system for Vite applications. Debug Vue, React, Svelte, Angular and more with a unified interface.',
    '/about':
      'Learn more about Universal DevTools - the powerful debugging suite for modern web development.',
    '/settings': 'Configure your Universal DevTools settings and preferences.',
  };
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', descriptions[route.path] || descriptions['/']);

  // Update canonical
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', `${baseUrl}${route.path}`);

  // Update JSON-LD
  let jsonLd = document.querySelector('script[type="application/ld+json"]');
  if (!jsonLd) {
    jsonLd = document.createElement('script');
    jsonLd.setAttribute('type', 'application/ld+json');
    document.head.appendChild(jsonLd);
  }

  const jsonLdData: any = {
    '@context': 'https://schema.org',
    '@type': route.path === '/' ? 'WebSite' : 'WebPage',
    name: document.title,
    description: descriptions[route.path] || descriptions['/'],
    url: `${baseUrl}${route.path}`,
  };

  if (route.path === '/') {
    jsonLdData.potentialAction = {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    };
  }

  jsonLd.textContent = JSON.stringify(jsonLdData);
};

const app = createApp(App);
app.use(pinia);
app.use(router);

// Update head on route change
router.afterEach(() => {
  updateHead();
});

// Initial update
updateHead();

app.mount('#app');
