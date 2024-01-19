import React from "./core/React";

function App() {
  console.log("App");

  const [bar, setBar] = React.useState("bar");
  const [count, setCount] = React.useState(10);
  function handleClickRoot() {
    setCount((c) => c);
    setBar("bar");
  }

  return (
    <div class="app">
      {count}
      <div>{bar}</div>
      <button onClick={handleClickRoot}>click me!</button>
    </div>
  );
}

export default App;
