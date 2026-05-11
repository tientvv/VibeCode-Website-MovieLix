<template>
  <div class="user-login">
    <div class="user-login__card">
      <h1 class="user-login__title">Welcome Back</h1>
      <p class="user-login__subtitle">Sign in to watch unlimited movies and TV series</p>

      <form @submit.prevent="handleLogin" class="user-login__form">
        <div class="user-login__field">
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

        <div class="user-login__field">
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

        <p v-if="error" class="user-login__error">{{ error }}</p>

        <button
          type="submit"
          class="btn btn-primary btn-lg user-login__submit"
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
import { useAuth } from '~/composables/useAuth';

useHead({ title: 'Sign In — MovieLix' });

const route = useRoute();
const auth = useAuth();

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

// If already logged in, redirect
onMounted(() => {
  if (auth.isLoggedIn.value) {
    navigateTo('/');
  }
});

async function handleLogin() {
  error.value = '';
  isLoading.value = true;

  try {
    const res = await $fetch<any>('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    });

    auth.login(res.token, res.user);

    const redirectPath = route.query.redirect as string;
    if (redirectPath) {
      navigateTo(redirectPath);
    } else {
      navigateTo('/');
    }
  } catch (err: any) {
    error.value = 'Invalid username or password';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.user-login {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  background-image: radial-gradient(circle at center, rgba(245, 197, 24, 0.05) 0%, transparent 70%);
}

.user-login__card {
  width: 100%;
  max-width: 420px;
  padding: var(--space-10);
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.user-login__title {
  text-align: center;
  font-size: var(--text-2xl);
  font-weight: 700;
  margin-bottom: var(--space-2);
  color: #fff;
}

.user-login__subtitle {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
}

.user-login__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.user-login__field label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}

.user-login__error {
  color: var(--color-error);
  font-size: var(--text-sm);
  text-align: center;
  background: rgba(255, 59, 48, 0.1);
  padding: 8px;
  border-radius: var(--radius-md);
}

.user-login__submit {
  width: 100%;
  justify-content: center;
  margin-top: var(--space-2);
  font-weight: 600;
  letter-spacing: 0.05em;
}
</style>
