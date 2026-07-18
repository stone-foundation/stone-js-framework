<template>
  <section class="trusted-by-section">
    <div class="container">
      <h2 class="section-title">Trusted by Developers Everywhere</h2>
      <p class="section-subtitle">
        Stone.js is already powering applications across the globe — in startups, side projects, and future-forward companies.
      </p>

      <div class="metrics">
        <div class="metric">
          <span class="number">2K+</span>
          <span class="label">GitHub Stars</span>
        </div>
        <div class="metric">
          <span class="number">100K+</span>
          <span class="label">NPM Downloads</span>
        </div>
        <div class="metric">
          <span class="number">120+</span>
          <span class="label">Contributors</span>
        </div>
      </div>

      <div class="avatar-grid">
        <div class="avatar" v-for="n in 12" :key="n">
          <img :src="`https://i.pravatar.cc/80?img=${n}`" alt="Contributor avatar" />
        </div>
      </div>

      <div class="actions">
        <a class="btn" href="https://github.com/stone-foundation/stone-js" target="_blank" rel="noopener">View on GitHub</a>
        <a class="btn secondary" href="/guide/contributing.html">Become a Contributor</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trusted-by-section {
  background: #f9f9f9;
  padding: 6rem 2rem;
  text-align: center;
}

.section-title {
  font-size: 3.5rem;
  color: #2c3e50;
  border: 0 none;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.metrics {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.metric {
  text-align: center;
}

.metric .number {
  font-size: 2rem;
  font-weight: bold;
  color: #d35400;
}

.metric .label {
  font-size: 0.95rem;
  color: #7f8c8d;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 2rem auto 3rem;
}

.avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
}

.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  background: #d35400;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
}

.btn.secondary {
  background: transparent;
  border: 2px solid #d35400;
  color: #d35400;
}
</style>
