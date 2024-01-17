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

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
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
  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = createDom(fiber);
    fiber.dom = dom;

    updateProps(dom, fiber.props);
  }

  const children = fiber.props.children;

  initChildren(fiber, children);
}

function createDom(fiber) {
  return fiber.type === "TEXT_ELEMENT"
    ? document.createTextNode(fiber.props.nodeValue)
    : document.createElement(fiber.type);
}

function updateProps(dom, props) {
  for (const key of Object.keys(props)) {
    if (key !== "children") {
      const isOn = /^on[A-Z]/.test(key);
      if (isOn) {
        const event = key.slice(2).toLowerCase();
        dom.addEventListener(event, props[key]);
      } else {
        dom[key] = props[key];
      }
    }
  }
}

function initChildren(fiber, children) {
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
