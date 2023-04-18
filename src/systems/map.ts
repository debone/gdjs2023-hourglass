import Phaser from "phaser";
import { tileSizeHeight, tileSizeWidth, worldSize } from "../scenes/world";

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;
type Camera = Phaser.Cameras.Scene2D.Camera;

import Perlin from "phaser3-rex-plugins/plugins/perlin.js";

export class Map {
  camera: Camera;

  tileWidth = tileSizeWidth;
  tileHeight = tileSizeHeight;

  map: number[][] = [];

  constructor(camera: Camera, tileWidth: number, tileHeight: number) {
    this.camera = camera;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

    this.generateMap(worldSize, 50);

    this.defineRoom(93, 132, 98, 137, -1);

    this.defineRoom(91, 123, 92, 124, -15);
    this.defineRoom(86, 137, 87, 138, -15);
  }

  generateMap(width: number, gradient: number) {
    const noise = new Perlin(1);
    const noise2 = new Perlin(100);
    this.map = [];
    for (let y = 0; y < width; y++) {
      this.map.push([]);
      for (let x = 0; x < width; x++) {
        this.map[y].push(
          noise2.perlin2(x / (gradient * 10), y / (gradient * 10)) * 20 +
            noise.simplex2(x / gradient, y / gradient)
        );
      }
    }
  }

  /**
   * Function that defines a room in the map
   * a room is a rectangle of tiles
   * the room is defined by the top left and bottom right tiles
   */
  defineRoom(
    topLeftX: number,
    topLeftY: number,
    bottomRightX: number,
    bottomRightY: number,
    value: number
  ) {
    for (let x = topLeftX; x < bottomRightX; x++) {
      for (let y = topLeftY; y < bottomRightY; y++) {
        this.map[y][x] = value;
      }
    }
  }

  getTile(x: number, y: number) {
    return this.map?.[y]?.[x];
  }

  worldToTile(worldX: number, worldY: number, point: Vector2 = new Vector2()) {
    // Find the world position relative to the static or dynamic layer's top left origin,
    // factoring in the camera's vertical scroll
    /*worldY =
      worldY -
      (tilemapLayer.y + camera.scrollY * (1 - tilemapLayer.scrollFactorY));

    tileHeight *= tilemapLayer.scaleY;

    // Find the world position relative to the static or dynamic layer's top left origin,
    // factoring in the camera's horizontal scroll

    worldX =
      worldX -
      (tilemapLayer.x + camera.scrollX * (1 - tilemapLayer.scrollFactorX));

    tileWidth *= tilemapLayer.scaleX;*/

    const tileWidthHalf = this.tileWidth / 2;
    const tileHeightHalf = this.tileHeight / 2;

    //    worldX = worldX - tileWidthHalf;

    var x = 0.5 * (worldX / tileWidthHalf + worldY / tileHeightHalf);
    var y = 0.5 * (-worldX / tileWidthHalf + worldY / tileHeightHalf);

    x = Math.floor(x);
    y = Math.floor(y);

    return point.set(x, y);
  }

  tileToWorld(tileX: number, tileY: number, point: Vector2 = new Vector2()) {
    var layerWorldX = 0;
    var layerWorldY = 0;

    var x = layerWorldX + (tileX - tileY) * (this.tileWidth / 2);
    var y = layerWorldY + (tileX + tileY) * (this.tileHeight / 2);

    return point.set(x, y);
  }
}
