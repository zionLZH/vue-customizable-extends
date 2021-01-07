# vue-customizable-extends
vue-customizable-extends针对需要extends组件后对组件进行定制化操作的场景，支持开发者以更简单的方式实现extends后操作组件(props/slots/scopedSlots)，支持await/async，并且不会丢失组件原有的属性，事件等。

## 1. 安装模块
Npm用户
````
npm install vue-customizable-extends -S
````

Yarn用户
````
yarn add vue-customizable-extends
````

## 2. 开始使用
首先你需要引入vue-customizable-extends与被继承组件（如el-select），并且编写基础代码。    
el-select文档请参考element-ui官方文档：https://element.eleme.cn/#/zh-CN/component/select

````javascript
import vcExtend from 'vue-customizable-extends'
import { Select } from 'element-ui'

export default {
    name: 'ajax-select',
    extends: vcExtend,
    data () {
      return {
        realComponent: Select
      }
    },
    methods: {
      // 返回Render函数所需的Props
      async _getRenderProps (props) {
        return props
      },
      // 返回Render函数所需的Slots
      async _getRenderSlots (slots) {
        retrun slots
      },
      // 返回Render函数所需的ScopedSlots
      async _getRenderScopedSlots (scopedSlots) {
        return scopedSlots
      }
    }
}
````

## 3.实战
假设我们现在需要继承el-select，并且通过role="EnumName"的方式自动请求获取枚举下拉数据并且渲染，我们可以通过以下代码实现。    
el-select文档请参考element-ui官方文档：https://element.eleme.cn/#/zh-CN/component/select

````javascript
import vcExtend from 'vue-customizable-extends'
import { Select, Option } from 'element-ui'

export default {
    name: 'ajax-select',
    extends: vcExtend,
    props: {
      role: { type: String },
    },
    data () {
      return {
        realComponent: Select,
        enumLoading:false,
        enumResult: false
      }
    },
    methods: {
      // 返回Render函数所需的Props
      async _getRenderProps (props) {
        return props
      },
      // 返回Render函数所需的Slots
      async _getRenderSlots (slots) {
        if (this.enumLoading) {
          return {}
        }
        this.enumLoading = true
        if (!this.enumResult) {
          let res = await ajax(this.props) // 此处需要自行实现ajax逻辑
          this.enumResult = res.Data
          this.enumLoading = false
        }
        let Options = this.enumResult.map(item => {
          return this.$createElement(Select, {
            props: {
              label: item.Name,
              value: item.Id,
            }   
          }, [])  
        })
        return {
          ...slots,
          default: [
            ...slots.default,
            ...Options
          ]
        }
      },
      // 返回Render函数所需的ScopedSlots
      async _getRenderScopedSlots (scopedSlots) {
        return scopedSlots
      }
    }
}
````

组件使用如下

````html
<ajax-select role="AccountType" v-model="modal.AccountType"></ajax-select>
...

export default {
  data () {
    modal: {
      AccountType: ''
    }
  }
}
````

## 4.使用说明
vue-customizable-extends只提供5个内置methods方法，均具备内部预置的实现，具体可以查看源码，在使用过程中根据自己实际需求进行定制化开发，但是请注意，_getExtend与_fetchRealComponentRender最好不要调整。5个内置的methods方法如下：

|  方法名                     | 描述                                                             |
|  ----                      | ----                                                            |
| _getExtend                 | 获取真实的继承组件(如: Select本身)                                  |
| _getRenderProps            | 实现渲染所需函数，接受props，返回props(支持async/await)              |
| _getRenderSlots            | 实现渲染所需函数，接受slots，返回slots(支持async/await)              |
| _getRenderScopedSlots      | 实现渲染所需函数，接受scopedSlots，返回scopedSlots(支持async/await)  |
| _fetchRealComponentRender  | 实现async/await的关键函数                                         |


## 5.注意点
vue-customizable-extends会在beforeMount之后尝试将被继承组件的的methods挂载至本身，如果有其他业务需求进行处理，请自行实现。如果在其他时候需要操作到真实组件，请使用$refs.yourRef._getExtend()获取真实组件再操作。


