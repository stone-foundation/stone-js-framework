<template>
  <section class="ecosystem-tooling">
    <div class="ecosystem-bg" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path
          d="M0,160 C360,280 1080,40 1440,160 L1440,900 L0,900 Z"
          fill="#d35400"
          fill-opacity="0.05"
        />
      </svg>
    </div>

    <div class="section-container">
      <h2 class="section-title">Ecosystem & Tooling</h2>
      <p class="section-subtitle">
        Everything you need to build modern, scalable, and flexible applications.
      </p>

      <div class="tooling-grid">
        <div class="tool" v-for="(tool, index) in tools" :key="index">
          <component :is="tool.icon" class="tool-icon" />
          <div>
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { Terminal, Wrench, Plug, Zap, FileText, Monitor, Share2, Database, Layers } from 'lucide-vue-next';

const tools = [
  {
    icon: Terminal,
    title: 'Stone CLI',
    desc: 'Generate, build, run, and deploy apps with a unified, developer-first command line.'
  },
  {
    icon: Wrench,
    title: 'Plugin System',
    desc: 'Extend or override core behaviors using reusable, modular plugins.'
  },
  {
    icon: Plug,
    title: 'Adapters',
    desc: 'Abstract platform differences and run your app seamlessly on Node, browser, Lambda, or the unknown.'
  },
  {
    icon: Share2,
    title: 'Stone Router',
    desc: 'Universal router for frontend and backend. One routing system. Every dimension.'
  },
  {
    icon: Monitor,
    title: 'Use React',
    desc: 'Enable SSR, hydration, and rendering in React, with full head and layout control.'
  },
  {
    icon: FileText,
    title: 'Typed Config & Env',
    desc: 'Manage environment and config variables safely with powerful helpers.'
  },
  {
    icon: Zap,
    title: 'Blueprint System',
    desc: 'Configure everything through a unified context-aware API, declarative or imperative.'
  },
  {
    icon: Database,
    title: 'Dependency Injection',
    desc: 'Destructure your services with ease using a fast, extensible, zero-boilerplate DI container.'
  },
  {
    icon: Layers,
    title: 'Starter Project Scaffolding',
    desc: 'Kick off with “basic”, “standard”, or “full” blueprints, pick your entry point into the Continuum.'
  }
]

</script>

<style scoped lang="scss">
.ecosystem-tooling {
  overflow: hidden;
  position: relative;
  padding: 6rem 2rem;
  background-color: #fdfdfd;

  @media (max-width: hope-config.$tablet) {
    padding: 3rem 0;
  }

  .ecosystem-bg {
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
    display: none;
    position: absolute;
    pointer-events: none;

    @media (min-width: hope-config.$pc) {
      display: block;
    }
  }

  .tooling-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    align-items: start;
  }

  .tool {
    display: flex;
    gap: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    padding: 1.5rem;
    transition: all 0.2s ease-in-out;
    align-items: center;
  }

  .tool:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }

  .tool-icon {
    width: 2rem;
    height: 2rem;
    color: #d35400;
    flex-shrink: 0;
  }

  .tool h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #2c3e50;
  }

  .tool p {
    margin: 0.25rem 0 0;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
}
</style>
