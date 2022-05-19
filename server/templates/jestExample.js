export const sum = (a<%= typeDecl1 %>, b<%= typeDecl1 %>)<%= typeDecl1 %> => a + b;

export const mergeWithoutDup = <%= type2 %>(source<%= typeDecl2 %>, addition<%= typeDecl2 %>)<%= typeDecl2 %> => {
  const s = new Set<%= type2 %>(source);
  addition.forEach((item) => s.add(item));
  return Array.from(s);
};
