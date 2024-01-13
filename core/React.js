export function createElement(type, props, ...children) {
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

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export function render(el, container) {
  const dom =
    el.type === "TEXT_ELEMENT"
      ? document.createTextNode(el.props.nodeValue)
      : document.createElement(el.type);

  for (const key of Object.keys(el.props)) {
    if (key !== "children") {
      dom[key] = el.props[key];
    }
  }

  const { children } = el.props;

  for (const child of children) {
    render(child, dom);
  }

  container.appendChild(dom);
}
