import { Types, defineComponent } from "bitecs";

const Sand = defineComponent({
  currentSand: Types.i32,
  maxSand: Types.i32,
});

export default Sand;
