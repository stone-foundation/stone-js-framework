<template>
  <section class="call-to-action">
    <div class="section-container">
      <h2 class="cta-title">Start building <br> with Stone.js today</h2>
      <p class="cta-subtitle">
        One mindset. One framework. Infinite possibilities. <br> Embrace the continuum, and deploy everywhere with confidence.
      </p>
      <div class="cta-buttons">
        <RouterLink to="/docs/" class="btn btn-primary">Get Started</RouterLink>
        <a href="https://github.com/stone-foundation/stone-js-docs" target="_blank" rel="noopener" class="btn btn-secondary">View on GitHub</a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.call-to-action {
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  background: linear-gradient(to right, #d35400, #f39c12);

  @media (max-width: hope-config.$tablet) {
    padding: 3rem 0;
  }

  .section-container {
    color: white;
  }

  .cta-title {
    font-size: 3.5rem;
    border: 0 none;
    font-weight: bold;
  }

  .cta-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2.5rem;
  }

  .cta-buttons {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  .cta-buttons .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .btn-primary {
    background-color: #fff;
    color: #d35400;
  }

  .btn-primary:hover {
    background-color: #f7f7f7;
  }

  .btn-secondary {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid white;
  }

  .btn-secondary:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  @media (min-width: 640px) {
    .cta-buttons {
      flex-direction: row;
      justify-content: center;
    }
  }
}
</style>
