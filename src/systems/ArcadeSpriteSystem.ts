import { defineQuery, defineSystem, enterQuery, exitQuery } from "bitecs";
import { SceneWorld } from "../scenes/world";
import { RESOURCES_LIST } from "../scenes/preload";
import ArcadeSprite from "../components/ArcadeSprite";

export const arcadeSpriteById = new Map<
  number,
  Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
>();

const createArcadeSpriteSystem = (scene: SceneWorld) => {
  const spriteQuery = defineQuery([ArcadeSprite]);
  const spriteQueryEnter = enterQuery(spriteQuery);
  const spriteQueryExit = exitQuery(spriteQuery);

  return defineSystem((world) => {
    const enterEntities = spriteQueryEnter(world);
    for (let i = 0; i < enterEntities.length; i++) {
      const entityId = enterEntities[i];
      const textureId = ArcadeSprite.texture[entityId];
      const sprite = scene.physics.add.sprite(0, 0, RESOURCES_LIST[textureId]);

      sprite.setScale(2);

      arcadeSpriteById.set(entityId, sprite);
    }

    /*const entities = spriteQuery(world);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const sprite = spriteById.get(entity);
      sprite?.setPosition(Position.x[entity], Position.y[entity]);
    }*/

    const exitEntities = spriteQueryExit(world);
    for (let i = 0; i < exitEntities.length; i++) {
      const entityId = exitEntities[i];
      const sprite = arcadeSpriteById.get(entityId);
      sprite?.destroy();
      arcadeSpriteById.delete(entityId);
    }

    return world;
  });
};

export default createArcadeSpriteSystem;
