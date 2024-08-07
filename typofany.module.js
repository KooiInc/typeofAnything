const {
  IS,
  maybe,
  typeOf,
  createWrappedProxy,
  extendObject,
  isNothing,
} = TOAFactory();

export {
  IS as default,
  maybe,
  typeOf,
  createWrappedProxy,
  extendObject,
  isNothing,
};

function TOAFactory() {
  const proxySymbol = Symbol.for('proxied');
  
  return { IS, maybe, typeOf, createWrappedProxy, extendObject: addSymbols2Object, isNothing };
  
  function IS(anything, ...shouldBe) {
    const input = typeof anything === `symbol` ? Symbol('any') : anything;
    return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
  }
  
  function typeOf(anything) {
    if (anything?.[proxySymbol]) {
      return 'Proxy';
    }
    
    return IS(anything);
  }
  
  function determineType(input, ...shouldBe) {
    let {compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, isNaN, isInfinity} =
      getVariables(input, ...shouldBe);
    
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
    if (input[proxySymbol] && shouldBeCTOR === Proxy) {
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
  
  function createWrappedProxy(fromObj, traps) {
    const originalGetterTrap = traps.get ?? function (target, key) {
      return target[key];
    };
    traps.get = function (target, key) {
      return !(key in target)
        ? `Proxy`
        : originalGetterTrap(target, key);
    };
    fromObj[proxySymbol] = true;
    return new Proxy(fromObj, traps);
  }
  
  function $XFactory(isSymbol, typeSymbol) {
    return function (someObj) {
      return Object.freeze({
        get [typeSymbol]() { return typeOf(someObj); },
        get type() { return typeOf(someObj); },
        [isSymbol](...args) { return IS(someObj, ...args); },
        is(...args) { return IS(someObj, ...args); }
      });
    }
  }
  
  function addSymbols2Object({is = `is`, type = `type`} = {}) {
    const isSymbol = Symbol(`toa.${is}`);
    const typeSymbol = Symbol(`toa.${type}`);
    
    // prototypal
    if (!Object.getOwnPropertyDescriptors(Object.prototype)[isSymbol]) {
      Object.defineProperties(Object.prototype, {
        [typeSymbol]: {
          get() { return typeOf(this); },
          enumerable: true,
        },
        [isSymbol]: {
          value: function (...args) { return IS(this, ...args); },
          enumerable: true,
        },
      });
      
      // static
      Object.defineProperties(Object, {
        [typeSymbol]: {
          value(obj) { return typeOf(obj); },
          enumerable: true,
        },
        [isSymbol]: {
          value: function (obj, ...args) { return IS(obj, ...args); },
          enumerable: true,
        },
      });
    }
    
    return {
      $X: $XFactory(isSymbol, typeSymbol),
      get is() {  return isSymbol; },
      get type() { return typeSymbol; },
    };
  }
}