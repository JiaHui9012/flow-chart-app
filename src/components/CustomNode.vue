<script setup>
import { Handle, Position, EdgeLabelRenderer } from '@vue-flow/core'
  defineProps({
  data: Object,
  type: String,
  style: Object,
})
</script>

<template>
  <template v-if="type === 'addNode'">
    <!--  class="nodrag nopan" -->
      <div>
      <!--  @click="addNode()" -->
        <button :style="style" class="edgebutton">+</button>
      </div>
  </template>
  <template v-else>
    <div class="node">
      <div class="title">
        <template v-if="type === 'trigger'">
          <i class="fa fa-bolt"></i>
        </template>
        <template v-else-if="type === 'sendMessage'">
          <i class="fa fa-paper-plane-o"></i>
        </template>
        <template v-else-if="type === 'dateTime'">
          <i class="fa fa-calendar"></i>
        </template>
        <template v-else-if="type === 'addComment'">
          <i class="fa fa-commenting-o"></i>
        </template>
        {{ data.title }}
      </div>
      <div class="desc" v-if="data.description" v-html="data.description">
      </div>
    </div>
  </template>
</template>

<style scoped>
/* .node {
  background: white;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 6px;
}

.desc {
  font-size: 12px;
  color: #666;
  white-space: pre-wrap;
} */

.edgebutton {
  border-width: 1px;
  border-style: solid;
  border-radius: 10px;
  background: white;
}
</style>
