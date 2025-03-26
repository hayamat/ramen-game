import { Scene } from "phaser";

interface GameSceneData {
  difficulty: "kid" | "adult";
}

export class GameScene extends Scene {
  private player!: Phaser.GameObjects.Text;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private obstacles: Phaser.GameObjects.Text[] = [];
  private gameSpeed: number = 5;
  private isGameOver: boolean = false;

  constructor() {
    super({ key: "GameScene" });
  }

  create(data: GameSceneData) {
    // 背景
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x87ceeb)
      .setOrigin(0, 0);

    // 地面
    this.add
      .rectangle(0, this.scale.height - 100, this.scale.width, 100, 0x8b4513)
      .setOrigin(0, 0);

    // プレイヤー（ラーメン絵文字）
    this.player = this.add.text(100, this.scale.height - 150, "🍜", {
      fontSize: "48px",
    });

    // スコア表示
    this.scoreText = this.add.text(16, 16, "スコア: 0", {
      fontSize: "32px",
      color: "#000",
    });

    // 難易度に応じた設定
    if (data.difficulty === "adult") {
      this.gameSpeed = 7;
    }

    // タッチ/マウス操作の設定
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameOver) {
        this.player.setY(pointer.y);
      }
    });

    // 障害物の生成
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });
  }

  update() {
    if (this.isGameOver) return;

    // 障害物の移動
    this.obstacles.forEach((obstacle, index) => {
      obstacle.x -= this.gameSpeed;

      // 画面外に出た障害物の削除
      if (obstacle.x < -50) {
        obstacle.destroy();
        this.obstacles.splice(index, 1);
        this.score += 10;
        this.scoreText.setText("スコア: " + this.score);
      }

      // 衝突判定
      if (this.checkCollision(this.player, obstacle)) {
        this.gameOver();
      }
    });
  }

  private spawnObstacle() {
    const obstacle = this.add.text(
      this.scale.width + 50,
      this.scale.height - 150,
      Math.random() > 0.5 ? "🦠" : "🍖", // バイキンかトッピング
      {
        fontSize: "48px",
      }
    );

    this.obstacles.push(obstacle);
  }

  private checkCollision(
    player: Phaser.GameObjects.Text,
    obstacle: Phaser.GameObjects.Text
  ): boolean {
    const playerBounds = player.getBounds();
    const obstacleBounds = obstacle.getBounds();

    return (
      playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
      playerBounds.x + playerBounds.width > obstacleBounds.x &&
      playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
      playerBounds.y + playerBounds.height > obstacleBounds.y
    );
  }

  private gameOver() {
    this.isGameOver = true;

    // ゲームオーバーテキスト
    this.add
      .text(this.scale.width / 2, this.scale.height / 2, "ゲームオーバー", {
        fontSize: "64px",
        color: "#ff0000",
      })
      .setOrigin(0.5);

    // リトライボタン
    const retryButton = this.add
      .text(this.scale.width / 2, this.scale.height / 2 + 100, "もう一度", {
        fontSize: "32px",
        color: "#000",
        backgroundColor: "#fff",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    retryButton.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });
  }
}
