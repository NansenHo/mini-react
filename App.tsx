import React from "./core/React";

function Counter({ count }) {
  return (
    <div class="counter">
      <p>count: {count}</p>
      <button onClick={handleClick}>click me!</button>
    </div>
  );
}

function CounterContainer() {
  return <Counter count={20} />;
}

function handleClick() {
  console.log("click");
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
