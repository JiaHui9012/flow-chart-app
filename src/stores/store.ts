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
      this.nodes = this.transformToNodes(data)
      this.edges = this.transformToEdges(data)
      // console.log('nodes', this.nodes)
      // console.log('edges', this.edges)
    },
    // transformToNodes(data: any) {
    //   return data.map((item: any) => {
    //     let title = item.name ?? 'Type: ' + item.type
    //     let description = ''

    //     switch (item.type) {
    //       case 'trigger':
    //         title = 'Trigger'
    //         description = item.data?.type ?? ''
    //         break
    //       case 'sendMessage':
    //         description = item.data?.payload?.find((p: any) => p.type === 'text')?.text ?? ''
    //         break
    //       case 'dateTime':
    //         description = title + ' - ' + (item.data?.timezone ?? '')
    //         break
    //       case 'addComment':
    //         description = item.data?.comment ?? ''
    //         break
    //       default:
    //     }

    //     return {
    //       id: item.id.toString(),
    //       type: item.type,
    //       position: { x: 0, y: 0 },
    //       data: {
    //         ...item.data,
    //         title,
    //         description,
    //       }
    //     }
    //   })
    // },
    transformToNodes(data: any[]) {
      // map parentId to children
      const childrenMap = new Map()
      data.forEach(node => {
        const parentId = node.parentId
        if (!childrenMap.has(parentId)) {
          childrenMap.set(parentId, [])
        }
        childrenMap.get(parentId).push(node.id)
      })

      const positions = new Map()
      const xSpacing = 280
      const ySpacing = 180
      let leafX = 0

      // calculate positions
      function dfs(nodeId: string, depth: number) {
        let children = childrenMap.get(nodeId) || []

        // last node in the branch
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
      const root = data.find(n => n.parentId === -1)
      if (root) dfs(root.id, 0)

      return data.map(node => {
        const pos = positions.get(node.id) || { x: 0, y: 0 }

        let title = node.name ?? `Type: ${node.type}`
        let description = ''

        switch (node.type) {
          case 'trigger':
            title = 'Trigger'
            description = node.data?.type ?? ''
            break

          case 'sendMessage':
            description =
              node.data?.payload
                ?.find((p: any) => p.type === 'text')
                ?.text ?? ''
            break

          case 'dateTime':
            title = node.name ?? 'Business Hours'
            description = `${title} - ${node.data?.timezone ?? ''}`
            break

          case 'addComment':
            description = node.data?.comment ?? ''
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
          }
        }
      })
    },
    transformToEdges(data: any) {
      return data
        .filter((item: any) => item.parentId !== -1)
        .map((item: any) => {
          const parentType = data.find((p: any) => p.id === item.parentId)?.type
          const color = parentType && parentType in this.nodeTypeColors 
            ? this.nodeTypeColors[parentType as keyof typeof this.nodeTypeColors]
            : '#b1b1b7'
          return {
            id: `${item.parentId}-${item.id}`,
            source: item.parentId.toString(),
            target: item.id.toString(),
            type: item.type !== 'dateTimeConnector' ? 'button' : undefined,
            style: { stroke: color },
          }
        })
    },

    addNodeBetween(edge: any) {
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
      const { addNodes, addEdges, removeNodes, removeEdges , findEdge  } = flow

      if(!this.form.type || !this.form.title) {
        alert('Please fill in the required fields: type and title.')
        return
      }

      const node = this.selectedNode
      const edge = this.selectedEdge

      if(edge) {
          const newId = `node-${Date.now()}`

          // remove old edge
          removeEdges(edge.id)

          // add new node
          addNodes([
            {
              id: newId,
              position: { x: edge.centerX - 90, y: edge.centerY - 30 },
              data: { 
                title: this.form.title,
                description: this.form.description
              },
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
              style: { stroke: this.nodeTypeColors[this.form.type as keyof typeof this.nodeTypeColors] || '#b1b1b7' },
            },
          ])
      } else if(node) {
        // // find connected edges
        // const edges = findEdge ()
        // const incoming = edges.find((e: any) => e.target === node)
        // const outgoing = edges.find((e: any) => e.source === node)

        // if (!incoming || !outgoing) return

        // const newId = `node-${Date.now()}`

        // // 1. add new node (replace add-node position)
        // addNodes([
        //   {
        //     id: newId,
        //     type: this.form.type,
        //     position: incoming ? { ...incoming } : { x: 0, y: 0 }, // improve later
        //     data: {
        //       title: this.form.title,
        //       description: this.form.description,
        //     },
        //   },
        // ])

        // // 2. remove add-node placeholder
        // removeNodes([node])

        // // 3. remove old edges
        // const newEdges = edges.filter(
        //   e => e.source !== node && e.target !== node
        // )

        // // 4. connect properly
        // newEdges.push(
        //   {
        //     id: `${incoming.source}-${newId}`,
        //     source: incoming.source,
        //     target: newId,
        //   },
        //   {
        //     id: `${newId}-${outgoing.target}`,
        //     source: newId,
        //     target: outgoing.target,
        //   }
        // )

        // addEdges(newEdges)
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