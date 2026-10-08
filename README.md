# js-reflection

Reflection helpers for JavaScript projects: dynamically import a script file and look up or call its exported objects, functions and classes.

**Note:** This repository is archived and read-only.

Package `@ralvarezdev/js-reflection` (0.3.11, ES modules, no dependencies).

## Installation

npm publication was not verified; installing from GitHub works regardless:

```bash
npm install github:ralvarezdev/js-reflection
```

## Usage

```js
import Script from "@ralvarezdev/js-reflection";

const script = new Script("./path/to/module.js");
const value = await script.getObject("someExport");
const result = await script.callFunction("someFunction", 1, 2);
const instance = await script.callNew("SomeClass");
```

## API

Exported from `index.js`: default `Script`, `isClass`, `isFunction`.

`new Script(scriptPath)` adds a `.js` extension if missing and imports the script lazily, with caching. Async methods:

- **Lookup** — `loadedScript()`, `getObject(name)`, `getObjectProperty(obj, prop)`, `getObjectFunctionProperty(obj, prop)`, `getNestedObjectProperty(obj, ...props)`, `getFunction(name)`, `getClass(name)`, `getClassMethods(className)`
- **Calls** — `callFunction(name, ...params)`, `callObjectMethod(obj, method, ...params)`, `callNew(className, ...params)`
- **Safe calls** — `safeCallFunction`, `safeCallObjectMethod`, `safeCallNew` throw `Mismatched number of parameters` if the argument count differs from the function's arity.

Missing paths, objects or properties and wrong kinds throw errors such as `Object not found` or `Object is not a class`.

## Development

Tests use Node's built-in runner (`index.test.js`, `load/index.test.js`, `load/script.test.js`):

```bash
npm test   # node index.test.js
```

```
index.js
load/   script.js (Script), helpers.js (isClass, isFunction), index.js, *.test.js
```

## License

The repository has a GNU General Public License v3.0 `LICENSE` file, but `package.json` declares `ISC`; the two disagree.
