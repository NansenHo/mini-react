import { render } from "./React";

export const ReactDom = {
  createRoot(container) {
    return {
      render(app) {
        render(app, container);
      },
    };
  },
};
