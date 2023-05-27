export default IS;

function IS(obj, ...shouldBe) {
  const toStringTrial = something => {
    try { return `${something}`; }
    catch(e) { return /a Symbol value/.test(e.message) ? `Symbol` : something }
  }
  const nopes = [`NaN`, `null`, `undefined`];
  const isNothing = nothing => {
    for (let nada of nopes) {
      if (nada === toStringTrial(nothing)) { return true; }
    }
    return false;
  };
  const ISOneOf = (obj, ...params) => {
    for (let param of params) {
      if (IS(obj, param))  { return true; }
    }
    return false;
  };

  if (shouldBe.length > 1) { return ISOneOf(obj, ...shouldBe); }

  const isSymbolTrial = toStringTrial(obj);
  const shouldBeLen = shouldBe.length > 0;
  shouldBe = shouldBeLen && shouldBe.shift();
  
  const objIsNothing = isNothing(isSymbolTrial);
  const shouldBeIsNothing = isNothing(shouldBe);

  if (!objIsNothing && isSymbolTrial === `Symbol`) {
    return !shouldBeLen ? isSymbolTrial : shouldBe === Symbol;
  }

  if (objIsNothing) {
    return shouldBeIsNothing ?
      `${obj}` === `${shouldBe}` : shouldBe instanceof Object ?
        false : `${obj}`;
  }

  if (obj === false) { return shouldBe === Boolean ? true : `Boolean`; }

  const self = obj === 0 ? Number : obj === `` ?
    String : !obj ?
      {name: obj.toString()} : Object.getPrototypeOf(obj)?.constructor;
  return shouldBe ? !!(shouldBe === self?.__proto__ ||
    shouldBe === self ||
    shouldBe.toString === self?.name) : self?.name;
}
