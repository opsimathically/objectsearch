import assert from 'node:assert';
import { whatis } from '@opsimathically/whatis';
import {
  ObjectSearch,
  path_elem_t,
  on_key_params_t,
  on_val_params_t
} from '@src/ObjectSearch.class';

(async function () {
  const search_this: any = {
    foo: {
      bar: new Map([[{ baz: 1 }, new Set([2, 3])]]),
      settest: new Set([5, 6])
    },
    [Symbol('hidden')]: 'some_symbol_val'
  };

  const objsearch = new ObjectSearch();

  let symbol_path = null;
  const set_paths: any = [];
  await objsearch.run({
    object_to_search: search_this,
    on_key: async function (info: on_key_params_t) {},
    on_val: async function (info: on_val_params_t) {
      if (info.whatis.key.codes.symbol) symbol_path = info.path;
      if (info.path_elem.context === 'set_index') set_paths.push(info.path);
      // debugger;
    }
  });
  if (symbol_path) {
    // const looked_up_symbol_val = objsearch.objGet(search_this, symbol_path);
    // assert(looked_up_symbol_val === 'some_symbol_val');
  }

  objsearch.objSet(search_this, set_paths[0], 'some_string');
  objsearch.objSet(search_this, set_paths[1], 'some_other');
  debugger;
  //console.debug(set_paths);
})();
