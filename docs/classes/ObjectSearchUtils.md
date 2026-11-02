[**@opsimathically/objectsearch**](../README.md)

***

[@opsimathically/objectsearch](../README.md) / ObjectSearchUtils

# Class: ObjectSearchUtils

Defined in: src/ObjectSearchUtils.class.ts:16

Utilities to make working with objectsearch easier to apply to general
tasks.

## Constructors

### Constructor

> **new ObjectSearchUtils**(`search_this`, `options`?): `ObjectSearchUtils`

Defined in: src/ObjectSearchUtils.class.ts:23

#### Parameters

##### search\_this

`any`

##### options?

###### whatis_plugins

`any`[]

#### Returns

`ObjectSearchUtils`

## Properties

### search\_this

> **search\_this**: `any`

Defined in: src/ObjectSearchUtils.class.ts:18

***

### whatis\_plugins

> **whatis\_plugins**: `any`[] = `[]`

Defined in: src/ObjectSearchUtils.class.ts:21

## Methods

### searchDeepEquals()

> **searchDeepEquals**(`search_terms`, `cbs`): `Promise`\<`boolean`\>

Defined in: src/ObjectSearchUtils.class.ts:87

Search for anything, must match deep equals.  Uses fast-equal npm package for
deep equal matching.

#### Parameters

##### search\_terms

`any`[]

##### cbs

###### key?

`any`

###### val?

`any`

#### Returns

`Promise`\<`boolean`\>

***

### searchNumbers()

> **searchNumbers**(`search_terms`, `cbs`): `Promise`\<`boolean`\>

Defined in: src/ObjectSearchUtils.class.ts:128

Search for numbers (or bigints)

#### Parameters

##### search\_terms

(`number` \| `bigint`)[]

##### cbs

###### key?

`any`

###### val?

`any`

#### Returns

`Promise`\<`boolean`\>

***

### searchStrings()

> **searchStrings**(`search_terms`, `cbs`): `Promise`\<`boolean`\>

Defined in: src/ObjectSearchUtils.class.ts:31

Search for strings, using either direct string matching, or regular expression terms.

#### Parameters

##### search\_terms

(`string` \| `RegExp`)[]

##### cbs

###### key?

`any`

###### val?

`any`

#### Returns

`Promise`\<`boolean`\>

***

### searchWhatisCodes()

> **searchWhatisCodes**(`search_terms`, `cbs`): `Promise`\<`boolean`\>

Defined in: src/ObjectSearchUtils.class.ts:173

Search for whatis codes.

#### Parameters

##### search\_terms

`string`[]

##### cbs

###### key?

`any`

###### val?

`any`

#### Returns

`Promise`\<`boolean`\>
