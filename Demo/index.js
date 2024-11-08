import { default as IS, maybe, $Wrap, isNothing, xProxy }
  from "../typeofany.module.js";

const {log} = logFactory();

// assign symbols from library
const is = Symbol.is;
const type = Symbol.type;

// -----------------------------------
const printHTML = html => html.replace(/</g, `&lt;`);
window.IS = IS;
let [nTests, failed, succeeded] = [0, 0, 0];
const resultBox = createResultBox();
printExamples();

document.querySelectorAll(`code.block`)
  .forEach(block => {
    block.classList.remove(`block`);
    block.classList.add(`language-javascript`, `line-numbers`);
    const div = block.closest(`div`);
    div.append(Object.assign(document.createElement(`pre`), {classList: "line-numbers language-javascript"}))
    div.querySelector(`pre`).append(block);
  });

Prism.highlightAll();

function getHeader() {
  const backLink = /github\.io|localhost/i.test(location.href)
    ? `<a target="_top" href="https://github.com/KooiInc/typeofAnything">Back to repository</a>`
    : `<a target="_top" href="https://stackblitz.com/@KooiInc">All projects</a>`;
  return `!!<p>${backLink}
    | <a target="_blank" href="https://www.npmjs.com/package/typeofanything">@NPM</a></p>
    <div class="normal"><h3>TypeofAnything: determine/check the type of nearly any (ECMAScript) thing</h3>
      (including null/undefined/NaN/true/false etc.).
      <br><b>Note</b> Every example is a <i>test</i> for the given code. The 'received' value is the
      result of the executed code.
      <br><button id="showResults">Show test results</button>
    </div>
    <div class="normal noborder"><h3>Code used for examples</h3></div>
    <code class="block">
    // import & initialize
    import { 
      default as IS, // the main type checking function
      maybe,         // a try/catch wrapper utility function
      $Wrap,         // wrapper for any variable
      isNothing,     // special function for empty stuff (null, NaN etc)
      xProxy,        /* Object for Proxy implementation. Syntax:
                        xProxy.custom() => default, type check for Proxy enabled
                        xProxy.native() => native ES20xx implementation */
    } from "./typeofAnything.js";
    
    // assign symbols from library
    const is = Symbol.is;
    const type = Symbol.type;

    // definitions used in the following examples
    const [tru, flse, zero, not_a_nr, nil, undef, div, div2, nonDiv, proxyEx] =
      [true, false, 0, +("NaN"), null, undefined, 
       Object.assign(document.createElement("div"), {textContent: "I am div"}),
       Object.assign(document.createElement("div"), {textContent: "I am div 2"}),
       document.createElement("unknown"),
       someProxy()];
    
    // a constructor
    function SomeCTOR(something) {
      this.something = something;
    }
    // a proxy
    function someProxy() {
      return new Proxy(new String("hello"), { 
        get(obj, key) { return key === 'world' ? (obj += " world") && obj : obj[key] }
      });
    }</code>`.replace(/\n {4}/g, `\n`);
}

function test(testFn, expected) {
  nTests += 1;
  const fnStr = testFn.toString().trim();
  
  let result = maybe({trial: testFn, whenError: err => testError(err, fnStr)});
  if (result === `FAIL`) { failed += 1; return; }
  
  expected = IS(expected, HTMLElement)
    ? printHTML(expected.outerHTML) : IS(expected, Object)
      ? maybe({trial: _ => JSON.stringify(expected)}) : IS(expected, String)
        ? `"${expected}"` : expected;
  
  result = IS(result, HTMLElement)
    ? printHTML(result.outerHTML) : IS(result, Object)
      ? maybe({trial: _ => JSON.stringify(result)}) : IS(result, String)
        ? `"${result}"` : result;
  const resultStr = `(expected <i>${expected}</i>, received <i>${result}</i>)`;
  
  if (result ===  expected) {
    succeeded += 1;
    return log(`<div class="ok">${toCode(fnStr.slice(4), result)}
      <span><b>=> OK</b> ${resultStr}</span></div>`);
  }
  failed += 1;
  return log(`<div class="testErr">${toCode(fnStr.slice(4))}
    <span><b>=> NOT OK</b> ${resultStr}</span></div>`);
}

function codeExamples() {
  const [tru, flse, zero, not_a_nr, nil, undef, div, div2, nonDiv, proxyEx] =
    [true, false, 0, +("NaN"), null, undefined,
      Object.assign(document.createElement("div"), {textContent: "I am div"}),
      Object.assign(document.createElement("div"), {textContent: "I am div 2"}),
      document.createElement("unknown"),
      someProxy()];
  
  function SomeCTOR(something) {
    this.something = something;
  }
  
  function someProxy() {
    return new Proxy(new String(`hello`), {
      get(obj, key) { return key === 'world' ? ((obj += " world"), obj) : obj[key] }
    });
  }
  
  log(getHeader());
  
  return [
    t => `<div class="normal" id="IS" data-content-text="The IS function"><b>The IS function</b></div>`,
    _ => test(_ => IS([]), `Array`),
    _ => test(_ => IS([], Array), true),
    _ => test(_ => IS("nothing", Array, String), true),
    _ => test(_ => IS("nothing", Object, HTMLElement, null, NaN, undefined, Infinity), false),
    _ => test(_ => IS("nothing", String, null, NaN, undefined, Infinity), true),
    _ => test(_ => IS(div, Node), true),
    _ => test(_ => IS(), `undefined`),
    _ => test(_ => IS(nil), `null`),
    _ => test(_ => IS(not_a_nr), `NaN`),
    _ => test(_ => IS(not_a_nr, NaN), true),
    _ => test(_ => IS(1/0, Infinity), true),
    _ => test(_ => IS(flse), `Boolean`),
    _ => test(_ => IS({} + [], String /* ES peculiarity */), true),
    _ => test(_ => IS(true + false, Number /* ES peculiarity */), true),
    
    t => `<div class="normal" id="symbolicExt" data-content-text="The Object symbolic extension"><b>The Object symbolic extension</b></div>`,
    _ => test(_ => [][type], `Array`),
    _ => test(_ => [][is](Map), false),
    _ => test(_ => ({})[is](Array), false),
    _ => test(_ => [][is](Object /* up the prototoype chain */), true),
    _ => test(_ => `Hello World`[type], `String`),
    _ => test(_ => `Hello World`[is](String), true),
    _ => test(_ => `Hello World`[is](Object), false),
    _ => test(_ => new String(`Hello World`)[is](Object), true),

    t => `<div class="normal"><b>Note</b>: one can also use <code>Symbol.type/Symbol.is</code> directly</div>`,
    _ => test(_ => [][Symbol.type], `Array`),
    _ => test(_ => [][Symbol.is](Map), false),
    _ => test(_ => ({})[Symbol.is](Array), false),
    _ => test(_ => [][Symbol.is](Object /* up the prototoype chain */), true),

    t => `<div class="normal" id="staticSymbol" data-content-text="The <i>static</i> Object symbolic extension"><b>The <i>static</i> Object symbolic extension</b></div>`,
    _ => test(_ => Object[type](`Hello`), `String`),
    _ => test(_ => Object[is]([], Map), false),
    _ => test(_ => Object[is]([], Array), true),
    _ => test(_ => Object[is](not_a_nr, Number), false),
    _ => test(_ => Object[Symbol.is](not_a_nr, NaN), true),
    _ => test(_ => Object[is](not_a_nr, NaN, Number), true),
    _ => test(_ => Object[is](`Hello world`, NaN, Number, String), true),
    
    t => `<div class="normal" id="directStrict" data-content-text="Direct comparison">
      <b>Direct comparison</b>.
        <br>One can use the <code>IS</code> function
        or <code>Symbol.is</code> extension just for (<i>strict</i>) comparison of two values
        <br>So: <code>x[is](y)</code> or <code>IS(x, y)</code>
        are equivalents of <code>x <b>===</b> y</code>.</div>`,
    _ => test(_ => {let [x,y] = ["hello", "Hello"]; return y[is](x);}, false),
    _ => test(_ => {let [x,y] = ["Hello", "Hello"]; return y[is](x);}, true),
    _ => test(_ => {let [x,y] = [undefined, "Hello"]; return x?.[is](y) ?? `${x} !== ${y}`;}, `undefined !== Hello`),
    _ => test(_ => {let [x,y,z] = [42, 21, 3]; return x[is](z*y);}, false),
    _ => test(_ => {let [x,y,z] = [42, 21, 2]; return y[is](x/z);}, true),
    _ => test(_ => {let [x,y] = [{a: 2}, {a: 2}]; return y[is](x);}, false),

    t => `<div class="normal" id="wrapper" data-content-text="The wrapper <code>$Wrap</code>"><b>The wrapper <code>$Wrap</code></b></div>`,
    _ => test(_ => $Wrap([])[type], `Array`),
    _ => test(_ => $Wrap([]).type, `Array`),
    _ => test(_ => $Wrap([])[is](Map), false),
    _ => test(_ => $Wrap([])[is](Array), true),
    _ => test(_ => $Wrap([]).is(Array), true),
    _ => test(_ => $Wrap().type, `undefined`),
    _ => test(_ => $Wrap().is(null), false),
    _ => test(_ => $Wrap(undef).is(null, undefined), true),
    t => `<div class="normal"><b>Note</b>: <code>null</code> and <code>undefined</code>
           can <i>only</i> be checked using the wrapper</div>`,
    _ => test(_ => null?.[type] ?? $Wrap(null).type, `null`),
    _ => test(_ => undefined?.[is](undefined) ?? $Wrap(undefined).is(undefined), true),

    t => `<div class="normal" id="maybe" data-content-text="The <code>maybe</code> function"><b>The <code>maybe</code> function</b></div>`,
    _ => test(_ => maybe({trial() {return {};}})[is](Object), true),
    _ => test(_ => maybe({trial: () => $Wrap(null)}).is(null), true),
    _ => test(_ => maybe({trial: () => 1 === 2})[is](Boolean), true),
    _ => test(_ => maybe({trial: () => 2/0}), Infinity),
    _ => test(_ => maybe({trial: () => 2/0})[type], `Infinity`),
    _ => test(_ => maybe({trial: () => 2/0})[is](Infinity), true),
    _ => test(_ => maybe({trial: () => {throw new Error(`error!`);}, whenError() {return `no!`}}), `no!`),
    _ => test(_ => maybe({trial: () => {throw new Error(`error!`);}, whenError() {return `no!`}})[is](`no!`), true),
    _ => test(_ => maybe({trial: () => {throw new Error(`error!`);}, whenError() {return `no!`}})[is](String), true),
    _ => test(_ => maybe({trial: () => {throw new TypeError(`no!`);}, whenError(err) {return err.name; }}), `TypeError`),
    _ => test(_ => maybe({trial: () => {throw new TypeError(`no!`);}, whenError(err) {return err.name; }})[is](String), true),

    t => `<div class="normal" id="proxy" data-content-text="Proxy 'type'">
            <b>Proxy</b><br>
            A <code>Proxy</code> instance has no prototype,
            it is designed to be transparent to the proxied Object.
            <br>So checking the type of a <code>Proxy</code> instance
            will return the type of the <i>constituating Object</i>.
            <br><code>typeOfAnything</code> by default <i>redefines</i>
              the <code>Proxy</code> constructor to create <code>Proxy</code>
              instances with a determinable type.
            <br>With it the result of checking the type of a <code>Proxy</code>
              instance is now:
            <br><code>"Proxy ([type of the proxified original])"</code>.</div>`,
    _ => test(_ => new Proxy({}, {})[type], `Proxy (Object)`),
    _ => test(_ => new Proxy(new String(), {})[type], `Proxy (String)`),
    _ => test(_ => new Proxy(new Date(), {})[type], `Proxy (Date)`),
    _ => test(_ => new Proxy(new Date(), {})[is](Date), true),
    _ => test(_ => new Proxy(new Date(), {})[is](Proxy), true),
    _ => test(_ => proxyEx[type], `Proxy (String)`),
    _ => test(_ => proxyEx[is](Proxy), true),
    _ => test(_ => proxyEx[is](String), true),

    t => xProxy.native(),
    t => `<div class="normal">When we reset <code>Proxy</code>
          to its initial constructor (using <code>xProxy.native()</code>),
          the results are:</div>`,
    _ => test(_ => new Proxy({}, {})[type], `Object`),
    _ => test(_ => new Proxy(new String(), {})[type], `String`),
    _ => test(_ => new Proxy(new Date(), {})[type], `Date`),
    _ => test(_ => new Proxy(new Date(), {})[is](Date), true),

    t => `<div class="normal">
          <b>Note</b>: <code>proxyEx</code> was assigned with the modified
           <code>Proxy</code> constructor, so:</div>`,
    _ => test(_ => proxyEx[type], `Proxy (String)`),
    _ => test(_ => proxyEx[is](Proxy), true),
    _ => test(_ => proxyEx[is](String), true),

    t => `<div class="normal" id="nulletc" data-content-text="null, undefined, true, false">
            <b>null, undefined, true, false</b>
            <br><b>Note</b>: <code>null</code> and <code>undefined</code>
            must always be wrapped. </div>`,
    _ => test(_ => IS(...[,null]), false),
    _ => test(_ => IS(...[,]), `undefined`),
    _ => test(_ => nil?.[type] ?? $Wrap(nil)[type], `null`),
    _ => test(_ => $Wrap(nil)[is](undefined), false),
    _ => test(_ => $Wrap(nil)[is](null), true),
    _ => test(_ => tru[type], `Boolean`),
    _ => test(_ => flse[type], `Boolean`),
    _ => test(_ => $Wrap(flse)[type], `Boolean`),
    _ => test(_ => $Wrap(tru)[type], `Boolean`),
    _ => test(_ => tru[is](Boolean), true),
    _ => test(_ => flse[is](Boolean), true),
    _ => test(_ => undef?.[type] ?? $Wrap(undefined)[type], `undefined`),
    _ => test(_ => undef?.[is](undefined) ?? $Wrap(undef)[is](undefined), true),
    _ => test(_ => undef?.[is](null, NaN) ?? $Wrap(undef)[is](null, NaN), false),
    _ => test(_ => maybe({trial: () => nil[type], whenError: () => `WRAPPED ${$Wrap(nil).type}`}), `WRAPPED null`),
    _ => test(_ => maybe({trial: () => undef[type], whenError: () => `WRAPPED ${$Wrap(undef).type}`}), `WRAPPED undefined`),

    t => `<div class="normal" id="nothing" data-content-text="'Nothingness'</b> (<code>isNothing</code>)"><b>'Nothingness'</b> (<code>isNothing</code>)<br>
          <code>isNothing</code> is a special
          function imported from the module.
          <br>It determines if a
          given value is either <code>null</code> or
          <code>undefined</code> (so just <i>nothing</i>),
          <br><b>or</b> - when the second parameter is true -
          either <code>null</code>, <code>undefined</code>,
          <code>NaN</code> or <code>Infinity</code>
          </div>`,
    _ => test(_ => isNothing(undef), true),
    _ => test(_ => isNothing(nil), true),
    _ => test(_ => isNothing(nil, true), true),
    _ => test(_ => isNothing(undef, true), true),
    _ => test(_ => isNothing(NaN), false),
    _ => test(_ => isNothing(NaN, true), true),
    _ => test(_ => isNothing(1/0), false),
    _ => test(_ => isNothing(1/0, true), true),
    _ => test(_ => isNothing("hello!", true), false),
    _ => test(_ => isNothing(new Date(`error!`).getTime()), false),
    _ => test(_ => isNothing(new Date(`error!`).getTime(), true), true),

    t => `<div class="normal"><b>Note</b>: Invalid Date is still a <code>Date</code></div>`,
    _ => test(_ => new Date(`error!`)[is](Date), true),
    _ => test(_ => new Date(`error!`)[type], `Date`),
    _ => test(_ => isNothing(new Date(`error!`) /*Invalid Date: still a Date*/), false),
    _ => test(_ => isNothing(new Date(`error!`), true), false),

    t => `<div class="normal" id="zero" data-content-text="0 (zero)"><b>0 (zero)</b></div>`,
    _ => test(_ => zero[type], `Number`),
    _ => test(_ => zero[is](Boolean /* should be false */), false),
    _ => test(_ => zero[is](Number /* literal is Number */), true),
    _ => test(_ => zero[is](Object /* literal not Object */), false),
    _ => test(_ => new Number(zero)[is](Number), true),
    _ => test(_ => new Number(zero)[is](Object /* Up the prototype chain */), true),

    t => `<div class="normal" id="nan" data-content-text="NaN"><b>NaN</b></div>`,
    _ => test(_ => /* ES20xx default */ typeof not_a_nr, `number`),
    _ => test(_ => not_a_nr[is](Number /* by design we DON'T consider NaN to be Number */), false),
    _ => test(_ => not_a_nr[type], `NaN`),
    _ => test(_ => not_a_nr[is](NaN), true),
    _ => test(_ => new Number(not_a_nr)[is](Number), false),
    _ => test(_ => /* ES20xx */typeof new Number(not_a_nr), `object`),
    _ => test(_ => new Number(not_a_nr)[is](Object), false),
    _ => test(_ => new Number(not_a_nr)[type], `NaN`),
    _ => test(_ => new Number(not_a_nr)[is](NaN), true),

    t => `<div class="normal" id="specials" data-content-text="Special signature for <code>IS</code>">
            <b>Special signature for <code>IS/Symbol.is</code></b>
            <div><code>IS(input, {isTypes: [...types][, notTypes: [...types], defaultValue: any]})</code></div>
            <div>When the second parameter (or the first, using the Object symbol extension or <code>$Wrap</code>)
              is an Object with key [<code>isTypes</code>] and one of the keys [<code>defaultValue</code>]
              or [<code>notTypes</code>], the <code>IS</code> function works like:
            <ul>
              <li>with key <code>notTypes</code>: is the input type (one of) [<code>isTypes</code>],
                but <i><b>not</b></i> (one of) [<code>notTypes</code>]?</li>
              <li>with key <code>defaultValue</code>: if input type is not (one of) [<code>isTypes</code>]:
                returns [<code>defaultValue</code>], otherwise the <code>input</code> value</li>
              <li>with keys <code>defaultValue</code> <i>and</i> <code>notTypes</code>:
                if input type is (one of) [<code>isTypes</code>] and not (one of) [<code>notTypes</code>]
                returns [<code>input</code>], otherwise the <code>defaultValue</code> value</li>
              <li>
                <b>Notes</b>
                <ul class="notes">
                <li>With <i>only</i> the key <code>isTypes</code> in the first parameter
                the code will run as:<br>
                <code>IS(input, ...[value of isTypes])</code>.</li>
                <li><code>IS(input, {isTypes: [type[s]], notTypes: [type[s]]})</code>
                  is equivalent to
                  <br><code>IS(input, [...isType(s)]) && !IS(input, [...notType(s)])</code> and
                  <br><code>IS(input, {isTypes: [type[s]], defaultValue: [any]})</code>
                  <br>equals to
                  <br><code>IS(input, [...isType(s)]) || defaultValue</code></li></ul>
              </li>
            </ul>
          </div>`,
    _ => test(_ => div[is]({isTypes: HTMLDivElement, notTypes: HTMLUnknownElement}), true),
    _ => test(_ => div[is]({isTypes: [Array, String], notTypes: Node}), false),
    _ => test(_ => div[is]({isTypes: [HTMLElement], notTypes: [Array, String]}), true),
    _ => test(_ => `Hello`[is]({isTypes: [Object, Array], notTypes: String}), false),
    _ => test(_ => `Hello`[is]({isTypes: Array, defaultValue: `Should be an Array!`}), `Should be an Array!`),
    _ => test(_ => div[is](Node), true),
    _ => test(_ => IS(div, {isTypes: [Node], notTypes: NaN}), true),
    _ => test(_ => IS(div, {isTypes: [Node], notTypes: [RegExp, Symbol]}), true),
    _ => test(_ => IS(div, {isTypes: [Node], notTypes: [Number, undefined]}), true),
    _ => test(_ => IS(div, {isTypes: [Node], notTypes: undefined}), true),
    _ => test(_ => IS(div, {isTypes: [Node]}), true),
    _ => test(_ => $Wrap(null)[is]({isTypes: null, notTypes: undefined}), true),
    _ => test(_ => $Wrap(NaN).is({isTypes: NaN, notTypes: [undefined, null]}), true),
    _ => test(_ => IS(div, {isTypes: HTMLDivElement, notTypes: HTMLUnknownElement}), true),
    _ => test(_ => IS(`42`, {isTypes: String, defaultValue: {default: 42}}), `42`),
    _ => test(_ => IS(undefined, {isTypes: null, defaultValue: 42}), 42),
    _ => test(_ => IS(`50`, {isTypes: `42`, defaultValue: 42}), 42),
    _ => test(_ => IS(50, {isTypes: `50`, defaultValue: 42}), 42),
    _ => test(_ => IS({a: 50}, {isTypes: Object, notTypes: Array, defaultValue: 42}), {a: 50}),
    _ => test(_ => IS([1,2,42], {isTypes: Array, notTypes: Object, defaultValue: [42]}), [42]),
    _ => test(_ => IS(undefined, {isTypes: undefined, defaultValue: 42}), undefined),
    _ => test(_ => IS(div, {isTypes: HTMLUListElement, defaultValue: undefined}), undefined),
    _ => test(_ => IS(div, {isTypes: HTMLElement, notTypes: HTMLUnknownElement, defaultValue: div2}), div),
    _ => test(_ => IS(nonDiv, {isTypes: HTMLElement, notTypes: HTMLUnknownElement, defaultValue: div}), div),
    _ => test(_ => IS(div, {isTypes: HTMLUListElement, defaultValue: div2}), div2),
    _ => test(_ => IS(div, {isTypes: [undefined, null, NaN], defaultValue: div2}), div2),
    
    t => xProxy.custom(),
    t => `<div class="normal"><b>*</b> Rewritten <code>Proxy</code> constructor (<code>xProxy.custom()</code>)</div>`,
    _ => test(_ => new Proxy(new Date(), {})[type], `Proxy (Date)`),
    _ => test(_ => new Proxy(new Date(), {})[is]({isTypes: Proxy, notTypes: Date}), false),
    _ => test(_ => new Proxy(new Date(), {})[is]({isTypes: Date, notTypes: Proxy}), false),

    t => xProxy.native(),
    t => `<div class="normal"><b>*</b> Native <code>Proxy</code> constructor (<code>xProxy.native()</code>)</div>`,
    _ => test(_ => new Proxy(new Date(), {})[type], `Date`),
    _ => test(_ => new Proxy(new Date(), {})[is]({isTypes: Proxy, notTypes: Date}), false),
    _ => test(_ => new Proxy(new Date(), {})[is]({isTypes: Date, notTypes: Proxy}), true),

    t => `<div class="normal" id="tostringtag" data-content-text="The use of <code>Symbol.toStringTag</code>">
            <b>toStringTag</b>:
              The use of <code>Symbol.toStringTag</code> for reporting/checking 'types'.
            <div>
              A number of ES20xx Objects contain the 'well known Symbol' <code>Symbol.toStringTag</code>
              in their prototype. Such objects use that Symbol for their string representation (<code>toString</code>).
              Such 'types' are not always available as known constructors in the (global) namespace
              (like for example <code>HTMLElement</code> or <code>RegExp</code> are), so one can't always use (for example)
              <code>IS(new Float32Array(1), Float32Array)</code>).
              <br>One can check such non-available global constructors using their string representation,
              <br>e.g. <code>IS(new Float32Array(1), "Float32Array")</code>
              <br><br>See also: <a target="_blank"
                href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag"
                >MDN documentation</a></div>
            </div>`,
    _ => test(_ => div[type], `[object HTMLDivElement]`),
    _ => test(_ => Symbol.for(`is`)[type], `[object Symbol]`),
    _ => test(_ => Symbol.is[Symbol.is](Symbol /* known global constructor */), true),
    _ => test(_ => new Intl.Collator()[type], `[object Intl.Collator]`),
    _ => test(_ => new Intl.Collator()[is](`Intl.Collator`), true),
    _ => test(_ => new Intl.Collator()[is](Object), true),
    _ => test(_ => new Float32Array(1)[type], `[object Float32Array]`),
    _ => test(_ => new Float32Array(1)[is](TypedArray /* not a known global constructor */), false),
    _ => test(_ => new Float32Array(1)[is](Array, "Float32Array"), true),
    _ => test(_ => new Float32Array(1)[is](Object), true),
    _ => test(_ => new DataView(new ArrayBuffer(2))[type], `[object DataView]`),
    _ => test(_ => new FinalizationRegistry(_ => {})[type], `[object FinalizationRegistry]`),
    _ => test(_ => new FinalizationRegistry(_ => {})[is]("FinalizationRegistry"), true),
    _ => test(_ => new FinalizationRegistry(_ => {})[is](Function, "FinalizationRegistry"), true),
    _ => test(_ => new FinalizationRegistry(_ => {})[is](Function), false),
    _ => test(_ => new FinalizationRegistry(_ => {})[is](Object), true),
    _ => test(_ => Iterator[type], `Function`),
    _ => test(_ => Iterator.from([1,2,3])[type], `[object Array Iterator]`),
    _ => test(_ => Iterator.from([1,2,3])[is](`Array Iterator`), true),
    _ => test(_ => Iterator.from([1,2,3])[is](Object), true),
    _ => test(_ => new SharedArrayBuffer(16)?.[type], `[object SharedArrayBuffer]`),
    _ => test(_ => Intl[type], `[object Intl]`),
    _ => test(_ => Intl[is](Object), true),
    _ => test(_ => Intl[is](`Intl`), true),
    _ => test(_ => Intl.Collator[type], `Function`),
    _ => test(_ => Intl.Collator[is](Function), true),
    _ => test(_ => new Intl.Collator(`nl`)[type], `[object Intl.Collator]`),
    _ => test(_ => new Intl.Collator(`nl`)[is](Object), true),
    _ => test(_ => JSON[type], `[object JSON]`),
    _ => test(_ => JSON[is](Object), true),
    _ => test(_ => Math[type], `[object Math]`),
    _ => test(_ => new Promise((a, b) => {})[type], `[object Promise]`),
    _ => test(_ => new Promise((a, b) => {})[is](Promise), true),
    _ => test(_ => function* () {}[type], `[object GeneratorFunction]`),
    _ => test(_ => function* () {}[is](Function), true),
    _ => test(_ => function* () {}[is](`GeneratorFunction`), true),

    t => `<div class="normal" id="more" data-content-text="More examples"><b>More examples</b></div>`,
    _ => test(_ => /[a-z]/[type], `RegExp`),
    _ => test(_ => /[a-z]/[is](RegExp), true),
    _ => test(_ => /[a-z]/[is](Array), false),
    _ => test(_ => ``[type], `String`),
    _ => test(_ => new AggregateError(`aggregateError!`)[type], `AggregateError`),
    _ => test(_ => new AggregateError(`aggregateError!`)[is](Error), true),
    _ => test(_ => new TypeError(`error1`)[type], `TypeError`),
    _ => test(_ => new TypeError(`error2`)[is](TypeError), true),
    _ => test(_ => new TypeError(`error3`)[is](Error /* up the prototype chain */), true),
    _ => test(_ => new SomeCTOR("yada")[type], `SomeCTOR`),
    _ => test(_ => new SomeCTOR("yada")[is](SomeCTOR), true),
    _ => test(_ => new SomeCTOR("yada")[is](Object /* up the prototype chain */), true),
    _ => test(_ => Symbol(`me`)[is](Symbol), true),
    _ => test(_ => nonDiv[type], `[object HTMLUnknownElement]`),
    _ => test(_ => nonDiv[is](HTMLUnknownElement), true),
    _ => test(_ => div[is](Node), true),
    _ => test(_ => div[is](HTMLElement), true),
    _ => test(_ => div[is](HTMLDivElement), true),
    _ => test(_ => div[is](HTMLUListElement), false),
    _ => test(_ => div[is](HTMLUListElement, HTMLAreaElement, Node), true),
  ];
}

function toCode(str, res) {
  return `<code>${str}</code>`;
}

function addContentIndex() {
  const contentElements = document.querySelectorAll(`[data-content-text]`);
  const ul = Object.assign(document.createElement("ul"), {classList: `content`});
  ul.insertAdjacentHTML(`beforeend`, `<li class="head"><h3>Content</h3></li>`);
  contentElements.forEach(element => {
    ul.insertAdjacentHTML(`beforeend`,
      `<li><a href="#${element.id}">${element.dataset.contentText}</a></li>`);
    element.querySelector(`b`).title = "Content ↑";
  });
  const normalDiv = Object.assign(document.createElement("div"),
    {classList: `normal top noborder`});
  normalDiv.append(ul);
  document.querySelector(`#log2screen li:first-child .normal`)
    .insertAdjacentElement(`afterend`, normalDiv);
}

function logExampleCB(example) {
  const fn = example.toString().trim();
  const result = maybe({trial: example, whenError: err => testError(err, fn)});
  
  if (result === `FAIL`) { return failed += 1; }
  
  if (!isNothing(result)) {
    return log(toCode(String(fn).slice(4), example()))
  }
}

function printExamples() {
  document.addEventListener(`click`, handle);
  const allTests = codeExamples();
  
  for (let i = 0; i < allTests.length; i += 1) {
    const ex = allTests[i];
    if (ex.toString().startsWith(`t`)) {
      const txt2Log = ex();
      txt2Log &&  log(`!!${ex()}`);
      continue;
    }
    
    logExampleCB(ex);
  }
  
  addContentIndex();
  popupResults();
}

function popupResults() {
  resultBox.textContent = ``;
  resultBox.insertAdjacentHTML(`beforeend`,
    `<ul>
      <li>tests run: <b>${nTests}</b></li>
      <li>tests succeeded: <span class="ok" data-expected="..."><b>${succeeded}</b></span></li>
      <li>tests failed: <span class="testErr" data-expected="..."><b>${failed}</b></span></li>
    </ul>
    <div><button id="closePopover">Close</button></div>`);
  resultBox.showPopover();
}

function handle(evt) {
  const popoverCloseBttn = evt.target.closest(`#testResults`);
  const popoverOpenBttn = evt.target.closest(`#showResults`);
  
  if (popoverOpenBttn) {
    return resultBox.showPopover();
  }
  
  if (popoverCloseBttn) {
    return popoverCloseBttn.hidePopover();
  }
  
  if (evt.target.closest(`[data-content-text]`)) {
    return document.querySelector(`.container`).scrollIntoView();
  }
}

function logFactory(formatJSON = true) {
  const logContainer = document.querySelector(`#log2screen`);
  
  function logItem(top = false) {
    return content => {
      content = !IS(content, String, Number, Symbol)
        ? tryJSON(content, formatJSON) : String(content).trim();
      const isHead = content.startsWith(`!!`);
      content = isHead ? content.slice(2) : content;
      
      logContainer.insertAdjacentHTML(
        top ? `afterbegin` : `beforeend`,
        `<li${isHead ? ` class="head"` : ``}>
           <div>${content}</div>
        </li>` );
    };
  }
  const [logLamda, logTopLambda] = [logItem(), logItem(true)];
  
  return {
    log: (...txt) => txt.forEach( logLamda ),
    logTop: (...txt) => txt.forEach( logTopLambda ),
  };
}

function testError(err, testFn) {
  log(`<div class="testErr" data-expected="Function problem caught">
      Tried: <code>${testFn.slice(testFn.indexOf(`>`)+1)}</code>
      <br><b>=> NOT OK</b> (execution problem:
      failed with <i>${err.name}</i>: "<i>${err.message}</i>").</div>`);
  return `FAIL`;
}

function createResultBox() {
  const resultBox = Object.assign(document.createElement(`div`), {
    popover: `auto`,
    id: `testResults` });
  document.querySelector(`.container`) .prepend(resultBox);
  return resultBox;
}

function tryJSON(content, formatted) {
  return maybe({
    trial() { return formatted ? `<pre>${JSON.stringify(content, null, 2)}</pre>` : JSON.stringify(content); },
    whenError() { return `${String(content)}`; }
  });
}