import {
  defineQuery,
  defineSystem,
  enterQuery,
  exitQuery,
  removeComponent,
} from "bitecs";
import { SceneWorld } from "../scenes/world";
import { RESOURCES_LIST } from "../scenes/preload";
import Position, { UpdatePosition } from "../components/Position";
import UISprite from "../components/UISprite";

export const uiSpriteById = new Map<number, Phaser.GameObjects.Sprite>();

export const createUISpriteSystem = (scene: SceneWorld) => {
  const spriteQuery = defineQuery([UISprite, Position]);
  const spriteQueryEnter = enterQuery(spriteQuery);
  const spriteQueryExit = exitQuery(spriteQuery);
  return defineSystem((world) => {
    const enterEntities = spriteQueryEnter(world);
    for (let i = 0; i < enterEntities.length; i++) {
      const entityId = enterEntities[i];
      const textureId = UISprite.texture[entityId];
      const sprite = scene.add
        .sprite(
          Position.x[entityId],
          Position.y[entityId],
          RESOURCES_LIST[textureId]
        )
        .setScrollFactor(0);
      uiSpriteById.set(entityId, sprite);
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
      const sprite = uiSpriteById.get(entityId);
      sprite?.destroy();
      uiSpriteById.delete(entityId);
    }

    return world;
  });
};

export const createUIUpdateSpriteSystem = (scene: SceneWorld) => {
  const spriteQuery = defineQuery([UISprite, Position, UpdatePosition]);
  const spriteQueryEnter = enterQuery(spriteQuery);
  return defineSystem((world) => {
    const entities = spriteQueryEnter(world);

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const sprite = uiSpriteById.get(entity);
      sprite?.setPosition(Position.x[entity], Position.y[entity]);

      removeComponent(world, UpdatePosition, entity);
    }

    return world;
  });
};
