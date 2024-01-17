# 实现 Fiber 架构

## 之前 `render` 函数存在的问题

最初的 `render` 函数是通过递归实现的。

当处理一个非常大且深的虚拟 DOM 树时，单线程的 JavaScript 会不断递归地执行 `render` 操作，这最终可能导致浏览器后续渲染过程的阻塞。

## `requestIdleCallback` & `idleDeadline.timeRemaining()`

利用浏览器提供的下列接口，

- [requestIdleCallback - MDN Document](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)

  `requestIdleCallback` 函数可以插入一个函数，使其在浏览器空闲时间被调用。

  `requestIdleCallback` 能在主事件循环上执行**后台**和**低优先级工作**，而**不会影响延迟关键事件**，如动画和输入响应。

  函数一般会按**先进先调用**的顺序执行。

  然而，如果回调函数指定了执行超时时间 `timeout`，则有可能为了在超时前执行函数而打乱执行顺序。

- [IdleDeadline - MDN Document](https://developer.mozilla.org/zh-CN/docs/Web/API/IdleDeadline)

  `IdleDeadline` 接口是在调用 `Window.requestIdleCallback()` 时创建的闲置回调的输入参数的数据类型。

  它提供了两个方法：

  - `timeRemaining()` 方法，用来判断用户代理预计还剩余多少闲置时间；
  - `didTimeout` (en-US) 属性，用来判断当前的回调函数是否因超时而被执行。

知道浏览器的空闲时间有多久后，就能利用空闲时间执行特定任务。

```ts
function workLoop(idleDeadline) {
  let shouldYield = false;
  while (!shouldYield) {
    // do something

    shouldYield = idleDeadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}
```

### `requestIdleCallback` 和宏任务与微任务的关系

`requestIdleCallback` 计划的任务不属于宏任务或微任务的范畴，其在事件循环的空闲期执行。

这通常发生在**当前帧**的宏任务和微任务执行完毕后，且在浏览器认为有足够空闲时间可以用于处理低优先级工作时。

相比于宏任务和微任务，`requestIdleCallback` 计划的任务的优先级更低。

它们是在浏览器空闲时才执行，因此**不会阻塞或延迟关键的用户界面更新和响应**。

> 在实践中，`requestIdleCallback` 通常用于执行后台或低优先级的任务，如**日志记录**、**数据分析**、**更新非关键的用户界面元素**等。

### 在每个宏任务中都执行特定任务

下列代码中，`workLoop` 函数只会在第一个宏任务（T1）结束后被执行。

```ts
requestIdleCallback(workLoop);
```

需要在 `workLoop` 中继续调用 `requestIdleCallback(workLoop)` ，

才能保证在每个宏任务结束后，浏览器都会去执行特定任务。

```ts
function workLoop() {
  ...

  requestIdleCallback(workLoop)
}
```

## 构建链表

并且，我们按 `child => sibling => uncle` 的节点顺序，

将 VDom 一部分一部分地，先转换成链表，再进行渲染。

如果空闲时间不够，就记录下来，下次在接着进行渲染。
