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

class ObjectSearch {
  whatis_plugins: any[] = [];
  constructor(options?: { whatis_plugins: any[] }) {
    if (options) this.whatis_plugins = options?.whatis_plugins;
  }

  /**
   * Get a value within an object using a path generated via object search.
   */
  objGet(object_to_get_from: any, path_lookup: path_t) {
    if (!Array.isArray(path_lookup)) throw new Error('path_lookup_invalid');
    if (path_lookup.length <= 0) throw new Error('path_lookup_empty');

    let val = object_to_get_from;
    for (let idx = 0; idx < path_lookup.length; idx++) {
      const path_elem = path_lookup[idx];
      switch (path_elem.context) {
        case 'array_index':
          val = val[path_elem.elem];
          break;

        case 'map_key':
          val = (val as Map<any, any>).get(path_elem.elem);
          break;

        case 'set_index':
          val = Array.from(val)[path_elem.elem];
          break;

        case 'object_key':
          val = val[path_elem.elem];
          break;

        case 'object_symbol':
          val = val[path_elem.elem];
          break;

        default:
          throw new Error('invalid_object_get_path_context');
      }
    }
    return val;
  }

  /**
   * Set a value within an object using a path generated via object search.
   */
  objSet(object_to_get_from: any, path_lookup: path_t, set_val: any) {
    if (!Array.isArray(path_lookup)) throw new Error('path_lookup_invalid');
    if (path_lookup.length <= 0) throw new Error('path_lookup_empty');
    let val = object_to_get_from;
    for (let idx = 0; idx < path_lookup.length; idx++) {
      const path_elem = path_lookup[idx];
      switch (path_elem.context) {
        case 'array_index':
          if (idx === path_lookup.length - 1) {
            val[path_elem.elem] = set_val;
            return true;
          } else {
            val = val[path_elem.elem];
          }
          break;

        case 'map_key':
          if (idx === path_lookup.length - 1) {
            (path_elem.parent as Map<any, any>).set(path_elem.elem, set_val);
            return true;
          } else {
            val = (val as Map<any, any>).get(path_elem.elem);
          }
          break;

        case 'set_index':
          if (idx === path_lookup.length - 1) {
            if (!path_elem?.whatis_set?.parent?.codes?.set) {
              throw new Error('set_index_is_not_within_set');
            }

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
            return true;
          } else {
            val = Array.from(val)[path_elem.elem];
          }
          break;

        case 'object_key':
          if (idx === path_lookup.length - 1) {
            val[path_elem.elem] = set_val;
            return true;
          } else {
            val = val[path_elem.elem];
          }
          break;

        case 'object_symbol':
          if (idx === path_lookup.length - 1) {
            val[path_elem.elem] = set_val;
            return true;
          } else {
            val = val[path_elem.elem];
          }
          break;

        default:
          throw new Error('invalid_object_get_path_context');
      }
    }

    throw new Error('invalid_object_get_path');
    return false;
  }

  /**
   * Run a search on an object, executing a callback on keys and values.
   */
  async run(params: {
    object_to_search: any;
    on_key: recurse_key_callback_t;
    on_val: recurse_val_callback_t;
  }) {
    const objsearch_ref = this;

    await objsearch_ref.deep_recurse(
      params.object_to_search,
      params.on_key,
      params.on_val
    );
  }

  private async deep_recurse(
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
          key: whatis(i),
          value: whatis(value),
          parent: whatis(obj)
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

        const recurse_result = await objsearch_ref.deep_recurse(
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
      for (const [key, value] of obj.entries()) {
        const whatis_set = {
          key: whatis(key),
          value: whatis(value),
          parent: whatis(obj)
        };

        const key_result = await on_key({
          objsearch_ref,
          parent: obj,
          key: key,
          value,
          whatis: {
            key: whatis(key),
            value: whatis(value),
            parent: whatis(parent)
          },
          path_elem: { parent: obj, context: 'map_key', elem: key, whatis_set },
          path: [
            ...path,
            { parent: obj, context: 'map_key', elem: key, whatis_set }
          ]
        });
        if (key_result === false) return false;

        const recurse_key = await objsearch_ref.deep_recurse(
          key,
          on_key,
          on_value,
          seen,
          [...path, { parent: obj, context: 'map_key', elem: key, whatis_set }],
          obj
        );
        if (!recurse_key) return false;

        const val_result = await on_value({
          objsearch_ref,
          parent: obj,
          key: key,
          value,
          whatis: {
            key: whatis(key),
            value: whatis(value),
            parent: whatis(parent)
          },
          path_elem: { parent: obj, context: 'map_key', elem: key, whatis_set },
          path: [
            ...path,
            { parent: obj, context: 'map_key', elem: key, whatis_set }
          ]
        });
        if (val_result === false) return false;

        const recurse_value = await objsearch_ref.deep_recurse(
          value,
          on_key,
          on_value,
          seen,
          [...path, { parent: obj, context: 'map_key', elem: key, whatis_set }],
          obj
        );
        if (!recurse_value) return false;
      }
      return true;
    }

    if (obj instanceof Set) {
      let index = 0;
      for (const value of obj.values()) {
        const whatis_set = {
          key: whatis(index),
          value: whatis(value),
          parent: whatis(obj)
        };
        const val_result = await on_value({
          objsearch_ref,
          parent: obj,
          key: index,
          value,
          whatis: {
            key: whatis(index),
            value: whatis(value),
            parent: whatis(parent)
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

        const recurse_result = await objsearch_ref.deep_recurse(
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
        key: whatis(key),
        value: whatis(value),
        parent: whatis(obj)
      };
      const key_result = await on_key({
        objsearch_ref,
        parent: obj,
        key: key,
        value,
        whatis: {
          key: whatis(key),
          value: whatis(value),
          parent: whatis(parent)
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
          key: whatis(key),
          value: whatis(value),
          parent: whatis(parent)
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

      const recurse_result = await objsearch_ref.deep_recurse(
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
        key: whatis(key),
        value: whatis(value),
        parent: whatis(obj)
      };
      const key_result = await on_key({
        objsearch_ref,
        parent: obj,
        key: key,
        value,
        whatis: {
          key: whatis(key),
          value: whatis(value),
          parent: whatis(parent)
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
          key: whatis(key),
          value: whatis(value),
          parent: whatis(parent)
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

      const recurse_result = await objsearch_ref.deep_recurse(
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

  /*

  private async deep_recurse(
    obj: unknown,
    on_key: recurse_callback_t,
    on_value: recurse_callback_t,
    seen = new WeakSet(),
    path: (string | number | symbol)[] = [],
    parent: unknown = undefined
  ): Promise<boolean> {
    const objsearch_ref = this;
    if (typeof obj !== 'object' || obj === null) return true;

    if (seen.has(obj)) return true;
    seen.add(obj);

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        const key_result = await on_key({
          parent: obj,
          key: i,
          value,
          path: [...path, i]
        });
        if (key_result === false) return false;

        const val_result = await on_value({
          parent: obj,
          key: i,
          value,
          path: [...path, i]
        });
        if (val_result === false) return false;

        const recurse_result = await objsearch_ref.deep_recurse(
          value,
          on_key,
          on_value,
          seen,
          [...path, i],
          obj
        );
        if (!recurse_result) return false;
      }
      return true;
    }

    if (obj instanceof Map) {
      for (const [key, value] of obj.entries()) {
        const key_path = [...path, `[Map key: ${String(key)}]`];

        const key_result = await on_key({
          parent: obj,
          key: key,
          value,
          path: key_path
        });
        if (key_result === false) return false;

        const recurse_key = await objsearch_ref.deep_recurse(
          key,
          on_key,
          on_value,
          seen,
          key_path,
          obj
        );
        if (!recurse_key) return false;

        const val_result = await on_value({
          parent: obj,
          key: key,
          value,
          path: [...path, key]
        });
        if (val_result === false) return false;

        const recurse_value = await objsearch_ref.deep_recurse(
          value,
          on_key,
          on_value,
          seen,
          [...path, key],
          obj
        );
        if (!recurse_value) return false;
      }
      return true;
    }

    if (obj instanceof Set) {
      let index = 0;
      for (const value of obj.values()) {
        const val_result = await on_value({
          parent: obj,
          key: index,
          value,
          path: [...path, index]
        });
        if (val_result === false) return false;

        const recurse_result = await objsearch_ref.deep_recurse(
          value,
          on_key,
          on_value,
          seen,
          [...path, index],
          obj
        );
        if (!recurse_result) return false;

        index++;
      }
      return true;
    }

    const keys_and_symbols = [
      ...Object.keys(obj),
      ...Object.getOwnPropertySymbols(obj)
    ];

    for (const key of keys_and_symbols) {
      const value = (obj as any)[key];
      const key_result = await on_key({
        parent: obj,
        key: key,
        value,
        path: [...path, key]
      });
      if (key_result === false) return false;

      const val_result = await on_value({
        parent: obj,
        key: key,
        value,
        path: [...path, key]
      });
      if (val_result === false) return false;

      const recurse_result = await objsearch_ref.deep_recurse(
        value,
        on_key,
        on_value,
        seen,
        [...path, key],
        obj
      );
      if (!recurse_result) return false;
    }

    return true;
  }
  */
}

export { ObjectSearch, path_elem_t, on_key_params_t, on_val_params_t };
