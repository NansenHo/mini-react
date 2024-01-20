import React from "./core/React";

function Hello() {
  console.log("hello");
  const [hello, setHello] = React.useState("hello");

  function handleClick() {
    setHello("hello world");
  }

  React.useEffect(() => {
    console.log("This should be called once - Hello");

    return () => {
      console.log("clean up - Hello");
    };
  }, [hello]);

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

  React.useEffect(() => {
    console.log("This useEffect should be called once.");

    return () => {
      console.log("clean up - should not be called");
    };
  }, []);

  React.useEffect(() => {
    console.log("This useEffect should be called when count changed.");

    return () => {
      console.log("clean up - should be called");
    };
  }, [count]);

  return (
    <div class="app">
      {count}
      <div>{bar}</div>
      <Hello />
      <button onClick={handleClickRoot}>click me app!</button>
    </div>
  );
}

export default App;
