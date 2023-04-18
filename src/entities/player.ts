import { RESOURCES } from "../scenes/main";
import { SceneWorld } from "../scenes/world";

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare posX: number;
  declare posY: number;

  declare maxWater: number;
  declare water: number;

  declare maxStamina: number;
  declare stamina: number;

  declare sand: number;
  declare maxSand: number;

  declare sceneWorld: SceneWorld;

  constructor(
    scene: SceneWorld,
    x: number,
    y: number,
    posX: number,
    posY: number
  ) {
    super(scene, x, y, RESOURCES.TEST_CHAR);
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.posX = posX;
    this.posY = posY;

    this.sceneWorld = scene;

    this.setOrigin(0, 0.75);

    this.maxWater = 10;
    this.water = 10;

    this.maxStamina = 10;
    this.stamina = 10;

    //this.playerPos = new Phaser.Math.Vector2(x, y);
  }
}
