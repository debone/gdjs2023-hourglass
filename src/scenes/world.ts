import { Pane } from "tweakpane";

import PhaserGamebus from "../gamebus";

import Phaser, { Display } from "phaser";
import { Map } from "../systems/map";
//import { RESOURCES } from "./main";
import { Player } from "../entities/player";

type Color = Display.Color;
const Color = Display.Color;

export const tileSizeWidth = 64;
export const tileSizeHeight = 32;

export const worldSize = 512;

export const playerStartX = 95;
export const playerStartY = 35;

export class SceneWorld extends Phaser.Scene {
  declare controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  gamebus!: PhaserGamebus;
  bus!: Phaser.Events.EventEmitter;

  declare pane: Pane;
  declare params: any;
  declare marker: Phaser.GameObjects.Graphics;
  declare cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "SceneWorld" });
  }

  drawMark(
    x: number,
    y: number,
    color: Color,
    graphics: Phaser.GameObjects.Graphics
  ) {
    // this.floorLayer?
    const worldCoord = this.map.map.tileToWorldXY(x, y)!;
    //const tileAt = this.map.getTile(x, y);

    // Snap to tile coordinates, but in world space
    let tx = worldCoord.x;
    let ty = worldCoord.y;

    graphics.lineStyle(7, color.color, 1);
    graphics.translateCanvas(tx, ty + tileSizeHeight);
    graphics.beginPath();
    graphics.moveTo(tileSizeWidth / 2, 0);
    graphics.lineTo(tileSizeWidth, tileSizeHeight / 2);
    graphics.lineTo(tileSizeWidth / 2, tileSizeHeight);
    graphics.lineTo(0, tileSizeHeight / 2);
    graphics.lineTo(tileSizeWidth / 2, 0);
    graphics.closePath();
    graphics.strokePath();
  }

  create() {
    this.scene.run("SceneHUD", { sceneWorld: this });

    this.bus = this.gamebus.getBus();

    this.params = {
      fps: 0,
      tileCoord: { x: 50, y: 25 },
      worldCoord: { x: 50, y: 25 },
      tile: 1,
      water: 0,
      stamina: 0,
      sand: 0,
    };
    this.pane = new Pane();
    this.pane.addMonitor(this.params, "fps");
    this.pane.addInput(this.params, "tileCoord");
    this.pane.addInput(this.params, "worldCoord");
    this.pane.addInput(this.params, "tile");
    this.pane.addSeparator();
    this.pane.addInput(this.params, "water", { min: 0, max: 10 });
    this.pane.addInput(this.params, "stamina", { min: 0, max: 10 });
    this.pane.addInput(this.params, "sand", { min: 0, max: 100 });

    this.add.text(100, 100, "Maaain", {
      font: "15vw verdana",
      color: "white",
    });

    this.cursors = this.input.keyboard!.createCursorKeys();

    //this.cameras.main.setZoom(0.1);

    /*const controlConfig = {
      camera: this.cameras.main,
      left: this.cursors.left,
      right: this.cursors.right,
      up: this.cursors.up,
      down: this.cursors.down,
      acceleration: 0.04,
      drag: 0.0005,
      maxSpeed: 0.7,
    };*/

    /*this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig
    );*/

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.createGame();
  }

  declare mapRender: Phaser.GameObjects.Graphics;
  declare map: Map;
  declare player: Player;
  declare playerStart: Phaser.Math.Vector2;

  createGame() {
    this.map = new Map(this, tileSizeWidth, tileSizeHeight);

    this.playerStart = this.map.map.tileToWorldXY(playerStartX, playerStartY)!;
    //this.cameras.main.centerOn(this.playerStart.x, this.playerStart.y);

    this.player = new Player(
      this,
      this.playerStart.x,
      this.playerStart.y,
      playerStartX,
      playerStartY
    );

    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setDeadzone(200, 100);

    this.marker = this.add.graphics();
    //this.player.body?.drawDebug(this.marker);
    this.drawMark(7, 7, Color.RandomRGB(), this.marker);
  }

  update(_time: number) {
    //    this.controls.update(delta);

    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
      this.gamebus.emit("pulse", _time);
    }

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-100);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(100);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-100);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(100);
    }

    //this.floorLayer.setOrigin(0, -1);
    //this.floorLayer.setPosition(0, this.params.X);
    const worldPoint = this.input.activePointer.positionToCamera(
      this.cameras.main
    ) as Phaser.Math.Vector2;

    const pointerTile = this.map.map.worldToTileXY(
      worldPoint.x,
      worldPoint.y, //- this.map.tileWidth / 2,,
      true
    );

    //    console.log(this.map.getTileAt(pointerTile.x, pointerTile.y));

    if (pointerTile) {
      this.marker.clear();
      this.drawMark(
        pointerTile.x,
        pointerTile.y,
        Color.IntegerToColor(0x9966ff),
        this.marker
      );
      // Snap to tile coordinates, but in world space
      //this.marker.x = worldCoord.x;
      //this.marker.y = worldCoord.y - tileFloorHeight[tileAt.index];

      //log(`mouse is at, ${worldCoord.x}, ${worldCoord.y}`);
      //debugEvery(500);

      this.params.fps = this.game.loop.actualFps;
      this.params.tileCoord.x = pointerTile.x;
      this.params.tileCoord.y = pointerTile.y;
      this.params.worldCoord.x = worldPoint.x;
      this.params.worldCoord.y = worldPoint.y;
      this.params.tile = this.map.map.getTileAt(
        Math.floor(pointerTile.x),
        Math.floor(pointerTile.y)
      );

      this.params.water = this.player.water;
      this.params.stamina = this.player.stamina;
      this.params.sand = this.player.sand;
    }

    this.pane.refresh();
  }
}
