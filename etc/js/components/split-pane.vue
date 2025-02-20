<template>
  <div class="split-pane-container" :data-direction="direction">
    <slot></slot>
  </div>
</template>

<script>
export default { name: "split-pane" };
</script>

<script setup>
import { defineProps } from 'vue';

defineProps({
  direction: {
    type: String,
    default: 'horizontal',
    validator: (value) => ['horizontal', 'vertical'].includes(value)
  }
});
</script>

<style scoped>
.split-pane-container {
  display: flex;
  height: 100%;
  gap: 0;
}

.split-pane-container[data-direction="vertical"] {
  flex-direction: column;
}

:deep(.handle) {
  height: 100%;
  width: 1px !important;
  background-color: transparent !important;
  cursor: col-resize;
  margin: 0 !important;
  padding: 0;
  position: relative;
}

:deep(.handle-grab-box) {
  position: absolute;
  z-index: 100;
  left: -2px;
  height: 100%;
  width: 5px;
  background-color: transparent;
}

:deep(.handle:hover),
:deep(.handle-grab-box:hover) {
  background-color: rgba(128, 128, 128, 0.2);
}
</style> 