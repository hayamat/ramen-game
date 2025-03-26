import { Scene } from "phaser";

export class MenuScene extends Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create() {
    const { width, height } = this.scale;

    // タイトル
    this.add
      .text(width / 2, height / 4, "ラーメンゲーム", {
        fontSize: "48px",
        color: "#000",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // コース選択ボタン
    const buttonStyle = {
      fontSize: "32px",
      color: "#000",
      backgroundColor: "#fff",
      padding: { x: 20, y: 10 },
    };

    const kidButton = this.add
      .text(width / 2, height / 2, "こどもコース", buttonStyle)
      .setOrigin(0.5)
      .setInteractive();

    const adultButton = this.add
      .text(width / 2, height / 2 + 80, "おとなコース", buttonStyle)
      .setOrigin(0.5)
      .setInteractive();

    // ボタンのホバーエフェクト
    [kidButton, adultButton].forEach((button) => {
      button.on("pointerover", () => button.setStyle({ color: "#ff0000" }));
      button.on("pointerout", () => button.setStyle({ color: "#000" }));
    });

    // クリックイベント
    kidButton.on("pointerdown", () => {
      this.scene.start("GameScene", { difficulty: "kid" });
    });

    adultButton.on("pointerdown", () => {
      this.scene.start("GameScene", { difficulty: "adult" });
    });
  }
}
