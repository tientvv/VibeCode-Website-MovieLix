<template>
  <div id="app-root">
    <Navbar v-if="showShell" />
    <main :class="{ 'main--with-nav': showShell }">
      <NuxtPage />
    </main>
    <FooterSection v-if="showShell" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const showShell = computed(() => {
  const path = route.path;
  return !path.startsWith('/admin') && path !== '/login';
});
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.main--with-nav {
  padding-top: var(--navbar-height);
}
</style>
