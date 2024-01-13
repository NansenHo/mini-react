import { render } from "./React.js";

export const ReactDom = {
  createRoot(container) {
    return {
      render(app) {
        render(app, container);
      },
    };
  },
};
