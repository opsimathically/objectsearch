/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ObjectSearch,
  on_key_params_t,
  on_val_params_t
} from '@src/ObjectSearch.class';

import { whatis } from '@opsimathically/whatis';
import { deepEqual } from 'fast-equals';

/**
 * Utilities to make working with objectsearch easier to apply to general
 * tasks.
 */
class ObjectSearchUtils {
  // thing which will be searched
  search_this: any;

  // whatis plugins which will be sent to ObjectSearch
  whatis_plugins: any[] = [];

  constructor(search_this: any, options?: { whatis_plugins: any[] }) {
    if (options) this.whatis_plugins = options?.whatis_plugins;
    this.search_this = search_this;
  }

  /**
   * Search for strings, using either direct string matching, or regular expression terms.
   */
  async searchStrings(
    search_terms: (string | RegExp)[],
    cbs: {
      key?: any;
      val?: any;
    }
  ) {
    const objsearch_utils_ref = this;
    const objsearch = new ObjectSearch({
      whatis_plugins: objsearch_utils_ref.whatis_plugins
    });
    await objsearch.run({
      object_to_search: objsearch_utils_ref.search_this,
      on_key: async function (info: on_key_params_t) {
        if (!cbs?.key) return;
        if (!info?.whatis?.key?.codes?.string) return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          const term_is = whatis(term);
          if (term_is?.codes?.regexp) {
            if ((term as RegExp).test(info.key as string)) {
              return await cbs.key(term, info.key, info, objsearch);
            }
          } else if (term_is?.codes?.string) {
            if (term === info.key)
              return await cbs.key(term, info.key, info, objsearch);
          }
        }
      },
      on_val: async function (info: on_val_params_t) {
        if (!cbs?.val) return;
        if (!info?.whatis?.value?.codes?.string) return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          const term_is = whatis(term);
          if (term_is?.codes?.regexp) {
            if ((term as RegExp).test(info.value as string)) {
              return await cbs.val(term, info.value, info, objsearch);
            }
          } else if (term_is?.codes?.string) {
            if (term === info.value)
              return await cbs.val(term, info.value, info, objsearch);
          }
        }
      }
    });

    return true;
  }

  /**
   * Search for anything, must match deep equals.  Uses fast-equal npm package for
   * deep equal matching.
   */
  async searchDeepEquals(
    search_terms: any[],
    cbs: {
      key?: any;
      val?: any;
    }
  ) {
    const objsearch_utils_ref = this;
    const objsearch = new ObjectSearch({
      whatis_plugins: objsearch_utils_ref.whatis_plugins
    });
    await objsearch.run({
      object_to_search: objsearch_utils_ref.search_this,
      on_key: async function (info: on_key_params_t) {
        if (!cbs?.key) return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          if (deepEqual(info.key, term)) {
            return cbs.key(term, info.key, info, objsearch);
          }
        }
      },
      on_val: async function (info: on_val_params_t) {
        if (!cbs?.val) return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          if (deepEqual(info.value, term)) {
            return cbs.val(term, info.value, info, objsearch);
          }
        }
      }
    });

    return true;
  }

  /**
   * Search for numbers (or bigints)
   */
  async searchNumbers(
    search_terms: (number | bigint)[],
    cbs: {
      key?: any;
      val?: any;
    }
  ) {
    const objsearch_utils_ref = this;
    const objsearch = new ObjectSearch({
      whatis_plugins: objsearch_utils_ref.whatis_plugins
    });
    await objsearch.run({
      object_to_search: objsearch_utils_ref.search_this,
      on_key: async function (info: on_key_params_t) {
        if (!cbs?.key) return;
        if (!info.whatis.key.codes.number && !info.whatis.key.codes.bigint)
          return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          if (info.key === term) {
            return cbs.key(term, info.key, info, objsearch);
          }
        }
      },
      on_val: async function (info: on_val_params_t) {
        if (!cbs?.val) return;
        if (!info.whatis.value.codes.number && !info.whatis.value.codes.bigint)
          return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          if (info.value === term) {
            return cbs.val(term, info.value, info, objsearch);
          }
        }
      }
    });

    return true;
  }

  /**
   * Search for whatis codes.
   */
  async searchWhatisCodes(
    search_terms: string[],
    cbs: {
      key?: any;
      val?: any;
    }
  ) {
    const objsearch_utils_ref = this;
    const objsearch = new ObjectSearch({
      whatis_plugins: objsearch_utils_ref.whatis_plugins
    });
    await objsearch.run({
      object_to_search: objsearch_utils_ref.search_this,
      on_key: async function (info: on_key_params_t) {
        if (!cbs?.key) return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          if (info?.whatis?.key?.codes[term])
            return cbs.key(term, info.key, info, objsearch);
        }
      },
      on_val: async function (info: on_val_params_t) {
        if (!cbs?.val) return;

        for (let idx = 0; idx < search_terms.length; idx++) {
          const term = search_terms[idx];
          if (info?.whatis?.value?.codes[term]) {
            return cbs.val(term, info.value, info, objsearch);
          }
        }
      }
    });

    return true;
  }
}

export { ObjectSearchUtils };
