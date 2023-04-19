import Phaser from "phaser";

import testTile from "../assets/test-tile.png?url";
import testChar from "../assets/test-char.png?url";
import testDune from "../assets/test-dune.png?url";

export const RESOURCES = {
  TEST_TILE: "test-tile",
  TEST_CHAR: "test-char",
  TEST_DUNE: "test-dune",
} as const;

export const RESOURCES_INDEX = Object.keys(RESOURCES).reduce(
  (acc, key, index) => ({ ...acc, [key]: index }),
  {} as Record<keyof typeof RESOURCES, number>
);

export const RESOURCES_LIST = Object.values(RESOURCES);

export class SceneMain extends Phaser.Scene {
  declare keySpace: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.image(RESOURCES.TEST_TILE, testTile);
    this.load.image(RESOURCES.TEST_CHAR, testChar);
    this.load.image(RESOURCES.TEST_DUNE, testDune);
  }

  create() {
    this.add.text(100, 100, "Main", {
      font: "15vw verdana",
      color: "white",
    });

    this.keySpace = this.input.keyboard!.addKey("SPACE");
    this.scene.transition({
      target: "SceneWorld",
      duration: 0, //2000,
      moveBelow: true,
    });
  }

  update(/*time, delta*/) {
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.scene.transition({
        target: "SceneWorld",
        duration: 0, //2000,
        moveBelow: true,
      });
    }
  }
}
