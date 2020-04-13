const cubec = require('../../dist/cubec.min');

test("[model] set data with Object", ()=>{
  const model = cubec.model();
  const data = { a:1, b:2, c:3 };
  model.set(data);
  expect(model.get()).toEqual(data);
});

test("[model] set data with key & value", ()=>{
  const model = cubec.model();
  model.set("a", 1);
  model.set("b", 2);
  expect(model.get()).toEqual({ a:1, b:2 });
});

test("[model] set data with function", ()=>{
  const model = cubec.model({
    data: { a: 1 }
  });

  model.set(function(modelData){
    modelData.b = 2;
    modelData.c = 3;
    modelData.d = { d: 213 };

    return modelData;
  });

  expect(model.get()).toEqual({ a:1, b:2, c:3, d: { d: 213 } });
});
