import PhaserGamebus from "../gamebus";

import Phaser from "phaser";
import { IWorld, createWorld } from "bitecs";
import createArcadeSpriteSystem, {
  arcadeSpriteById,
} from "../systems/ArcadeSpriteSystem";
import createMovementSystem from "../systems/MovementSystem";
import { MapSystem } from "../systems/MapSystem";
import { Player } from "../entities/player";
import createKeyboardMovementSystem from "../systems/KeyboardMovementSystem";
import { createSpriteSystem } from "../systems/SpriteSystem";
import { SandFallingSystem } from "../systems/SandFallSystem";
import { params } from "./debug";
import Sand from "../components/Sand";

export const tileSizeWidth = 64;
export const tileSizeHeight = 32;

export const worldSize = 512;

export const playerStartX = 95;
export const playerStartY = 35;

export class SceneWorld extends Phaser.Scene {
  gamebus!: PhaserGamebus;
  bus!: Phaser.Events.EventEmitter;

  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  declare player: Player;

  declare world: IWorld;

  declare map: MapSystem;
  declare sandFallSystem: SandFallingSystem;

  declare spriteSystem: ReturnType<typeof createSpriteSystem>;
  declare arcadeSpriteSystem: ReturnType<typeof createArcadeSpriteSystem>;
  declare movementSystem: ReturnType<typeof createMovementSystem>;
  declare keyboardMovementSystem: ReturnType<
    typeof createKeyboardMovementSystem
  >;

  constructor() {
    super({ key: "SceneWorld" });
  }

  create() {
    this.scene.run("SceneDebug", { sceneWorld: this });

    this.bus = this.gamebus.getBus();

    //this.cameras.main.setZoom(0.1);
    this.cameras.main.setDeadzone(200, 100);
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.world = createWorld();

    this.map = new MapSystem(this);
    // create all the systems
    this.arcadeSpriteSystem = createArcadeSpriteSystem(this);
    this.movementSystem = createMovementSystem();
    this.keyboardMovementSystem = createKeyboardMovementSystem(this.cursors);

    this.player = new Player(this, playerStartX, playerStartY);

    this.cameras.main.startFollow(arcadeSpriteById.get(this.player.id)!, true);
    this.sandFallSystem = new SandFallingSystem(this);
  }

  update(_time: number) {
    this.arcadeSpriteSystem(this.world);
    this.movementSystem(this.world);
    this.keyboardMovementSystem(this.world);

    this.map.update();

    this.sandFallSystem.update();
    params.sand = Sand.currentSand[this.player.id];
  }
}
