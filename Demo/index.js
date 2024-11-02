import { default as IS, maybe, $Wrap, isNothing, xProxy }
  from "./typeofAnything.js"; // also @https://github.com/KooiInc/typeofAnything

const {log} = logFactory();

// assign symbols from library
const is = Symbol.is;
const type = Symbol.type;

// -----------------------------------
const printHTML = html => html.replace(/</g, `&lt;`);
printExamples();

function SomeCTOR(something) {
  this.something = something;
}

function someProxy() {
  return new Proxy(new String(`hello`), {
    get(obj, key) { return key === 'world' ? ((obj += " world"), obj) : obj[key] }
  });
}

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
  return t => `<p><a target="_top" href="https://stackblitz.com/@KooiInc">All projects</a>
    | <a target="_blank" href="https://www.npmjs.com/package/typeofanything">@NPM</a></p>
    <div class="normal"><h3>TypeofAnything: determine/check the type of nearly any (ECMAScript) thing</h3>
      (including null/undefined/NaN/true/false etc.) Pre-release 1.2.6</div>
    <code class="block">
    // import & initialize
    import { 
      default as IS, // the main type checking function
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
    const [tru, flse, zero, not_a_nr, nil, undef, div, proxyEx] =
      [true, false, 0, +("NaN"), null, undefined, 
       document.createElement("div"), someProxy()];
    const SharedArrayBufferTrial = maybe({
      trial: _ => new SharedArrayBuffer(16)?.[type],
      whenError: _ => "Tried &lt;code>new SharedArrayBuffer(16)?.[type]&lt;/code>\\
        &lt;br>Failed=> &lt;code>SharedArrayBuffer&lt;/code> not available,\\
        security conditions probably not met" });
    const IteratorTrial = maybe({
      trial: _ => Iterator.from([1,2,3]?.Type,
      whenError: _ => 
          "Tried &lt;code>Iterator.from([1,2,3])&lt;/code>\\
          &lt;br>Failed => Iterator is experimental and not available in all browsers" });
      
    // a constructor
    function SomeCTOR(something) {
      this.something = something;
    }
    // a proxy
    function someProxy() {
      return new Proxy(new String("hello"), { 
        get(obj, key) { return key === 'world' ? (obj += " world") && obj : obj[key] }
      });
    }</code>` .replace(/\n {4}/g, `\n`);
}

function codeExamples() {
  const [tru, flse, zero, not_a_nr, nil, undef, div, proxyEx] =
    [true, false, 0, +("NaN"), null, undefined, document.createElement(`div`), someProxy()];
  div.textContent = `I am div`;
  const SharedArrayBufferTrial = maybe({
    trial: _ => new SharedArrayBuffer(16)?.[type],
    whenError: _ => `Tried <code>new SharedArrayBuffer(16)?.[type]</code>
      <div>Failed => <code>SharedArrayBuffer</code> not available, security conditions probably not met</div>
      <div>See <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer"
      >MDN</a></div>`});
  const IteratorTrial = maybe({
    trial: _ => `<code>Iterator.from([1,2,3]?.[type]</code> ${Iterator.from([1,2,3])?.[type]}`,
    whenError: _ => `Tried <code>Iterator.from([1,2,3])?.[type]</code> 
      <br>Failed => Iterator is experimental and not available in all browsers`
  });
  return [
    getHeader(),
    t => `<div class="normal"><b>The IS function</b></div>`,
    _ => IS([]),
    _ => IS([], Array),
    _ => IS("nothing", Array, String),
    _ => IS(div, Node),
    _ => IS(not_a_nr, NaN),
    _ => IS(1/0, Infinity),
    _ => IS(flse),
    _ => IS({} + [], String /* ES peculiarity */),
    _ => IS(true + false, Number /* ES peculiarity */),
    
    t => `<div class="normal"><b>The Object symbolic extension</b></div>`,
    _ => [][type],
    _ => [][is](Map),
    _ => ({})[is](Array),
    _ => [][is](Object /* up the prototoype chain */),
    _ => `Hello World`[type],
    _ => `Hello World`[is](String),
    _ => `Hello World`[is](Object),
    _ => new String(`Hello World`)[is](Object),
    
    t => `<div class="normal"><b>Note</b>: one can also use <code>Symbol.type/Symbol.is</code> directly</div>`,
    _ => [][Symbol.type],
    _ => [][Symbol.is](Map),
    _ => ({})[Symbol.is](Array),
    _ => [][Symbol.is](Object /* up the prototoype chain */),
    
    t => `<div class="normal"><b>The <i>static</i> Object symbolic extension</b></div>`,
    _ => Object[type](`Hello`),
    _ => Object[is]([], Map),
    _ => Object[is]([], Array),
    _ => Object[is](not_a_nr, Number),
    _ => Object[Symbol.is](not_a_nr, NaN),
    _ => Object[is](not_a_nr, NaN, Number),
    _ => Object[is](`Hello world`, NaN, Number, String),
    
    t => `<div class="normal"><b>The wrapper <code>$Wrap</code></b></div>`,
    _ => $Wrap([])[type],
    _ => $Wrap([]).type,
    _ => $Wrap([])[is](Map),
    _ => $Wrap([])[is](Array),
    _ => $Wrap([]).is(Array),
    _ => $Wrap().type,
    _ => $Wrap().is(null),
    _ => $Wrap().is(null, undefined),
    t => `<div class="normal"><b>Note</b>: <code>null</code> and <code>undefined</code>
           can <i>only</i> be checked using the wrapper</div>`,
    _ => null?.[type] ?? $Wrap(null).type,
    _ => undefined?.[is](undefined) ?? $Wrap(undefined).is(undefined),
    
    t => `<div class="normal">
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
    _ => new Proxy({}, {})[type],
    _ => new Proxy(new String(), {})[type],
    _ => new Proxy(new Date(), {})[type],
    _ => new Proxy(new Date(), {})[is](Date),
    _ => new Proxy(new Date(), {})[is](Proxy),
    _ => proxyEx[type],
    _ => proxyEx[is](Proxy),
    _ => proxyEx[is](String),
    
    // TODO
    t => xProxy.native(),
    t => `<div class="normal">When we reset <code>Proxy</code>
          to its initial constructor (using <code>xProxy.native()</code>),
          the results are:</div>`,
    _ => new Proxy({}, {})[type],
    _ => new Proxy(new String(), {})[type],
    _ => new Proxy(new Date(), {})[type],
    _ => new Proxy(new Date(), {})[is](Date),
    
    t => `<div class="normal"><b>Note</b>: <code>proxyEx</code> was assigned with the modified
           <code>Proxy</code> constructor, so:</div>`,
    _ => proxyEx[type],
    _ => proxyEx[is](Proxy),
    _ => proxyEx[is](String),
    
    t => `<div class="normal"><b>null, undefined, true, false</b></div>`,
    _ => nil?.[type] ?? $Wrap(nil)[type],
    _ => $Wrap(nil)[is](undefined),
    _ => $Wrap(nil)[is](null),
    _ => tru[type],
    _ => flse[type],
    _ => $Wrap(flse)[type],
    _ => $Wrap(tru)[type],
    _ => tru[is](Boolean),
    _ => flse[is](Boolean),
    _ => undef?.[type] ?? $Wrap(undefined)[type],
    _ => undef?.[is](undefined) ?? $Wrap(undef)[is](undefined),
    _ => undef?.[is](null, NaN) ?? $Wrap(undef)[is](null, NaN),
    
    t => `<div class="normal"><b>'Nothingness'</b><br>
          <code>isNothing</code> is a special
          function imported from the module.
          <br>It determines if a
          given value is either <code>null</code> or
          <code>undefined</code> (so just <i>nothing</i>),
          <br><b>or</b> - when the second parameter is true -
          either <code>null</code>, <code>undefined</code>,
          <code>NaN</code> or <code>Infinity</code>
          </div>`,
    _ => isNothing(undef),
    _ => isNothing(nil),
    _ => isNothing(nil, true),
    _ => isNothing(undef, true),
    _ => isNothing(NaN),
    _ => isNothing(NaN, true),
    _ => isNothing(1/0),
    _ => isNothing(1/0, true),
    
    t => `<div class="normal"><b>0 (zero)</b></div>`,
    _ => zero[type],
    _ => zero[is](Boolean /* should be false */),
    _ => zero[is](Number /* literal is Number */),
    _ => zero[is](Object /* literal not Object */),
    _ => new Number(zero)[is](Number),
    _ => new Number(zero)[is](Object /*<br>&nbsp;&nbsp;Up the prototype chain, Number instance is also Object */),
    
    t => `<div class="normal"><b>NaN</b></div>`,
    _ => typeof not_a_nr,
    _ => not_a_nr[is](Number /* by design we DON'T consider NaN to be Number */),
    _ => not_a_nr[type],
    _ => not_a_nr[is](NaN),
    _ => new Number(not_a_nr)[is](Number),
    _ => new Number(not_a_nr)[is](Object),
    _ => typeof new Number(not_a_nr),
    _ => new Number(not_a_nr)[type],
    _ => new Number(not_a_nr)[is](NaN),
    
    t => `<div class="normal"><b>Special cases</b>
            <div>When the second parameter (or the first, using the Object symbol extension or <code>$Wrap</code>)
              is an Object with key [<code>isTypes</code>] and one of the keys [<code>defaultValue</code>]
              or [<code>notTypes</code>], the <code>IS</code> function works like:
            <ul>
              <li>with key <code>notTypes</code>: is the input type (one of) [<code>isTypes</code>],
                but <i><b>not</b></i> (one of) [<code>notTypes</code>]?</li>
              <li>with key <code>defaultValue</code>: if input type is not (one of) [<code>isTypes</code>],
                then returns [<code>defaultValue</code>], otherwise the input value</li>
            </ul>
          </div>`,
    _ => div[is]({isTypes: HTMLDivElement, notTypes: HTMLUnknownElement}),
    _ => div[is]({isTypes: [Array, String], notTypes: Node}),
    _ => div[is]({isTypes: [HTMLElement], notTypes: [Array, String]}),
    _ => `Hello`[is]({isTypes: [Object, Array], notTypes: String}),
    _ => `Hello`[is]({isTypes: Array, defaultValue: `Should be an Array!`}),
    _ => div[is]({isTypes: [Node], notTypes: [undefined, null, NaN]}),
    _ => $Wrap(null)[is]({isTypes: null, notTypes: [undefined] /*undefined *must* be array*/}),
    _ => IS(div, {isTypes: HTMLDivElement, notTypes: HTMLUnknownElement}),
    _ => IS(div, {isTypes: HTMLUListElement, defaultValue: printHTML(div.outerHTML)}),
    _ => IS(div, {isTypes: [undefined, null, NaN], defaultValue: printHTML(div.outerHTML)}),

    t => xProxy.custom(),
    t => `<div class="normal">* Rewritten <code>Proxy</code> constructor (<code>xProxy.custom()</code>)</div>`,
    _ => new Proxy(new Date(), {})[type],
    _ => new Proxy(new Date(), {})[is]({isTypes: Proxy, notTypes: Date}),
    _ => new Proxy(new Date(), {})[is]({isTypes: Date, notTypes: Proxy}),
    
    t => xProxy.native(),
    t => `<div class="normal">* Native <code>Proxy</code> constructor (<code>xProxy.native()</code>)</div>`,
    _ => new Proxy(new Date(), {})[type],
    _ => new Proxy(new Date(), {})[is]({isTypes: Proxy, notTypes: Date}),
    _ => new Proxy(new Date(), {})[is]({isTypes: Date, notTypes: Proxy}),
    
    t => `<div class="normal"><b>More examples</b></div>`,
    _ => /[a-z]/[type],
    _ => /[a-z]/[is](RegExp),
    _ => /[a-z]/[is](Array),
    _ => ``[type],
    _ => new SomeCTOR("yada")[type],
    _ => new SomeCTOR("yada")[is](SomeCTOR),
    _ => new SomeCTOR("yada")[is](Object /* up the prototype chain */),
    _ => Symbol(`anything`)[type],
    _ => div[type],
    _ => div[is](Node),
    _ => div[is](HTMLElement),
    _ => div[is](HTMLDivElement),
    _ => div[is](HTMLUListElement),
    _ => div[is](HTMLUListElement, HTMLAreaElement, Node),
    _ => new Intl.Collator()[type],
    _ => new Float32Array(1)[type],
    _ => new Error(`error!`)[type],
    _ => new DataView(new ArrayBuffer(2))[type],
    _ => function* () {
      yield 'a';
      yield 'b';
      yield 'c';
    }[type],
    _ => new FinalizationRegistry(_ => {})[type],
    _ => IteratorTrial,
    _ => new AggregateError(`aggregateError!`)[type],
    _ => SharedArrayBufferTrial,
    _ => Intl.Collator[type],
    _ => function* () {}[type],
  ]
}

function toCode(str, res) {
  const resX = $Wrap(res);
  return `<code>${str}</code>: ${resX[is](Object, Array)
    ? `<pre>${JSON.stringify(res, null, 2)}</pre>`
    : resX[is](Symbol)
      ? res.toString()
      : res}`;
}

function wrap2Container() {
  $(`<div class="container">`).append($(`ul#log2screen`));
}

function logExampleCB(example) {
  const fn = example.toString().trim();
  const result = example();
  return maybe({
    trial: _ =>
      fn.startsWith('t')
        ? result && log(`!!${example()}`)
        : log(toCode(String(fn).slice(4), example())),
    whenError: err => {
      log(`<pre>${err}</pre>`);
      console.error(err);
    } });
}

function printExamples() {
  codeExamples().forEach(logExampleCB);
  //wrap2Container();
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

function tryJSON(content, formatted) {
  return maybe({
    trial() { return formatted ? `<pre>${JSON.stringify(content, null, 2)}</pre>` : JSON.stringify(content); },
    whenError() { return `${String(content)}`; }
  });
}