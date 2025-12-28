declare module 'json-to-ast' {
  export interface Location {
    start: { line: number; column: number };
    end: { line: number; column: number };
  }

  export interface ASTNode {
    type: 'Object' | 'Array' | 'Literal' | 'Property';
    loc: Location;
    children?: ASTNode[];
    key?: ASTNode & { value: string };
    value?: ASTNode;
  }

  function parse(json: string): ASTNode;
  export default parse;
}
