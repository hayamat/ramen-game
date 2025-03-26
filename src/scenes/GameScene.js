import { Scene } from "phaser";

export class GameScene extends Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  create(data) {
    // 背景（芝生）
    this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x4caf50)
      .setOrigin(0, 0);

    // 道路の描画
    this.drawRoad();

    // プレイヤー（ラーメン絵文字）
    this.player = this.add
      .text(this.scale.width / 2, this.scale.height - 100, "🍜", {
        fontSize: "48px",
      })
      .setOrigin(0.5);

    // スコア表示
    this.scoreText = this.add.text(16, 16, "スコア: 0", {
      fontSize: "32px",
      color: "#000",
    });

    this.score = 0;
    this.obstacles = [];
    this.gameSpeed = data.difficulty === "adult" ? 7 : 5;
    this.isGameOver = false;
    this.scrollSpeed = 3;
    this.roadWidth = 200; // 道路の幅
    this.laneCenter = this.scale.width / 2; // 道路の中心

    // デバイスの傾き検知の設定
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (event) => {
        if (!this.isGameOver) {
          const tilt = event.gamma; // デバイスの左右の傾き
          if (tilt) {
            this.player.x += (tilt * this.gameSpeed) / 10;
            // 画面端での制限
            this.player.x = Phaser.Math.Clamp(
              this.player.x,
              this.laneCenter - this.roadWidth / 2 + 30,
              this.laneCenter + this.roadWidth / 2 - 30
            );
          }
        }
      });
    }

    // キーボード操作のバックアップ
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    this.rightKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );

    // 障害物の生成
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    });
  }

  drawRoad() {
    const roadGraphics = this.add.graphics();

    // 道路の背景（アスファルト）
    roadGraphics.fillStyle(0x333333);
    roadGraphics.fillRect(
      this.scale.width / 2 - 100,
      0,
      200,
      this.scale.height
    );

    // 中央線
    const lineCount = Math.ceil(this.scale.height / 50);
    for (let i = 0; i < lineCount; i++) {
      roadGraphics.fillStyle(0xffff00);
      roadGraphics.fillRect(this.scale.width / 2 - 2, i * 50, 4, 30);
    }

    // 道路の端（ガードレール）
    roadGraphics.lineStyle(5, 0xcccccc);
    roadGraphics.beginPath();
    roadGraphics.moveTo(this.scale.width / 2 - 100, 0);
    roadGraphics.lineTo(this.scale.width / 2 - 100, this.scale.height);
    roadGraphics.moveTo(this.scale.width / 2 + 100, 0);
    roadGraphics.lineTo(this.scale.width / 2 + 100, this.scale.height);
    roadGraphics.strokePath();
  }

  update() {
    if (this.isGameOver) return;

    // キーボード操作
    if (this.leftKey.isDown) {
      this.player.x -= this.gameSpeed;
    }
    if (this.rightKey.isDown) {
      this.player.x += this.gameSpeed;
    }

    // 画面端での制限
    this.player.x = Phaser.Math.Clamp(
      this.player.x,
      this.laneCenter - this.roadWidth / 2 + 30,
      this.laneCenter + this.roadWidth / 2 - 30
    );

    // 画面のスクロール（上方向）
    this.cameras.main.scrollY += this.scrollSpeed;

    // 障害物の移動
    this.obstacles.forEach((obstacle, index) => {
      obstacle.y -= this.scrollSpeed;

      // 画面外に出た障害物の削除
      if (obstacle.y < this.cameras.main.scrollY - 50) {
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

  spawnObstacle() {
    const lanePosition =
      Math.random() > 0.5 ? this.laneCenter - 50 : this.laneCenter + 50;

    const obstacle = this.add
      .text(
        lanePosition,
        this.cameras.main.scrollY + this.scale.height + 50,
        Math.random() > 0.5 ? "🦠" : "🍖",
        {
          fontSize: "48px",
        }
      )
      .setOrigin(0.5);

    this.obstacles.push(obstacle);
  }

  checkCollision(player, obstacle) {
    const playerBounds = player.getBounds();
    const obstacleBounds = obstacle.getBounds();

    return (
      playerBounds.x < obstacleBounds.x + obstacleBounds.width &&
      playerBounds.x + playerBounds.width > obstacleBounds.x &&
      playerBounds.y < obstacleBounds.y + obstacleBounds.height &&
      playerBounds.y + playerBounds.height > obstacleBounds.y
    );
  }

  gameOver() {
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
