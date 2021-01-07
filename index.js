export default {
  data () {
    return {
      realComponent: false,
      realRenderResult: false
    }
  },
  render (h) {
    if (!this.realComponent) {
      return h('')
    }

    if (this.realRenderResult) {
      return this.realRenderResult
    }

    this._fetchRealComponentRender(h)
    return h('')
  },
  async beforeMount () {
    this.$nextTick(() => {
      try {
        let exCom = this._getExtend()
        for (let key in this.realComponent.methods) {
          if (!this[key]) {
            this[key] = exCom[key]
          }
        }
      } catch (e) {
        // nothing
      }
    })
  },
  methods: {
    _getExtend () {
      return this.$children[0]
    },
    _getRenderProps (props) {
      return props
    },
    _getRenderSlots (slots) {
      return slots
    },
    _getRenderScopedSlots (scopedSlots) {
      return scopedSlots
    },
    async _fetchRealComponentRender (h) {
      let props = await this._getRenderProps({
        ...this.$options._propKeys,
        ...this.$attrs
      })

      let $slots = {...this.$slots}
      let slots = await this._getRenderSlots($slots)
      let childrens = []
      for (let key in slots) {
        childrens.push(h('template', { slot: key }, slots[key]))
      }

      let $scopedSlots = {...this.$scopedSlots}
      // fixed something
      for (let key in $scopedSlots) {
        if ($slots[key]) {
          delete $scopedSlots[key]
        }
      }
      let scopedSlots = await this._getRenderScopedSlots($scopedSlots)

      this.realRenderResult = h(this.realComponent, {
        props: props,
        on: {
          ...this.$listeners
        },
        scopedSlots: scopedSlots,
      }, childrens)
    }
  }
}
