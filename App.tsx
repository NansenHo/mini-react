import React from "./core/React";

function Counter({ count }) {
  return <div class="counter">count: {count}</div>;
}

const App = (
  <div id="app">
    <p class="hi">hi, </p>
    <p class="mini">mini-react</p>
    <Counter count={10}></Counter>
    <Counter count={20}></Counter>
  </div>
);

export default App;
