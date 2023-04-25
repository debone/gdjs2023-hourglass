import { IWorld, defineQuery, defineSystem } from "bitecs";
import TickEquip from "../components/TickEquip";
import TickHealth from "../components/TickHealth";

export default function createTickEquipmentSystem() {
  const query = defineQuery([TickEquip]);
  const query2 = defineQuery([TickHealth]);

  return defineSystem((world: IWorld) => {
    {
      const entities = query(world);
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        TickEquip.equip[entity] > 0 && (TickEquip.equip[entity] -= 1);
      }
    }

    {
      const entities = query(world);
      for (let i = 0; i < entities.length; i++) {
        const entity = entities[i];
        TickHealth.health[entity] > 0 && (TickHealth.health[entity] -= 1);
      }
    }

    return world;
  });
}
