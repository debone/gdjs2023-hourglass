import "./style.css";

import Phaser from "phaser";

import { SceneMain } from "./scenes/preload";
import { SceneWorld } from "./scenes/world";
import { SceneDebug } from "./scenes/debug";

import { GAME_CONFIG } from "./consts";
import PhaserGamebus from "./gamebus";

export const config = {
  ...GAME_CONFIG,
  plugins: {
    global: [
      {
        key: "PhaserGamebus",
        plugin: PhaserGamebus,
        start: true,
        mapping: "gamebus",
      },
    ],
  },
  scene: [SceneMain, SceneWorld, SceneDebug],
};

new Phaser.Game(config);
