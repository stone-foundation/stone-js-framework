<template>
  <section class="join-community">
    <div class="container">
      <div class="text-content">
        <h2>Join the Stone.js Community</h2>
        <p>
          Stone.js is more than a framework. It's a movement built around clean architecture, cloud-native principles, and a radically simplified developer experience.
        </p>
        <p>
          Whether you're building apps, libraries, plugins, or frameworks on top of Stone.js, you're not alone. Meet developers, ask questions, share ideas, and shape the future.
        </p>
        <div class="cta-buttons">
          <a href="https://github.com/stone-foundation/" target="_blank" rel="noopener" class="btn primary">GitHub</a>
          <a href="https://discord.gg/stonejs" target="_blank" rel="noopener" class="btn outline">Join Discord</a>
        </div>
      </div>

      <div class="visual-content" aria-hidden="true">
        <img src="/assets/image/moai_community.png" alt="Stone.js community graphic" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.join-community {
  padding: 6rem 2rem;
  position: relative;
  background: #f9f9f9;

  .container {
    gap: 3rem;
    display: flex;
    margin: 0 auto;
    flex-wrap: wrap;
    max-width: 1200px;
    align-items: center;

    @media (max-width: hope-config.$tablet) {
      gap: 0;
    }
  }

  .text-content {
    flex: 1 1 400px;
  }

  .visual-content {
    display: flex;
    flex: 1 1 400px;
    align-items: center;
    justify-content: center;

    @media (max-width: hope-config.$tablet) {
      max-height: 200px;
      flex: 1 1 290px;
    }

    img {
      height: auto;
      max-width: 100%;
    }
  }

  h2 {
    font-size: 3.5rem;
    color: #2c3e50;
    border: 0 none;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    color: #7f8c8d;
    line-height: 1.7;
    margin-bottom: 1.25rem;
  }

  .cta-buttons {
    gap: 1rem;
    display: flex;
    flex-wrap: wrap;
  }

  .btn {
    text-decoration: none;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease-in-out;
  }

  .btn.primary {
    background-color: #d35400;
    color: #fff;
  }

  .btn.primary:hover {
    background-color: #c0392b;
  }

  .btn.outline {
    border: 2px solid #d35400;
    color: #d35400;
  }

  .btn.outline:hover {
    background-color: #fbeee0;
  }

  @media (max-width: hope-config.$tablet) {
    .container {
      flex-direction: column;
      text-align: center;
    }

    .visual-content {
      order: -1;
    }

    .cta-buttons {
      margin-top: 4rem;
      justify-content: center;
    }
  }
}
</style>
