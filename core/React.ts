function createElement(type: string, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";

        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

function createTextNode(text: string | number) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(el, container: HTMLElement) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };

  nextWorkUnit = wipRoot;
}

let nextWorkUnit: any = null;
// work in progress
let wipRoot: any = null;
let currentRoot: any = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkUnit) {
    nextWorkUnit = performWorkOfUnit(nextWorkUnit);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkUnit && wipRoot) {
    commitRoot();
    currentRoot = wipRoot;
    wipRoot = null;
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(wipRoot.child);
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === "placement") {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  } else if (fiber.effectTag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  const fnComponentContent = fiber.type(fiber.props);

  const children = [fnComponentContent];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = createDom(fiber);
    fiber.dom = dom;

    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;

  reconcileChildren(fiber, children);
}

function createDom(fiber) {
  return fiber.type === "TEXT_ELEMENT"
    ? document.createTextNode(fiber.props.nodeValue)
    : document.createElement(fiber.type);
}

function updateProps(dom, nextProps, prevProps) {
  for (const key in prevProps) {
    if (!nextProps[key]) {
      dom.removeAttribute(key);
    }
  }

  for (const key in nextProps) {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        const isOn = /^on[A-Z]/.test(key);
        if (isOn) {
          const eventType = key.slice(2).toLowerCase();
          // dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  }
}

function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild: any = null;

  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;

    let newFiber;
    if (isSameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        dom: oldFiber.dom,
        child: null,
        parent: fiber,
        sibling: null,
        effectTag: "update",
        alternate: oldFiber,
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        child: null,
        parent: fiber,
        sibling: null,
        effectTag: "placement",
      };
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    prevChild = newFiber;
  });
}

requestIdleCallback(workLoop);

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };

  nextWorkUnit = wipRoot;
}

const React = {
  update,
  render,
  createElement,
};

export default React;
