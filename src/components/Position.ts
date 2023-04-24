import { Types, defineComponent } from "bitecs";

const Position = defineComponent({
  x: Types.f32,
  y: Types.f32,
});

export default Position;

export const UpdatePosition = defineComponent();
