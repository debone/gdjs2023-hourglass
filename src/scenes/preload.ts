import Phaser from "phaser";

import testTile from "../assets/test-tile.png?url";
import tileTwo from "../assets/tile-two.png?url";
import testChar from "../assets/test-char.png?url";
import testDune from "../assets/test-dune.png?url";
import duneRed from "../assets/dune-red.png?url";
import duneBlue from "../assets/dune-blue.png?url";
import testKlepsydra from "../assets/test-klepsydra.png?url";

import filter from "../assets/filter.png?url";

import klepsydraA from "../assets/klep-a.png?url";
import klepsydraB from "../assets/klep-b.png?url";

import sandTank from "../assets/sandtank.png?url";

import arrowDown from "../assets/arrow-down.png?url";
import one from "../assets/one.png?url";
import two from "../assets/two.png?url";
import mouse from "../assets/mouse.png?url";

import playerImage from "../assets/char.png?url";
import playerJson from "../assets/char.json?url";

export const RESOURCES = {
  TEST_TILE: "test-tile",
  TILE_TWO: "tile-two",
  TEST_CHAR: "test-char",
  TEST_DUNE: "test-dune",
  TEST_KLEPSYDRA: "test-klepsydra",
  KLEPSYDRA_A: "klep-a",
  KLEPSYDRA_B: "klep-b",
  SAND_TANK: "sand-tank",
  ARROW_DOWN: "arrow-down",
  ONE: "one",
  TWO: "two",
  MOUSE: "mouse",
  FILTER: "filter",
  PLAYER_IMAGE: "player-image",
  PLAYER_JSON: "player-json",
  DUNE_BLUE: "dune-blue",
  DUNE_RED: "dune-red",
} as const;

export const RESOURCES_INDEX = Object.keys(RESOURCES).reduce(
  (acc, key, index) => ({ ...acc, [key]: index }),
  {} as Record<keyof typeof RESOURCES, number>
);

export const RESOURCES_LIST = Object.values(RESOURCES);

declare var WebFont: any;

export class SceneMain extends Phaser.Scene {
  declare keySpace: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.image(RESOURCES.TEST_TILE, testTile);
    this.load.image(RESOURCES.TILE_TWO, tileTwo);
    this.load.image(RESOURCES.TEST_CHAR, testChar);
    this.load.image(RESOURCES.TEST_DUNE, testDune);

    this.load.image(RESOURCES.DUNE_BLUE, duneBlue);
    this.load.image(RESOURCES.DUNE_RED, duneRed);

    this.load.image(RESOURCES.TEST_KLEPSYDRA, testKlepsydra);

    this.load.image(RESOURCES.KLEPSYDRA_A, klepsydraA);
    this.load.image(RESOURCES.KLEPSYDRA_B, klepsydraB);

    this.load.image(RESOURCES.SAND_TANK, sandTank);

    this.load.image(RESOURCES.ARROW_DOWN, arrowDown);
    this.load.image(RESOURCES.MOUSE, mouse);
    this.load.image(RESOURCES.ONE, one);
    this.load.image(RESOURCES.TWO, two);

    this.load.image(RESOURCES.FILTER, filter);

    this.load.aseprite(RESOURCES.PLAYER_IMAGE, playerImage, playerJson);

    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
  }

  create() {
    WebFont.load({
      google: {
        families: ["Alkalami"],
      },
      active: () => {
        this.add
          .text(100, 200, "Sands of time", {
            fontFamily: "Alkalami",
            fontSize: "100px",
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
        this.add
          .text(260, 320, "Press space to start", {
            fontFamily: "Alkalami",
            fontSize: "32px",
            color: "#ffffff",
          })
          .setShadow(2, 2, "#333333", 2, false, true);
      },
    });

    this.keySpace = this.input.keyboard!.addKey("SPACE");
  }

  update(/*time, delta*/) {
    if (Phaser.Input.Keyboard.JustDown(this.keySpace)) {
      this.scene.transition({
        target: "SceneWorld",
        duration: 2000,
      });
    }
  }
}
