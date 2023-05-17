const MINUS = (a: number, b: number) => {
  return a - b;
};
const SUM = (a: number, b: number) => {
  return a + b;
};
const MUL = (a: number, b: number) => {
  return a * b;
};
const DIV = (a: number, b: number) => {
  return a / b;
};
export class Model {
  MINUS: any;
  SUM: any;
  MUL: any;
  DIV: any;
  constructor() {
    this.MINUS = MINUS;
    this.SUM = SUM;
    this.MUL = MUL;
    this.DIV = DIV;
  }
}
