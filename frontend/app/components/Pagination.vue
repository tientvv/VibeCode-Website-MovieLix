<template>
  <div class="pagination" v-if="totalPages > 1">
    <button class="pagination__btn" :disabled="currentPage <= 1" @click="$emit('change', currentPage - 1)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <div class="pagination__pages">
      <button
        v-for="p in visiblePages"
        :key="p"
        class="pagination__page"
        :class="{ 'pagination__page--active': p === currentPage }"
        @click="typeof p === 'number' && $emit('change', p)"
      >
        {{ p }}
      </button>
    </div>

    <button class="pagination__btn" :disabled="currentPage >= totalPages" @click="$emit('change', currentPage + 1)">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

defineEmits<{
  change: [page: number];
}>();

const visiblePages = computed(() => {
  const current = props.currentPage;
  const total = props.totalPages;

  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
});
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-8) 0;
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pagination__btn,
.pagination__page {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination__btn {
  background: var(--color-bg-elevated);
}

.pagination__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination__page:not(.pagination__page--active):hover,
.pagination__btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  border-color: var(--color-border-hover);
}

.pagination__page--active {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
</style>
