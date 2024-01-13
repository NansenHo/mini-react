# 渲染 `<div id="app">app</div>`

封装了 `createElement` 和 `createTextNode` 两个函数来创建 VDom。

`render` 函数将 VDom 渲染成真实节点，其封装了三个步骤：

1. 创建元素
2. 挂载属性
3. 渲染子节点

> `render` 用递归的方式来处理 `children`。
