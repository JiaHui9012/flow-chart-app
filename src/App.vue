<script setup>
import { ref, watch } from 'vue'
import { Position, VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import CustomNode from './components/CustomNode.vue'
import EdgeWithButton from './components/EdgeWithButton.vue'
import { useQuery } from '@tanstack/vue-query'
import axios from 'axios'
import payload from './data/payload.json'
import { useStore } from './stores/store'

const store = useStore()

const flow = useVueFlow()

const fetchFlow = async () => {
  // const { data } = await axios.get('https://respond-io-fe-bucket.s3.ap-southeast-1.amazonaws.com/candidate-assessments/payload.json')
  // return data
  return payload
}

const { data } = useQuery({
  queryKey: ['flow'],
  queryFn: fetchFlow,
})
// console.log('flow data', data)

watch(data, (val) => {
  if (val) {
    store.setFlow(val)
  }
}, { immediate: true })

// const nodes = ref([
//   {
//     id: 'n1',
//     type: 'output',
//     position: { x: 350, y: 10 },
//     targetPosition: Position.Left,
//     data : {
//       title: 'abc',
//       description: 'aabbcc',
//     },
//   },
//   {
//     id: 'add1',
//     type: 'add-node',
//     position: { x: 420, y: 100 },
//     targetPosition: Position.Left,
//     // data : {
//     //   title: 'abc',
//     //   description: 'aabbcc',
//     // },
//     style: { borderColor: 'orange' },
//   },
//   {
//     id: 'n2',
//     type: 'trigger',
//     position: { x: 350, y: 160 },
//     targetPosition: Position.Left,
//     data : {
//       title: 'tri',
//       description: 'qwerrr',
//     },
//   },
//   {
//     id: 'add2',
//     type: 'add-node',
//     position: { x: 420, y: 250 },
//     targetPosition: Position.Left,
//     style: { borderColor: 'orange' },
//   },
// ])

// const edges = ref([
//   {
//     id: 'n1-add1',
//     source: 'n1',
//     target: 'add1',
//     // type: 'button',
//     style: { stroke: 'orange' },
//   },
//   {
//     id: 'add1-n2',
//     source: 'add1',
//     target: 'n2',
//     // type: 'button',
//     style: { stroke: 'orange' },
//   },
//   {
//     id: 'n2-add2',
//     source: 'n2',
//     target: 'add2',
//     // type: 'button',
//     style: { stroke: 'orange' },
//   },
// ])

const nodeTypes = {
  // output: CustomNode,
  trigger: CustomNode,
  sendMessage: CustomNode,
  dateTime: CustomNode,
  dateTimeConnector: CustomNode,
  addComment: CustomNode,
  addNode: CustomNode,
}

flow.onInit((vueFlowInstance) => {
  // instance is the same as the return of `useVueFlow`
  vueFlowInstance.fitView()
})
</script>

<template>
  <VueFlow
    :nodes="store.nodes"
    :edges="store.edges"
    :node-types="nodeTypes"
    class="basic-flow"
    fit-view-on-init
  >
    <Background pattern-color="#aaa" :gap="16" />

    <!-- <template #node-output="props">
      <CustomNode :data="props.data" />
    </template> -->

    <template #edge-button="buttonEdgeProps">
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
    </template>
  </VueFlow>

  <div
    v-if="store.showModal"
    class="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
  >
    <div class="bg-white w-[320px] rounded-2xl shadow-xl p-5 space-y-4">
      
      <h3 class="text-lg font-semibold">Add Node</h3>

      <select
        v-model="store.form.type"
        class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option disabled value="">Select type</option>
        <option v-for=" key in Object.keys(nodeTypes).filter((i: any) => i !== 'addNode')" :value="key">{{ key }}</option>
      </select>

      <input
        v-model="store.form.title"
        placeholder="Title"
        class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <textarea
        v-model="store.form.description"
        placeholder="Description"
        class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div class="flex justify-end gap-2 pt-2">
        <button
          @click="store.closeModal()"
          class="px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          @click="store.createNode(flow)"
          class="px-3 py-1.5 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          Confirm
        </button>
      </div>

    </div>
  </div>
</template>

