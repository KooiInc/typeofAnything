# typeofAnything

A little ES20xx module to determine the type of ... well, *anything one throws at it*.

The code is available as an ESM module, as a browser script and as a browser script containing a factory function. 

The module is also available from [NPM](https://www.npmjs.com/package/typeofanything).

## Module version

### The module exports:
- `default`: a function to determine the type of a given input. Syntax:

   `[imported default function](input, [...type] | {...})`

    *Note*: for the `{...}` parameter, see the [demonstration page](https://kooiinc.github.io/typeofAnything/Demo)

- `$Wrap`: a function that wraps input and returns an Object with keys:
   - `value`: the input value (can also be `undefined`, `null`, `NaN` or `Infinity`) 
   - `is([...types]|{...})`: function to determine the type of the wrapped input. This may also be `[Symbol.is]`.
   - `type`: returns (a string representation) of the type of the wrapped input. This may also be `[Symbol.type]`
   
- `maybe`: a utility function that returns either a tested value, or an error value of choice, syntax

   `maybe({trial: [function][, whenError: function]}`
 
    *Note*: without a `whenError` parameter, `maybe` returns `undefined` when `trial` fails.
- `isNothing(input:any[, all: boolean]`: a function to check if input is either `null || undefined`  (`all: false`)
   or `null || undefined || NaN || Infinity` (`all: true`).
- `xProxy`: in the `typeofAnything` module the native `Proxy` constructor is rewritten, which enables checking if input is  a proxy instance (and its constituting type). xProxy is an Object to enable/disable this. Syntax:
   
   - `xProxy.native()`: use the native ES20xx `Proxy` constructor (disable type checking for proxies - so opt out from module default)
   - `xProxy.custom()`: use the custom `Proxy` constructor (enable type checking for proxies)

For an extensive set of examples see
the [module demonstration page](https://kooiinc.github.io/typeofAnything/Demo)
or fiddle with it with a fork of this [Stackblitz project](https://stackblitz.com/edit/js-qem4v7?file=typeofAnything.js).

## Script version
The script version makes the factory `TOAFactory` globally available. Invoking the factory delivers an Object encapsulating
the beforementioned exports (except `default`, that's just `IS`).

For an extensive set of examples see
the [script demonstration page](https://kooiinc.github.io/typeofAnything/Demo/index-brwsr.html)


## Import the module

Your script should be of type `module`.

```html
<script type="module">
  import {default as IS, $Wrap} from "[install path]/Src/typeofany.module.js";
  const isObject = IS({}, Array, Object);
  const nothing = null;
  const isNothingNull = nothing?.[is](null) || $Wrap(nothing).is(null);
</script>
```

## Use in browser
Create a script tag in your html:

```html
<script src="[install path]/Src/typeofany.browser.js")</script>
```
Subsequently in your script (for example)

```html
<script>
  const {IS, $Wrap} = TOAFactory(); 
  const isObject = IS({}, Array, Object);
  const nothing = null;
  const isNothingNull = nothing?.[is](null) || $Wrap(nothing).is(null); 
  /* ... */
</script>
```

## Minified
Both the module- and browser-script versions are available as minified js files
in the `./Dist` directory, downloadable from e.g. `unpkg`

- module: https://unpkg.com/typeofanything@latest/Dist/toa.min.js
- script: https://unpkg.com/typeofanything@latest/Dist/toa.browser.min.js
