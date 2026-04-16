<script setup>
import { ref, toRef } from 'vue'
import { Position, VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import CustomNode from './components/CustomNode.vue'
import EdgeWithButton from './components/EdgeWithButton.vue'

const { onInit, onNodeDragStop, onConnect, addEdges, setViewport, toObject } = useVueFlow()

const nodes = ref([
  {
    id: 'n1',
    type: 'output',
    position: { x: 350, y: 10 },
    targetPosition: Position.Left,
    data : {
      title: 'abc',
      description: 'aabbcc',
    },
  },
  {
    id: 'add1',
    type: 'add-node',
    position: { x: 420, y: 100 },
    targetPosition: Position.Left,
    // data : {
    //   title: 'abc',
    //   description: 'aabbcc',
    // },
    style: { borderColor: 'orange' },
  },
  {
    id: 'n2',
    type: 'trigger',
    position: { x: 350, y: 160 },
    targetPosition: Position.Left,
    data : {
      title: 'tri',
      description: 'qwerrr',
    },
  },
  {
    id: 'add2',
    type: 'add-node',
    position: { x: 420, y: 250 },
    targetPosition: Position.Left,
    style: { borderColor: 'orange' },
  },
])

const edges = ref([
  {
    id: 'n1-add1',
    source: 'n1',
    target: 'add1',
    // type: 'button',
    style: { stroke: 'orange' },
  },
  {
    id: 'add1-n2',
    source: 'add1',
    target: 'n2',
    // type: 'button',
    style: { stroke: 'orange' },
  },
  {
    id: 'n2-add2',
    source: 'n2',
    target: 'add2',
    // type: 'button',
    style: { stroke: 'orange' },
  },
])

const nodeTypes = {
  output: CustomNode,
  trigger: CustomNode,
  'add-node': CustomNode,
}

// onInit((vueFlowInstance) => {
//   // instance is the same as the return of `useVueFlow`
//   vueFlowInstance.fitView()
// })
</script>

<template>
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    :node-types="nodeTypes"
    class="basic-flow"
    fit-view-on-init
  >
    <Background pattern-color="#aaa" :gap="16" />

    <!-- <template #node-output="props">
      <CustomNode :data="props.data" />
    </template> -->

    <!-- <template #edge-button="buttonEdgeProps">
      <EdgeWithButton
        :id="buttonEdgeProps.id"
        :source-x="buttonEdgeProps.sourceX"
        :source-y="buttonEdgeProps.sourceY"
        :target-x="buttonEdgeProps.targetX"
        :target-y="buttonEdgeProps.targetY"
        :source-position="buttonEdgeProps.sourcePosition"
        :target-position="buttonEdgeProps.targetPosition"
        :marker-end="buttonEdgeProps.markerEnd"
        :style="buttonEdgeProps.style"
      />
    </template> -->
  </VueFlow>
</template>

