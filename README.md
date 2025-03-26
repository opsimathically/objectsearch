# objectsearch

Recursively, and deeply, searches through objects, and nested maps, symbols, and sets - executing
a callback on each key/val, giving you the opportunity to operate on what was found.  
Complex pathings are generated which can be used to access just about anything found later
during execution.

There are several "search" oriented packages on npm; the core difference in this one is its
thoroughness in search/path generation. For example, you can search for a value in an object
which is being used as a key within a map, get a path to it, and then operate on that
key object using the generated path. You can search for a nested key, within an object,
stored in a set, and do the same. You can search objects/sets/maps within object symbols,
and do the same.

Additionally, our search analyzer uses the [@opsimathically/whatis](https://www.npmjs.com/package/@opsimathically/whatis) package
on keys and values so that you can use whatis plugins, if desired, or if not, simply
have detailed information about what it is you're looking at. This makes it possible
to write a set of whatis plugins, load them into an ObjectSearch instance, and quickly and
easily identify and store matching data during searches, fitting almost any imaginable
object search need.

## Install

```bash
npm install @opsimathically/objectsearch
```

## Building from source

This package is intended to be run via npm, but if you'd like to build from source,
clone this repo, enter directory, and run `npm install` for dev dependencies, then run
`npm run build`.

## Usage

[See API Reference for documentation](https://github.com/opsimathically/objectsearch/blob/main/docs/)

[See unit tests for more usage examples](https://github.com/opsimathically/objectsearch/blob/main/test/objectsearch.test.ts)
