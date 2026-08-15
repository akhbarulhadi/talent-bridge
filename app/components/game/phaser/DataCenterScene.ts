import Phaser from "phaser";
import { useGameStore } from "@/app/store/gameStore";

const ROOM_WIDTH = 1680;
const ROOM_HEIGHT = 1040;
const TILE = 64;
const WALL_THICKNESS = 28;

interface HotspotZone {
  id: string;
  x: number;
  y: number;
  radius: number;
}

export default class DataCenterScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  private hotspotZones: HotspotZone[] = [];
  private footstepTimer = 0;
  private lastFacing: "up" | "down" | "left" | "right" = "down";

  constructor() {
    super("DataCenterScene");
  }

  create() {
    this.generateTextures();
    this.buildRoom();
    this.buildPlayer();
    this.buildInput();

    this.physics.world.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
    this.cameras.main.setBounds(0, 0, ROOM_WIDTH, ROOM_HEIGHT);
    this.cameras.main.setZoom(1.05);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.fadeIn(500, 5, 8, 15);
  }

  private generateTextures() {
    const g = this.add.graphics();

    // Floor tile
    g.fillStyle(0x0c1322, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.lineStyle(1, 0x1a2438, 1);
    g.strokeRect(0, 0, TILE, TILE);
    g.fillStyle(0x131c30, 1);
    g.fillRect(0, 0, 2, TILE);
    g.generateTexture("floor-tile", TILE, TILE);
    g.clear();

    // Rack (server cabinet)
    const rw = 88;
    const rh = 136;
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(rw / 2, rh - 4, 60, 18);
    g.fillStyle(0x1c2438, 1);
    g.fillRoundedRect(0, 0, rw, rh - 12, 6);
    g.fillStyle(0x0e1422, 1);
    g.fillRoundedRect(5, 5, rw - 10, rh - 22, 4);
    g.lineStyle(2, 0x2a3550, 1);
    for (let i = 0; i < 6; i++) {
      const y = 16 + i * 15;
      g.beginPath();
      g.moveTo(11, y);
      g.lineTo(rw - 11, y);
      g.strokePath();
    }
    g.generateTexture("rack", rw, rh);
    g.clear();

    // Small LED dot
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("led", 8, 8);
    g.clear();

    // CRAC cooling unit
    const cw = 128;
    const ch = 168;
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(cw / 2, ch - 6, 84, 22);
    g.fillStyle(0x232c44, 1);
    g.fillRoundedRect(0, 0, cw, ch - 16, 10);
    g.fillStyle(0x131a2c, 1);
    g.fillRoundedRect(8, 8, cw - 16, ch - 60, 8);
    g.fillStyle(0x0a0f1c, 1);
    for (let i = 0; i < 4; i++) {
      g.fillCircle(24 + i * 26, ch - 34, 9);
    }
    g.generateTexture("crac", cw, ch);
    g.clear();

    // Player (top-down technician)
    const pw = 44;
    const ph = 44;
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(pw / 2, ph - 8, 22, 9);
    g.fillStyle(0x494bd6, 1);
    g.fillCircle(pw / 2, ph / 2 + 2, 15);
    g.fillStyle(0xc0c1ff, 1);
    g.fillCircle(pw / 2, ph / 2 - 5, 9);
    g.fillStyle(0x4edea3, 1);
    g.fillTriangle(pw / 2 - 4, ph / 2 - 9, pw / 2 + 4, ph / 2 - 9, pw / 2, ph / 2 - 17);
    g.generateTexture("player", pw, ph);

    g.destroy();
  }

  private buildRoom() {
    this.add
      .tileSprite(0, 0, ROOM_WIDTH, ROOM_HEIGHT, "floor-tile")
      .setOrigin(0, 0)
      .setDepth(0);

    // Walls
    const walls = this.add.graphics().setDepth(1);
    walls.fillStyle(0x05070f, 1);
    walls.fillRect(0, 0, ROOM_WIDTH, WALL_THICKNESS);
    walls.fillRect(0, ROOM_HEIGHT - WALL_THICKNESS, ROOM_WIDTH, WALL_THICKNESS);
    walls.fillRect(0, 0, WALL_THICKNESS, ROOM_HEIGHT);
    walls.fillRect(ROOM_WIDTH - WALL_THICKNESS, 0, WALL_THICKNESS, ROOM_HEIGHT);
    walls.lineStyle(2, 0x2a3550, 0.6);
    walls.strokeRect(WALL_THICKNESS, WALL_THICKNESS, ROOM_WIDTH - WALL_THICKNESS * 2, ROOM_HEIGHT - WALL_THICKNESS * 2);

    this.hotspotZones = [];

    const rowY = [240, 440, 640, 840];
    const rowLabels = ["A", "B", "C", "D"];
    const rackSpacingX = 116;
    const startX = 170;

    rowLabels.forEach((rowLabel, rowIndex) => {
      for (let col = 0; col < 11; col++) {
        const x = startX + col * rackSpacingX;
        const y = rowY[rowIndex];
        const rackId = `${rowLabel}-${(col + 1).toString().padStart(2, "0")}`;
        const isSpecial = rackId === "B-14";

        this.add.image(x, y, "rack").setOrigin(0.5).setDepth(5);

        this.add
          .text(x, y + 76, rackId, {
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            color: isSpecial ? "#ffb4ab" : "#7d89b0",
          })
          .setOrigin(0.5)
          .setDepth(5);

        const ledColor = isSpecial ? 0xff5252 : 0x4edea3;
        for (let i = 0; i < 3; i++) {
          const led = this.add
            .image(x - 26 + i * 12, y - 52, "led")
            .setTint(ledColor)
            .setScale(0.9)
            .setDepth(6);
          this.tweens.add({
            targets: led,
            alpha: { from: 1, to: 0.15 },
            duration: Phaser.Math.Between(500, 1300),
            yoyo: true,
            repeat: -1,
            delay: Phaser.Math.Between(0, 900),
          });
        }

        if (isSpecial) {
          const glow = this.add
            .rectangle(x, y - 8, 104, 150, 0xff3d3d, 0.22)
            .setOrigin(0.5)
            .setDepth(4);
          this.tweens.add({
            targets: glow,
            alpha: { from: 0.08, to: 0.32 },
            duration: 900,
            yoyo: true,
            repeat: -1,
          });

          const tempLabel = this.add
            .text(x, y - 96, "⚠ 32°C", {
              fontFamily: "var(--font-mono), monospace",
              fontSize: "14px",
              color: "#ffb4ab",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setDepth(6);
          this.tweens.add({
            targets: tempLabel,
            y: y - 104,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
          });

          this.hotspotZones.push({ id: "rack-b14", x, y, radius: 120 });
        }
      }
    });

    // CRAC units along the top wall
    const cracPositions = [
      { x: 300, y: 100 },
      { x: 840, y: 100 },
      { x: 1380, y: 100 },
    ];
    cracPositions.forEach((pos, idx) => {
      const cracNum = idx + 1;
      const isAlarm = cracNum === 3;

      this.add.image(pos.x, pos.y, "crac").setOrigin(0.5).setDepth(5);
      this.add
        .text(pos.x, pos.y + 92, `CRAC #${cracNum}`, {
          fontFamily: "var(--font-mono), monospace",
          fontSize: "12px",
          color: isAlarm ? "#ffd166" : "#7d89b0",
        })
        .setOrigin(0.5)
        .setDepth(5);

      const beacon = this.add
        .circle(pos.x, pos.y - 92, 8, isAlarm ? 0xff4d4d : 0x3ddc84, 1)
        .setDepth(6);
      this.tweens.add({
        targets: beacon,
        alpha: { from: 1, to: 0.15 },
        scale: { from: 1, to: isAlarm ? 1.7 : 1.1 },
        duration: isAlarm ? 420 : 1500,
        yoyo: true,
        repeat: -1,
      });

      if (isAlarm) {
        this.hotspotZones.push({ id: "crac-3", x: pos.x, y: pos.y, radius: 130 });

        this.time.addEvent({
          delay: 4200,
          loop: true,
          callback: () => this.cameras.main.shake(180, 0.0018),
        });
      }
    });

    // NOC monitoring terminal
    const termX = ROOM_WIDTH - 200;
    const termY = ROOM_HEIGHT - 180;
    this.add
      .rectangle(termX, termY, 78, 54, 0x141a2b)
      .setStrokeStyle(2, 0x4edea3)
      .setDepth(5);
    this.add
      .rectangle(termX, termY - 8, 60, 30, 0x0a2a20)
      .setDepth(6);
    this.add
      .text(termX, termY - 54, "NOC TERMINAL", {
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        color: "#4edea3",
      })
      .setOrigin(0.5)
      .setDepth(6);
    const screenGlow = this.add
      .rectangle(termX, termY - 8, 60, 30, 0x4edea3, 0.25)
      .setDepth(6);
    this.tweens.add({
      targets: screenGlow,
      alpha: { from: 0.1, to: 0.3 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
    });
    this.hotspotZones.push({ id: "noc-terminal", x: termX, y: termY, radius: 95 });
  }

  private buildPlayer() {
    this.player = this.physics.add.sprite(ROOM_WIDTH / 2, ROOM_HEIGHT - 150, "player");
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(1100, 1100);
    this.player.setMaxVelocity(230, 230);
    this.player.setSize(22, 18).setOffset(11, 20);
    this.player.setDepth(10);
  }

  private buildInput() {
    const keyboard = this.input.keyboard!;
    this.cursors = keyboard.createCursorKeys();
    this.wasd = {
      up: keyboard.addKey("W"),
      down: keyboard.addKey("S"),
      left: keyboard.addKey("A"),
      right: keyboard.addKey("D"),
    };
  }

  update(_time: number, delta: number) {
    const accel = 1200;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      const len = Math.hypot(vx, vy);
      this.player.setAcceleration((vx / len) * accel, (vy / len) * accel);

      if (Math.abs(vx) > Math.abs(vy)) {
        this.lastFacing = vx < 0 ? "left" : "right";
        this.player.setFlipX(vx < 0);
      } else {
        this.lastFacing = vy < 0 ? "up" : "down";
      }

      // subtle footstep bob
      this.footstepTimer += delta;
      if (this.footstepTimer > 260) {
        this.footstepTimer = 0;
        this.tweens.add({
          targets: this.player,
          scaleY: { from: 1, to: 0.92 },
          duration: 90,
          yoyo: true,
        });
      }
    } else {
      this.player.setAcceleration(0, 0);
    }

    // Hotspot proximity detection
    let nearest: string | null = null;
    let nearestDist = Infinity;
    for (const zone of this.hotspotZones) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, zone.x, zone.y);
      if (d <= zone.radius && d < nearestDist) {
        nearest = zone.id;
        nearestDist = d;
      }
    }

    const state = useGameStore.getState();
    if (state.nearbyHotspotId !== nearest) {
      state.setNearbyHotspot(nearest);
      if (nearest) state.markInspected(nearest);
    }
  }
}
