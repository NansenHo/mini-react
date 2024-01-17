import React from "./core/React";

function Counter({ count }) {
  return <div class="counter">count: {count}</div>;
}

function CounterContainer() {
  return <Counter count={20} />;
}

function App() {
  return (
    <div id="app">
      <p class="hi">hi, </p>
      <p class="mini">mini-react</p>
      <Counter count={10} />
      <CounterContainer />
    </div>
  );
}

export default App;
