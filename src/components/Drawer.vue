<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { useStore } from '../stores/store'

const store = useStore()
const { updateNode } = useVueFlow()
const form = ref<any>(null)
const editingTitle = ref<boolean>(false)
const editingDescription = ref<boolean>(false)
const vFocus = {
  mounted: (el: any) => el.focus()
}

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

const messageContent = computed({
    get() {
        return form.value.payload?.find((p: any) => p.type === 'text')?.text || ''
    },
    set(newValue) {
        if (!form.value.payload) {
            form.value.payload = []
        }
        let item = form.value.payload?.find((p: any) => p.type === 'text')
        if (!item) {
            item = { type: 'text', text: '' }
            form.value.payload.push(item)
        }
        item.text = newValue
    }
})

const attachments = computed(() => {
    return form.value.payload?.filter((p: any) => p.type === 'attachment') || [];
});

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        const file = target.files[0];
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!form.value.payload) {
                form.value.payload = [];
            }
            form.value.payload.push({
                type: 'attachment',
                attachment: e.target?.result as string
            });
        };
        reader.readAsDataURL(file);
    }
};

const removeAttachment = (index: number) => {
    const actualIndex = form.value.payload.findIndex((p: any) => p.attachment === attachments.value[index].attachment);
    if (actualIndex > -1) {
        form.value.payload.splice(actualIndex, 1);
    }
};
</script>

<template>
    <div
        class="fixed top-0 right-0 h-full w-[500px] bg-white shadow-xl z-50
            transition-transform duration-300 ease-in-out"
        :class="(store.drawerToggle && store.selectedNode) ? 'translate-x-0' : 'translate-x-full'"
    >
        <div class="p-4" v-if="store.selectedNode">
            <div class="mb-2">
                <h3 class="flex items-center justify-center gap-1 text-lg font-semibold">
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
                    
                    <template v-if="!editingTitle">
                        <span @click="editingTitle = true" class="cursor-pointer">
                            {{ form.title }}
                        </span>
                    </template>
                    <template v-else>
                        <input
                            v-model="form.title"
                            class="border rounded px-2 py-1 text-sm w-full"
                            @blur="editingTitle = false"
                            @keyup.enter="editingTitle = false"
                            v-focus
                        />
                    </template>
                </h3>
                <template v-if="!editingDescription">
                    <p @click="editingDescription = true" class="cursor-pointer text-gray-600">
                    {{ form.description }}
                    </p>
                </template>
                <template v-else>
                    <textarea
                    v-model="form.description"
                    class="border rounded px-2 py-1 text-sm w-full"
                    @blur="editingDescription = false"
                    v-focus
                    />
                </template>
            </div>
        
            <hr class="text-gray-300">
            
            <div class="mt-3">
                <template v-if="store.selectedNode.type === 'dateTime'">
                    <div class="mb-5">
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
                    <div class="text-left mb-5">
                        <label class="text-gray-500 text-xs">Time Zone</label>
                        <select class="w-full border rounded-md px-3 py-2 text-sm" v-model="form.timezone">
                            <option value="UTC">(GMT+00:00) UTC</option>
                            <option value="Asia/Singapore">(GMT+08:00) Singapore</option>
                            <option value="Asia/Kuala_Lumpur">(GMT+08:00) Kuala Lumpur</option>
                        </select>
                    </div>
                </template>
                <template v-else-if="store.selectedNode.type === 'sendMessage'">
                    <div class="mb-5">
                        <label class="text-gray-500 text-xs">Message</label>
                        <textarea
                            v-model="messageContent"
                            class="border rounded px-2 py-1 text-sm w-full h-30"
                            v-focus
                        />
                    </div>

                    <div class="mb-5">
                        <label class="text-gray-500 text-xs">Attachments</label>
                        <div class="grid grid-cols-3 gap-3">
                            <div 
                                v-for="(item, index) in attachments" 
                                :key="index"
                                class="relative group aspect-square border rounded-lg overflow-hidden bg-gray-100"
                            >
                                <img 
                                    :src="item.attachment" 
                                    class="w-full h-full object-cover"
                                />
                                <button 
                                    @click="removeAttachment(index)"
                                    class="absolute top-1 right-1 text-white rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <i class="fa fa-times-circle-o"></i>
                                </button>
                            </div>

                            <label class="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                <svg xmlns="http://w3.org" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span class="text-xs text-gray-500 mt-1">Upload</span>
                                <input type="file" class="hidden" @change="handleFileUpload" accept="image/*" />
                            </label>
                        </div>
                    </div>
                </template>
                <template v-else-if="store.selectedNode.type === 'addComment'">
                    <div class="mb-5">
                        <textarea
                            v-model="form.comment"
                            class="border rounded px-2 py-1 text-sm w-full h-30"
                            v-focus
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

