const cubec = require('../../dist/cubec.min');

test("[model] get data with no arguments", ()=>{
  const model = cubec.model({ data: { a:1, b:2 } });
  expect(model.get()).toEqual({ a:1, b:2 });
});

test("[model] get data with key", ()=>{
  const model = cubec.model({ data: { a: 1 } });
  expect(model.get("a")).toBe(1);
});

test("[model] get data with key [Object]", ()=>{
  const model = cubec.model({ data: { a: { b: {c:3} } } });
  expect(model.get("a")).toEqual({ b: {c:3} });
});

test("[model] get data with deep key", ()=>{
  const model = cubec.model({ data: { a: { b: { c: { d: 4 } } } } });

  expect(model.get("a.b")).toEqual({ c: { d: 4} });
  expect(model.get("a.b.c.d")).toEqual(4);
});

test("[model] get data is immutable", ()=>{
  const orgData = { a:1, b:2 };

  const model = cubec.model({
    data: orgData
  });

  const getData = model.get();

  getData.a = 2;
  getData.b = 3;

  const getData2 = model.get();

  expect(
    getData.a !== getData2.a &&
    getData.b !== getData2.b
  ).toBe(true);

  expect(
    orgData.a !== getData.a &&
    orgData.b !== getData.b
  ).toBe(true);
});

test("[model] get data with function()", ()=>{
  const model = cubec.model({
    data: { a: 1, b: 2 }
  });

  const data1 = model.get(function(modelData){
    return {
      a: modelData.a,
    };
  });

  const data2 = model.get(function(modelData){
    return {
      ...modelData,
      c: 3
    };
  });

  expect(data1).toEqual({ a: 1 });

  expect(data2).toEqual({ a: 1, b: 2, c: 3 });
});

