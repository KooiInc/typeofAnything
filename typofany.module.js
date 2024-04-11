export {IS as default, maybe};

function IS(anything, ...shouldBe) {
  const input =  typeof anything === `symbol` ? Symbol('any') : anything;
  return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(input, ...shouldBe);
}

function determineType(input, ...shouldBe) {
  let { compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN } = getVariables(input, ...shouldBe);
  
  if (is_NAN && compareWith) {
    compareWith = maybe({trial:  _ => String(compareWith), whenError: _ => ``});
    return compareWith === String(input) || shouldBe === Number;
  }
  
  if (inputIsNothing || shouldBeIsNothing) {
    return shouldBeIsNothing
      ? String(input) === String(compareWith)
      : !compareWith
        ? `${input}`
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
  const is_NAN = maybe({trial: _ => String(input), whenError: _ => ``}) === `NaN`;
  
  return { compareWith, inputIsNothing, shouldBeIsNothing, inputCTOR, is_NAN };
}

function getResult(input, shouldBe, self) {
  if (maybe({trial:  _ => String(shouldBe), whenError: _ => `-`}) === `NaN`) {
    return String(input) === `NaN`;
  }
  
  return shouldBe
    ? maybe({
      trial: _ => !!(input instanceof shouldBe),
      whenError: _ => false } ) ||
    shouldBe === self ||
    shouldBe === Object.getPrototypeOf(self) ||
    `${shouldBe?.name}` === self?.name
    : self?.name;
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