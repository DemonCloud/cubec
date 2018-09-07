# Cubec

Cubec, micro mvc framework


# Module

### model

数据模型 存储一个JavaScript Object， 只支持标准的JSON类型，不适合在数据类型中放置 function之类的变量. model主要的作用:

1. 存储数据
2. 本地持久化（加密）
3. 和Server端通信
4. 提供事件模型
5. 数据校验
6. 抽象化逻辑


### atom

原子模型 是一个用于存储 model 的容器，可以一次性装载多个model，只要model设置了name值。就可以通过use的方式再任何地方轻松索引到model的位置并且将其装入容器中(前提是model先实例化(创建))， 容器可以同时对model进行批量操作， atom主要的作用:

1. 模型管理集合
2. 批量操作
3. 快速索引到模型。


### view

视图层 用于HTML结构的渲染，提供三种渲染模式，并且提供简单的DOM事件代理，方便对常规DOM事件的处理.

模式1: 计算渲染 (directRender:false 默认)

默认的渲染方式，编写c的模板会被自动解析成DOM树状，下次更新时计算差异， 并进行差异更新。
支持不少高级特性:

  1. 定义的c模板文件可以使用{{@include}} 语法进行模板嵌套
  2. 支持refs在视图中找到实体节点
  3. 快速调试定位


模式2: 直接渲染 (directRender:true)

在创建view实例的时候 在选项中设置好 directRender选项为true的话（默认false ) 就表示该视图是直接通过内置的模板引擎直接渲染，更可以通过设置cache来缓存模板渲染的结果，从而重复渲染的时候速度更快.

directRender实质就是模板直出渲染，也就是模板结果直接输出，比较大的问题在于:

  1. 不支持refs
  2. 直接暴露节点属性

模式3: 自定义渲染 (编写render函数)

可以自己编写render函数，render函数中上下文会自动指向该view实例本身， 这样可以完美配合React ， Vue 等视图框架，进行视图拆分


# 旧文档

> ax替换成cubec, 如ax.model()替换成cubec.model()可用

[Ax项目地址](https://github.com/DemonCloud/Ax)

[Ax项目文档](https://yj1028.me/Ax/v3/)
