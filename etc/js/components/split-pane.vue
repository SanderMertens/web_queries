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
  width: var(--gap) !important;
  background-color: transparent !important;
  cursor: col-resize;
  margin: 0 !important;
  padding: 0;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  z-index: 10;
  transition: background-color 0.2s;
}

:deep(.handle-grab-box) {
  position: absolute;
  z-index: 100;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: 4px;
  background-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  transition: width 0.2s, background-color 0.2s;
}

:deep(.handle:hover .handle-grab-box) {
  background-color: rgba(128, 128, 128, 0.2);
  width: 6px;
}
</style>

<style>
.noselect {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
.noselect .handle, 
.noselect .handle-grab-box {
  cursor: col-resize !important;
}
</style> 