import ActiveKlepsydra from "../components/ActiveKlepsydra";
import Sand from "../components/Sand";
import TickEquip from "../components/TickEquip";
import TickHealth from "../components/TickHealth";
import { GAME_CONFIG } from "../consts";
import { RESOURCES } from "../scenes/preload";
import { SceneWorld } from "../scenes/world";

//export const
export const sandTankBuffer = new Uint8Array(25000);

export const STEP_MARKER_MASK = 0b0000_0001;
export const STEP_MARKER_EVEN = 0b0000_0000;
export const STEP_MARKER_ODD = 0b0000_0001;

export const VARIANT_MASK = 0b0000_1110;
export const VARIANT_SHIFT = 1;

export const PIXEL_TYPE_MASK = 0b0111_0000;
export const PIXEL_TYPE_SHIFT = 4;

export const PIXEL_TYPE_AIR = 0b0001_0000;
export const PIXEL_TYPE_WALL = 0b0010_0000;
export const PIXEL_TYPE_CHOKE_A = 0b0011_0000;
export const PIXEL_TYPE_CHOKE_B = 0b0100_0000;
export const PIXEL_TYPE_CHOKE_C = 0b0101_0000;
export const PIXEL_TYPE_CHOKE_D = 0b0110_0000;

export const PIXEL_TYPE_AIR_SHIFTED = PIXEL_TYPE_AIR >> PIXEL_TYPE_SHIFT;
export const PIXEL_TYPE_WALL_SHIFTED = PIXEL_TYPE_WALL >> PIXEL_TYPE_SHIFT;
export const PIXEL_TYPE_CHOKE_A_SHIFTED =
  PIXEL_TYPE_CHOKE_A >> PIXEL_TYPE_SHIFT;
export const PIXEL_TYPE_CHOKE_B_SHIFTED =
  PIXEL_TYPE_CHOKE_B >> PIXEL_TYPE_SHIFT;
export const PIXEL_TYPE_CHOKE_C_SHIFTED =
  PIXEL_TYPE_CHOKE_C >> PIXEL_TYPE_SHIFT;
export const PIXEL_TYPE_CHOKE_D_SHIFTED =
  PIXEL_TYPE_CHOKE_D >> PIXEL_TYPE_SHIFT;

export const SAND_CHECK_MASK = 0b1000_0000;
export const SAND_CHECK_SHIFT = 7;

export const SAND_TYPE_NORMAL = 0b1000_0000;
export const SAND_TYPE_HEALTH = 0b1001_0000;
export const SAND_TYPE_TANK = 0b1010_0000;

export const SAND_TYPE_NORMAL_SHIFTED = SAND_TYPE_NORMAL >> PIXEL_TYPE_SHIFT;
export const SAND_TYPE_HEALTH_SHIFTED = SAND_TYPE_HEALTH >> PIXEL_TYPE_SHIFT;
export const SAND_TYPE_TANK_SHIFTED = SAND_TYPE_TANK >> PIXEL_TYPE_SHIFT;

const addEquip = 1;
const addHealth = 2;

export class SandFallingSystem {
  scene: SceneWorld;
  graphics: Phaser.GameObjects.Graphics;

  playerId: number;

  width = GAME_CONFIG.width / 2;
  height = GAME_CONFIG.height / 2;

  sandWorld = new Uint8Array(this.width * this.height).fill(PIXEL_TYPE_AIR);

  iteration = STEP_MARKER_ODD;
  nextIteration = STEP_MARKER_EVEN;

  chokeA = {
    stored: 0,
    ticks: 0,
    maxTicks: 30,
  };

  chokeB = {
    stored: 0,
    ticks: 0,
    maxTicks: 30,
  };

  klepASwapPoint!: { x: number; y: number };
  klepBSwapPoint!: { x: number; y: number };

  sandTankSpawnPoints: number[] = [];
  sandTankCollectionPoints: number[] = [];

  constructor(scene: SceneWorld) {
    this.scene = scene;
    this.playerId = this.scene.player.id;

    this.graphics = scene.add.graphics();
    this.graphics.setScrollFactor(0);
    this.graphics.setScale(2);

    const klepA = scene.textures
      .get(RESOURCES.KLEPSYDRA_A)
      .getSourceImage() as HTMLImageElement;

    const klepB = scene.textures
      .get(RESOURCES.KLEPSYDRA_B)
      .getSourceImage() as HTMLImageElement;

    const sandTank = scene.textures
      .get(RESOURCES.SAND_TANK)
      .getSourceImage() as HTMLImageElement;

    const filter = scene.textures
      .get(RESOURCES.FILTER)
      .getSourceImage() as HTMLImageElement;

    const klepsydra = scene.textures.createCanvas(
      "klepsydra",
      this.width,
      this.height
    );

    const { width, height } = klepsydra!;

    klepsydra?.draw(0, height - 74 - 40, klepA);
    klepsydra?.draw(12, height - 180 - 40, filter);
    klepsydra?.draw(64, height - 74 - 40, klepB);
    klepsydra?.draw(336, height - 106 - 60, sandTank);

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        //const pixel = scene.textures.getPixel(x, y, RESOURCES.TEST_KLEPSYDRA);
        const pixel = klepsydra?.getPixel(x, y);
        if (pixel && pixel.alpha > 0) {
          if (pixel.red === 55) {
            this.sandWorld[x + y * this.width] =
              SAND_TYPE_HEALTH | (Phaser.Math.Between(0, 3) << 1);
          } else if (pixel.red === 155) {
            this.klepASwapPoint = { x, y };
          } else if (pixel.red === 255) {
            this.sandWorld[x + y * this.width] = PIXEL_TYPE_CHOKE_A;
          } else if (pixel.green === 55) {
            this.sandWorld[x + y * this.width] = PIXEL_TYPE_CHOKE_C;
          } else if (pixel.green === 85) {
            this.sandWorld[x + y * this.width] = PIXEL_TYPE_CHOKE_D;
          } else if (pixel.green === 155) {
            this.klepBSwapPoint = { x, y };
          } else if (pixel.green === 255) {
            this.sandWorld[x + y * this.width] = PIXEL_TYPE_CHOKE_B;
          } else if (pixel.blue === 55) {
            this.sandWorld[x + y * this.width] =
              SAND_TYPE_TANK | (Phaser.Math.Between(0, 3) << 1);
          } else if (pixel.blue === 155) {
            this.sandTankSpawnPoints.push(x + y * this.width);
          } else if (pixel.blue === 255) {
            this.sandTankCollectionPoints.push(x + y * this.width);
          } else {
            this.sandWorld[x + y * this.width] = PIXEL_TYPE_WALL;
          }
        }
      }
    }

    const keyR = scene.input.keyboard!.addKey("R");

    keyR.on("up", () => {
      let swapPoints;
      if (ActiveKlepsydra.klepsydra[this.playerId] === 0) {
        swapPoints = this.klepASwapPoint;
      } else {
        swapPoints = this.klepBSwapPoint;
      }
      let maxX = 29;
      let maxY = 62;
      let temp, futureX, futureY, by, bx;

      // A loop where it mirrors the array of numbers on the x axis
      for (let y = 0; y < maxY / 2 - 1; y++) {
        for (let x = 0; x < maxX; x++) {
          bx = x + swapPoints.x;
          by = this.width * (y + swapPoints.y);

          futureX = swapPoints.x + maxX - x - 1;
          futureY = this.width * (swapPoints.y + maxY - y - 1);

          temp = this.sandWorld[bx + by];
          this.sandWorld[bx + by] = this.sandWorld[futureX + futureY];
          this.sandWorld[futureX + futureY] = temp;
        }
      }

      /*
      for (let loopY = swapPoints.y, i =0; loopY < maxY + swapPoints.y; loopY++, i++) {
        for (let x = swapPoints.x, j = 0; x < maxX + swapPoints.x; x++, j++) {
          y = this.width * loopY;
          curr = x + y;
          if (this.sandWorld[curr] >> PIXEL_TYPE_SHIFT !==
            PIXEL_TYPE_WALL_SHIFTED) {
              futureX = x

            temp = this.sandWorld[curr];
            this.sandWorld[curr] = this.sandWorld[];
            this
          }
        }
      }*/
    });
  }

  update() {
    /**
    if (this.scene.input.activePointer.isDown) {
      const x = Math.floor(this.scene.input.activePointer.x / 2);
      const y = this.width * Math.floor(this.scene.input.activePointer.y / 2);
      this.sandWorld[x + y - this.width] = SAND_TYPE_WALL;
      this.sandWorld[1 + x + y - this.width] = SAND_TYPE_WALL;
      this.sandWorld[-1 + x + y - this.width] = SAND_TYPE_WALL;
      this.sandWorld[x + y] = SAND_TYPE_WALL;
      this.sandWorld[1 + x + y] = SAND_TYPE_WALL;
      this.sandWorld[-1 + x + y] = SAND_TYPE_WALL;
      this.sandWorld[x + y + this.width] = SAND_TYPE_WALL;
      this.sandWorld[1 + x + y + this.width] = SAND_TYPE_WALL;
      this.sandWorld[-1 + x + y + this.width] = SAND_TYPE_WALL;
    } else {
        /**/
    /*const x = Math.floor(this.scene.input.activePointer.x / 2);
    const y = this.width * Math.floor(this.scene.input.activePointer.y / 2);
    this.sandWorld[x + y - this.width] = SAND_TYPE_NORMAL;
    this.sandWorld[1 + x + y - this.width] = SAND_TYPE_NORMAL;
    this.sandWorld[-1 + x + y - this.width] = SAND_TYPE_NORMAL;
    this.sandWorld[x + y] = SAND_TYPE_NORMAL;
    this.sandWorld[1 + x + y] = SAND_TYPE_NORMAL;
    this.sandWorld[-1 + x + y] = SAND_TYPE_NORMAL;
    this.sandWorld[x + y + this.width] = SAND_TYPE_NORMAL;
    this.sandWorld[1 + x + y + this.width] = SAND_TYPE_NORMAL;
    this.sandWorld[-1 + x + y + this.width] = SAND_TYPE_NORMAL;
    // }
    /**/

    //if ()

    //if (Sand.normalSand)

    this.iteration =
      this.iteration === STEP_MARKER_EVEN ? STEP_MARKER_ODD : STEP_MARKER_EVEN;
    this.nextIteration =
      this.iteration === STEP_MARKER_EVEN ? STEP_MARKER_ODD : STEP_MARKER_EVEN;

    if (Sand.isTankFilled[this.playerId] > 0) {
      let free = true;
      for (let i = 0; i < this.sandTankSpawnPoints.length; i++) {
        if (
          this.sandWorld[this.sandTankSpawnPoints[i]] >> PIXEL_TYPE_SHIFT !==
          PIXEL_TYPE_AIR_SHIFTED
        ) {
          free = false;
          break;
        }
      }
      if (free) {
        Sand.isTankFilled[this.playerId] = 0;
      }
    } else {
      if (Sand.size[this.playerId] - Sand.pos[this.playerId] > 0) {
        for (let i = 0; i < this.sandTankSpawnPoints.length; i++) {
          if (
            this.sandWorld[this.sandTankSpawnPoints[i]] >> PIXEL_TYPE_SHIFT ===
            PIXEL_TYPE_AIR_SHIFTED
          ) {
            const sandType =
              sandTankBuffer[Sand.pos[this.playerId]] === 3
                ? SAND_TYPE_TANK
                : sandTankBuffer[Sand.pos[this.playerId]] === 2
                ? SAND_TYPE_HEALTH
                : SAND_TYPE_NORMAL;

            this.sandWorld[this.sandTankSpawnPoints[i]] =
              sandType | (Phaser.Math.Between(0, 3) << 1) | this.iteration;
            Sand.pos[this.playerId] += 1;

            if (Sand.size[this.playerId] - Sand.pos[this.playerId] === 0) {
              Sand.size[this.playerId] = 0;
              Sand.pos[this.playerId] = 0;
              break;
            }
          } else {
            Sand.isTankFilled[this.playerId] = 1;
            break;
          }
        }
      }
    }

    if (this.scene.input.activePointer.isDown) {
      const x = Math.floor(this.scene.input.activePointer.x / 2);
      const y = this.width * Math.floor(this.scene.input.activePointer.y / 2);
      for (let i = 0; i < 3; i++) {
        if (
          this.sandWorld[x + i + y] >> PIXEL_TYPE_SHIFT ===
            PIXEL_TYPE_AIR_SHIFTED &&
          this.sandWorld[this.sandTankCollectionPoints[i]] >>
            PIXEL_TYPE_SHIFT !==
            PIXEL_TYPE_AIR_SHIFTED
        ) {
          this.sandWorld[x + i + y] =
            this.sandWorld[this.sandTankCollectionPoints[i]];
          this.sandWorld[this.sandTankCollectionPoints[i]] = PIXEL_TYPE_AIR;
        }
      }
    }

    let down = 0;
    let downLeft = 0;
    let downRight = 0;
    let up = 0;
    let upLeft = 0;
    let upRight = 0;
    let curr = 0;
    let sw = this.sandWorld;

    // Loop through this.sandWorld and move the sand down
    for (let loopY = this.height - 1; loopY >= 0; loopY--) {
      for (
        let x = this.iteration > 0 ? 0 : this.width - 1;
        (this.iteration > 0 && x < this.width) ||
        (this.iteration === 0 && x >= 0);
        x += this.iteration > 0 ? 1 : -1
      ) {
        let y = this.width * loopY;
        curr = x + y;

        if (
          sw[curr] >> SAND_CHECK_SHIFT === 1 &&
          (sw[curr] & STEP_MARKER_MASK) === this.iteration
        ) {
          down = x + y + this.width;
          downLeft = x + y + this.width - 1;
          downRight = x + y + this.width + 1;

          if (sw[down] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_AIR_SHIFTED) {
            sw[down] = ((sw[curr] >> 1) << 1) | this.nextIteration;
            sw[curr] = PIXEL_TYPE_AIR;
            continue;
          }

          if (sw[downLeft] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_AIR_SHIFTED) {
            sw[downLeft] = ((sw[curr] >> 1) << 1) | this.nextIteration;
            sw[curr] = PIXEL_TYPE_AIR;
            continue;
          }

          if (sw[downRight] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_AIR_SHIFTED) {
            sw[downRight] = ((sw[curr] >> 1) << 1) | this.nextIteration;
            sw[curr] = PIXEL_TYPE_AIR;
            continue;
          }

          continue;
        }

        // I will not check if the sand is finding the choke point, but if the choke point is finding the sand
        // Because there's only two choke points and infinite more sand
        // So it's better to check the choke points
        if (sw[curr] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_CHOKE_A_SHIFTED) {
          // The choke point is inactive
          if (this.chokeA.stored === 0) {
            // Try to activate it
            up = x + y - this.width;
            upLeft = x + y - this.width - 1;
            upRight = x + y - this.width + 1;

            if (sw[up] >> SAND_CHECK_SHIFT === 1) {
              this.chokeA.stored = (sw[up] >> 1) << 1;
              this.chokeA.ticks = this.chokeA.maxTicks;

              sw[up] = PIXEL_TYPE_AIR;
              continue;
            }

            if (sw[upLeft] >> SAND_CHECK_SHIFT === 1) {
              this.chokeA.stored = (sw[upLeft] >> 1) << 1;
              this.chokeA.ticks = this.chokeA.maxTicks;

              sw[upLeft] = PIXEL_TYPE_AIR;
              continue;
            }

            if (sw[upRight] >> SAND_CHECK_SHIFT === 1) {
              this.chokeA.stored = (sw[upRight] >> 1) << 1;
              this.chokeA.ticks = this.chokeA.maxTicks;

              sw[upRight] = PIXEL_TYPE_AIR;
              continue;
            }
          } else {
            if (this.chokeA.ticks > 0) {
              if (
                this.chokeA.stored >> PIXEL_TYPE_SHIFT ===
                  SAND_TYPE_TANK_SHIFTED &&
                TickEquip.equip[this.scene.player.id] <
                  TickEquip.maxEquip[this.scene.player.id]
              ) {
                TickEquip.equip[this.scene.player.id] += addEquip;
              }
              if (
                this.chokeA.stored >> PIXEL_TYPE_SHIFT ===
                  SAND_TYPE_HEALTH_SHIFTED &&
                TickHealth.health[this.scene.player.id] <
                  TickHealth.maxHealth[this.scene.player.id]
              ) {
                TickHealth.health[this.scene.player.id] += addHealth;
              }
              this.chokeA.ticks--;
            } else if (
              sw[x + y + this.width] >> PIXEL_TYPE_SHIFT ===
              PIXEL_TYPE_AIR_SHIFTED
            ) {
              if ((this.chokeA.stored & VARIANT_MASK) >> VARIANT_SHIFT > 0) {
                const nextVariant =
                  ((this.chokeA.stored & VARIANT_MASK) >> VARIANT_SHIFT) - 1;
                sw[x + y + this.width] =
                  (this.chokeA.stored & ~VARIANT_MASK) | nextVariant;
              }
              this.chokeA.stored = 0;
            }
          }
        }

        // I will not check if the sand is finding the choke point, but if the choke point is finding the sand
        // Because there's only two choke points and infinite more sand
        // So it's better to check the choke points
        if (sw[curr] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_CHOKE_B_SHIFTED) {
          // The choke point is inactive
          if (this.chokeB.stored === 0) {
            // Try to activate it
            up = x + y - this.width;
            upLeft = x + y - this.width - 1;
            upRight = x + y - this.width + 1;

            if (sw[up] >> SAND_CHECK_SHIFT === 1) {
              this.chokeB.stored = (sw[up] >> 1) << 1;
              this.chokeB.ticks = this.chokeB.maxTicks;

              sw[up] = PIXEL_TYPE_AIR;
              continue;
            }

            if (sw[upLeft] >> SAND_CHECK_SHIFT === 1) {
              this.chokeB.stored = (sw[upLeft] >> 1) << 1;
              this.chokeB.ticks = this.chokeB.maxTicks;

              sw[upLeft] = PIXEL_TYPE_AIR;
              continue;
            }

            if (sw[upRight] >> SAND_CHECK_SHIFT === 1) {
              this.chokeB.stored = (sw[upRight] >> 1) << 1;
              this.chokeB.ticks = this.chokeB.maxTicks;

              sw[upRight] = PIXEL_TYPE_AIR;
              continue;
            }
          } else {
            if (this.chokeB.ticks > 0) {
              if (
                this.chokeB.stored >> PIXEL_TYPE_SHIFT ===
                  SAND_TYPE_TANK_SHIFTED &&
                TickEquip.equip[this.scene.player.id] <
                  TickEquip.maxEquip[this.scene.player.id]
              ) {
                TickEquip.equip[this.scene.player.id] += addEquip;
              }
              if (
                this.chokeB.stored >> PIXEL_TYPE_SHIFT ===
                  SAND_TYPE_HEALTH_SHIFTED &&
                TickHealth.health[this.scene.player.id] <
                  TickHealth.maxHealth[this.scene.player.id]
              ) {
                TickHealth.health[this.scene.player.id] += addHealth;
              }
              this.chokeB.ticks--;
            } else if (
              sw[x + y + this.width] >> PIXEL_TYPE_SHIFT ===
              PIXEL_TYPE_AIR_SHIFTED
            ) {
              if ((this.chokeB.stored & VARIANT_MASK) >> VARIANT_SHIFT > 0) {
                const nextVariant =
                  ((this.chokeB.stored & VARIANT_MASK) >> VARIANT_SHIFT) - 1;
                sw[x + y + this.width] =
                  (this.chokeB.stored & ~VARIANT_MASK) | nextVariant;
              }
              this.chokeB.stored = 0;
            }
          }
        }

        if (sw[curr] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_CHOKE_C_SHIFTED) {
          up = x + y - this.width;
          upLeft = x + y - this.width - 1;
          upRight = x + y - this.width + 1;
          if (sw[up] >> PIXEL_TYPE_SHIFT === SAND_TYPE_NORMAL_SHIFTED) {
            sw[upRight] = ((sw[up] >> 1) << 1) | this.nextIteration;

            sw[up] = PIXEL_TYPE_AIR;
            continue;
          }
        }

        if (sw[curr] >> PIXEL_TYPE_SHIFT === PIXEL_TYPE_CHOKE_D_SHIFTED) {
          up = x + y - this.width;
          upLeft = x + y - this.width - 1;
          upRight = x + y - this.width + 1;
          if (sw[up] >> PIXEL_TYPE_SHIFT === SAND_TYPE_HEALTH_SHIFTED) {
            sw[upLeft] = ((sw[up] >> 1) << 1) | this.nextIteration;

            sw[up] = PIXEL_TYPE_AIR;
            continue;
          }

          if (sw[up] >> PIXEL_TYPE_SHIFT === SAND_TYPE_TANK_SHIFTED) {
            sw[upRight] = ((sw[up] >> 1) << 1) | this.nextIteration;

            sw[up] = PIXEL_TYPE_AIR;
            continue;
          }
        }

        /* I don't think this is improving much the looks
           else {
            if (
              this.sandWorld[x + nextY + 1] >> PIXEL_TYPE_SHIFT ===
              PIXEL_TYPE_AIR_SHIFTED
            ) {
              this.sandWorld[x + nextY + 1] =
                ((this.sandWorld[x + y] >> 1) << 1) | this.nextIteration;
              this.sandWorld[x + y] = PIXEL_TYPE_AIR;
            } else if (
              downLeft >> PIXEL_TYPE_SHIFT ===
              PIXEL_TYPE_AIR_SHIFTED
            ) {
              this.sandWorld[x + nextY - 1] =
                ((this.sandWorld[x + y] >> 1) << 1) | this.nextIteration;
              this.sandWorld[x + y] = PIXEL_TYPE_AIR;
            }
          }*/

        // The previous if, but simplified

        /*if (
            this.sandWorld[x + nextY - 1] >> SAND_TYPE_SHIFT ===
            SAND_TYPE_AIR_SHIFTED
          ) {
            this.sandWorld[x + y] = SAND_TYPE_AIR;
            this.sandWorld[x + nextY - 1] =
              this.nextIteration | SAND_TYPE_NORMAL_SAND;
          } else if (
            this.sandWorld[x + nextY + 1] >> SAND_TYPE_SHIFT ===
            SAND_TYPE_AIR_SHIFTED
          ) {
            this.sandWorld[x + y] = SAND_TYPE_AIR;
            this.sandWorld[x + nextY + 1] =
              this.nextIteration | SAND_TYPE_NORMAL_SAND;
          }*/

        /*} else if (this.sandWorld[x + this.width * y] >> 6 === 1) {
            
              this.sandWorld[x + y] = 0b000_0000;
              this.sandWorld[x + nextY - 1] = this.nextIteration | 0b000_0001;
            } else if (this.sandWorld[x + nextY + 1] === 0) {
              this.sandWorld[x + y] = 0b000_0000;
              this.sandWorld[x + nextY + 1] = this.nextIteration | 0b000_0001;
            }
          } else {
            if (this.sandWorld[x + nextY + 1] === 0) {
              this.sandWorld[x + y] = 0b000_0000;
              this.sandWorld[x + nextY + 1] = this.nextIteration | 0b000_0001;
            } else if (this.sandWorld[x + nextY - 1] === 0) {
              this.sandWorld[x + y] = 0b000_0000;
              this.sandWorld[x + nextY - 1] = this.nextIteration | 0b000_0001;
            }
          }*/
        //this.sandWorld[x + this.width * y] = 0;
      }
    }

    this.graphics.clear();
    // Loop through this.sandWorld and draw the pixels that are 1 in this.graphics
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const currentSandType =
          this.sandWorld[x + this.width * y] >> PIXEL_TYPE_SHIFT;
        if (currentSandType === SAND_TYPE_NORMAL_SHIFTED) {
          switch (
            (this.sandWorld[x + this.width * y] & VARIANT_MASK) >>
            VARIANT_SHIFT
          ) {
            case 2:
              this.graphics.fillStyle(0xfdd179, 1);
              break;
            case 1:
              this.graphics.fillStyle(0xa57855, 1);
              break;
            default:
            case 0:
              this.graphics.fillStyle(0xde9f47, 1);
          }
          this.graphics.fillRect(x, y, 1, 1);
        }

        if (currentSandType === PIXEL_TYPE_WALL_SHIFTED) {
          this.graphics.fillStyle(0x00ffff, 1);
          this.graphics.fillRect(x, y, 1, 1);
        }

        if (currentSandType === SAND_TYPE_HEALTH_SHIFTED) {
          switch (
            (this.sandWorld[x + this.width * y] & VARIANT_MASK) >>
            VARIANT_SHIFT
          ) {
            case 2:
              this.graphics.fillStyle(0x6b2643, 1);
              break;
            case 1:
              this.graphics.fillStyle(0xac2847, 1);
              break;
            default:
            case 0:
              this.graphics.fillStyle(0xec273f, 1);
          }
          this.graphics.fillRect(x, y, 1, 1);
        }

        if (currentSandType === SAND_TYPE_TANK_SHIFTED) {
          switch (
            (this.sandWorld[x + this.width * y] & VARIANT_MASK) >>
            VARIANT_SHIFT
          ) {
            case 2:
              this.graphics.fillStyle(0x3859b3, 1);
              break;
            case 1:
              this.graphics.fillStyle(0x3388de, 1);
              break;
            default:
            case 0:
              this.graphics.fillStyle(0x36c5f4, 1);
          }
          this.graphics.fillRect(x, y, 1, 1);
        }
      }
    }
  }
}
