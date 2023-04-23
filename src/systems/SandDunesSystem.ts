import {
  addComponent,
  addEntity,
  defineQuery,
  defineSystem,
  enterQuery,
} from "bitecs";
import { RESOURCES_INDEX, RESOURCES_LIST } from "../scenes/preload";
import { SceneWorld, playerStartX, playerStartY } from "../scenes/world";
import Sand from "../components/Sand";
import { arcadeSpriteById } from "./ArcadeSpriteSystem";
import { params } from "../scenes/debug";
import Dune from "../components/Dune";

class SandDunes {
  scene: SceneWorld;
  layer: Phaser.Tilemaps.TilemapLayer;

  //dune1: Phaser.Textures.CanvasTexture;
  //rt: Phaser.GameObjects.RenderTexture;

  constructor(scene: SceneWorld, layer: Phaser.Tilemaps.TilemapLayer) {
    this.scene = scene;
    this.layer = layer;

    /*const src = scene.textures
      .get(RESOURCES.TEST_DUNE)
      .getSourceImage() as HTMLImageElement;

    const { width, height } = src;*/

    const { x, y } = layer.tileToWorldXY(playerStartX + 3, playerStartY);

    const dune1_entity = addEntity(scene.world);

    addComponent(scene.world, Dune, dune1_entity);
    Dune.texture[dune1_entity] = RESOURCES_INDEX.TEST_DUNE;
    Dune.x[dune1_entity] = x;
    Dune.y[dune1_entity] = y;

    const { x: x2, y: y2 } = layer.tileToWorldXY(
      playerStartX - 15,
      playerStartY - 2
    );

    const dune2_entity = addEntity(scene.world);

    addComponent(scene.world, Dune, dune2_entity);
    Dune.texture[dune2_entity] = RESOURCES_INDEX.TEST_DUNE;
    Dune.x[dune2_entity] = x2;
    Dune.y[dune2_entity] = y2;

    //Loop that adds dunes
    for (let i = 0; i < 50; i++) {
      let { x, y } = layer.tileToWorldXY(
        playerStartX + Phaser.Math.Between(-50, 50),
        playerStartY + Phaser.Math.Between(-50, 50)
      );
      const dune_entity = addEntity(scene.world);

      addComponent(scene.world, Dune, dune_entity);
      Dune.texture[dune_entity] = RESOURCES_INDEX.TEST_DUNE;
      Dune.x[dune_entity] = x;
      Dune.y[dune_entity] = y;
    }
  }
}

export default SandDunes;

export const duneGraphicsById = new Map<
  number,
  {
    canvas: Phaser.Textures.CanvasTexture;
    rt: Phaser.GameObjects.RenderTexture;
  }
>();

// Thanks phaser
const contains = function (
  rw: number,
  rh: number,
  rx: number,
  ry: number,
  x: number,
  y: number
) {
  return rx <= x && rx + rw >= x && ry <= y && ry + rh >= y;
};

export const createDuneSystem = (scene: SceneWorld) => {
  const duneQuery = defineQuery([Dune]);
  const duneQueryEnter = enterQuery(duneQuery);
  //const duneQueryExit = exitQuery(duneQuery);

  return defineSystem((world) => {
    const enterEntities = duneQueryEnter(world);
    for (let i = 0; i < enterEntities.length; i++) {
      const entityId = enterEntities[i];
      const textureId = Dune.texture[entityId];
      const textureKey = `dune_${entityId}`;
      const x = Dune.x[entityId];
      const y = Dune.y[entityId];

      const src = scene.textures
        .get(RESOURCES_LIST[textureId])
        .getSourceImage() as HTMLImageElement;

      const { width, height } = src;

      Dune.width[entityId] = width;
      Dune.height[entityId] = height;

      const canvas = scene.textures.createCanvas(textureKey, width, height)!;
      canvas.draw(0, 0, src);
      canvas.update();

      const rt = scene.add.renderTexture(x, y, width, height).setOrigin(0);
      rt.draw(textureKey, 0, 0);

      duneGraphicsById.set(entityId, { canvas, rt });
    }

    const brushRadius = 5;

    if (
      scene.cursors.space.isDown &&
      Sand.isTankFilled[scene.player.id] === 0
    ) {
      const duneEntities = duneQuery(world);
      for (let i = 0; i < duneEntities.length; i++) {
        const entityId = duneEntities[i];
        const duneX = Dune.x[entityId];
        const duneY = Dune.y[entityId];
        const width = Dune.width[entityId];
        const height = Dune.height[entityId];
        const textureKey = `dune_${entityId}`;

        const { x, y } = arcadeSpriteById.get(scene.player.id)!;

        if (contains(width, height, duneX, duneY, x, y) === false) {
          continue;
        }

        const { canvas, rt } = duneGraphicsById.get(entityId)!;

        const relativeX = Math.floor(x - rt.x);
        const relativeY = Math.floor(22 + y - rt.y);

        params.debugCoord = { x: relativeX, y: relativeY };

        const pixels = canvas.getPixels(
          relativeX - brushRadius,
          relativeY - brushRadius,
          brushRadius * 2,
          brushRadius * 2
        );

        // Loop over all the pixels array and make them transparent
        for (let y = 0; y < pixels.length; y += 1) {
          for (let x = 0; x < pixels[y].length; x += 1) {
            if (pixels[y][x].color > 0) {
              canvas.setPixel(pixels[y][x].x, pixels[y][x].y, 0, 0, 0, 0);

              Sand.normalSand[scene.player.id] += 1;
            }
          }
        }

        canvas.update();

        rt.clear();
        rt.draw(textureKey, 0, 0);
      }
    }

    return world;
  });
};
