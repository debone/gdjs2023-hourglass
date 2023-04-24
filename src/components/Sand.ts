import { Types, defineComponent } from "bitecs";

const Sand = defineComponent({
  isTankFilled: Types.ui8,
  pos: Types.i32,
  size: Types.i32,
});

export default Sand;
