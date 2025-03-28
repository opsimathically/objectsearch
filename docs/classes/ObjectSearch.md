[**@opsimathically/objectsearch**](../README.md)

***

[@opsimathically/objectsearch](../README.md) / ObjectSearch

# Class: ObjectSearch

Defined in: [src/ObjectSearch.class.ts:65](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L65)

## Constructors

### Constructor

> **new ObjectSearch**(`options`?): `ObjectSearch`

Defined in: [src/ObjectSearch.class.ts:67](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L67)

#### Parameters

##### options?

###### whatis_plugins

`any`[]

#### Returns

`ObjectSearch`

## Properties

### whatis\_plugins

> **whatis\_plugins**: `any`[] = `[]`

Defined in: [src/ObjectSearch.class.ts:66](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L66)

## Methods

### complexPathToSimplePath()

> **complexPathToSimplePath**(`path_to_convert`, `options`?): `string`[]

Defined in: [src/ObjectSearch.class.ts:419](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L419)

ObjectSearc uses a complicated array path for being able to access just about
anything, just about anywhere in an object.  However, many tools, (mpath, etc)
require the ability to have paths in a simple linear array (or dot notation) format.
This utility method takes an existing complex path and attempts to convert it
to a "simple path" with a best effort.

Things that cannot be converted will be labeled as:
 "objsearch_cannot_convert_key_or_index".

a simple path is either:

   an array of strings and numbers
   an array of strings.

Enable the convert.numbers_to_strings flag if you want to convert numbers to strings
in the generated simple path.

#### Parameters

##### path\_to\_convert

[`path_t`](../type-aliases/path_t.md)

##### options?

###### convert_numbers_to_strings?

`boolean`

###### throw_on_cannot_convert?

`boolean`

#### Returns

`string`[]

***

### objGet()

> **objGet**(`object_to_get_from`, `path_lookup`): `any`

Defined in: [src/ObjectSearch.class.ts:78](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L78)

Get a value within an object using a path generated via object search.

#### Parameters

##### object\_to\_get\_from

`any`

##### path\_lookup

[`path_t`](../type-aliases/path_t.md)

#### Returns

`any`

***

### objSet()

> **objSet**(`object_to_get_from`, `path_lookup`, `set_val`): `boolean`

Defined in: [src/ObjectSearch.class.ts:186](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L186)

Set a value within an object using a path generated via object search.

#### Parameters

##### object\_to\_get\_from

`any`

##### path\_lookup

[`path_t`](../type-aliases/path_t.md)

##### set\_val

`any`

#### Returns

`boolean`

***

### run()

> **run**(`params`): `Promise`\<[`objsearch_run_result_t`](../type-aliases/objsearch_run_result_t.md)\>

Defined in: [src/ObjectSearch.class.ts:486](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L486)

Run a search on an object, executing a callback on keys and values.

#### Parameters

##### params

###### object_to_search

`any`

###### on_key

`recurse_key_callback_t`

###### on_val

`recurse_val_callback_t`

#### Returns

`Promise`\<[`objsearch_run_result_t`](../type-aliases/objsearch_run_result_t.md)\>

***

### simplePathToApproximatedComplexPath()

> **simplePathToApproximatedComplexPath**(`path_to_convert`): [`path_t`](../type-aliases/path_t.md)

Defined in: [src/ObjectSearch.class.ts:459](https://github.com/opsimathically/objectsearch/blob/0881bd7121c6c0bee9c3ad9b7f1fa3f364f28e99/src/ObjectSearch.class.ts#L459)

This will take a simple path and attempt to convert it into a path form
that can be utilized by objGet/objSet.

#### Parameters

##### path\_to\_convert

`any`[]

#### Returns

[`path_t`](../type-aliases/path_t.md)
