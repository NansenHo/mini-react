import React from "./core/React";

let barCount = 0;
let fooCount = 0;
let rootCount = 0;

const Bar = () => {
  console.log("Bar");

  const update = React.update();
  function handleClickBar() {
    barCount++;
    update();
  }
  return (
    <div>
      bar
      {barCount}
      <button onClick={handleClickBar}>click me!</button>
    </div>
  );
};

const Foo = () => {
  console.log("Foo");

  const update = React.update();
  function handleClickFoo() {
    fooCount++;
    update();
  }
  return (
    <div>
      foo
      {fooCount}
      <button onClick={handleClickFoo}>click me!</button>
      <Bar />
    </div>
  );
};

function App() {
  console.log("App");

  const update = React.update();
  function handleClickRoot() {
    rootCount++;
    update();
  }

  return (
    <div class="app">
      hi, mini-react
      {rootCount}
      <button onClick={handleClickRoot}>click me!</button>
      <Foo />
    </div>
  );
}

export default App;
