// composeFunction(f, g, h) =>
//   x => (f∘g∘h)(x)


export default (...funs) =>
  (...args) => {
    let val = args;
    funs.forEach((fun) => {
      val = [fun(...val)];
    });
    return val[0];
  };
