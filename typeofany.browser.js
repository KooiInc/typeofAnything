const extendObject = addSymbols2Object;
const proxySymbol = Symbol.for('proxied');

function IS(anything, ...shouldBe) {
  const input =  typeof anything === `symbol` ? Symbol('any') : anything;
  return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
}

function typeOf(anything) {
  if (anything?.[proxySymbol]) {
    return 'Proxy';
  }
  
  return IS(anything);
}

function determineType(input, ...shouldBe) {
  let { compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN } = getVariables(input, ...shouldBe);
  
  if (is_NAN) {
    return compareWith
      ? maybe({trial:  _ => String(compareWith), whenError: _ => `-`}) === String(input)
      : `NaN`
  }
  
  if (inputIsNothing || shouldBeIsNothing) {
    return shouldBeIsNothing
      ? String(input) === String(compareWith)
      : !compareWith
        ? String(input)
        : false;
  }
  
  if (inputCTOR === Boolean) {
    return !compareWith ? `Boolean` : !!(inputCTOR === compareWith);
  }
  
  return getResult(input, compareWith, getMe(input, inputCTOR));
}

function getMe(input, inputCTOR) {
  return input === 0
    ? Number : input === ``
      ? String : !input
        ? {name: String(input)} : inputCTOR;
}

function getVariables(input, ...shouldBe) {
  const sbLen = shouldBe.length > 0;
  const compareWith = sbLen && shouldBe.shift();
  const inputIsNothing = isNothing(input);
  const shouldBeIsNothing = sbLen && isNothing(compareWith);
  const inputCTOR = !inputIsNothing && Object.getPrototypeOf(input)?.constructor;
  const is_NAN = maybe({trial: _ => String(input), whenError: _ => `-`}) === `NaN`;
  
  return { compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN };
}

function getResult(input, shouldBe, me) {
  if (input[proxySymbol] && shouldBe === Proxy) {
    return shouldBe === Proxy;
  }
  
  if (maybe({trial:  _ => String(shouldBe), whenError: _ => `-`}) === `NaN`) {
    return String(input) === `NaN`;
  }
  
  return shouldBe
    ? maybe({
      trial: _ => !!(input instanceof shouldBe),
      whenError: _ => false } ) ||
    shouldBe === me ||
    shouldBe === Object.getPrototypeOf(me) ||
    `${shouldBe?.name}` === me?.name
    : me?.name;
}

function ISOneOf(obj, ...params) {
  for (const param of params) {
    if (IS(obj, param))  { return true; }
  }
  return false;
}

function isNothing(maybeNothing) {
  return maybe({
    trial: _ => /^(undefined|null)$/.test(String(maybeNothing)),
    whenError: _ => false });
}

function maybe({trial, whenError = err => console.log(err) } = {}) {
  if (!trial || !(trial instanceof Function)) {
    console.info(`TypeofAnything {maybe}: trial parameter not a Function or Lambda`);
    return false;
  }
  
  try { return trial(); } catch(err) { return whenError(err); }
}

function createWrappedProxy(fromObj, traps) {
  const originalGetterTrap = traps.get ?? function(target, key) { return target[key]; };
  traps.get = function(target, key) {
    return !(key in target)
      ? `Proxy`
      : originalGetterTrap(target, key);
  };
  fromObj[proxySymbol] = true;
  return new Proxy(fromObj, traps);
}

function $XFactory(isSymbol, typeSymbol) {
  return function(someObj) {
    return Object.freeze({
      get [typeSymbol]() { return typeOf(someObj); },
      get type() { return typeOf(someObj); },
      [isSymbol](...args) {  return IS(someObj, ...args); },
      is(...args) { return IS(someObj, ...args); }
    });
  }
}

function addSymbols2Object({is = `is`, type = `type`} = {}) {
  //                       ^ Note: can be different Symbol names
  const isSymbol = Symbol(`toa.${is}`);
  const typeSymbol = Symbol(`toa.${type}`);
  
  if (!Object.getOwnPropertyDescriptors(Object.prototype)[isSymbol]) {
    Object.defineProperties(Object.prototype, {
      [typeSymbol]: { get() { return typeOf(this); }, enumerable: true },
      [isSymbol]: { value: function(...args) { return IS(this, ...args); }, enumerable: true },
    });
  }
  
  return {
    // $X([someObject]).type/.is
    // or Object[is]/[type] can be used for null/undefined
    $X: $XFactory(isSymbol, typeSymbol),
    get is() { return isSymbol; },
    get type() { return typeSymbol; },
  };
}
