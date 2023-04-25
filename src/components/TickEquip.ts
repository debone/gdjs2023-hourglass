import { Types, defineComponent } from "bitecs";

const TickEquip = defineComponent({
  equip: Types.ui32,
  maxEquip: Types.ui32,
});

export default TickEquip;
