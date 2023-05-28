# typeof *anything*

Ecmascript can be a bitch when it comes to (determining) the type of variables. Sometimes `typeof`/`instanceof`/`constructor` etc. will 
just not give the right results. On the other hand I don't want to abandon dynamic typing, it offers that much more than static typing 
(so, *no typescript here*). On the other hand, there are moments where I want to be more certain that a variable is of the type I actually 
need (e.g in my [JQL](https://github.com/KooiInc/JQL) library).

So I created this little module/library. It tries to provide a function to determine a type of anything your throw at it. 

The code is available as an (importable) module or as a browser script.

## Import the module

Your script should be of type `module` (`<script type="module">`).

Within that script import using

`import IS from "kooiinc.github.io/typeofAnything/typeofany.module.js";`

or 

`const IS = (await import("kooiinc.github.io/typeofAnything/typeofany.module.js")).default;`

## Use in browser

Create a script tag in your html:

`<script src="kooiinc.github.io/typeofAnything/typeofany.module.js"`)</script>`

Subsequently use `window.IS` in you script

```html
<script>
  const IS = window.IS;
  // remove from global namespace
  delete window.IS;
  // ...
</script>
```

## Syntax

`[imported IS function](anything, [...types])`


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

For a more comprehensive example see this [Stackblitz project](https://stackblitz.com/edit/js-a1ggb3?file=index.js).
