/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Developer Note: If you're just copy pasting this example into your project,
// you need to change:  '@src/index' to  '@opsimathically/objectsearch'

import {
  ObjectSearchUtils,
  ObjectSearch,
  path_t,
  path_elem_t,
  on_key_params_t,
  on_val_params_t,
  simple_path_t,
  whatis_matches_t
} from '@src/index';

import { inspect } from 'node:util';

(async function () {
  /*
    IMPORTANT: 
    The concepts described for string searching below are mostly
    identical for searching other values/types.  We do not provide
    examples for each and every type for the sake of brevity.

    All of these basically work the same:
    searchStrings
    searchDeepEquals
    searchNumbers

    This works a litle bit different, so see example below:
    searchWhatisCodes
    */

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Basic Usage: String Searching %%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // this is the object we'll be searching for our examples
  const simple_searchable_obj = {
    hello: {
      there: {
        hi: 'how are you doing?'
      }
    }
  };

  // this will hold matching string keys and vals
  const matching_string_keys: string[] = [];
  const matching_string_vals: string[] = [];

  // Run a string search using a string literal and a regexp.
  const objsearch_utils = new ObjectSearchUtils(simple_searchable_obj);
  await objsearch_utils.searchStrings(['hello', /how are you/], {
    key: async function (
      // the matched search term: 'hello' or /how are you/ (regexp)
      term: any,
      // the key which matched
      matched: string,
      // in depth information about the key, including complex paths, and whatis information
      info: on_key_params_t,
      // a reference to the underlying ObjectSearch class which was used for this search.
      objsearch: ObjectSearch
    ) {
      // This callback is triggered when we find a string KEY matching any
      // of our search terms.
      matching_string_keys.push(matched);
    },
    val: async function (
      term: any,
      // for value callbacks, this will be a value instead of a key, all other properties
      // will be the same as for the key callback
      matched: string,
      info: on_key_params_t,
      objsearch: ObjectSearch
    ) {
      // This callback is triggered when we find a string VALUE matching any
      // of our search terms.
      matching_string_vals.push(matched);
    }
  });

  /* 
  matching_string_keys: [ 'hello' ]
  matching_string_vals: [ 'how are you doing?' ]
  */

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Converting Complex Paths To Simple Paths %%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // When items are found, their path is stored in info.path.  This
  // path is a complex path.  Using this, you should be able use
  // objsearch.objSet()/objsearch.objGet() to get and set just about anything,
  // anywhere, in any object.
  //
  // However, complex paths are unweildly to look at, so in the following
  // example we convert the complex paths to simple paths.  These paths
  // will be simple arrays of strings/numbers so you can visualize
  // things easier:
  // e.g.
  //
  //   [ 'hello' ]
  //   [ 'hello', 'there', 'hi' ]
  //
  // It's IMPORTANT to note however, that significant information is lost
  // during the conversion, and some things simply cannot reliably be
  // converted to a simple path (nested maps/sets/symbols etc).  If you
  // need reliable paths, preserve complex paths.  If you want to visualize
  // paths, or are working with very simple objects, it's fine to simplify
  // them.

  const simple_paths: simple_path_t[] = [];
  await objsearch_utils.searchStrings(['hello', /how are you/], {
    key: async function (
      term: any,
      matched: string,
      info: on_key_params_t,
      objsearch: ObjectSearch
    ) {
      simple_paths.push(objsearch.complexPathToSimplePath(info.path));
    },
    val: async function (
      term: any,
      matched: string,
      info: on_key_params_t,
      objsearch: ObjectSearch
    ) {
      simple_paths.push(objsearch.complexPathToSimplePath(info.path));
    }
  });

  // simple_paths: [ [ 'hello' ], [ 'hello', 'there', 'hi' ] ]

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Setting/Getting Using Complex Paths %%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // this will hold a path we preserve from within the callback
  let preserved_path: path_t = [];

  await objsearch_utils.searchStrings(['hello', /how are you/], {
    val: async function (
      term: any,
      matched: string,
      info: on_key_params_t,
      objsearch: ObjectSearch
    ) {
      // set value using path from within objsearch
      if (term instanceof RegExp)
        if (term.toString() === /how are you/.toString()) {
          objsearch.objSet(simple_searchable_obj, info.path, "i'm doing fine!");
          preserved_path = info.path;
        }
    }
  });

  // simple_searchable_obj: { hello: { there: { hi: "i'm doing fine!" } } }

  // now change the value after using preserved path:
  new ObjectSearch().objSet(
    simple_searchable_obj,
    preserved_path,
    "that's great!"
  );

  // simple_searchable_obj: { hello: { there: { hi: "that's great!" } } }

  // now lookup the value using the preserved path
  const looked_up_value_from_path = new ObjectSearch().objGet(
    simple_searchable_obj,
    preserved_path
  );

  // looked_up_value_from_path: that's great!

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Searching For Whatis Codes %%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // whatis, is a utility I developed for determining what something is
  //
  // NPM: @opsimathically/whatis
  //
  // It supports extensible plugins so that you can define your own criteria
  //  for what something is by giving it  a code (read: string value).
  //
  // Both ObjectSearch and ObjectSWearchUtils can be provided whatis plugins
  // so that searching by code is simple and easy.

  // in this example we'll be searching this data
  const some_other_object_to_search: any = {
    something: {
      nested: {
        with: {
          a: new Map<any, any>([
            ['url', 'http://www.something.com/'],
            ['http://mapkeyurl.net', true]
          ]),
          and_a: new Set<any>(['https://seturl.org'])
        }
      }
    },
    also: 'https://www.otherthing.com'
  };

  // create a whatis plugin that looks for strings that start with
  // "http", mark them with the code "potential_http_url"
  const httpstring_plugin = function (params: {
    value: any;
    matchset: whatis_matches_t;
    addToMatchSet: any;
  }) {
    // if it's not a string, and doesn't start with http, just return
    if (!params.matchset.codes.string) return;
    if (params.value.indexOf('http') !== 0) return;

    // if our criteria is met, add the match set
    params.addToMatchSet(params.matchset, {
      code: 'potential_http_url',
      type: 'string',
      description: 'String that starts with http, maybe a URL.'
    });
  };

  // create another search utils using the plugin
  const objsearch_utils_whatis = new ObjectSearchUtils(
    some_other_object_to_search,
    {
      whatis_plugins: [httpstring_plugin]
    }
  );

  // this will just aggregate things that match our custom whatis code
  const potential_urls: string[] = [];

  // search by whatis code (will match on our plugin custom code)
  await objsearch_utils_whatis.searchWhatisCodes(['potential_http_url'], {
    key: async function (term: any, matched: any, info: on_key_params_t) {
      if (!info.whatis.key.codes[term]) return;
      potential_urls.push(matched);
    },
    val: async function (term: any, matched: any, info: on_val_params_t) {
      if (!info.whatis.value.codes[term]) return;
      potential_urls.push(matched);
    }
  });

  /*
  potential_urls:
  [
    'http://www.something.com/',
    'http://mapkeyurl.net',
    'https://seturl.org',
    'https://www.otherthing.com'
  ]
  */
})();
