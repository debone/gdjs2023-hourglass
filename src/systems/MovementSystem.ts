import { IWorld, defineQuery, defineSystem } from "bitecs";
import Position from "../components/Position";
import Velocity from "../components/Velocity";

export default function createMovementSystem() {
  const query = defineQuery([Position, Velocity]);

  return defineSystem((world: IWorld) => {
    const entities = query(world);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      Position.x[entity] += Velocity.x[entity];
      Position.y[entity] += Velocity.y[entity];
    }
    return world;
  });
}
