import React from "./core/React";

function Hello() {
  console.log("hello");
  const [hello, setHello] = React.useState("hello");

  function handleClick() {
    setHello("hello world");
  }

  return (
    <div>
      {hello}
      <button onClick={handleClick}>click me!</button>
    </div>
  );
}

function App() {
  console.log("App");

  const [bar, setBar] = React.useState("bar");
  const [count, setCount] = React.useState(10);
  function handleClickRoot() {
    setCount((c) => c + 1);
    setBar("bar");
  }

  return (
    <div class="app">
      {count}
      <div>{bar}</div>
      <Hello />
      <button onClick={handleClickRoot}>click me!</button>
    </div>
  );
}

export default App;
