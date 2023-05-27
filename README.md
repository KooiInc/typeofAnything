# typeofAnything

Ecmascript can be a bitch when it comes to (determining) the type of variables. Sometimes `typeof`/`instanceof`/`constructor` etc. will 
just not give the right results.

This little module/library tries to provide a function to determine a type more extensively. It is available as an (importable) module or a browser script.

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

`[imported IS function](anything, [...types])`;


## Examples

```javascript
// assume the function is imported as IS
const someObj = {a: 1, b: `hello`, c: `world`};
IS(someObj); // => Object
IS(someObj, Object); // => true
IS(someObj, Array, String); // => false
IS(someObj, Symbol, String, RegExp, Object); // => true
IS(null); //=> null
IS(null, undefined); //=> false
IS(null, null); //=> true
IS(/[a-z]/gi, RegExp); //=> true
```

For a more extensive example see this [Stackblitz project](https://stackblitz.com/edit/js-a1ggb3?file=index.js).
