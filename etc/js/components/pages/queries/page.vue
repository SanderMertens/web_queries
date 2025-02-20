<template>
  <div id="page-queries" class="page-content">
    <split-pane :direction="isMobile ? 'vertical' : 'horizontal'">
      <div class="split-pane queries-left-pane" v-if="app_params.sidebar" :style="{ width: leftPaneWidth + 'px' }">
        <pane-query
          v-model:app_params="app_params"
          :conn="conn">
        </pane-query>
      </div>

      <div class="handle" v-if="app_params.sidebar && !isMobile" @mousedown="startResize">
        <div class="handle-grab-box"></div>
      </div>

      <div class="split-pane queries-right-pane" :style="{ width: rightPaneWidth + 'px' }">
        <pane-inspect
          :app_params="app_params"
          :conn="conn">
        </pane-inspect>
      </div>
    </split-pane>
  </div>
</template>

<script>
export default { name: "page-queries" };
</script>

<script setup>
import { defineProps, defineModel, ref, computed, onMounted, onUnmounted } from 'vue';
import SplitPane from '../../split-pane.vue';

const props = defineProps({
  conn: {type: Object, required: true},
  app_params: {type: Object, required: true},
});

const app_params = defineModel("app_params");

const isMobile = computed(() => window.innerWidth <= 800);
const leftPaneWidth = ref(500);
const rightPaneWidth = computed(() => {
  const totalWidth = window.innerWidth;
  return app_params.value.sidebar ? totalWidth - leftPaneWidth.value - 8 : totalWidth;
});

let isResizing = false;

function startResize() {
  isResizing = true;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

function handleResize(e) {
  if (!isResizing) return;
  
  const minWidth = 200;
  const maxWidth = window.innerWidth - 400; // Leave at least 400px for the right pane
  leftPaneWidth.value = Math.max(minWidth, Math.min(maxWidth, e.clientX));
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

onMounted(() => {
  window.addEventListener('resize', () => {
    const totalWidth = window.innerWidth;
    if (leftPaneWidth.value > totalWidth * 0.6) {
      leftPaneWidth.value = Math.min(leftPaneWidth.value, totalWidth * 0.6);
    }
  });
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
});
</script>

<style scoped>
#page-queries {
  height: calc(100vh - var(--header-height) - var(--footer-height) - 3 * var(--gap));
  overflow: hidden;
}

.split-pane {
  height: 100%;
  min-width: 0;
  overflow: auto;
}

.handle {
  cursor: col-resize;
  width: 8px;
  margin: 0 -4px;
  z-index: 100;
}

.handle-grab-box {
  height: 100%;
  width: 4px;
  background: var(--color-border);
  margin: 0 2px;
  transition: background-color 0.2s;
}

.handle:hover .handle-grab-box {
  background: var(--color-primary);
}

@media screen and (max-width: 800px) {
  .split-pane.queries-left-pane {
    width: 100% !important;
    height: calc(40vh - var(--header-height) - var(--gap));
  }

  .split-pane.queries-right-pane {
    width: 100% !important;
    height: calc(60vh - var(--footer-height) - var(--gap));
  }
}
</style>
