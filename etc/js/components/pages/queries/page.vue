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

const leftPaneRatio = ref(leftPaneWidth.value / window.innerWidth);
let isResizing = false;
let initialMouseX = 0;
let initialLeftPaneWidth = 0;

function startResize(e) {
  isResizing = true;
  initialMouseX = e.clientX;
  initialLeftPaneWidth = leftPaneWidth.value;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.classList.add('noselect');
  document.body.style.cursor = 'col-resize';
}

function handleResize(e) {
  if (!isResizing) return;
  
  const deltaX = e.clientX - initialMouseX;
  const totalWidth = window.innerWidth;
  const minWidth = 200;
  const maxWidth = totalWidth - 400;
  const newWidth = initialLeftPaneWidth + deltaX;
  leftPaneWidth.value = Math.max(minWidth, Math.min(maxWidth, newWidth));
  leftPaneRatio.value = leftPaneWidth.value / totalWidth;
}

function stopResize() {
  isResizing = false;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.classList.remove('noselect');
  document.body.style.cursor = '';
  const handles = document.querySelectorAll('.handle-grab-box');
  handles.forEach(handle => {
    handle.style.width = '4px';
    handle.style.backgroundColor = 'var(--color-border)';
  });
}

onMounted(() => {
  const totalWidth = window.innerWidth;
  if (leftPaneWidth.value > totalWidth * 0.6) {
    leftPaneWidth.value = Math.floor(totalWidth * 0.6);
    leftPaneRatio.value = leftPaneWidth.value / totalWidth;
  }
  
  window.addEventListener('resize', () => {
    if (!isResizing) {
      const totalWidth = window.innerWidth;
      const prevTotalWidth = window.prevTotalWidth || totalWidth;
      window.prevTotalWidth = totalWidth;
      if (Math.abs(totalWidth - prevTotalWidth) > 50) {
        const newLeftPaneWidth = Math.floor(totalWidth * leftPaneRatio.value);
        leftPaneWidth.value = Math.max(200, Math.min(totalWidth * 0.6, newLeftPaneWidth));
      }
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
  width: var(--gap);
  margin: 0;
  z-index: 10;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.handle-grab-box {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 100%;
  width: 4px;
  background: var(--color-border);
  transition: width 0.2s, background-color 0.2s;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: col-resize;
}

.handle:hover .handle-grab-box {
  background: var(--color-primary);
  width: 6px;
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
