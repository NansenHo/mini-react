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
let wipFiber: any = null;
let deletion: any[] = [];

function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextWorkUnit) {
    nextWorkUnit = performWorkOfUnit(nextWorkUnit);

    if (wipRoot?.sibling?.type === nextWorkUnit?.type) {
      nextWorkUnit = undefined;
    }

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkUnit && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletion.forEach(commitDeletion);
  commitWork(wipRoot.child);
  commitEffectHook();
  wipRoot = null;
  deletion = [];
}

function commitEffectHook() {
  function run(fiber) {
    if (!fiber) return;

    const oldEffectHooks = fiber.alternate?.effectHooks;
    const effectHooks = fiber?.effectHooks;

    if (!fiber.alternate) {
      effectHooks?.forEach((hook) => {
        hook.cleanup = hook.callback();
      });
    } else {
      effectHooks?.forEach((hook, index) => {
        const oldDeps = oldEffectHooks[index]?.deps;
        const deps = hook?.deps;

        if (deps.length > 0) {
          deps?.forEach((dep, i) => {
            if (dep !== oldDeps[i]) {
              hook.cleanup = hook.callback();
            }
          });
        }
      });
    }

    run(fiber.child);
    run(fiber.sibling);
  }

  function runCleanup(fiber) {
    if (!fiber) return;

    fiber.alternate?.effectHooks?.forEach((hook) => {
      if (hook.deps.length > 0) {
        hook.cleanup && hook.cleanup();
      }
    });

    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }

  runCleanup(wipRoot);
  run(wipRoot);
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = findFiberParent(fiber);
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = findFiberParent(fiber);

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

function findFiberParent(fiber) {
  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  return fiberParent;
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
  wipFiber = fiber;
  stateHooks = [];
  stateHookIndex = 0;
  effectHooks = [];

  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber));

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
    const hasKeyWithinNextProps = !!nextProps[key] || nextProps[key] === 0;
    if (!hasKeyWithinNextProps) {
      dom.removeAttribute(key);
    }
  }

  for (const key in nextProps) {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        const isOn = /^on[A-Z]/.test(key);
        if (isOn) {
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
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
      if (child) {
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
        deletion.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    if (newFiber) {
      prevChild = newFiber;
    }
  });

  while (oldFiber) {
    deletion.push(oldFiber);

    oldFiber = oldFiber.sibling;
  }
}

requestIdleCallback(workLoop);

function update() {
  const currentFiber = wipFiber;
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextWorkUnit = wipRoot;
  };
}

interface StateHookType {
  state: any;
  queue: any[];
}

let stateHooks: StateHookType[];
let stateHookIndex: number;
function useState(initial) {
  let currentFiber = wipFiber;
  const oldStateHook = wipFiber.alternate?.stateHooks[stateHookIndex];
  const stateHook: StateHookType = {
    state: oldStateHook ? oldStateHook.state : initial,
    queue: oldStateHook ? oldStateHook.queue : [],
  };

  for (const action of stateHook.queue) {
    stateHook.state = action(stateHook.state);
  }
  stateHook.queue = [];

  stateHooks.push(stateHook);
  stateHookIndex++;

  wipFiber.stateHooks = stateHooks;

  function setState(action) {
    const isFunction = typeof action === "function";
    const eagerState = isFunction ? action() : action;

    if (eagerState === stateHook.state) return;

    stateHook.queue.push(isFunction ? action : () => action);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextWorkUnit = wipRoot;
  }

  return [stateHook.state, setState];
}

let effectHooks;
function useEffect(callback, deps?) {
  const effectHook = {
    callback,
    deps,
    cleanup: null,
  };
  effectHooks.push(effectHook);

  wipFiber.effectHooks = effectHooks;
}

const React = {
  useEffect,
  useState,
  update,
  render,
  createElement,
};

export default React;
