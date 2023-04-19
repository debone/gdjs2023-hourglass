import { addEntity } from "bitecs";
import { RESOURCES, RESOURCES_INDEX } from "../scenes/preload";
import { SceneWorld } from "../scenes/world";
import { addComponent } from "bitecs";
import Position from "../components/Position";
import ArcadeSprite from "../components/ArcadeSprite";
import { arcadeSpriteById } from "../systems/ArcadeSpriteSystem";
import KeyboardControl from "../components/KeyboardControl";

export class Player {
  declare id: number;

  declare maxWater: number;
  declare water: number;

  declare maxStamina: number;
  declare stamina: number;

  declare sand: number;
  declare maxSand: number;

  declare sceneWorld: SceneWorld;

  constructor(scene: SceneWorld, posX: number, posY: number) {
    this.id = addEntity(scene.world);

    addComponent(scene.world, KeyboardControl, this.id);

    addComponent(scene.world, ArcadeSprite, this.id);

    ArcadeSprite.texture[this.id] = RESOURCES_INDEX.TEST_CHAR;

    scene.arcadeSpriteSystem(scene.world);

    const { x, y } = scene.map.map.tileToWorldXY(posX, posY)!;

    arcadeSpriteById.get(this.id)!.setPosition(x, y);

    //    this.sceneWorld = scene;

    /*    this.maxWater = 10;
    this.water = 10;

    this.maxStamina = 10;
    this.stamina = 10;*/

    //this.playerPos = new Phaser.Math.Vector2(x, y);
  }
}
