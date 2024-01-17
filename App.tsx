import React from "./core/React";

let props: any = { id: "1111111111" };
let count = 10;
function Counter() {
  return (
    <div class="counter" {...props}>
      <p>count: {count}</p>
      <button onClick={handleClick}>click me!</button>
    </div>
  );
}

function handleClick() {
  console.log("click");
  props = {};
  count++;
  React.update();
}

function App() {
  return (
    <div id="app">
      <p class="title">hi, </p>
      <p>mini-react</p>
      <Counter />
    </div>
  );
}

export default App;
