import { addComponent, addEntity } from "bitecs";
import { RESOURCES } from "../scenes/preload";
import { SceneWorld, playerStartX, playerStartY } from "../scenes/world";
import Sand from "../components/Sand";
import { arcadeSpriteById } from "./ArcadeSpriteSystem";
import { params } from "../scenes/debug";

class SandDunesSystem {
  scene: SceneWorld;
  layer: Phaser.Tilemaps.TilemapLayer;

  dune1: Phaser.Textures.CanvasTexture;
  rt: Phaser.GameObjects.RenderTexture;

  constructor(scene: SceneWorld, layer: Phaser.Tilemaps.TilemapLayer) {
    this.scene = scene;
    this.layer = layer;

    const src = scene.textures
      .get(RESOURCES.TEST_DUNE)
      .getSourceImage() as HTMLImageElement;

    const { width, height } = src;

    const dune1_entity = addEntity(scene.world);

    addComponent(scene.world, Sand, dune1_entity);

    Sand.currentSand[dune1_entity] = 100;

    this.dune1 = scene.textures.createCanvas("dune_1", width, height)!;

    this.dune1.draw(0, 0, src);
    this.dune1.update();

    const { x, y } = layer.tileToWorldXY(playerStartX + 3, playerStartY);

    this.rt = scene.add.renderTexture(x, y, width, height).setOrigin(0);

    this.rt.draw("dune_1", 0, 0);
    //rt.fill(0xff0000);

    //dune1(x, y, RESOURCES.TEST_DUNE);
  }

  brushRadius = 5;

  update() {
    if (this.scene.cursors.space.isDown) {
      const { x, y } = arcadeSpriteById.get(this.scene.player.id)!;

      const relativeX = Math.floor(x - this.rt.x);
      const relativeY = Math.floor(22 + y - this.rt.y);

      params.debugCoord = { x: relativeX, y: relativeY };

      const pixels = this.dune1.getPixels(
        relativeX - this.brushRadius,
        relativeY - this.brushRadius,
        this.brushRadius * 2,
        this.brushRadius * 2
      );

      //debugger;

      // Loop over all the pixels array and make them transparent
      for (let y = 0; y < pixels.length; y += 1) {
        for (let x = 0; x < pixels[y].length; x += 1) {
          if (pixels[y][x].color > 0) {
            this.dune1.setPixel(pixels[y][x].x, pixels[y][x].y, 0, 0, 0, 0);
            params.sandTank += 1;
            //.pixels[y * this.dune1.width + x] = 0;
          }
        }
      }

      this.dune1.update();

      this.rt.clear();
      this.rt.draw("dune_1", 0, 0);
      //this.dune1.update();
    }
  }
}

export default SandDunesSystem;
