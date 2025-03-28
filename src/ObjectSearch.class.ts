/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { whatis } from '@opsimathically/whatis';

type path_context_t =
  | 'array_index'
  | 'map_key'
  | 'set_index'
  | 'object_key'
  | 'object_symbol';

type path_elem_t = {
  parent: any;
  context: path_context_t;
  elem: any;
  whatis_set: any;
};
type path_t = path_elem_t[];

type simple_path_elem_t = string | number;
type simple_path_t = simple_path_elem_t[];

type on_key_params_t = {
  objsearch_ref: ObjectSearch;
  parent: unknown;
  key: any;
  value: unknown;
  whatis: {
    key: any;
    value: any;
    parent: any;
  };
  path_elem: path_elem_t;
  path: path_elem_t[];
};

type on_val_params_t = {
  objsearch_ref: ObjectSearch;
  parent: unknown;
  key: any;
  value: unknown;
  whatis: {
    key: any;
    value: any;
    parent: any;
  };
  path_elem: path_elem_t;
  path: path_elem_t[];
};

type recurse_key_callback_t = (
  info: on_key_params_t
) => Promise<boolean | void>;

type recurse_val_callback_t = (
  info: on_val_params_t
) => Promise<boolean | void>;

type objsearch_run_result_t = {
  counts: any;
};

class ObjectSearch {
  whatis_plugins: any[] = [];
  constructor(options?: { whatis_plugins: any[] }) {
    if (options) this.whatis_plugins = options?.whatis_plugins;
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Object Get/Set Via Paths %%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  /**
   * Get a value within an object using a path generated via object search.
   */
  objGet(object_to_get_from: any, path_lookup: path_t) {
    if (!Array.isArray(path_lookup))
      throw new Error('objget_path_lookup_invalid');
    if (path_lookup.length <= 0) throw new Error('objget_path_lookup_empty');

    let val = object_to_get_from;
    for (let idx = 0; idx < path_lookup.length; idx++) {
      const path_elem = path_lookup[idx];
      if (typeof path_elem !== 'object') {
        throw new Error('objget_path_elem_not_obj');
      }
      if (typeof path_elem?.context !== 'string') {
        throw new Error('objget_path_elem_no_context');
      }

      let has_errored = false;
      switch (path_elem.context) {
        case 'array_index':
          try {
            val = val[path_elem.elem];
          } catch (err) {
            has_errored = true;
          }
          if (has_errored)
            throw new Error('objget_invalid_path_element', {
              cause: {
                path_lookup: path_lookup,
                bad_path_elem: path_elem,
                context: 'array_index'
              }
            });
          break;

        case 'map_key':
          try {
            val = (val as Map<any, any>).get(path_elem.elem);
          } catch (err) {
            has_errored = true;
          }
          if (has_errored)
            throw new Error('objget_invalid_path_detected', {
              cause: {
                path_lookup: path_lookup,
                bad_path_elem: path_elem,
                context: 'map_key'
              }
            });

          break;

        case 'set_index':
          try {
            val = Array.from(val)[path_elem.elem];
          } catch (err) {
            has_errored = true;
          }
          if (has_errored)
            throw new Error('objget_invalid_path_detected', {
              cause: {
                path_lookup: path_lookup,
                bad_path_elem: path_elem,
                context: 'set_index'
              }
            });
          break;

        case 'object_key':
          try {
            val = val[path_elem.elem];
          } catch (err) {
            has_errored = true;
          }
          if (has_errored)
            throw new Error('objget_invalid_path_detected', {
              cause: {
                path_lookup: path_lookup,
                bad_path_elem: path_elem,
                context: 'object_key'
              }
            });
          break;

        case 'object_symbol':
          try {
            val = val[path_elem.elem];
          } catch (err) {
            has_errored = true;
          }
          if (has_errored)
            throw new Error('objget_invalid_path_detected', {
              cause: {
                path_lookup: path_lookup,
                bad_path_elem: path_elem,
                context: 'object_symbol'
              }
            });
          break;

        default:
          throw new Error('objget_invalid_object_get_path_context');
      }
    }
    return val;
  }

  /**
   * Set a value within an object using a path generated via object search.
   */
  objSet(object_to_get_from: any, path_lookup: path_t, set_val: any) {
    if (!Array.isArray(path_lookup))
      throw new Error('objset_path_lookup_invalid');
    if (path_lookup.length <= 0) throw new Error('objset_path_lookup_empty');
    let val = object_to_get_from;

    for (let idx = 0; idx < path_lookup.length; idx++) {
      const path_elem = path_lookup[idx];
      if (typeof path_elem !== 'object') {
        throw new Error('objset_path_elem_not_obj');
      }
      if (typeof path_elem?.context !== 'string') {
        throw new Error('objset_path_elem_no_context');
      }
      let has_errored = false;
      switch (path_elem.context) {
        case 'array_index':
          if (idx === path_lookup.length - 1) {
            try {
              val[path_elem.elem] = set_val;
            } catch (err) {
              has_errored = true;
            }
            if (has_errored) {
              throw new Error('objset_value_assignment_failed', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'array_index'
                }
              });
            }
            return true;
          } else {
            try {
              val = val[path_elem.elem];
            } catch (err) {
              has_errored = true;
            }
            if (has_errored)
              throw new Error('objset_invalid_path_detected', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'array_index'
                }
              });
          }
          break;

        case 'map_key':
          if (idx === path_lookup.length - 1) {
            try {
              (path_elem.parent as Map<any, any>).set(path_elem.elem, set_val);
            } catch (err) {
              has_errored = true;
            }
            if (has_errored) {
              throw new Error('objset_value_assignment_failed', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'map_key'
                }
              });
            }
            return true;
          } else {
            try {
              val = (val as Map<any, any>).get(path_elem.elem);
            } catch (err) {
              has_errored = true;
            }
            if (has_errored)
              throw new Error('objset_invalid_path_detected', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'map_key'
                }
              });
          }
          break;

        case 'set_index':
          if (idx === path_lookup.length - 1) {
            if (!path_elem?.whatis_set?.parent?.codes?.set) {
              throw new Error('objset_set_index_is_not_within_set');
            }

            try {
              const set_vals = Array.from(path_elem.parent);
              path_elem.parent.clear();
              set_vals[path_elem.elem] = set_val;

              // readd items to existing set, in order, do not
              // create a new set.
              for (
                let set_arr_idx = 0;
                set_arr_idx < set_vals.length;
                set_arr_idx++
              ) {
                path_elem.parent.add(set_vals[set_arr_idx]);
              }
            } catch (err) {
              has_errored = true;
            }
            if (has_errored) {
              throw new Error('objset_value_assignment_failed', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'set_index'
                }
              });
            }
            return true;
          } else {
            try {
              val = Array.from(val)[path_elem.elem];
            } catch (err) {
              has_errored = true;
            }
            if (has_errored)
              throw new Error('objset_invalid_path_detected', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'set_index'
                }
              });
          }
          break;

        case 'object_key':
          if (idx === path_lookup.length - 1) {
            try {
              val[path_elem.elem] = set_val;
            } catch (err) {
              has_errored = true;
            }
            if (has_errored) {
              throw new Error('objset_value_assignment_failed', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'object_key'
                }
              });
            }
            return true;
          } else {
            try {
              val = val[path_elem.elem];
            } catch (err) {
              has_errored = true;
            }
            if (has_errored)
              throw new Error('objset_invalid_path_detected', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'object_key'
                }
              });
          }
          break;

        case 'object_symbol':
          if (idx === path_lookup.length - 1) {
            try {
              val[path_elem.elem] = set_val;
            } catch (err) {
              has_errored = true;
            }
            if (has_errored) {
              throw new Error('objset_value_assignment_failed', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'object_symbol'
                }
              });
            }
            return true;
          } else {
            try {
              val = val[path_elem.elem];
            } catch (err) {
              has_errored = true;
            }
            if (has_errored)
              throw new Error('objset_invalid_path_detected', {
                cause: {
                  path_lookup: path_lookup,
                  bad_path_elem: path_elem,
                  context: 'object_symbol'
                }
              });
          }
          break;

        default:
          throw new Error('objset_invalid_object_get_path_context');
      }
    }

    throw new Error('objset_invalid_object_get_path');
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Utilities %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  /**
   *
   * ObjectSearc uses a complicated array path for being able to access just about
   * anything, just about anywhere in an object.  However, many tools, (mpath, etc)
   * require the ability to have paths in a simple linear array (or dot notation) format.
   * This utility method takes an existing complex path and attempts to convert it
   * to a "simple path" with a best effort.
   *
   * Things that cannot be converted will be labeled as:
   *  "objsearch_cannot_convert_key_or_index".
   *
   * a simple path is either:
   *
   *    an array of strings and numbers
   *    an array of strings.
   *
   * Enable the convert.numbers_to_strings flag if you want to convert numbers to strings
   * in the generated simple path.
   */
  complexPathToSimplePath(
    path_to_convert: path_t,
    options?: {
      throw_on_cannot_convert?: boolean;
      convert_numbers_to_strings?: boolean;
    }
  ) {
    if (!Array.isArray(path_to_convert))
      throw new Error('path_to_convert is not an array');
    const simple_path: string[] = [];
    for (let idx = 0; idx < path_to_convert.length; idx++) {
      const path_elem = path_to_convert[idx];
      if (path_elem?.whatis_set?.key?.codes?.string === true) {
        simple_path.push(path_elem.elem);
      } else if (path_elem?.whatis_set?.key?.codes?.number === true) {
        if (options?.convert_numbers_to_strings === true)
          simple_path.push(path_elem.elem.toString());
        else simple_path.push(path_elem.elem);
      } else if (path_elem?.whatis_set?.key?.codes?.boolean === true) {
        if (options?.convert_numbers_to_strings === true)
          simple_path.push(path_elem.elem.toString());
        else simple_path.push(path_elem.elem);
      } else if (path_elem?.whatis_set?.key?.codes?.bigint === true) {
        if (options?.convert_numbers_to_strings === true)
          simple_path.push(path_elem.elem.toString());
        else simple_path.push(path_elem.elem);
      } else {
        if (options?.throw_on_cannot_convert === true) {
          throw new Error('objsearch_cannot_convert_key_or_index');
        }
        simple_path.push('objsearch_cannot_convert_key_or_index');
      }
    }
    return simple_path;
  }

  /**
   * This will take a simple path and attempt to convert it into a path form
   * that can be utilized by objGet/objSet.
   */
  simplePathToApproximatedComplexPath(path_to_convert: any[]) {
    if (!Array.isArray(path_to_convert))
      throw new Error('path_to_convert is not an array');

    const converted_path: path_t = [];
    for (let idx = 0; idx < path_to_convert.length; idx++) {
      const path_type = typeof path_to_convert[idx];
      if (path_type !== 'string' && path_type !== 'number')
        throw new Error('path_to_convert_is_not_string_or_number');

      converted_path.push({
        parent: null,
        context: 'object_key',
        elem: path_to_convert[idx],
        whatis_set: {}
      });
    }
    return converted_path;
  }

  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%% Run Searching %%%%%%%%%%%%%%%%%%%%%%%%%%%
  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  /**
   * Run a search on an object, executing a callback on keys and values.
   */
  async run(params: {
    object_to_search: any;
    on_key: recurse_key_callback_t;
    on_val: recurse_val_callback_t;
  }): Promise<objsearch_run_result_t> {
    const objsearch_ref = this;

    const objsearch_run_result: objsearch_run_result_t = {
      counts: {}
    };

    const on_key_real = async function (info: on_key_params_t) {
      if (!objsearch_run_result.counts.keys)
        objsearch_run_result.counts.keys = 0;
      objsearch_run_result.counts.keys++;
      if (params.on_key) return await params.on_key(info);
    };

    const on_val_real = async function (info: on_val_params_t) {
      if (!objsearch_run_result.counts.vals)
        objsearch_run_result.counts.vals = 0;
      objsearch_run_result.counts.vals++;
      if (params.on_val) return await params.on_val(info);
    };

    await objsearch_ref.deepRecurse(
      objsearch_run_result,
      params.object_to_search,
      params.object_to_search,
      on_key_real,
      on_val_real
    );

    return objsearch_run_result;
  }

  /**
   * This is our main workhorse recursing search method.  It's marked private
   * and shouldn't be used directly by developers.
   */
  private async deepRecurse(
    objsearch_run_result: objsearch_run_result_t,
    initial_obj: unknown,
    obj: unknown,
    on_key: recurse_key_callback_t,
    on_value: recurse_val_callback_t,
    seen = new WeakSet(),
    path: path_elem_t[] = [],
    parent: unknown = undefined
  ): Promise<boolean> {
    const objsearch_ref = this;
    if (typeof obj !== 'object' || obj === null) return true;

    if (seen.has(obj)) return true;
    seen.add(obj);

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];

        const whatis_set = {
          key: whatis(i, objsearch_ref.whatis_plugins),
          value: whatis(value, objsearch_ref.whatis_plugins),
          parent: whatis(obj, objsearch_ref.whatis_plugins)
        };

        const key_result = await on_key({
          objsearch_ref,
          parent: obj,
          key: i,
          value,
          whatis: whatis_set,
          path_elem: {
            parent: obj,
            context: 'array_index',
            elem: i,
            whatis_set
          },
          path: [
            ...path,
            { parent: obj, context: 'array_index', elem: i, whatis_set }
          ]
        });
        if (key_result === false) return false;

        const val_result = await on_value({
          objsearch_ref,
          parent: obj,
          key: i,
          value,
          whatis: whatis_set,
          path_elem: {
            parent: obj,
            context: 'array_index',
            elem: i,
            whatis_set
          },
          path: [
            ...path,
            { parent: obj, context: 'array_index', elem: i, whatis_set }
          ]
        });
        if (val_result === false) return false;

        const recurse_result = await objsearch_ref.deepRecurse(
          objsearch_run_result,
          initial_obj,
          value,
          on_key,
          on_value,
          seen,
          [
            ...path,
            { parent: obj, context: 'array_index', elem: i, whatis_set }
          ],
          obj
        );
        if (!recurse_result) return false;
      }
      return true;
    }

    if (obj instanceof Map) {
      // sometimes a user can provide a proxy to a map that hasn't been
      // bound correctly, we need to ensure we can get entries, if not
      // we should just skip the map entirely.
      let can_get_values = true;
      try {
        obj.entries();
      } catch (err) {
        can_get_values = false;
      }
      if (can_get_values)
        for (const [key, value] of obj.entries()) {
          const whatis_set = {
            key: whatis(key, objsearch_ref.whatis_plugins),
            value: whatis(value, objsearch_ref.whatis_plugins),
            parent: whatis(obj, objsearch_ref.whatis_plugins)
          };

          const key_result = await on_key({
            objsearch_ref,
            parent: obj,
            key: key,
            value,
            whatis: {
              key: whatis(key, objsearch_ref.whatis_plugins),
              value: whatis(value, objsearch_ref.whatis_plugins),
              parent: whatis(parent, objsearch_ref.whatis_plugins)
            },
            path_elem: {
              parent: obj,
              context: 'map_key',
              elem: key,
              whatis_set
            },
            path: [
              ...path,
              { parent: obj, context: 'map_key', elem: key, whatis_set }
            ]
          });
          if (key_result === false) return false;

          const recurse_key = await objsearch_ref.deepRecurse(
            objsearch_run_result,
            initial_obj,
            key,
            on_key,
            on_value,
            seen,
            [
              ...path,
              { parent: obj, context: 'map_key', elem: key, whatis_set }
            ],
            obj
          );
          if (!recurse_key) return false;

          const val_result = await on_value({
            objsearch_ref,
            parent: obj,
            key: key,
            value,
            whatis: {
              key: whatis(key, objsearch_ref.whatis_plugins),
              value: whatis(value, objsearch_ref.whatis_plugins),
              parent: whatis(parent, objsearch_ref.whatis_plugins)
            },
            path_elem: {
              parent: obj,
              context: 'map_key',
              elem: key,
              whatis_set
            },
            path: [
              ...path,
              { parent: obj, context: 'map_key', elem: key, whatis_set }
            ]
          });
          if (val_result === false) return false;

          const recurse_value = await objsearch_ref.deepRecurse(
            objsearch_run_result,
            initial_obj,
            value,
            on_key,
            on_value,
            seen,
            [
              ...path,
              { parent: obj, context: 'map_key', elem: key, whatis_set }
            ],
            obj
          );
          if (!recurse_value) return false;
        }
      return true;
    }

    if (obj instanceof Set) {
      let index = 0;

      // sometimes a user can provide a proxy to a set that hasn't been
      // bound correctly, we need to ensure we can get values, if not
      // we should just skip the set entirely.
      let can_get_values = true;
      try {
        obj.values();
      } catch (err) {
        can_get_values = false;
      }
      if (can_get_values)
        for (const value of obj.values()) {
          const whatis_set = {
            key: whatis(index, objsearch_ref.whatis_plugins),
            value: whatis(value, objsearch_ref.whatis_plugins),
            parent: whatis(obj, objsearch_ref.whatis_plugins)
          };
          const val_result = await on_value({
            objsearch_ref,
            parent: obj,
            key: index,
            value,
            whatis: {
              key: whatis(index, objsearch_ref.whatis_plugins),
              value: whatis(value, objsearch_ref.whatis_plugins),
              parent: whatis(parent, objsearch_ref.whatis_plugins)
            },
            path_elem: {
              parent: obj,
              context: 'set_index',
              elem: index,
              whatis_set
            },
            path: [
              ...path,
              { parent: obj, context: 'set_index', elem: index, whatis_set }
            ]
          });
          if (val_result === false) return false;

          const recurse_result = await objsearch_ref.deepRecurse(
            objsearch_run_result,
            initial_obj,
            value,
            on_key,
            on_value,
            seen,
            [
              ...path,
              { parent: obj, context: 'set_index', elem: index, whatis_set }
            ],
            obj
          );
          if (!recurse_result) return false;

          index++;
        }
      return true;
    }

    const keys_only = [...Object.keys(obj)];

    for (const key of keys_only) {
      const value = (obj as any)[key];
      const whatis_set = {
        key: whatis(key, objsearch_ref.whatis_plugins),
        value: whatis(value, objsearch_ref.whatis_plugins),
        parent: whatis(obj, objsearch_ref.whatis_plugins)
      };
      const key_result = await on_key({
        objsearch_ref,
        parent: obj,
        key: key,
        value,
        whatis: {
          key: whatis(key, objsearch_ref.whatis_plugins),
          value: whatis(value, objsearch_ref.whatis_plugins),
          parent: whatis(parent, objsearch_ref.whatis_plugins)
        },
        path_elem: {
          parent: obj,
          context: 'object_key',
          elem: key,
          whatis_set
        },
        path: [
          ...path,
          { parent: obj, context: 'object_key', elem: key, whatis_set }
        ]
      });
      if (key_result === false) return false;

      const val_result = await on_value({
        objsearch_ref,
        parent: obj,
        key: key,
        value,
        whatis: {
          key: whatis(key, objsearch_ref.whatis_plugins),
          value: whatis(value, objsearch_ref.whatis_plugins),
          parent: whatis(parent, objsearch_ref.whatis_plugins)
        },
        path_elem: {
          parent: obj,
          context: 'object_key',
          elem: key,
          whatis_set
        },
        path: [
          ...path,
          { parent: obj, context: 'object_key', elem: key, whatis_set }
        ]
      });
      if (val_result === false) return false;

      const recurse_result = await objsearch_ref.deepRecurse(
        objsearch_run_result,
        initial_obj,
        value,
        on_key,
        on_value,
        seen,
        [
          ...path,
          { parent: obj, context: 'object_key', elem: key, whatis_set }
        ],
        obj
      );
      if (!recurse_result) return false;
    }

    const symbols_only = [...Object.getOwnPropertySymbols(obj)];

    for (const key of symbols_only) {
      const value = (obj as any)[key];
      const whatis_set = {
        key: whatis(key, objsearch_ref.whatis_plugins),
        value: whatis(value, objsearch_ref.whatis_plugins),
        parent: whatis(obj, objsearch_ref.whatis_plugins)
      };
      const key_result = await on_key({
        objsearch_ref,
        parent: obj,
        key: key,
        value,
        whatis: {
          key: whatis(key, objsearch_ref.whatis_plugins),
          value: whatis(value, objsearch_ref.whatis_plugins),
          parent: whatis(parent, objsearch_ref.whatis_plugins)
        },
        path_elem: {
          parent: obj,
          context: 'object_symbol',
          elem: key,
          whatis_set
        },
        path: [
          ...path,
          { parent: obj, context: 'object_symbol', elem: key, whatis_set }
        ]
      });
      if (key_result === false) return false;

      const val_result = await on_value({
        objsearch_ref,
        parent: obj,
        key: key,
        value,
        whatis: {
          key: whatis(key, objsearch_ref.whatis_plugins),
          value: whatis(value, objsearch_ref.whatis_plugins),
          parent: whatis(parent, objsearch_ref.whatis_plugins)
        },
        path_elem: {
          parent: obj,
          context: 'object_symbol',
          elem: key,
          whatis_set
        },
        path: [
          ...path,
          { parent: obj, context: 'object_symbol', elem: key, whatis_set }
        ]
      });
      if (val_result === false) return false;

      const recurse_result = await objsearch_ref.deepRecurse(
        objsearch_run_result,
        initial_obj,
        value,
        on_key,
        on_value,
        seen,
        [
          ...path,
          { parent: obj, context: 'object_symbol', elem: key, whatis_set }
        ],
        obj
      );
      if (!recurse_result) return false;
    }

    return true;
  }
}

export {
  ObjectSearch,
  path_t,
  path_elem_t,
  simple_path_elem_t,
  simple_path_t,
  on_key_params_t,
  on_val_params_t,
  objsearch_run_result_t
};
