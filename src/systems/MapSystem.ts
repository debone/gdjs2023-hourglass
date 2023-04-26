import Phaser from "phaser";
import {
  SceneWorld,
  tileSizeHeight,
  tileSizeWidth,
  worldSize,
} from "../scenes/world";

//import Perlin from "phaser3-rex-plugins/plugins/perlin.js";
import { RESOURCES } from "../scenes/preload";
import SandDunes, { createDuneSystem } from "./SandDunesSystem";

export class MapSystem {
  tileWidth = tileSizeWidth;
  tileHeight = tileSizeHeight;

  map: Phaser.Tilemaps.Tilemap;
  mapData: Phaser.Tilemaps.MapData;

  sandDunes: SandDunes;
  duneSystem: ReturnType<typeof createDuneSystem>;

  constructor(scene: SceneWorld) {
    this.mapData = new Phaser.Tilemaps.MapData({
      width: worldSize,
      height: worldSize,
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      orientation: Phaser.Tilemaps.Orientation.ISOMETRIC,
      format: Phaser.Tilemaps.Formats.ARRAY_2D,
    });

    this.map = new Phaser.Tilemaps.Tilemap(scene, this.mapData);

    const tileset = this.map.addTilesetImage(
      "iso-64x64-outside",
      RESOURCES.TEST_TILE
    );

    const layer = this.map.createBlankLayer("layer", tileset!, 0, 0);

    //layer?.fill(1, 0, 0, worldSize, worldSize);
    layer?.weightedRandomize(
      [
        { index: 0, weight: 10 },
        { index: 1, weight: 1 },
      ],
      0,
      0,
      worldSize,
      worldSize
    );

    this.sandDunes = new SandDunes(scene, layer!);
    this.duneSystem = createDuneSystem(scene);
    this.duneSystem(scene.world);

    //this.generateMap(worldSize, 50);

    //this.defineRoom(93, 132, 98, 137, -1);

    //this.defineRoom(91, 123, 92, 124, -15);
    //this.defineRoom(86, 137, 87, 138, -15);
  }

  update(scene: SceneWorld) {
    this.duneSystem(scene.world);
  }

  generateMap(width: number /*gradient: number*/) {
    //const noise = new Perlin(1);
    //const noise2 = new Perlin(100);
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < width; x++) {
        /*this.map[y].push(
          noise2.perlin2(x / (gradient * 10), y / (gradient * 10)) * 20 +
            noise.simplex2(x / gradient, y / gradient)
        );*/
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
    bottomRightY: number
    //value: number
  ) {
    for (let x = topLeftX; x < bottomRightX; x++) {
      for (let y = topLeftY; y < bottomRightY; y++) {
        //  this.map[y][x] = value;
      }
    }
  }
}
