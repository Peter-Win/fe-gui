import { sum, mergeWithoutDup } from "./jestExample";

test("sum", () => {
  expect(sum(2, 2)).toBe(4);
  expect(sum(2, -2)).toBe(0);
});

describe("mergeWithoutDup", () => {
  it("both empty", () => {
    expect(mergeWithoutDup([], [])).toEqual([]);
  });
  it("data without dup", () => {
    expect(mergeWithoutDup([1, 2], [22, 33])).toEqual([1, 2, 22, 33]);
    expect(mergeWithoutDup(["A", "B"], ["Y", "Z"])).toEqual(["A", "B", "Y", "Z"]);
  });
  it("all items are same", () => {
    expect(mergeWithoutDup([3, 3, 3], [3, 3])).toEqual([3]);
    expect(mergeWithoutDup(["c", "c"], ["c", "c"])).toEqual(["c"]);
  });
  it("part of items are duplicated", () => {
    expect(mergeWithoutDup([], [1, 2, 3, 2, 1])).toEqual([1, 2, 3]);
    expect(mergeWithoutDup([], ["a", "b", "c", "b", "a"])).toEqual(["a", "b", "c"]);
  });
  it("source dont changed", () => {
    expect(mergeWithoutDup([3, 2, 1], [1, 2, 3, 2, 1])).toEqual([3, 2, 1]);
    expect(mergeWithoutDup(["c", "b", "a"], ["a", "b", "c", "b", "a"])).toEqual(
      ["c", "b", "a"]
    );
  });
});
