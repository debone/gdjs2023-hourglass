import { addEntity } from "bitecs";
import { RESOURCES_INDEX } from "../scenes/preload";
import { SceneWorld } from "../scenes/world";
import { addComponent } from "bitecs";
import ArcadeSprite from "../components/ArcadeSprite";
import { arcadeSpriteById } from "../systems/ArcadeSpriteSystem";
import KeyboardControl from "../components/KeyboardControl";
import Sand from "../components/Sand";
import ActiveKlepsydra from "../components/ActiveKlepsydra";
import UISprite from "../components/UISprite";
import Position, { UpdatePosition } from "../components/Position";
import TickEquip from "../components/TickEquip";
import TickHealth from "../components/TickHealth";

export class Player {
  declare id: number;

  declare maxWater: number;
  declare water: number;

  declare maxStamina: number;
  declare stamina: number;

  declare sceneWorld: SceneWorld;

  constructor(scene: SceneWorld, posX: number, posY: number) {
    this.id = addEntity(scene.world);

    addComponent(scene.world, KeyboardControl, this.id);

    addComponent(scene.world, ArcadeSprite, this.id);
    ArcadeSprite.texture[this.id] = RESOURCES_INDEX.TEST_CHAR;

    scene.arcadeSpriteSystem(scene.world);

    const { x, y } = scene.map.map.tileToWorldXY(posX, posY)!;
    arcadeSpriteById.get(this.id)!.setPosition(x, y);

    addComponent(scene.world, Sand, this.id);
    Sand.isTankFilled[this.id] = 0;
    Sand.size[this.id] = 0;
    Sand.pos[this.id] = 0;

    addComponent(scene.world, TickEquip, this.id);
    TickEquip.equip[this.id] = 1;
    TickEquip.maxEquip[this.id] = 10;

    addComponent(scene.world, TickHealth, this.id);
    TickHealth.health[this.id] = 300;
    TickHealth.maxHealth[this.id] = 300;

    const activeKlep = addEntity(scene.world);

    addComponent(scene.world, ActiveKlepsydra, this.id);
    ActiveKlepsydra.klepsydra[activeKlep] = 0;

    const klepPos = [
      [104, 435],
      [232, 435],
    ];

    addComponent(scene.world, UISprite, activeKlep);
    UISprite.texture[activeKlep] = RESOURCES_INDEX.ARROW_DOWN;

    addComponent(scene.world, Position, activeKlep);
    Position.x[activeKlep] = klepPos[0][0];
    Position.y[activeKlep] = klepPos[0][1];

    const numberOneKey = scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ONE
    );
    const numberTwoKey = scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.TWO
    );

    numberOneKey?.on("up", () => {
      ActiveKlepsydra.klepsydra[this.id] = 0;

      Position.x[activeKlep] = klepPos[0][0];
      Position.y[activeKlep] = klepPos[0][1];
      addComponent(scene.world, UpdatePosition, activeKlep);
    });

    numberTwoKey?.on("up", () => {
      ActiveKlepsydra.klepsydra[this.id] = 1;

      Position.x[activeKlep] = klepPos[1][0];
      Position.y[activeKlep] = klepPos[1][1];
      addComponent(scene.world, UpdatePosition, activeKlep);
    });

    //    Sand.currentSand[this.id] = 0;
    //   Sand.maxSand[this.id] = 1000;

    //    this.sceneWorld = scene;

    /*    this.maxWater = 10;
    this.water = 10;

    this.maxStamina = 10;
    this.stamina = 10;*/

    //this.playerPos = new Phaser.Math.Vector2(x, y);
  }
}
