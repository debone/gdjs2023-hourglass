import { Display } from "phaser";
import { Pane } from "tweakpane";
import { SceneWorld, tileSizeHeight, tileSizeWidth } from "./world";

type Color = Display.Color;
const Color = Display.Color;

export class SceneDebug extends Phaser.Scene {
  declare pane: Pane;
  declare params: any;
  declare marker: Phaser.GameObjects.Graphics;
  declare sceneWorld: SceneWorld;

  constructor() {
    super({ key: "SceneDebug" });
  }

  create(data: { sceneWorld: SceneWorld }) {
    this.sceneWorld = data.sceneWorld;

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

    this.marker = this.sceneWorld.add.graphics();
  }

  update() {
    const worldPoint = this.input.activePointer.positionToCamera(
      this.sceneWorld.cameras.main
    ) as Phaser.Math.Vector2;

    const pointerTile = this.sceneWorld.map.map.worldToTileXY(
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
      this.params.tile = this.sceneWorld.map.map.getTileAt(
        Math.floor(pointerTile.x),
        Math.floor(pointerTile.y)
      );

      this.params.water = this.sceneWorld.player.water;
      this.params.stamina = this.sceneWorld.player.stamina;
      this.params.sand = this.sceneWorld.player.sand;
    }

    this.pane.refresh();
  }

  drawMark(
    x: number,
    y: number,
    color: Color,
    graphics: Phaser.GameObjects.Graphics
  ) {
    // this.floorLayer?
    const worldCoord = this.sceneWorld.map.map.tileToWorldXY(x, y)!;
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
}
