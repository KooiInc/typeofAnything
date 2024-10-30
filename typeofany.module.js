const {
  IS,
  maybe,
  $X,
  xProxy,
  isNothing,
} = TOAFactory();
export {
  IS as default,
  maybe,
  $X,
  xProxy,
  isNothing,
};

function TOAFactory() {
  Symbol.proxy = Symbol.for(`Symbol.proxy`);
  Symbol.is = Symbol.for(`toa.is`);
  Symbol.type = Symbol.for(`toa.type`);
  addSymbols2Object();
  const $X = $XFactory();
  const xProxy = setProxyFactory();
  xProxy.custom();
  
  return { IS, maybe, $X, isNothing, xProxy };
  
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
    }
  }
  
  function IS(anything, ...shouldBe) {
    if (shouldBe.length && shouldBe[0]?.isTypes) {
      if (`defaultValue` in (shouldBe[0] || {})) {
        return isOrDefault(anything, shouldBe[0]);
      }
      
      if (`notTypes` in (shouldBe[0] || {})) {
        return isExcept(anything, shouldBe[0]);
      }
    }
    
    const input = typeof anything === `symbol` ? Symbol('any') : anything;
    return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
  }
  
  function typeOf(anything) {
    return anything?.[Symbol.proxy] ?? IS(anything);
  }
  
  function determineType(input, ...shouldBe) {
    let {compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, isNaN, isInfinity} =
      getVariables(input, ...shouldBe);
    
    if (input?.[Symbol.proxy] && shouldBe.length < 1) {
      return input[Symbol.proxy];
    }
    
    if (isNaN) {
      return shouldBe.length
        ? maybe({trial: _ => String(compareWith), whenError: _ => `-`}) === String(input)
        : `NaN`
    }
    
    if (isInfinity) {
      return shouldBe.length
        ? maybe({trial: _ => String(compareWith), whenError: _ => `-`}) === String(input)
        : `Infinity`
    }
    
    if (inputIsNothing || shouldBeIsNothing) {
      return shouldBeIsNothing
        ? String(input) === String(compareWith)
        : !compareWith
          ? String(input)
          : false;
    }
    
    if (inputCTOR === Boolean) {
      return !compareWith ? `Boolean` : inputCTOR === compareWith;
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
    const isNaN = maybe({trial: _ => String(input), whenError: _ => `-`}) === `NaN`;
    const isInfinity = maybe({trial: _ => String(input), whenError: _ => `-`}) === `Infinity`;
    
    return {compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, isNaN, isInfinity,};
  }
  
  function getResult(input, shouldBeCTOR, me) {
    if (input?.[Symbol.proxy] && shouldBeCTOR === Proxy) {
      return shouldBeCTOR === Proxy;
    }
    
    if (maybe({trial: _ => String(shouldBeCTOR), whenError: _ => `-`}) === `NaN`) {
      return String(input) === `NaN`;
    }
    
    return shouldBeCTOR
      ? maybe({
        trial: _ => input instanceof shouldBeCTOR,
        whenError: _ => false
      }) ||
      shouldBeCTOR === me ||
      shouldBeCTOR === Object.getPrototypeOf(me) ||
      `${shouldBeCTOR?.name}` === me?.name
      : me?.name;
  }
  
  function ISOneOf(obj, ...params) {
    for (const param of params) {
      if (IS(obj, param)) {
        return true;
      }
    }
    return false;
  }
  
  function isNothing(maybeNothing, all = false) {
    let value = maybeNothing === null || maybeNothing === undefined;
    value = all ? value || maybeNothing === Infinity || isNaN(maybeNothing) : value;
    return value || false;
  }
  
  function maybe({trial, whenError = err => console.log(err)} = {}) {
    if (!trial || !(trial instanceof Function)) {
      console.info(`TypeofAnything {maybe}: trial parameter not a Function or Lambda`);
      return false;
    }
    
    try {
      return trial();
    } catch (err) {
      return whenError(err);
    }
  }
  
  function $XFactory() {
    return function(someObj) {
      return Object.freeze({
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
    // prototypal
    if (!Object.getOwnPropertyDescriptors(Object.prototype)[Symbol.is]) {
      Object.defineProperties(Object.prototype, {
        [Symbol.type]: {
          get() { return typeOf(this); },
          enumerable: true,
        },
        [Symbol.is]: {
          value: function (...args) { return IS(this, ...args); },
          enumerable: true,
        },
      });
      
      // static
      Object.defineProperties(Object, {
        [Symbol.type]: {
          value(obj) { return typeOf(obj); },
          enumerable: true,
        },
        [Symbol.is]: {
          value: function (obj, ...args) { return IS(obj, ...args); },
          enumerable: true,
        },
      });
    }
  }
}