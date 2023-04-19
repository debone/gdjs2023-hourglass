import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import { SceneWorld } from "../scenes/world";
import { RESOURCES_LIST } from "../scenes/preload";
import Position from "../components/Position";
import Sprite from "../components/Sprite";

export const spriteById = new Map<number, Phaser.GameObjects.Sprite>();

export const createSpriteSystem = (scene: SceneWorld) => {
  const spriteQuery = defineQuery([Sprite, Position]);
  const spriteQueryEnter = enterQuery(spriteQuery);
  const spriteQueryExit = exitQuery(spriteQuery);
  return defineSystem((world) => {
    const enterEntities = spriteQueryEnter(world);
    for (let i = 0; i < enterEntities.length; i++) {
      const entityId = enterEntities[i];
      const textureId = Sprite.texture[entityId];
      const sprite = scene.add.sprite(0, 0, RESOURCES_LIST[textureId]);
      spriteById.set(entityId, sprite);
    }

    /* Really not sure if I want to set position all the time.
    const entities = spriteQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const sprite = spriteById.get(entity);
      sprite?.setPosition(Position.x[entity], Position.y[entity]);
    }
    */

    const exitEntities = spriteQueryExit(world);
    for (let i = 0; i < exitEntities.length; i++) {
      const entityId = exitEntities[i];
      const sprite = spriteById.get(entityId);
      sprite?.destroy();
      spriteById.delete(entityId);
    }

    return world;
  });
};
