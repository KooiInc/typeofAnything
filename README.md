# type check *any ECMAScript thing*

ECMAscript can be a bitch when it comes to (determining) the type of variables. Sometimes `typeof`/`instanceof`/`constructor` etc. will 
just not give the right results. On the other hand I don't want to abandon dynamic typing, it offers that much more than static typing 
(so, *no typescript here*). 

Still, there are moments where I want to be more certain that a variable is of the type I actually 
need (e.g in my [JQL](https://github.com/KooiInc/JQL) library).

So I created this little module/library. It tries to provide a function to determine a type of anything your throw at it.

The code is available as an (importable) module, as a browser script and from [NPM](https://www.npmjs.com/package/typeofanything).

## Import the module

Your script should be of type `module`.

```html
<script type="module">
  import IS from "[path to]/typeofany.module.js";
  // or 
  const IS = (await import("[path to]/typeofany.module.js")).default;
</script>
```

## Use in browser
Create a script tag in your html:

```html
<script src="[path to]/typeofany.browser.js")</script>
```
Subsequently in your script (for example)

```html
<script>
  const isObject = IS({}, Array, Object);
  const nothing = null;
  const isNothingNull = nothing?.[is](null) || $Wrap(nothing).is(null); 
  /* ... */
</script>
```

## Use in browser with factory
Create a script tag in your html:

```html
<script src="[path to]/typeofany.browser-factory.js")</script>
```

Subsequently in your script (for example)

```html
<script>
  const {IS, $Wrap} = TOAFactory();
  const isObject = IS({}, Array, Object);
  const nothing = null;
  const isNothingNull = nothing?.is(null) || $Wrap(nothing).is(null);
  
  /* ... */
</script>
```

## Syntax

`[imported IS function](anything, [...type])`

## Return value

The method returns either a boolean (`anything` is/is not (one of) `[...type]`) 
or a string representation of the found 'type' (may also be `null`, `NaN` or `undefined`).

For checking if `anything` is (one of) `[...type]`, the level of specificity is
up to the prototype of `anything` (when it is found). For example

- `IS(document.createElement("div"), HTMLDivElement)`
*and* `IS(document.createElement("div"), HTMLElement)` are both true, but
`IS(document.createElement("div"), Node)` will be false. 
- `IS(Array, Object)` will be false, `IS(Array, Array)` true. 

## Examples

```javascript
// assume the function is imported as IS
const showMeMyType = something => IS(something)
const someObj = {a: 1, b: `hello`, c: `world`};
const wMap = new WeakMap();
IS(someObj); // => Object
showMeMyType(wMap); // => WeakMap
IS(someObj, Object); // => true
IS(someObj, Array, String); // => false
IS(someObj, Symbol, String, RegExp, Object); // => true
IS(null); //=> null
IS(null, undefined); //=> false
IS(null, null); //=> true
IS(/[a-z]/gi, RegExp); //=> true
```

The library can do a lot more (e.g. check if something is a `Proxy` instance).  
To see it in action, see the examples in 
the [demonstration page](https://kooiinc.github.io/typeofAnything/Demo)
or fiddle with it with a fork of this [Stackblitz project](https://stackblitz.com/edit/js-qem4v7?file=typeofAnything.js).
