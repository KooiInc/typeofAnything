export default IS;

function IS(obj, ...shouldBe) {
  const maybeSymbol = something => typeof something === `symbol` ? Symbol : something;

  return shouldBe.length > 1 ? ISOneOf(obj, ...shouldBe) : determineType();

  function determineType() {
    const objOrSymbol = maybeSymbol(obj);
    const shouldBeLen = shouldBe.length > 0;
    shouldBe = shouldBeLen && shouldBe.shift();
    const inputIsNothing = isNothing(objOrSymbol);
    const shouldBeIsNothing = shouldBeLen && isNothing(shouldBe);

    if (inputIsNothing || shouldBeIsNothing) {
      return shouldBeIsNothing
        ? `${objOrSymbol}` === `${shouldBe}`
        : !shouldBe
          ? `${objOrSymbol}` : false;
    }

    if (Object.getPrototypeOf(objOrSymbol)?.constructor === Boolean) {
      return !shouldBe
        ? `Boolean`
        : Object.getPrototypeOf(objOrSymbol).constructor === shouldBe;
    }

    return thisIs();

    function thisIs() {
      const self = obj === 0
        ? Number : obj === ``
          ? String : !objOrSymbol
            ? {name: `${objOrSymbol}`} : Object.getPrototypeOf(obj)?.constructor;

      return shouldBe
        ? shouldBe === self ||
          shouldBe === Object.getPrototypeOf(self) ||
          `${shouldBe}` === self?.name
        : self?.name;
    }
  }

  function isNothing(nothing) {
    try {
      return /^(undefined|NaN|null)$/.test(`${nothing}`);
    } catch(e) {
      return false;
    }
  }

  function ISOneOf(obj, ...params) {
    for (let param of params) {
      if (IS(obj, param))  { return true; }
    }
    return false;
  }
}
