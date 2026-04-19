import { defineStore } from 'pinia'
// import { useVueFlow } from '@vue-flow/core'
// import { nextTick } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()

export const useStore = defineStore('vue-flow-pinia', {
  state: () => ({
    nodes: [] as any[],
    edges: [] as any[],
    nodeTypeColors: {
      trigger: '#ea2264',
      dateTime: '#ff9142',
      dateTimeConnector : '#ff9142',
      sendMessage: '#02b194',
      addComment: '#3a98f7',
    },
    showModal: false,
    selectedNode: null as any,
    selectedEdge: null as any,
    form: {
      type: '',
      title: '',
      description: '',
    },
    drawerToggle: false,
  }),

  actions: {
    setFlow(data: any) {
      const newData = [...data]

      if(newData.length === 0) {
        newData.push({
          id: `node-${Date.now()}-${Math.random()}`,
          type: 'addNode',
          parentId: '-1',
          style: { borderColor: '#b1b1b7' }
        })
      }

      const childrenMap = new Map()
      // map parentId to children
      newData.forEach(node => {
        const parentId = node.parentId.toString()
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, [])
        }
        childrenMap.get(parentId).push(node.id.toString())
      })

      const nodesToAdd: any[] = []
      newData.forEach(node => {
        const children = childrenMap.get(node.id.toString())
        if ((!children || children.length === 0) && node.type !== 'addNode') {
          const newId = `node-${Date.now()}-${Math.random()}`
          nodesToAdd.push({
            id: newId,
            type: 'addNode',
            parentId: node.id,
            style: {
              borderColor:
                node.type in this.nodeTypeColors
                  ? this.nodeTypeColors[node.type as keyof typeof this.nodeTypeColors]
                  : '#b1b1b7'
            }
          })
          childrenMap.set(node.id.toString(), [newId])
        }
      })
      newData.push(...nodesToAdd)

      this.nodes = this.transformToNodes(newData, childrenMap)
      this.edges = this.transformToEdges(this.nodes, childrenMap)
      // console.log('nodes', this.nodes)
      // console.log('edges', this.edges)
    },
    transformToNodes(data: any[], childrenMap: any) {
      const positions = new Map()
      const xSpacing = 280
      const ySpacing = 180
      let leafX = 0

      // calculate positions
      function dfs(nodeId: string, depth: number) {
        let children = childrenMap.get(nodeId.toString()) || []

        // leaf node
        if (children.length === 0) {
          const pos = {
            x: leafX * xSpacing,
            y: depth * ySpacing
          }
          positions.set(nodeId, pos)
          leafX++
          return pos
        }

        // calculate children positions
        const childPositions = []
        for (const childId of children) {
          const pos = dfs(childId, depth + 1)
          if (pos) childPositions.push(pos)
        }

        let x = 0
        // calculate parent x position based on children
        if (childPositions.length > 0) {
          const minX = Math.min(...childPositions.map(p => p.x))
          const maxX = Math.max(...childPositions.map(p => p.x))
          x = (minX + maxX) / 2
        }

        // parent position
        const pos = {
          x,
          y: depth * ySpacing
        }

        positions.set(nodeId, pos)

        return pos
      }

      // start calculating positions from root nodes (parentId === -1)
      const roots = data.filter(n => n.parentId === -1)
      roots.forEach((root, index) => {
        dfs(root.id, 0)
      })

      return data.map(node => {
        const pos = positions.get(node.id) || { x: 0, y: 0 }

        let title = node.name ?? `Type: ${node.type}`
        let description = ''

        switch (node.type) {
          case 'trigger':
            title = 'Trigger'
            // description = node.data?.type ?? ''
            description = node.description ?? 'Conversation Opened'
            break

          case 'sendMessage':
            // description =
            //   node.data?.payload
            //     ?.find((p: any) => p.type === 'text')
            //     ?.text ?? ''
            description = node.description ?? 'Use it to display conversation message.'
            break

          case 'dateTime':
            title = node.name ?? 'Business Hours'
            // description = `${title} - ${node.data?.timezone ?? ''}`
            description = node.description ?? 'Use it to show business hours or date range conditions.'
            break

          case 'addComment':
            // description = node.data?.comment ?? ''
            description = node.description ?? 'Use it to add comment.'
            break
        }

        return {
          id: node.id.toString(),
          type: node.type,
          position: pos,
          data: {
            ...node.data,
            title,
            description
          },
        }
      })
    },
    transformToEdges(data: any, childrenMap: any) {
      return data.flatMap((item: any) => {
        if (!childrenMap.has(item.id.toString())) return []

        const children = childrenMap.get(item.id.toString()) || []
        return children.map((childId: string) => {
          const childType = data.find((p: any) => p.id === childId)?.type
          let color = item.type && item.type in this.nodeTypeColors
              ? this.nodeTypeColors[item.type as keyof typeof this.nodeTypeColors]
              : '#b1b1b7'
          if(childType === 'addNode') {
            color = '#b1b1b7'
          }
          return {
            id: `${item.id}-${childId}`,
            source: item.id.toString(),
            target: childId.toString(),
            type: childType !== 'dateTimeConnector' && childType !== 'addNode' ? 'button' : undefined,
            style: { stroke: color, borderColor: color }
          }
        })
      })
    },

    addNodeByEdge(edge: any) {
      this.selectedEdge = edge
      this.selectedNode = null
      this.showModal = true
      this.closeDrawer()
    },
    addNode(node: string) {
      this.selectedEdge = null
      this.selectedNode = node
      this.showModal = true
      this.closeDrawer()
    },
    closeModal() {
      this.showModal = false
      this.form = { type: '', title: '', description: '' }
    },
    createNode(flow: any) {
      const { addNodes, addEdges, findNode, removeEdges , edges, updateNode  } = flow

      if(!this.form.type || !this.form.title) {
        alert('Please fill in the required fields: type and title.')
        return
      }

      const node = this.selectedNode
      const edge = this.selectedEdge
      const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
      const data: any = { 
        title: this.form.title,
        description: this.form.description
      }
      if(this.form.type === 'dateTime') {
        data.times = daysOfWeek.map(day => ({
            day: day,
            startTime: '00:00',
            endTime: '00:00'
        }));
        data.timezone = 'UTC'
      }

      if(edge) {
          const newId = `node-${Date.now()}`

          // remove old edge
          removeEdges(edge.id)

          // add new node
          addNodes([
            {
              id: newId,
              position: { x: edge.centerX - 90, y: edge.centerY - 30 },
              data: data,
              type: this.form.type,
            },
          ])

          // add new edges
          addEdges([
            {
              id: `${edge.source}-${newId}`,
              source: edge.source,
              target: newId,
              type: this.form.type !== 'dateTimeConnector' ? 'button' : undefined,
              style: edge.style,
            },
            {
              id: `${newId}-${edge.target}`,
              source: newId,
              target: edge.target,
              type: edge.type,
              style: { stroke: this.nodeTypeColors[this.form.type as keyof typeof this.nodeTypeColors] || '#b1b1b7', borderColor: this.nodeTypeColors[this.form.type as keyof typeof this.nodeTypeColors] || '#b1b1b7' },
            },
          ])
      } else if(node) {
        const newId = `node-${Date.now()}`
        // add new node
        addNodes([
          {
            id: newId,
            type: this.form.type,
            position: node.position,
            data: data,
          },
        ])

        // reuse the addNode node by updating position
        updateNode(node.id, (node: any) => ({
          position: { x: node.position.x, y: node.position.y + 100 }
        }))

        // find connected edges
        const incoming = edges.value.find((e: any) => e.target === node.id)
        if (incoming) {
          // add edges
          const sourceNode = findNode(incoming.source)
          addEdges([
            {
              id: `${incoming.source}-${newId}`,
              source: incoming.source,
              target: newId,
              type: this.form.type !== 'dateTimeConnector' ? 'button' : undefined,
              style: { stroke: this.nodeTypeColors[sourceNode.type as keyof typeof this.nodeTypeColors] || '#b1b1b7', borderColor: this.nodeTypeColors[sourceNode.type as keyof typeof this.nodeTypeColors] || '#b1b1b7' },
            },
            {
              id: `${newId}-${node.id}`,
              source: newId,
              target: node.id,
              type: incoming.type,
              style: incoming.style,
            },
          ])

          // remove edges
          removeEdges([incoming.id])
        } else {
          addEdges([
            {
              id: `${newId}-${node.id}`,
              source: newId,
              target: node.id,
              type: undefined,
              style: { stroke: '#b1b1b7', borderColor: '#b1b1b7' },
            },
          ])
        }
      }

      this.closeModal()
    },
    
    drawDrawer(node: any) {
      if(this.drawerToggle) {
        if(this.selectedNode && this.selectedNode.id === node.id) {
          this.closeDrawer()
          return
        }
      }
      this.drawerToggle = true
      this.router.push({
        query: { nodeId: node.id },
      })
      this.selectedNode = node
    },
    closeDrawer() {
      this.drawerToggle = false
      this.router.push({
        query: {},
      })
    },
  },
})