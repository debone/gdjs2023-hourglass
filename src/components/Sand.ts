import { Types, defineComponent } from "bitecs";

const Sand = defineComponent({
  isTankFilled: Types.ui8,
  normalSand: Types.i32,
  redSand: Types.i32,
  blueSand: Types.i32,
});

export default Sand;
