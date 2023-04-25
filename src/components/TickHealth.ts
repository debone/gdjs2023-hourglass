import { Types, defineComponent } from "bitecs";

const TickHealth = defineComponent({
  health: Types.i32,
  maxHealth: Types.i32,
});

export default TickHealth;
