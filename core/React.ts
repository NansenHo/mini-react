function createElement(type: string, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child;
      }),
    },
  };
}

function createTextNode(text: string) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(el, container: HTMLElement) {
  nextWorkUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };

  root = nextWorkUnit;
}

let nextWorkUnit: any = null;
let root: any = null;

function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkUnit) {
    nextWorkUnit = performWorkOfUnit(nextWorkUnit);

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkUnit && root) {
    commitRoot();
    root = null;
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(root.child);
}

function commitWork(fiber) {
  if (!fiber) return;
  fiber.parent.dom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function performWorkOfUnit(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber));

    updateProps(dom, fiber.props);
  }

  initChildren(fiber);

  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }

  return fiber.parent?.sibling;
}

function createDom(work) {
  return work.type === "TEXT_ELEMENT"
    ? document.createTextNode(work.props.nodeValue)
    : document.createElement(work.type);
}

function updateProps(dom, props) {
  for (const key of Object.keys(props)) {
    if (key !== "children") {
      dom[key] = props[key];
    }
  }
}

function initChildren(fiber) {
  const { children } = fiber.props;
  let prevChild: any = null;

  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      dom: null,
      child: null,
      parent: fiber,
      sibling: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    prevChild = newFiber;
  });
}

requestIdleCallback(workLoop);

const React = {
  render,
  createElement,
};

export default React;
