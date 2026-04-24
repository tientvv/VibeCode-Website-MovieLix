<template>
  <div id="app-root">
    <Navbar />
    <main>
      <NuxtPage />
    </main>
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding-top: var(--navbar-height);
}
</style>
