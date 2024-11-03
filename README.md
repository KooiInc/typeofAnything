# typeofAnything

A little ES20xx module to determine the type of ... well, *anything one throws at it*.

The code is available as an ESM module, as a browser script and as a browser script containing a factory function. 

The module is also available from [NPM](https://www.npmjs.com/package/typeofanything).

## Exports
The module exports:
- `default`: a function to determine the type of a given input. Syntax:

   `[imported default function](input, [...type] | {...})`

    *Note*: for the `{...}` parameter, see the [demonstration page](https://kooiinc.github.io/typeofAnything/Demo)

- `$Wrap`: a function that wraps input and returns an Object with keys:
   - `value`: the input value 
   - `is([...types]|{...})`: function to determine the type of the wrapped input. This may also be `[Symbol.is]`.
   - `type`: returns (a string representation) of the type of the wrapped input. This may also be `[Symbol.type]`
   
- `maybe`: a utility function that returns either a tested value, or an error value of choice, syntax

   `maybe({trial: [function][, whenError: function]}`
 
    *Note*: without a `whenError` parameter, `maybe` returns `undefined` when `trial` fails.
- `isNothing(input:any[, all: boolean]`: a function to check if input is either `null || undefined`  (`all: false`)
   or `null || undefined || NaN || Infinity` (`all: true`).
- `xProxy`: in the `typeofAnything` module the native `Proxy` constructor is rewritten, which enables checking if input is
   a proxy instance (and its constituting type). xProxy is an Object to enable/disable this. Syntax:
   
   - `xProxy.native()`: use the native ES20xx `Proxy` constructor (disable type checking for proxies - so opt out from module default)
   - `xProxy.custom()`: use the custom `Proxy` constructor (enable type checking for proxies)

For an extensive set of examples see
the [demonstration page](https://kooiinc.github.io/typeofAnything/Demo)
or fiddle with it with a fork of this [Stackblitz project](https://stackblitz.com/edit/js-qem4v7?file=typeofAnything.js).

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