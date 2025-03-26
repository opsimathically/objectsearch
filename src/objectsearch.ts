/* eslint-disable no-debugger */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert';

/*
Usage Examples: searchObjectValues and searchObjectKeys

    // this can be string or regex
    var search_for_value = /blah/;

    // this can be any object
    var search_this = 
    {
        moo:
        {
            cow:
            [
                "blah"
            ],
            goes:
            {
                moo: "blah",
                gobble:
                {
                    taddd: "blah",
                    maddd: [0, "abc", "blah"]
                }
            },
            also_blah: "blah"
        }
    };

    // search object for values
    var search_results = custom_utils.searchObjectValues(search_this, search_for_value);
    await custom_utils.notice({search_results: search_results});

    var found_val = custom_utils.getObjectElementByPath(search_this, search_results.findings[2]);
    custom_utils.notice({found_val: found_val});

    // --- key tests -----
    var search_key_results = custom_utils.searchObjectKeys(search_this, "also_blah");
    await custom_utils.notice({search_key_results: search_key_results});

    var found_key_val = custom_utils.getObjectElementByPath(search_this, search_key_results.findings[0]);
    custom_utils.notice({found_key_val: found_key_val});

*/

// search object values, the results of the search will be returned in the aggregate_findings object.
const searchObjectValues = function (
  search_this: any,
  search_for_value: any,
  aggregate_findings: any = null,
  current_path: any = null
) {
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Aggregate Findings %%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  if (aggregate_findings === null) {
    aggregate_findings = {
      depth: 0,
      match_was_found: false,
      matches: 0,
      findings: []
    };
  } else {
    aggregate_findings.depth++;
  }

  // this holds our current path through the object
  if (current_path === null) current_path = [];

  // Always reset last index in regex, this is required, as regular expression states
  // are stateful, which would result in bad matches.
  if (search_for_value instanceof RegExp) search_for_value.lastIndex = 0;

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Run Value Search/Checks %%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // search for a value
  if (search_for_value instanceof RegExp) {
    if (typeof search_this === 'string') {
      // run regex check
      if (search_for_value.test(search_this) === true) {
        // mark that a match was found and increment match counter
        aggregate_findings.match_was_found = true;
        aggregate_findings.matches++;

        // reparse the path to prevent reference stacking
        const reparsed_path = JSON.parse(JSON.stringify(current_path));
        aggregate_findings.findings.push(reparsed_path);
      }
    }
  } else if (search_for_value === search_this) {
    // mark that a match was found and increment match counter
    aggregate_findings.match_was_found = true;
    aggregate_findings.matches++;

    // reparse the path to prevent reference stacking
    const reparsed_path = JSON.parse(JSON.stringify(current_path));
    aggregate_findings.findings.push(reparsed_path);
  } else if (typeof search_for_value === 'function') {
    // check test match
    const test_match = search_for_value({
      value: search_this,
      current_path: current_path,
      aggregate_findings: aggregate_findings
    });

    // if the match succeeded, add to aggregate findings
    if (test_match === true) {
      // mark that a match was found and increment match counter
      aggregate_findings.match_was_found = true;
      aggregate_findings.matches++;

      // reparse the path to prevent reference stacking
      const reparsed_path = JSON.parse(JSON.stringify(current_path));
      aggregate_findings.findings.push(reparsed_path);
    }
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Handle Recursing/Paths %%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // check if the item is an array, if so, convert it
  if (Array.isArray(search_this) === true) {
    // create conversion array
    const search_array: any[] = [];
    for (
      let search_array_idx = 0;
      search_array_idx < search_this.length;
      search_array_idx++
    ) {
      // gather value
      const search_array_value = search_this[search_array_idx];

      // recurse and push result into the returnable conversion array
      current_path.push(search_array_idx);
      searchObjectValues(
        search_array_value,
        search_for_value,
        aggregate_findings,
        current_path
      );
      current_path.pop(search_array_idx);
    }

    // if we're at depth 0, just return the findings as the search is now complete
    if (aggregate_findings.depth === 0) return aggregate_findings;

    // return the conversion array
    aggregate_findings.depth--;
    return search_array;
  }

  // if it's an object, iterate through it's keys and attempt to recurse
  if (search_this instanceof RegExp) {
    return search_this;
  } else if (search_this instanceof Object) {
    // this will hold the converted recursed object
    const search_object = {};

    // gather keys and iterate threm
    const search_object_keys = Object.keys(search_this);
    for (let idx = 0; idx < search_object_keys.length; idx++) {
      // gather conversion key and check hasOwnProperty
      const search_object_key = search_object_keys[idx];
      current_path.push(search_object_key);
      if (search_this.hasOwnProperty(search_object_key)) {
        searchObjectValues(
          search_this[search_object_key],
          search_for_value,
          aggregate_findings,
          current_path
        );
      }
      current_path.pop(search_object_key);
    }

    // if we're at depth 0, just return the findings as the search is now complete
    if (aggregate_findings.depth === 0) return aggregate_findings;

    // return the converted object
    aggregate_findings.depth--;
    return search_object;
  }

  // if we're at depth 0, just return the findings as the search is now complete
  if (aggregate_findings.depth === 0) {
    return aggregate_findings;
  }

  // just return the item if there's nothing to do
  aggregate_findings.depth--;
  return search_this;
};

// search object keys, the results of the search will be returned in the aggregate_findings object.
const searchObjectKeys = function (
  search_this: any,
  search_for_key: any,
  aggregate_findings: any = null,
  current_path: any = null
) {
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Aggregate Findings %%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  if (aggregate_findings === null) {
    aggregate_findings = {
      depth: 0,
      match_was_found: false,
      matches: 0,
      findings: []
    };
  } else {
    aggregate_findings.depth++;
  }

  // this holds our current path through the object
  if (current_path === null) current_path = [];

  // Always reset last index in regex, this is required, as regular expression states
  // are stateful, which would result in bad matches.
  if (search_for_key instanceof RegExp) search_for_key.lastIndex = 0;

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Handle Recursing/Paths %%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // process/recurse arrays
  if (Array.isArray(search_this) === true) {
    // create conversion array
    const search_array: any[] = [];
    for (
      let search_array_idx = 0;
      search_array_idx < search_this.length;
      search_array_idx++
    ) {
      // gather value
      const search_array_value = search_this[search_array_idx];

      // recurse and push result into the returnable conversion array
      current_path.push(search_array_idx);
      searchObjectKeys(
        search_array_value,
        search_for_key,
        aggregate_findings,
        current_path
      );
      current_path.pop(search_array_idx);
    }

    // if we're at depth 0, just return the findings as the search is now complete
    if (aggregate_findings.depth === 0) return aggregate_findings;

    // return the conversion array
    aggregate_findings.depth--;
    return search_array;
  }

  // if it's an object, iterate through it's keys and attempt to recurse
  if (search_this instanceof RegExp) {
    return search_this;
  }

  // process objects
  if (search_this instanceof Object) {
    // this will hold the converted recursed object
    const search_object = {};

    // gather keys and iterate threm
    const search_object_keys = Object.keys(search_this);
    for (let idx = 0; idx < search_object_keys.length; idx++) {
      // gather conversion key and check hasOwnProperty
      const search_object_key = search_object_keys[idx];

      // place key in path before running searches
      current_path.push(search_object_key);

      // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
      // %%% Run Object Key Search/Checks %%%
      // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

      // search for a value
      if (search_for_key instanceof RegExp) {
        // Always reset last index in regex, this is required, as regular expression states
        // are stateful, which would result in bad matches.
        if (search_for_key instanceof RegExp) search_for_key.lastIndex = 0;

        if (typeof search_object_key === 'string') {
          // run regex check
          if (search_for_key.test(search_object_key) === true) {
            // mark that a match was found and increment match counter
            aggregate_findings.match_was_found = true;
            aggregate_findings.matches++;

            // notice({current_path: current_path});

            // ensure findings are an array
            if (Array.isArray(aggregate_findings.findings) !== true)
              aggregate_findings.findings = [];

            // reparse the path to prevent reference stacking
            const reparsed_path = JSON.parse(JSON.stringify(current_path));
            aggregate_findings.findings.push(reparsed_path);
          }
        }
      } else if (search_for_key === search_object_key) {
        // mark that a match was found and increment match counter
        aggregate_findings.match_was_found = true;
        aggregate_findings.matches++;

        // notice({current_path: current_path});

        // ensure findings are an array
        if (Array.isArray(aggregate_findings.findings) !== true)
          aggregate_findings.findings = [];

        // reparse the path to prevent reference stacking
        const reparsed_path = JSON.parse(JSON.stringify(current_path));
        aggregate_findings.findings.push(reparsed_path);
      } else if (typeof search_for_key === 'function') {
        // check test match
        const test_match = search_for_key({
          key: search_object_key,
          value: search_this[search_object_key],
          parent_obj: search_this,
          current_path: current_path,
          aggregate_findings: aggregate_findings
        });

        // if the match succeeded, add to aggregate findings
        if (test_match === true) {
          // mark that a match was found and increment match counter
          aggregate_findings.match_was_found = true;
          aggregate_findings.matches++;

          // reparse the path to prevent reference stacking
          const reparsed_path = JSON.parse(JSON.stringify(current_path));
          aggregate_findings.findings.push(reparsed_path);
        }
      }

      // ---- continue recursing after searches -----

      if (search_this.hasOwnProperty(search_object_key)) {
        searchObjectKeys(
          search_this[search_object_key],
          search_for_key,
          aggregate_findings,
          current_path
        );
      }

      // remove search key
      current_path.pop(search_object_key);
    }

    // if we're at depth 0, just return the findings as the search is now complete
    if (aggregate_findings.depth === 0) return aggregate_findings;

    // return the converted object
    aggregate_findings.depth--;
    return search_object;
  }

  // if we're at depth 0, just return the findings as the search is now complete
  if (aggregate_findings.depth === 0) {
    return aggregate_findings;
  }

  // just return the item if there's nothing to do
  aggregate_findings.depth--;
  return search_this;
};

// convert search ojbect results to mpaths
const convertSearchObjectResultsToMPaths = function (search_results: any) {
  if (search_results.matches <= 0) return null;

  // check search results
  if (Array.isArray(search_results.findings) !== true) return null;

  // iterate
  const mpath_search_results: any[] = [];
  for (let idx = 0; idx < search_results.findings.length; idx++) {
    // add search results
    mpath_search_results.push(search_results.findings[idx].join('.'));
  }

  // return the converted
  return mpath_search_results;
};

// get value using an array path
const getValueUsingArrayPath = function (record: any, array_path: any) {
  // iterate through record using reduce and gather the values
  let found_val = null;
  let errored = false;
  array_path.reduce(function (record: any, item: any) {
    try {
      found_val = record[item];
    } catch (err) {
      errored = true;
    }
    if (errored === true) return null;
    return record[item];
  }, record);

  if (errored) {
    throw new Error('NO_SUCH_PATH');
    return;
  }

  // return the found value
  return found_val;
};

// Execute function on an array path.
const executeFunctionOnArrayPath = function (
  record: any,
  array_path: any,
  callback_func: any
) {
  // TODO
  debugger;
  assert(false);
};

// attempt to remove an item at a path
const replaceStringValueUsingArrayPath = function (
  record: any,
  array_path: any,
  replace_this: any,
  with_this: any
) {
  // iterate through record using reduce and gather the values
  let found_val = null;
  array_path.reduce(function (record: any, item: any) {
    found_val = record[item];
    if (typeof found_val === 'string') {
      record[item] = record[item].replaceAll(replace_this, with_this);
    }
    return record[item];
  }, record);

  // return the found value
  return true;
};

// this will attempt to nullify/delete keyed items using an array path
const removeItemUsingArrayPath = function (record: any, array_path: any) {
  // ensure we have a record
  if (!record) return false;
  if (!array_path) return false;

  let curr_item = record;
  for (let idx = 0; idx < array_path.length; idx++) {
    const curr_key = array_path[idx];
    if (idx + 1 === array_path.length) {
      try {
        curr_item[curr_key] = null;
      } catch (err) {}

      try {
        delete curr_item[curr_key];
      } catch (err) {}
      return true;
    }
    curr_item = curr_item[curr_key];
  }

  // return indicating success
  return true;
};

// set a value provided an array path
const setValueUsingArrayPath = function (
  record: any,
  array_path: any,
  new_value: any
) {
  // ensure we have a record
  if (!record) return false;
  if (!array_path) return false;

  let curr_item = record;
  for (let idx = 0; idx < array_path.length; idx++) {
    const curr_key = array_path[idx];
    if (idx + 1 === array_path.length) {
      curr_item[curr_key] = new_value;
      return true;
    }
    curr_item = curr_item[curr_key];
  }

  // return indicating success
  return true;
};

// Set a value and create missing paths provided an array path,
// The difference between this and setValueUsingArrayPath is that
// this function will attempt to create an empty object if it encounters
// an empty value in a key path.  This method is dangerous in that it
// can corrupt a tree by overwriting valid, but empty values, so
// you should use it with care and knowledge of what's happening.
const setValueAndCreateMissingPathsUsingArrayPath = function (
  record: any,
  array_path: any,
  new_value: any
) {
  // ensure we have a record
  if (!record) return false;
  if (!array_path) return false;

  let curr_item = record;
  for (let idx = 0; idx < array_path.length; idx++) {
    const curr_key = array_path[idx];
    if (idx + 1 === array_path.length) {
      curr_item[curr_key] = new_value;
      return true;
    }

    // create an empty object for the path if
    // it's currently missing.
    if (curr_item[curr_key] === undefined) curr_item[curr_key] = {};

    curr_item = curr_item[curr_key];
  }

  // return indicating success
  return true;
};

// this will attempt to nullify/delete keyed items using an array path
const executeFunctionOnItemUsingArrayPath = async function (
  record: any,
  array_path: any,
  function_cb: any
) {
  // ensure we have a record
  if (!record) return false;
  if (!array_path) return false;

  let curr_item = record;
  for (let idx = 0; idx < array_path.length; idx++) {
    const curr_key = array_path[idx];
    if (idx + 1 === array_path.length) {
      // set key via function
      const callback_ret = await function_cb({
        curr_object: curr_item,
        path: array_path,
        key: array_path[idx],
        value: curr_item[curr_key]
      });

      // if the overwrite flag is set, perform overwrite.  We do this
      // specifically because an overwrite can be any value, including
      // empty/null values.
      if (callback_ret?.overwrite === true) {
        curr_item[curr_key] = callback_ret.value;
      }

      // return indicating success (path found, callback run)
      return true;
    }
    curr_item = curr_item[curr_key];
  }

  // return false if no action was taken
  return false;
};

// search keys and get values (any matching key will have its value added to
// the stack of returned values, useful for searching large collections of nested
// objects for values attached to keys of various depth and occurance.)
const searchObjectKeysAndReturnFoundValuesAsArray = function (
  search_this: any,
  search_for_key: any,
  options: any = {}
) {
  // search object keys
  const search_results = searchObjectKeys(search_this, search_for_key);
  if (!search_results) return null;
  if (search_results.matches <= 0) return null;

  // iterate findings and get values
  const ret_array = [];
  for (let idx = 0; idx < search_results.findings.length; idx++) {
    // gather array path
    const array_path = search_results.findings[idx];

    // get the value at the path using array path
    const found_value = getValueUsingArrayPath(search_this, array_path);

    // skip undefined values
    if (found_value === undefined) continue;

    if (options.distinct === true) {
      if (ret_array.indexOf(found_value) === -1) ret_array.push(found_value);
    } else {
      ret_array.push(found_value);
    }
  }

  // return the found values
  return ret_array;
};

export {
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
};
