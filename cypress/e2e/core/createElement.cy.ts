import React from "../../../core/React";
const { createElement } = React;

describe("createElement", () => {
  it("should return a element vdom", () => {
    const vdom = createElement(
      "div",
      { id: "app", class: "container" },
      "hello"
    );

    const expectedVdom = {
      props: {
        id: "app",
        class: "container",
        children: [
          {
            props: {
              children: [],
              nodeValue: "hello",
            },
            type: "TEXT_ELEMENT",
          },
        ],
      },
      type: "div",
    };

    expect(vdom).to.deep.equal(expectedVdom);
  });

  it("no props", () => {
    const vdom = createElement("div", null, "hello");

    const expectedVdom = {
      props: {
        children: [
          {
            props: {
              children: [],
              nodeValue: "hello",
            },
            type: "TEXT_ELEMENT",
          },
        ],
      },
      type: "div",
    };

    expect(vdom).to.deep.equal(expectedVdom);
  });
});
