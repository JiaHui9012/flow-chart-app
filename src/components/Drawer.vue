<script setup lang="ts">
import { ref, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useStore } from '../stores/store'

const store = useStore()
const { updateNode } = useVueFlow()
const form = ref<any>(null)

watch(
  () => store.selectedNode,
  (node) => {
    if (!node) {
      form.value = null
      return
    }
    form.value = JSON.parse(JSON.stringify(node.data))
  },
  { immediate: true }
)

watch(
  form,
  (newVal) => {
    if (!store.selectedNode || !newVal) return

    updateNode(store.selectedNode.id, (node) => ({
      ...node,
      data: newVal,
    }))
  },
  { deep: true }
)
</script>

<template>
    <div
        class="fixed top-0 right-0 h-full w-[500px] bg-white shadow-xl z-50
            transition-transform duration-300 ease-in-out"
        :class="(store.drawerToggle && store.selectedNode) ? 'translate-x-0' : 'translate-x-full'"
    >
        <div class="p-4" v-if="store.selectedNode">
            <div class="mb-2">
                <h3 class="text-lg font-semibold">
                    <template v-if="store.selectedNode.type === 'trigger'">
                    <i class="fa fa-bolt"></i>
                    </template>
                    <template v-else-if="store.selectedNode.type === 'sendMessage'">
                    <i class="fa fa-paper-plane-o"></i>
                    </template>
                    <template v-else-if="store.selectedNode.type === 'dateTime'">
                    <i class="fa fa-calendar"></i>
                    </template>
                    <template v-else-if="store.selectedNode.type === 'addComment'">
                    <i class="fa fa-commenting-o"></i>
                    </template>
                    {{ store.selectedNode.data.title }}
                </h3>
                <p>{{ store.selectedNode.data.description }}</p>
            </div>
        
            <hr class="text-gray-300">
            
            <div class="mt-3">
                <template v-if="store.selectedNode.type === 'dateTime'">
                    <div class="mb-5" v-if="store.selectedNode.data.times">
                        <div class="grid grid-cols-3 text-gray-500 text-xs font-medium mb-1">
                            <div class="flex items-center justify-center gap-1"><i class="fa fa-calendar-o"></i>Day</div>
                            <div class="flex items-center gap-1 text-left col-span-2"><i class="fa fa-clock-o"></i>Time</div>
                        </div>
                        <div class="space-y-3">
                            <div
                                v-for="(val, key) in form.times"
                                :key="key"
                                class="grid grid-cols-3 items-center"
                            >
                                <div class="text-gray-700 font-bold">
                                {{ val.day.toUpperCase() }}
                                </div>

                                <div class="flex items-center gap-2 col-span-2">
                                    <input
                                        type="time"
                                        class="border rounded-md px-2 py-1 text-xs w-[80px]"
                                        v-model="val.startTime"
                                    />
                                    <span>to</span>
                                    <input
                                        type="time"
                                        class="border rounded-md px-2 py-1 text-xs w-[80px]"
                                        v-model="val.endTime"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-left mb-5" v-if="store.selectedNode.data.timezone">
                        <label class="text-gray-500 text-xs">Time Zone</label>
                        <select class="w-full border rounded-md px-3 py-2 text-sm" v-model="form.timezone">
                            <option value="UTC">(GMT+00:00) UTC</option>
                            <option value="Asia/Singapore">(GMT+08:00) Singapore</option>
                            <option value="Asia/Kuala_Lumpur">(GMT+08:00) Kuala Lumpur</option>
                        </select>
                    </div>
                </template>
                <!-- <p class="text-sm text-gray-500">Editing:</p>
                <p class="font-medium">{{ store.selectedNode.data.title }}</p> -->
            </div>
        </div>
    </div>
</template>

