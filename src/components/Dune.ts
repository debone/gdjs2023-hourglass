import { Types, defineComponent } from "bitecs";

const Dune = defineComponent({
  texture: Types.ui8,
  width: Types.i32,
  height: Types.i32,
  x: Types.i32,
  y: Types.i32,
});

export default Dune;
