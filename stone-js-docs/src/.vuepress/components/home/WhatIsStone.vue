<template>
  <section class="what-is-stone">
    <div class="section-container">
      <h2 class="section-title">What is Stone.js?</h2>
      <p class="section-subtitle">
        Stone.js is a future-ready framework designed for full-context development: <br> cloud, serverless, browser, and beyond.
      </p>

      <div class="card-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
        >
          <component :is="feature.icon" class="icon" />
          <h3>{{ feature.title }}</h3>
          <p v-html="feature.desc"></p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Infinity, Cog, Plug, Terminal, Share2, LayoutTemplate, Puzzle } from 'lucide-vue-next'

const features = [
  { icon: Infinity, title: 'Continuum Architecture', desc: 'One mindset across backend, frontend, serverless, and browser. Learn once, build anything.' },
  { icon: Cog, title: 'Universal by Design', desc: 'Designed for the next generation of web development. Run on Node.js, AWS Lambda, Browser, or anywhere, adapt to any platform.' },
  { icon: Cog, title: 'Modular & Compact', desc: 'No <code>node_modules</code>. One artifact. Pure ESM. Built for performance and portability. Ship your app as a single file, with zero install-time dependencies.' },
  { icon: Plug, title: 'Declarative & Functional API', desc: 'Choose your style: class-based declarative or function-first programming, Stone.js supports both, natively.' },
  { icon: Share2, title: 'Universal Routing', desc: 'Define routes once, use them everywhere. Same routing logic for backend and frontend.' },
  { icon: LayoutTemplate, title: 'Frontend-Ready Plugins', desc: 'Use built-in support for React and Vue(soon) with full SSR and hydration, or plug in your own view engine.' },
  { icon: Puzzle, title: 'Pluggable & Extensible', desc: 'Add features through composable plugins. Build microservices, CLI apps, or SPAs without friction.' },
  { icon: Terminal, title: 'First-Class CLI', desc: 'Create, build, test and deploy with one simple and powerful command line.' },
]
</script>

<style scoped lang="scss">
.what-is-stone {
  overflow: hidden;
  position: relative;
  padding: 0rem 0 6rem;
  background-color: #fff;

  &::after {
    right: 0;
    bottom: 0%;
    z-index: 0;
    content: "";
    width: 900px;
    height: 900px;
    opacity: 0.10;
    position: absolute;
    pointer-events: none;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-image: url('/assets/image/stone-wave-bg.png');
  }

  @media (max-width: hope-config.$tablet) {
    padding: 0rem 0 3rem;
  }
}
</style>
