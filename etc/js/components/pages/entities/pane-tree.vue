<template>
  <div id="pane-tree" class="pane">
    <div class="pane-tree-search-box">
      <div class="pane-tree-select">
        <dropdown 
          :items="treeModeItems" 
          v-model:active_item="appParams.tree_mode">
        </dropdown>
      </div>
      <div class="pane-tree-search">
        <search-box v-model="nameFilter"></search-box>
      </div>
    </div>
    <div class="pane-tree-entity-tree">
      <entity-tree 
        :conn="conn" 
        :nameFilter="nameFilter"
        :queryFilter="queryFilter"
        @select="selectItem">
      </entity-tree>
    </div>
  </div>
</template>

<script>
export default { name: "pane-tree" }
</script>

<script setup>
import { computed, defineProps, defineModel, ref } from 'vue';

const props = defineProps({
  conn: {type: Object, required: true},
});

const emit = defineEmits(["scriptOpen", "entityOpen"]);
const appParams = defineModel("app_params");
const nameFilter = ref();

const treeModeItems = computed(() => {
  if (appParams.value.script) {
    return ['Entities', 'Scripts', 'Outline'];
  } else {
    return ['Entities', 'Scripts'];
  }
});

const queryFilter = computed(() => {
  let result = "";

  if (appParams.value.tree_mode === "Outline") {
    let activeScript = appParams.value.script;
    if (activeScript) {
      result = `[none] (flecs.script.Script, ${activeScript})`;
      if (!nameFilter.value) {
        result += `, !flecs.script.Script(up, ${activeScript})`;
      }
    } else {
      result = `!_`; // match nothing
    }
  } else if (appParams.value.tree_mode === "Scripts") {
    result = `[none] flecs.script.Script, !flecs.core.Component`;
  }

  return result;
});

function selectItem(item) {
  if (item) {
    let path = item.path;
    const idStart = path.indexOf("#");
    if (idStart != -1) {
      path = path.slice(idStart, path.length);
    }

    if (appParams.value.tree_mode === "Scripts") {
      emit("scriptOpen", path);
    } else {
      emit("entityOpen", path);
      appParams.value.entity.path = path;
    }
  } else {
    if (appParams.value.tree_mode === "Scripts") {
      appParams.value.script = undefined;
    } else {
      appParams.value.entity.path = undefined;
    }
  }
}

</script>

<style scoped>
#pane-tree {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: var(--border-radius-medium);
}

div.pane-tree-search-box {
  flex: 0 0 auto;
  padding: 8px;
  display: grid;
  grid-template-rows: 36px 36px;
  gap: var(--gap);
}

div.pane-tree-entity-tree {
  flex: 1 1 auto;
  overflow: auto;
  min-height: 0;
}

div.pane-tree-select {
  grid-row: 1;
}

div.pane-tree-select div.dropdown {
  width: 100%;
}

div.pane-tree-search {
  grid-row: 2;
}

</style>
