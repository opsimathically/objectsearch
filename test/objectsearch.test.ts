/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'node:test';
import assert from 'node:assert';

import { deepEqual } from 'fast-equals';
import { whatis, whatis_matches_t } from '@opsimathically/whatis';
import { generateRandomGarbage } from '@opsimathically/garbage';
import {
  ObjectSearch,
  path_t,
  path_elem_t,
  on_key_params_t,
  on_val_params_t
} from '@src/ObjectSearch.class';

import { ObjectSearchUtils } from '@src/ObjectSearchUtils.class';

(async function () {
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Test Data Definitions %%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  const external_obj: any = {
    something_external: 'moo',
    [Symbol('nested_symbol_obj')]: {
      symsome: 'symstring',
      symhello: 'symthere',
      testsymmap: new Map([['hi', 'whats up']])
    }
  };
  external_obj.circular_ref = external_obj;
  const search_this: any = {
    foo: {
      bar: new Map([[{ baz: 1 }, new Set([2, 3])]]),
      settest: new Set([5, 6]),
      nested: {
        something: 'here',
        nested_circular: {
          external_circular: external_obj
        }
      }
    },
    [Symbol('hidden')]: 'some_symbol_val',
    7: 8,
    9: new Map<any, any>([[10, 11]])
  };

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Garbage Data Tests %%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // Run the search algorithm 1000 times against randomly generated garbage
  // in attempts to find things that would cause it to bork.  As a note, I've already
  // ran over 100,000,000 random tests just letting it run over night, but this is here
  // just in case we find something.
  test('ObjectSearch 1000 random garbage tests on search', async function () {
    for (let idx = 0; idx < 1000; idx++) {
      const objsearch = new ObjectSearch();
      const random_garbage = generateRandomGarbage();
      try {
        await objsearch.run({
          object_to_search: random_garbage,
          on_key: async function (info: on_key_params_t) {},
          on_val: async function (info: on_val_params_t) {}
        });
      } catch (err) {
        debugger;
        assert.fail('should_never_throw_an_exception_on_garbage_tests');
      }
    }
  });

  test('objGet 1000+1000 random garbage tests.', async function () {
    // invalid search path tests
    for (let idx = 0; idx < 1000; idx++) {
      const external_obj: any = {
        something_external: 'moo',
        [Symbol('nested_symbol_obj')]: {
          symsome: 'symstring',
          symhello: 'symthere',
          testsymmap: new Map([['hi', 'whats up']])
        }
      };
      external_obj.circular_ref = external_obj;
      const search_this: any = {
        foo: {
          bar: new Map([[{ baz: 1 }, new Set([2, 3])]]),
          settest: new Set([5, 6]),
          nested: {
            something: 'here',
            nested_circular: {
              external_circular: external_obj
            }
          }
        },
        [Symbol('hidden')]: 'some_symbol_val'
      };
      const objsearch = new ObjectSearch();
      const random_garbage = generateRandomGarbage();
      try {
        objsearch.objGet(search_this, random_garbage);
      } catch (err) {
        if (err instanceof Error) {
          if (
            !(err?.cause as any)?.context &&
            err.message !== 'objget_path_lookup_invalid' &&
            err.message !== 'objget_invalid_path_detected' &&
            err.message !== 'objget_invalid_object_get_path_context' &&
            err.message !== 'objget_path_elem_not_obj' &&
            err.message !== 'objget_path_elem_no_context'
          ) {
            console.log(err);
            assert.fail('objGet garbage path test failed.');
          }
        }
      }
    }

    // garbage search data/search path
    for (let idx = 0; idx < 1000; idx++) {
      const objsearch = new ObjectSearch();
      const random_garbage_search = generateRandomGarbage();
      const random_garbage_path = generateRandomGarbage();
      try {
        await objsearch.objGet(random_garbage_search, random_garbage_path);
      } catch (err) {
        if (err instanceof Error) {
          if (
            !(err?.cause as any)?.context &&
            err.message !== 'objget_path_lookup_invalid' &&
            err.message !== 'objget_invalid_path_detected' &&
            err.message !== 'objget_invalid_object_get_path_context' &&
            err.message !== 'objget_path_elem_not_obj' &&
            err.message !== 'objget_path_elem_no_context'
          ) {
            console.log(err);
            assert.fail('objGet garbage search/path failed.');
          }
        }
      }
    }
  });

  test('objSet 1000 random garbage tests.', async function () {
    // invalid search path tests
    for (let idx = 0; idx < 10000; idx++) {
      const external_obj: any = {
        something_external: 'moo',
        [Symbol('nested_symbol_obj')]: {
          symsome: 'symstring',
          symhello: 'symthere',
          testsymmap: new Map([['hi', 'whats up']])
        }
      };
      external_obj.circular_ref = external_obj;
      const search_this: any = {
        foo: {
          bar: new Map([[{ baz: 1 }, new Set([2, 3])]]),
          settest: new Set([5, 6]),
          nested: {
            something: 'here',
            nested_circular: {
              external_circular: external_obj
            }
          }
        },
        [Symbol('hidden')]: 'some_symbol_val'
      };
      const objsearch = new ObjectSearch();
      const random_garbage = generateRandomGarbage();
      const random_garbage_setval = generateRandomGarbage();
      try {
        objsearch.objSet(search_this, random_garbage, random_garbage_setval);
      } catch (err) {
        if (err instanceof Error) {
          if (
            !(err?.cause as any)?.context &&
            err.message !== 'objset_path_lookup_invalid' &&
            err.message !== 'objset_path_elem_not_obj' &&
            err.message !== 'objset_path_elem_no_context' &&
            err.message !== 'objset_path_lookup_empty' &&
            err.message !== 'objset_value_assignment_failed' &&
            err.message !== 'objset_invalid_path_detected' &&
            err.message !== 'objset_set_index_is_not_within_set' &&
            err.message !== 'objset_invalid_object_get_path_context' &&
            err.message !== 'objset_invalid_object_get_path'
          ) {
            console.log(err);
            assert.fail('objSet garbage path test failed.');
          }
        }
      }
    }
  });

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Class/Event Based Tests %%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // should't ever get stuck in an infinite loop, but we put this here anyway
  // just to test.
  test('ObjectSearch circular object loop avoidance test.', async function () {
    const objsearch = new ObjectSearch();
    try {
      await objsearch.run({
        object_to_search: search_this,
        on_key: async function (info: on_key_params_t) {},
        on_val: async function (info: on_val_params_t) {
          // ensure the desired value is within an object_symbol entry.
          if (info.value === 'symthere') {
            assert(info.path[info.path.length - 2].context == 'object_symbol');
          }
        }
      });
    } catch (err) {
      assert.fail('test_failed, should never throw error.');
    }
  });

  // Since we're often working on live, changing data, problems can occur.  We do our
  // best to detect them.
  test('ObjectSearch live data corruption avoidance testing.', async function () {
    // create local version of test data here since we'll be mutating it by
    // corrupting data.
    const external_obj: any = {
      something_external: 'moo',
      [Symbol('nested_symbol_obj')]: {
        symsome: 'symstring',
        symhello: 'symthere',
        testsymmap: new Map([['hi', 'whats up']])
      }
    };
    external_obj.circular_ref = external_obj;
    const search_this_corrupting: any = {
      foo: {
        bar: new Map([[{ baz: 1 }, new Set([2, 3])]]),
        settest: new Set([5, 6]),
        nested: {
          something: 'here',
          nested_circular: {
            external_circular: external_obj
          }
        }
      },
      [Symbol('hidden')]: 'some_symbol_val'
    };

    try {
      const objsearch = new ObjectSearch();
      await objsearch.run({
        object_to_search: search_this_corrupting,
        on_key: async function (info: on_key_params_t) {},
        on_val: async function (info: on_val_params_t) {
          // ensure the desired value is within an object_symbol entry.
          if (info.value === 'here') {
            // corrupt the object removing the foo parent path
            delete search_this_corrupting.foo;
          }
        }
      });
    } catch (err) {
      assert.fail('resilliancy_test_failed_due_to_error');
    }
  });

  test('ObjectSearch nested symbol test.', async function () {
    const objsearch = new ObjectSearch();
    await objsearch.run({
      object_to_search: search_this,
      on_key: async function (info: on_key_params_t) {},
      on_val: async function (info: on_val_params_t) {
        // ensure the desired value is within an object_symbol entry.
        if (info.value === 'symthere') {
          assert(info.path[info.path.length - 2].context == 'object_symbol');
        }
      }
    });
  });

  test('ObjectSearch object as map key test.', async function () {
    const objsearch = new ObjectSearch();
    await objsearch.run({
      object_to_search: search_this,
      on_key: async function (info: on_key_params_t) {},
      on_val: async function (info: on_val_params_t) {
        // map_key
        if (info.path_elem.context === 'map_key') {
          if (info?.key?.baz) assert.deepStrictEqual(info.key, { baz: 1 });
        }
      }
    });
  });

  test('Use objGet in order to get values.', async function () {
    const objsearch = new ObjectSearch();
    const stored_paths: path_t[] = [];
    await objsearch.run({
      object_to_search: search_this,
      on_key: async function (info: on_key_params_t) {},
      on_val: async function (info: on_val_params_t) {
        switch (info.value) {
          case 'symthere':
          case 'whats up':
          case 'here':
            stored_paths.push(info.path);
            break;
          default:
            break;
        }
      }
    });

    const result_0 = objsearch.objGet(search_this, stored_paths[0]);
    assert(result_0 === 'here');
    const result_1 = objsearch.objGet(search_this, stored_paths[1]);
    assert(result_1 === 'symthere');
    const result_2 = objsearch.objGet(search_this, stored_paths[2]);
    assert(result_2 === 'whats up');
  });

  test('Use objGet in order to set values.', async function () {
    // create local information set
    const external_obj: any = {
      something_external: 'moo',
      [Symbol('nested_symbol_obj')]: {
        symsome: 'symstring',
        symhello: 'symthere',
        testsymmap: new Map([['hi', 'whats up']])
      }
    };
    external_obj.circular_ref = external_obj;
    const search_this_scoped: any = {
      foo: {
        bar: new Map([[{ baz: 1 }, new Set([2, 3])]]),
        settest: new Set([5, 6]),
        nested: {
          something: 'here',
          nested_circular: {
            external_circular: external_obj
          }
        }
      },
      [Symbol('hidden')]: 'some_symbol_val'
    };

    const stored_paths: path_t[] = [];
    const objsearch = new ObjectSearch();
    await objsearch.run({
      object_to_search: search_this_scoped,
      on_key: async function (info: on_key_params_t) {},
      on_val: async function (info: on_val_params_t) {
        switch (info.value) {
          case 'symthere':
          case 'whats up':
          case 'here':
            stored_paths.push(info.path);
            break;
          default:
            break;
        }
      }
    });

    // set values
    objsearch.objSet(search_this_scoped, stored_paths[0], 'setval0');
    objsearch.objSet(search_this_scoped, stored_paths[1], 'setval1');
    objsearch.objSet(search_this_scoped, stored_paths[2], 'setval2');

    // get values after set and assert
    const result_0 = objsearch.objGet(search_this_scoped, stored_paths[0]);
    assert(result_0 === 'setval0');
    const result_1 = objsearch.objGet(search_this_scoped, stored_paths[1]);
    assert(result_1 === 'setval1');
    const result_2 = objsearch.objGet(search_this_scoped, stored_paths[2]);
    assert(result_2 === 'setval2');
  });

  test('Complex path to simple path conversion.', async function () {
    const stored_paths: path_t[] = [];
    const objsearch = new ObjectSearch();
    await objsearch.run({
      object_to_search: search_this,
      on_key: async function (info: on_key_params_t) {},
      on_val: async function (info: on_val_params_t) {
        switch (info.value) {
          case 'symthere':
          case 'whats up':
          case 'here':
            stored_paths.push(info.path);
            break;
          default:
            break;
        }
      }
    });

    const simple_path_0 = objsearch.complexPathToSimplePath(stored_paths[0]);
    const simple_path_1 = objsearch.complexPathToSimplePath(stored_paths[1]);
    const simple_path_2 = objsearch.complexPathToSimplePath(stored_paths[2]);

    assert.deepStrictEqual(simple_path_0, ['foo', 'nested', 'something']);
    assert.deepStrictEqual(simple_path_1, [
      'foo',
      'nested',
      'nested_circular',
      'external_circular',
      'objsearch_cannot_convert_key_or_index',
      'symhello'
    ]);
    assert.deepStrictEqual(simple_path_2, [
      'foo',
      'nested',
      'nested_circular',
      'external_circular',
      'objsearch_cannot_convert_key_or_index',
      'testsymmap',
      'hi'
    ]);
  });

  test('Complex path conversion error throwing.', async function () {
    let cannot_convert_path: path_t = [];
    const objsearch = new ObjectSearch();
    await objsearch.run({
      object_to_search: search_this,
      on_key: async function (info: on_key_params_t) {},
      on_val: async function (info: on_val_params_t) {
        switch (info.value) {
          case 'symthere':
            cannot_convert_path = info.path;
            break;
          default:
            break;
        }
      }
    });
    let error_was_thrown = false;
    try {
      objsearch.complexPathToSimplePath(cannot_convert_path, {
        throw_on_cannot_convert: true
      });
    } catch (err) {
      error_was_thrown = true;
    }
    assert(error_was_thrown);
  });

  test('Simple path converted and used in objGet test.', async function () {
    const objsearch = new ObjectSearch();
    const simple_path: any[] = ['foo', 'nested', 'something'];
    const converted_complex_path: path_t =
      objsearch.simplePathToApproximatedComplexPath(simple_path);

    const lookup_result = objsearch.objGet(search_this, converted_complex_path);
    assert(lookup_result === 'here');
  });

  test('Catch objGet bad-paths exceptions test.', async function () {
    const objsearch = new ObjectSearch();
    const invalid_complex_path: path_t =
      objsearch.simplePathToApproximatedComplexPath(['foo', 'moo', 5]);
    let caught_error = false;
    try {
      objsearch.objGet(search_this, invalid_complex_path);
    } catch (err) {
      if (err instanceof Error) {
        assert((err?.cause as any).context === 'object_key');
        caught_error = true;
      }
    }
    assert(caught_error);
  });

  test('Catch objSet bad-path exceptions test.', async function () {
    const objsearch = new ObjectSearch();
    const invalid_complex_path: path_t =
      objsearch.simplePathToApproximatedComplexPath(['foo', 'moo', 5]);
    let caught_error = false;
    try {
      objsearch.objSet(search_this, invalid_complex_path, 'anyval');
    } catch (err) {
      if (err instanceof Error) {
        assert((err?.cause as any)?.context === 'object_key');
        caught_error = true;
      }
    }
    assert(caught_error);
  });

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% ObjectSearchUtils Tests %%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  test('Use ObjectSearchUtils to search for strings using string and regexp', async function () {
    const found_keys: string[] = [];
    const found_vals: string[] = [];

    const objsearch_utils = new ObjectSearchUtils(search_this);
    await objsearch_utils.searchStrings([/^sym/, 'here'], {
      key: async function (
        term: any,
        matched: string,
        info: on_key_params_t,
        objsearch: ObjectSearch
      ) {
        found_keys.push(matched);
      },
      val: async function (
        term: any,
        matched: string,
        info: on_val_params_t,
        objsearch: ObjectSearch
      ) {
        found_vals.push(matched);
      }
    });

    assert.deepStrictEqual(found_keys, ['symsome', 'symhello']);
    assert.deepStrictEqual(found_vals, ['here', 'symstring', 'symthere']);
  });

  test('Use ObjectSearchUtils to search for anything using deepEqual.', async function () {
    const objsearch_utils = new ObjectSearchUtils(search_this);
    const search_terms = [new Map([['hi', 'whats up']]), { baz: 1 }];
    await objsearch_utils.searchDeepEquals(search_terms, {
      key: async function (term: any, matched: any, info: on_key_params_t) {
        assert.deepStrictEqual(term, matched);
      },
      val: async function (term: any, matched: any, info: on_val_params_t) {
        assert.deepStrictEqual(term, matched);
      }
    });
  });

  test('Use ObjectSearchUtils to search for numerical values.', async function () {
    const objsearch_utils = new ObjectSearchUtils(search_this);
    const search_terms = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11];
    const found_keys: any = [];
    const found_vals: any = [];
    await objsearch_utils.searchNumbers(search_terms, {
      key: async function (term: any, matched: any, info: on_key_params_t) {
        found_keys.push(matched);
      },
      val: async function (term: any, matched: any, info: on_val_params_t) {
        found_vals.push(matched);
      }
    });

    // there should only ever be one found key, the reason for this
    // is because object keys are automatically stringified.  The
    // found key, is actually a map key, which can be a literal number type.
    assert.deepStrictEqual(found_keys, [10]);
    assert.deepStrictEqual(found_vals, [8, 11, 1, 2, 3, 5, 6]);
  });

  test('Use ObjectSearchUtils to search for whatis codes.', async function () {
    // create a basic whatis plugin to create a type for one of
    // our test maps.
    const plugin = function (params: {
      value: any;
      matchset: whatis_matches_t;
      addToMatchSet: any;
    }) {
      if (!params.matchset.codes.map) return;
      if (!deepEqual(params.value, new Map([['hi', 'whats up']]))) return;
      params.addToMatchSet(params.matchset, {
        code: 'hi_whatsup_map',
        type: 'object',
        description: 'Map test type.'
      });
    };

    const objsearch_utils = new ObjectSearchUtils(search_this, {
      whatis_plugins: [plugin]
    });
    const search_terms = ['hi_whatsup_map', 'object', 'map', 'set', 'number'];
    const found_terms: string[] = [];
    await objsearch_utils.searchWhatisCodes(search_terms, {
      key: async function (term: any, matched: any, info: on_key_params_t) {
        found_terms.push(term);
      },
      val: async function (term: any, matched: any, info: on_val_params_t) {
        found_terms.push(term);
      }
    });

    assert.deepStrictEqual(found_terms, [
      'number',
      'object',
      'number',
      'number',
      'object',
      'object',
      'object',
      'number',
      'object',
      'number',
      'number',
      'object',
      'number',
      'number',
      'object',
      'object',
      'object',
      'object',
      'object',
      'hi_whatsup_map'
    ]);
  });
})();
