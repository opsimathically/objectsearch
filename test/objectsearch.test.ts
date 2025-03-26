/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'node:test';
import assert from 'node:assert';

import {
  searchObjectValues,
  searchObjectKeys,
  convertSearchObjectResultsToMPaths,
  getValueUsingArrayPath,
  executeFunctionOnArrayPath,
  replaceStringValueUsingArrayPath,
  removeItemUsingArrayPath,
  setValueUsingArrayPath,
  setValueAndCreateMissingPathsUsingArrayPath,
  executeFunctionOnItemUsingArrayPath,
  searchObjectKeysAndReturnFoundValuesAsArray
} from '@src/objectsearch';

import { whatis } from '@opsimathically/whatis';
import { ObjectSearch } from '@src/ObjectSearch.class';

(async function () {
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Class/Event Based Tests %%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  test('Search using SearchObject class.', async function () {});

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Functional Old Tests %%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  test('searchObjectValues using string.', async function () {
    const search_for_value: any = 'blah';
    const search_this: any = {
      moo: {
        cow: ['blah'],
        goes: {
          moo: 'blah',
          gobble: {
            taddd: 'blah',
            maddd: [0, 'abc', 'blah']
          }
        },
        also_blah: 'blahshouldmatchregex'
      }
    };

    // run object search
    const search_results = searchObjectValues(search_this, search_for_value);
    assert(search_results.match_was_found === true);
    assert(search_results.matches === 4);
    assert.deepStrictEqual(['moo', 'cow', 0], search_results.findings[0]);
  });

  test('searchObjectValues using regexp.', async function () {
    const search_for_value: any = /blah/;
    const search_this: any = {
      moo: {
        cow: ['blah'],
        goes: {
          moo: 'blah',
          gobble: {
            taddd: 'blah',
            maddd: [0, 'abc', 'blah']
          },
          funconly: 'heythere'
        },
        also_blah: 'blahshouldmatchregex'
      }
    };
    const search_results = searchObjectValues(search_this, search_for_value);
    assert(search_results.match_was_found === true);
    assert(search_results.matches === 5);
    assert.deepStrictEqual(['moo', 'cow', 0], search_results.findings[0]);
  });

  test('searchObjectValues using function.', async function () {
    const search_for_value: any = function (params: {
      value: any;
      current_path: any;
      aggregate_findings: any;
    }) {
      if (params.value === 'blah') return true;
      if (params.value === 'heythere') return true;
    };

    // this can be any object
    const search_this: any = {
      moo: {
        cow: ['blah'],
        goes: {
          moo: 'blah',
          gobble: {
            taddd: 'blah',
            maddd: [0, 'abc', 'blah']
          },
          funconly: 'heythere'
        },
        also_blah: 'blahshouldmatchregex'
      }
    };

    // run object search
    const search_results = searchObjectValues(search_this, search_for_value);
    assert(search_results.match_was_found === true);
    assert(search_results.matches === 5);
    assert.deepStrictEqual(
      ['moo', 'goes', 'funconly'],
      search_results.findings[4]
    );
  });

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Key Searches %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  test('searchObjectKeys using string.', async function () {
    const search_for_key: any = 'also_blah';
    const search_this: any = {
      moo: {
        cow: ['blah'],
        goes: {
          moo: 'blah',
          gobble: {
            taddd: 'blah',
            maddd: [0, 'abc', 'blah']
          },
          funconly: 'heythere'
        },
        also_blah: 'blahshouldmatchregex'
      }
    };
    const search_results = searchObjectKeys(search_this, search_for_key);
    assert(search_results.match_was_found === true);
    assert(search_results.matches === 1);
    assert.deepStrictEqual(['moo', 'also_blah'], search_results.findings[0]);
  });

  test('searchObjectKeys using regexp.', async function () {
    const search_for_key: any = /blah/;
    const search_this: any = {
      moo: {
        cow: ['blah'],
        goes: {
          moo: 'blah',
          gobble: {
            taddd: 'blah',
            maddd: [0, 'abc', 'blah']
          },
          blahkey: 'hello',
          funconly: 'heythere'
        },
        also_blah: 'blahshouldmatchregex'
      }
    };
    const search_results = searchObjectKeys(search_this, search_for_key);
    assert(search_results.match_was_found === true);
    assert(search_results.matches === 2);
    assert.deepStrictEqual(['moo', 'also_blah'], search_results.findings[1]);
  });

  test('searchObjectKeys using function.', async function () {
    const search_for_key: any = function (params: {
      key: any;
      value: any;
      parent_obj: any;
      current_path: any;
      aggregate_findings: any;
    }) {
      if (typeof params.key === 'string') {
        if (params.key.indexOf('blah') !== -1) return true;
        if (params.key.indexOf('func') !== -1) return true;
      }
    };

    const search_this: any = {
      moo: {
        cow: ['blah'],
        goes: {
          moo: 'blah',
          gobble: {
            taddd: 'blah',
            maddd: [0, 'abc', 'blah']
          },
          blahkey: 'hello',
          funconly: 'heythere'
        },
        also_blah: 'blahshouldmatchregex'
      }
    };
    const search_results = searchObjectKeys(search_this, search_for_key);
    assert(search_results.match_was_found === true);
    console.debug(search_results);
    assert(search_results.matches === 3);
    assert.deepStrictEqual(
      ['moo', 'goes', 'funconly'],
      search_results.findings[1]
    );
  });
})();
