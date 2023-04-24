import { defineQuery, defineSystem } from "bitecs";
import KeyboardControl from "../components/KeyboardControl";
import ArcadeSprite from "../components/ArcadeSprite";
import { arcadeSpriteById } from "./ArcadeSpriteSystem";
import { SceneWorld } from "../scenes/world";

const createKeyboardMovementSystem = (
  scene: SceneWorld,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
) => {
  const query = defineQuery([KeyboardControl, ArcadeSprite]);
  return defineSystem((world) => {
    const entities = query(world);

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const body = arcadeSpriteById.get(entity)!;

      body.setVelocity(0);

      if (cursors.left.isDown || scene.keyA.isDown) {
        body.setVelocityX(-100);
      } else if (cursors.right.isDown || scene.keyD.isDown) {
        body.setVelocityX(100);
      }

      if (cursors.up.isDown || scene.keyW.isDown) {
        body.setVelocityY(-100);
      } else if (cursors.down.isDown || scene.keyS.isDown) {
        body.setVelocityY(100);
      }
    }

    return world;
  });
};

export default createKeyboardMovementSystem;
