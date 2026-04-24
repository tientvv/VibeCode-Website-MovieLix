<template>
  <footer class="footer">
    <div class="footer__inner container">
      <div class="footer__brand">
        <NuxtLink to="/" class="footer__logo">
          <span class="footer__logo-badge">MOVIE</span>
          <span class="footer__logo-text">LIX</span>
        </NuxtLink>
        <p class="footer__tagline">Stream movies in stunning 1080p & 2K quality.</p>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">© {{ new Date().getFullYear() }} MovieLix. All rights reserved.</p>
        <p class="footer__powered">Powered by <span class="text-accent">neytrix.app</span></p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
}

.footer__inner {
  padding-top: var(--space-10);
  padding-bottom: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.footer__brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.footer__logo {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-lg);
  text-decoration: none;
}

.footer__logo:hover {
  color: var(--color-text-primary);
}

.footer__logo-badge {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  letter-spacing: 0.05em;
}

.footer__logo-text {
  color: var(--color-text-primary);
  margin-left: 4px;
}

.footer__tagline {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.footer__copy,
.footer__powered {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
