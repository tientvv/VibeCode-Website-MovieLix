<template>
  <div class="admin-login" id="admin-login-page">
    <div class="admin-login__card">
      <div class="admin-login__header">
        <img src="/logo.png" alt="MovieLix" style="height: 40px; width: auto; object-fit: contain;" />
      </div>
      <h1 class="admin-login__title">Admin Panel</h1>
      <p class="admin-login__subtitle">Sign in to manage movies and content</p>

      <form @submit.prevent="handleLogin" class="admin-login__form">
        <div class="admin-login__field">
          <label for="login-username">Username</label>
          <input
            v-model="username"
            type="text"
            id="login-username"
            class="input"
            placeholder="Enter username"
            required
            autocomplete="username"
          />
        </div>

        <div class="admin-login__field">
          <label for="login-password">Password</label>
          <input
            v-model="password"
            type="password"
            id="login-password"
            class="input"
            placeholder="Enter password"
            required
            autocomplete="current-password"
          />
        </div>

        <p v-if="error" class="admin-login__error">{{ error }}</p>

        <button
          type="submit"
          class="btn btn-primary btn-lg admin-login__submit"
          :disabled="isLoading"
          id="btn-login"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

useHead({ title: 'Admin Login — MovieLix' });

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleLogin() {
  error.value = '';
  isLoading.value = true;

  try {
    const res = await $fetch<any>('/api/admin/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    });

    localStorage.setItem('admin_token', res.token);
    navigateTo('/admin');
  } catch (err: any) {
    error.value = 'Invalid username or password';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  padding: var(--space-4);
}

.admin-login__card {
  width: 100%;
  max-width: 400px;
  padding: var(--space-10);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.admin-login__header {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-bottom: var(--space-6);
  justify-content: center;
}

.admin-login__title {
  text-align: center;
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.admin-login__subtitle {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.admin-login__field label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.admin-login__error {
  color: var(--color-error);
  font-size: var(--text-sm);
  text-align: center;
}

.admin-login__submit {
  width: 100%;
  justify-content: center;
  margin-top: var(--space-2);
}
</style>
