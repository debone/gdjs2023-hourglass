import { defineQuery, defineSystem } from "bitecs";
import KeyboardControl from "../components/KeyboardControl";
import ArcadeSprite from "../components/ArcadeSprite";
import { arcadeSpriteById } from "./ArcadeSpriteSystem";

const createKeyboardMovementSystem = (
  cursors: Phaser.Types.Input.Keyboard.CursorKeys
) => {
  const query = defineQuery([KeyboardControl, ArcadeSprite]);
  return defineSystem((world) => {
    const entities = query(world);

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const body = arcadeSpriteById.get(entity)!;

      body.setVelocity(0);

      if (cursors.left.isDown) {
        body.setVelocityX(-100);
      } else if (cursors.right.isDown) {
        body.setVelocityX(100);
      }

      if (cursors.up.isDown) {
        body.setVelocityY(-100);
      } else if (cursors.down.isDown) {
        body.setVelocityY(100);
      }
    }

    return world;
  });
};

export default createKeyboardMovementSystem;
