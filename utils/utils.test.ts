// getValue_test.ts
import { assert, assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { extractValuesInTemplate, flattenObject, getValue, handleLoops, removeWhiteSpace } from "./utils.ts";

Deno.test("Får rätt värde för en enkel nyckel", () => {
  const data = { age: 30 };
  const result = getValue(data, "age");
  assertEquals(result, "30");
});

Deno.test("Får rätt värde för en djupare egenskap", () => {
  const data = {
    me: {
      firstName: "Kalle",
      lastName: "Anka"
    }
  };
  const result = getValue(data, "me.firstName");
  assertEquals(result, "Kalle");
});

Deno.test("Returnerar tom sträng om nyckeln saknas", () => {
  const data = {
    me: {
      firstName: "Kalle"
    }
  };
  const result = getValue(data, "me.lastName");
  assertEquals(result, "");
});

Deno.test("Returnerar tom sträng om den första nyckeln saknas", () => {
  const data = { };
  const result = getValue(data, "me.firstName");
  assertEquals(result, "");
});

Deno.test("Returnerar korrekt värde även om det är ett tal", () => {
  const data = { count: 0 };
  const result = getValue(data, "count");
  assertEquals(result, "0");
});

Deno.test("Returnerar en sträng även för objekt", () => {
  const data = { obj: { a: 1 } };
  const result = getValue(data, "obj");
  // Notera att detta blir "[object Object]"
  assertEquals(result, "[object Object]");
});


Deno.test('Should handle strings without any params', () => {
   assertEquals('here is no params', extractValuesInTemplate('here is no params', {}));
   assertEquals('here is no params {{', extractValuesInTemplate('here is no params {{', {}));
   assertEquals('here is no params {{a', extractValuesInTemplate('here is no params {{a', {}));
   assertEquals('here is no params {{ a}', extractValuesInTemplate('here is no params {{ a}', {}));
});

Deno.test('Should just print the var if no data is found', () => {
   assertEquals('params without {{data}}', extractValuesInTemplate('params without {{data}}', {}));
   assertEquals('params without {{ data}}', extractValuesInTemplate('params without {{ data}}', {}));
   assertEquals('params without {{ data }}', extractValuesInTemplate('params without {{ data }}', {}));
   assertEquals('params without {{  data}}', extractValuesInTemplate('params without {{  data}}', {}));
});

Deno.test('Should extract values if found in data (no depth)', () => {
   assertEquals('params without 1', extractValuesInTemplate('params without {{data}}', {data: 1}));
   assertEquals('params without 1', extractValuesInTemplate('params without {{ data}}', {data: '1'}));
   assertEquals('params without 2', extractValuesInTemplate('params without {{ data }}', {data: 1+1}));
});

Deno.test('Should extract values if found in data (with depth)', () => {
   assertEquals('My name is Johannes, I work at Consid', extractValuesInTemplate('My name is {{person.name}}, I work at {{ person.work}}', {person: {name: 'Johannes', work: 'Consid'}}));
});

Deno.test('flatten objects paths with objects', () => {
  assertEquals({'a': true}, flattenObject({a: true}))
  assertEquals({'a.b': true, 'a.c': false}, flattenObject({a: {b: true, c: false}}))
  assertEquals({'person.name': 'johannes', 'person.work': 'consid'}, flattenObject({person: {name: 'johannes', work: 'consid'}}))
})

Deno.test('flattenObject', () => {
  assertEquals({'a': true}, flattenObject({a: true}))
  assertEquals({'a.b': true, 'a.c': false}, flattenObject({a: {b: true, c: false}}))
  assertEquals({'person.name': 'johannes', 'person.work': 'consid'}, flattenObject({person: {name: 'johannes', work: 'consid'}}))
})

Deno.test('flattenObjectWithArray', () => {
  assertEquals({'items[0].name': 'hi there'}, flattenObject({items: [{name: 'hi there'}]}))
  assertEquals({'a.b': true, 'a.c[0]': false, 'a.c[1]': true}, flattenObject({a: {b: true, c: [false, true]}}))
})

Deno.test('parse loop string', () => {
    const template = `
    <p> x.name1 </p>
    <p> myList </p>
    {{ foreach x in list }}
    <h2> {{ x.name }} </h2>
    <h2> {{ x.name }} </h2>
    {{ /foreach }}`;

  const expected = removeWhiteSpace(`
    <p> x.name1 </p>
    <p> myList </p>

    <h2> {{ list[0].name }} </h2>
    <h2> {{ list[0].name }} </h2>
    <h2> {{ list[1].name }} </h2>
    <h2> {{ list[1].name }} </h2>
    `);

  const data = { list: [{name: 'Johannes'}, {name: 'Gustav'}] };
  const result = handleLoops(template, data);
  assertEquals(result, expected);
})