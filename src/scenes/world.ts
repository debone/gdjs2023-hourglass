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
import {
  createUISpriteSystem,
  createUIUpdateSpriteSystem,
} from "../systems/UISpriteSystem";
import { SandFallingSystem } from "../systems/SandFallSystem";

export const tileSizeWidth = 64;
export const tileSizeHeight = 32;

export const worldSize = 512;

export const playerStartX = Math.floor(worldSize / 2);
export const playerStartY = Math.floor(worldSize / 2);

export class SceneWorld extends Phaser.Scene {
  gamebus!: PhaserGamebus;
  bus!: Phaser.Events.EventEmitter;

  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  declare keyW: Phaser.Input.Keyboard.Key;
  declare keyA: Phaser.Input.Keyboard.Key;
  declare keyS: Phaser.Input.Keyboard.Key;
  declare keyD: Phaser.Input.Keyboard.Key;

  declare player: Player;

  declare world: IWorld;

  declare map: MapSystem;
  declare sandFallSystem: SandFallingSystem;

  declare uiSpriteSystem: ReturnType<typeof createUISpriteSystem>;
  declare uiUpdateSpriteSystem: ReturnType<typeof createUIUpdateSpriteSystem>;
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

    this.keyW = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W)!;
    this.keyA = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A)!;
    this.keyS = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S)!;
    this.keyD = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D)!;

    this.world = createWorld();

    this.map = new MapSystem(this);
    // create all the systems
    this.uiSpriteSystem = createUISpriteSystem(this);
    this.uiUpdateSpriteSystem = createUIUpdateSpriteSystem(this);
    this.arcadeSpriteSystem = createArcadeSpriteSystem(this);
    this.movementSystem = createMovementSystem();
    this.keyboardMovementSystem = createKeyboardMovementSystem(
      this,
      this.cursors
    );

    this.player = new Player(this, playerStartX, playerStartY);

    this.cameras.main.startFollow(arcadeSpriteById.get(this.player.id)!, true);
    this.sandFallSystem = new SandFallingSystem(this);
  }

  update(_time: number) {
    this.map.update(this);

    this.uiSpriteSystem(this.world);
    this.uiUpdateSpriteSystem(this.world);
    this.arcadeSpriteSystem(this.world);
    this.movementSystem(this.world);
    this.keyboardMovementSystem(this.world);

    this.sandFallSystem.update();
  }
}
