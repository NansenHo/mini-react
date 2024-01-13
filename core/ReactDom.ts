import React from "./React";

const ReactDom = {
  createRoot(container) {
    return {
      render(app) {
        React.render(app, container);
      },
    };
  },
};

export default ReactDom;
