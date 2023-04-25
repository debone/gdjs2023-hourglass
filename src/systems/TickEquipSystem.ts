import { IWorld, defineQuery, defineSystem } from "bitecs";
import TickEquip from "../components/TickEquip";

export default function createTickEquipmentSystem() {
  const query = defineQuery([TickEquip]);

  return defineSystem((world: IWorld) => {
    const entities = query(world);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      TickEquip.equip[entity] > 0 && (TickEquip.equip[entity] -= 1);
    }
    return world;
  });
}
