# 实现 Fiber 架构

我们将 VDom 这棵树转换成链表的结构。

```
```

## 构建链表

并且，我们按 `child => sibling => uncle` 的节点顺序，

将 VDom 一部分一部分地，先转换成链表，再进行渲染。

如果空闲时间不够，就记录下来，下次在接着进行渲染。