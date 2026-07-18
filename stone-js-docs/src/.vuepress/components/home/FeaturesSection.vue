<template>
  <section class="features-section">
    <div class="section-container">
      <h2 class="section-title">Why Choose Stone.js?</h2>
      <p class="section-subtitle">
        A modern, full-context JavaScript framework designed for speed, portability, and architectural clarity, from edge to core.
      </p>

      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-item"
        >
          <component :is="feature.icon" class="icon" />
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  InfinityIcon,
  ServerIcon,
  TerminalIcon,
  LayersIcon,
  CloudIcon,
  SettingsIcon,
  ZapIcon,
  PuzzleIcon,
  FolderIcon,
  CodeIcon,
  CpuIcon,
  SlidersIcon
} from 'lucide-vue-next'

const features = [
  { icon: InfinityIcon, title: 'Continuum Architecture', desc: 'One architecture from backend to frontend to cloud, fully aligned.' },
  { icon: ServerIcon, title: 'Deploy Anywhere', desc: 'Node.js, browser, FaaS, Edge… you choose. One artifact runs everywhere.' },
  { icon: TerminalIcon, title: 'Powerful CLI', desc: 'Bootstrap, build, test, and deploy with zero config.' },
  { icon: LayersIcon, title: 'Unified API', desc: 'Same knowledge across frontend and backend. Universal routing, services, config.' },
  { icon: CloudIcon, title: 'Cloud Native', desc: 'Designed for serverless and edge-native deployments from the ground up.' },
  { icon: SettingsIcon, title: 'Adaptive Configuration', desc: 'Declarative or imperative, dynamic or static, configure your way.' },
  { icon: ZapIcon, title: 'Lightning Fast', desc: 'Small, tree-shaken, lazy-loaded. Zero runtime overhead.' },
  { icon: PuzzleIcon, title: 'Composable Middleware', desc: 'Define, register, and compose behavior easily and transparently.' },
  { icon: FolderIcon, title: 'No Node Modules', desc: 'Just one portable artifact. No baggage. No pollution.' },
  { icon: CodeIcon, title: 'Pure ESM + TypeScript', desc: 'Built for modern tooling with type-safe interfaces everywhere.' },
  { icon: CpuIcon, title: 'Minimal Core', desc: 'No bloat. Bring only what you use, when you use it.' },
  { icon: SlidersIcon, title: 'Flexible & Extensible', desc: 'Override, extend, or inject behavior at every lifecycle stage.' }
]
</script>

<style scoped lang="scss">
.features-section {
  padding: 6rem 2rem;
  background-color: #fdfdfd;

  @media (max-width: hope-config.$tablet) {
    padding: 3rem 0;
  }


  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
    justify-items: center;
  }

  .feature-item {
    background: #fff;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease-in-out;
  }

  .feature-item:hover {
    transform: translateY(-6px);
  }

  .feature-item .icon {
    width: 2.5rem;
    height: 2.5rem;
    color: #d35400;
    margin-bottom: 1rem;
  }

  .feature-item h3 {
    font-size: 1.2rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .feature-item p {
    color: #7f8c8d;
    font-size: 0.95rem;
    line-height: 1.5;
  }
}
</style>
