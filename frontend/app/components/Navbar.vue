<template>
  <nav class="navbar" :class="{ 'navbar--scrolled': isScrolled }">
    <div class="navbar__inner container">
      <NuxtLink to="/" class="navbar__logo" id="nav-logo">
        <img src="/logo.png" alt="MovieLix" class="navbar__logo-img" />
      </NuxtLink>

      <div class="navbar__links" id="nav-links">
        <NuxtLink to="/" class="navbar__link" active-class="navbar__link--active"> New Movie </NuxtLink>
        <NuxtLink to="/movies" class="navbar__link" active-class="navbar__link--active"> Movie </NuxtLink>
      </div>

      <div class="navbar__actions">
        <button class="navbar__search-btn" id="nav-search-btn" @click="toggleSearch" aria-label="Search movies">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <button
          class="navbar__mobile-toggle"
          id="nav-mobile-btn"
          @click="mobileOpen = !mobileOpen"
          aria-label="Toggle menu"
        >
          <svg
            v-if="!mobileOpen"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div class="navbar__user-menu">
          <NuxtLink v-if="!auth.isLoggedIn.value" to="/login" class="btn btn-primary btn-sm">Sign In</NuxtLink>
          <div v-else class="navbar__user-profile">
            <span class="navbar__username">{{ auth.user.value?.username }}</span>
            <button @click="auth.logout()" class="navbar__logout-btn" title="Logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="navbar__mobile-menu">
        <NuxtLink to="/" class="navbar__mobile-link" @click="mobileOpen = false">New Movie</NuxtLink>
        <NuxtLink to="/movies" class="navbar__mobile-link" @click="mobileOpen = false">Movie</NuxtLink>
      </div>
    </Transition>

    <!-- Search overlay -->
    <Teleport to="body">
      <Transition name="search-overlay">
        <div v-if="searchOpen" class="navbar__search-overlay" @click.self="searchOpen = false">
          <div class="navbar__search-box">
            <svg
              class="navbar__search-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search movies, series..."
              class="navbar__search-input"
              id="search-input"
              @keyup.enter="handleSearch"
              @keyup.escape="searchOpen = false"
            />
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const isScrolled = ref(false);
const mobileOpen = ref(false);
const searchOpen = ref(false);
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);

const auth = useAuth();

function toggleSearch() {
  searchOpen.value = !searchOpen.value;
  if (searchOpen.value) {
    nextTick(() => searchInput.value?.focus());
  }
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
    searchOpen.value = false;
    searchQuery.value = '';
  }
}

onMounted(() => {
  let ticking = false;
  const handleScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        isScrolled.value = window.scrollY > 20;
        ticking = false;
      });
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  onUnmounted(() => window.removeEventListener('scroll', handleScroll));
});
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: var(--navbar-height);
  z-index: 1000;
  background: linear-gradient(to bottom, rgba(11, 14, 20, 0.85) 0%, transparent 100%);
  transition: background var(--transition-base), box-shadow var(--transition-base);
}

.navbar--scrolled {
  background: rgba(11, 14, 20, 0.95);
  box-shadow: 0 1px 0 var(--color-border);
}

.navbar__inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-8);
}

/* Logo */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--text-xl);
  text-decoration: none;
  flex-shrink: 0;
}

.navbar__logo:hover {
  color: var(--color-text-primary);
}

.navbar__logo-img {
  height: 32px;
  width: auto;
  object-fit: contain;
  transition: opacity var(--transition-fast);
}

.navbar__logo:hover .navbar__logo-img {
  opacity: 0.8;
}

/* Nav links */
.navbar__links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: auto;
}

.navbar__link {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  cursor: pointer;
  background: none;
  border: none;
  font-family: var(--font-body);
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--color-text-primary);
}

.navbar__link--active {
  position: relative;
}

.navbar__link--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: var(--color-accent);
  border-radius: 1px;
}

.navbar__dropdown-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

/* Actions */
.navbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: var(--space-4);
}

.navbar__search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.navbar__search-btn:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.navbar__user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: var(--space-2);
}

.navbar__user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 12px;
  border-radius: 20px;
}

.navbar__username {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.navbar__logout-btn {
  padding: 4px;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
}

.navbar__logout-btn:hover {
  color: var(--color-error);
}

.navbar__mobile-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
}

/* Search overlay */
.navbar__search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120px;
  z-index: 2000;
}

.navbar__search-box {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: min(640px, 90vw);
  padding: var(--space-4) var(--space-6);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-hover);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
}

.navbar__search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.navbar__search-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-size: var(--text-lg);
  font-family: var(--font-body);
  outline: none;
}

.navbar__search-input::placeholder {
  color: var(--color-text-muted);
}

/* Mobile menu */
.navbar__mobile-menu {
  display: none;
  flex-direction: column;
  padding: var(--space-4);
  background: rgba(5, 5, 5, 0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--color-border);
}

.navbar__mobile-link {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
}

.navbar__mobile-link:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.04);
}

/* Transitions */
.search-overlay-enter-active {
  transition: opacity 200ms ease;
}
.search-overlay-leave-active {
  transition: opacity 150ms ease;
}
.search-overlay-enter-from,
.search-overlay-leave-to {
  opacity: 0;
}

.mobile-menu-enter-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}
.mobile-menu-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}
.mobile-menu-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar__links {
    display: none;
  }
  .navbar__actions {
    margin-left: auto;
  }
  .navbar__mobile-toggle {
    display: flex;
  }
  .navbar__mobile-menu {
    display: flex;
  }
}
</style>
