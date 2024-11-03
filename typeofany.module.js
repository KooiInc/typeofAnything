const { IS, maybe, $Wrap, xProxy, isNothing } = TOAFactory();
export { IS as default, maybe, $Wrap, xProxy, isNothing };

function TOAFactory() {
  Symbol.proxy = Symbol.for(`toa.proxy`);
  Symbol.is = Symbol.for(`toa.is`);
  Symbol.type = Symbol.for(`toa.type`);
  Symbol.any = Symbol.for(`toa.any`);
  addSymbols2Object();
  const $Wrap = WrapAnyFactory();
  const xProxy = setProxyFactory();
  xProxy.custom();
  
  return { IS, maybe: maybeFactory(), $Wrap, isNothing, xProxy };
  
  function IS(anything, ...shouldBe) {
    if (shouldBe.length && shouldBe[0]?.isTypes) {
      return `defaultValue` in (shouldBe[0]) ? isOrDefault(anything, shouldBe[0]) : isExcept(anything, shouldBe[0]);
    }
    
    const input = typeof anything === `symbol` ? Symbol.any : anything;
    return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
  }
  
  function typeOf(anything) {
    return anything?.[Symbol.proxy] ?? IS(anything);
  }
  
  function determineType(input, ...shouldBe) {
    let { compareWith, noInput, noShouldbe, inputCTOR, isNaN, isInfinity } = processInput(input, ...shouldBe);
    switch(true) {
      case input?.[Symbol.proxy] && shouldBe.length < 1: return input[Symbol.proxy];
      case isNaN:  return shouldBe.length ? maybe({trial: _ => String(compareWith)}) === String(input) : `NaN`;
      case isInfinity:  return shouldBe.length ? maybe({trial: _ => String(compareWith)}) === String(input) : `Infinity`;
      case !!(noInput || noShouldbe): return noShouldbe ? String(input) === String(compareWith) : !compareWith ? String(input)  : false;
      case inputCTOR === Boolean: return !compareWith ? `Boolean` : inputCTOR === compareWith;
      default: return getResult(input, compareWith, getMe(input, inputCTOR));
    }
  }
  
  function getMe(input, inputCTOR) {
    return input === 0 ? Number : input === `` ? String : !input ? {name: String(input)} : inputCTOR;
  }
  
  function processInput(input, ...shouldBe) {
    const sbLen = shouldBe.length > 0;
    const compareWith = sbLen && shouldBe.shift();
    const noInput = isNothing(input);
    const noShouldbe = sbLen && isNothing(compareWith);
    const inputCTOR = !noInput && Object.getPrototypeOf(input)?.constructor;
    const isNaN = maybe({trial: _ => String(input)}) === `NaN`;
    const isInfinity = maybe({trial: _ => String(input)}) === `Infinity`;
    
    return {compareWith, noInput: noInput, noShouldbe: noShouldbe, inputCTOR, isNaN, isInfinity,};
  }
  
  function getResult(input, shouldBeCTOR, me) {
    if (input?.[Symbol.proxy] && shouldBeCTOR === Proxy) { return shouldBeCTOR === Proxy; }
    if (maybe({trial: _ => String(shouldBeCTOR)}) === `NaN`) { return String(input) === `NaN`; }
    
    return shouldBeCTOR
      ? maybe({ trial: _ => input instanceof shouldBeCTOR, }) ||
        shouldBeCTOR === me || shouldBeCTOR === Object.getPrototypeOf(me) ||
        `${shouldBeCTOR?.name}` === me?.name : me?.name;
  }
  
  function ISOneOf(obj, ...params) {
    for (const param of params) { if (IS(obj, param)) { return true; } }
    return false;
  }
  
  function isNothing(maybeNothing, all = false) {
    let value = maybeNothing === null || maybeNothing === undefined;
    value = all ? value || maybeNothing === Infinity || isNaN(maybeNothing) : value;
    return value || false;
  }
  
  function tryFn(maybeFn, maybeError) {
    return maybeFn?.constructor === Function ? maybeFn(maybeError) : undefined;
  }
  
  function maybeFactory() {
    return function({trial, whenError = () => undefined} = {}) {
      try { return tryFn(trial) } catch(err) { return tryFn(whenError, err) }
    };
  }
  
  function WrapAnyFactory() {
    return function(someObj) {
      return Object.freeze({
        get value() { return someObj; },
        get [Symbol.type]() { return typeOf(someObj); },
        get type() { return typeOf(someObj); },
        [Symbol.is](...args) { return IS(someObj, ...args); },
        is(...args) { return IS(someObj, ...args); }
      });
    }
  }
  
  function isOrDefault(input, { defaultValue, isTypes = [] } = {}) {
    return isTypes.length && IS(input, ...[isTypes].flat()) ? input : defaultValue;
  }
  
  function isExcept(input, { isTypes = [], notTypes = [] } = {} ) {
    return IS(input, ...[isTypes].flat()) && !IS(input, ...[notTypes].flat());
  }
  
  function addSymbols2Object() {
    if (!Object.getOwnPropertyDescriptors(Object.prototype)[Symbol.is]) {
      Object.defineProperties(Object.prototype, {
        [Symbol.type]: { get() { return typeOf(this); }, },
        [Symbol.is]: { value: function (...args) { return IS(this, ...args); }, },
      });
      Object.defineProperties(Object, {
        [Symbol.type]: { value(obj) { return typeOf(obj); }, },
        [Symbol.is]: { value: function (obj, ...args) { return IS(obj, ...args); }, },
      });
    }
  }
  
  function setProxyFactory() {
    const _Proxy = window.Proxy;
    
    return {
      native() { window.Proxy = _Proxy; },
      custom() {
        // adaptation of https://stackoverflow.com/a/53463589
        window.Proxy = new _Proxy(_Proxy, {
          construct(target, args) {
            const proxy = new target(...args);
            proxy[Symbol.proxy] = `Proxy (${determineType(args[0])})`;
            return proxy;
          }
        });
      }
    };
  }
}