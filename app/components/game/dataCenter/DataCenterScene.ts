import Phaser from "phaser";
import { useDataCenterInteraction } from "@/app/store/dataCenterInteractionStore";
import type { StationId } from "./stationMapping";

const ROOM_WIDTH = 1680;
const ROOM_HEIGHT = 1040;
const TILE = 64;
const WALL_THICKNESS = 28;
const INTERACT_RADIUS = 110;
const NAV_UPDATE_INTERVAL = 120; // ms

interface StationMarker {
  ring: Phaser.GameObjects.Arc;
  icon: Phaser.GameObjects.Text;
  label: Phaser.GameObjects.Text;
  /** The rack id / CRAC name text painted on the floor prop itself. */
  nameText: Phaser.GameObjects.Text;
  tweens: Phaser.Tweens.Tween[];
}

const NEUTRAL_LABEL_COLOR = "#7d89b0";
const ACTIVE_LABEL_COLOR = "#ffd166";

/**
 * Presentation + interaction layer. This scene has no knowledge of
 * scenarios, problem statements, or decisions as *data* — it only:
 *  - renders the persistent data center environment (racks, CRAC units,
 *    NOC terminal, vendor desk, NPC),
 *  - reads `activeStationId` from the store to know which physical spot to
 *    highlight for whichever node is currently loaded,
 *  - reports proximity/heading back to the store so React can render a
 *    compass + "press E" prompt,
 *  - freezes player movement while the decision panel is open.
 * It never fetches or decides scenario data itself.
 */
export default class DataCenterScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<
    "up" | "down" | "left" | "right",
    Phaser.Input.Keyboard.Key
  >;
  private footstepTimer = 0;

  private stations: Partial<Record<StationId, { x: number; y: number }>> = {};
  private stationMarkers: Partial<Record<StationId, StationMarker>> = {};
  private lastActiveStationId: StationId | null = null;
  private wasNear = false;
  private navTimer = 0;

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
    const rw = 84;
    const rh = 132;
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(rw / 2, rh - 4, 58, 17);
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
    const cw = 122;
    const ch = 164;
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(cw / 2, ch - 6, 80, 21);
    g.fillStyle(0x232c44, 1);
    g.fillRoundedRect(0, 0, cw, ch - 16, 10);
    g.fillStyle(0x131a2c, 1);
    g.fillRoundedRect(8, 8, cw - 16, ch - 60, 8);
    g.fillStyle(0x0a0f1c, 1);
    for (let i = 0; i < 4; i++) {
      g.fillCircle(23 + i * 25, ch - 34, 9);
    }
    g.generateTexture("crac", cw, ch);
    g.clear();

    // Desk (vendor / escalation phone desk)
    const dw = 96;
    const dh = 64;
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(dw / 2, dh - 4, 70, 16);
    g.fillStyle(0x2a3350, 1);
    g.fillRoundedRect(0, dh - 34, dw, 30, 4);
    g.fillStyle(0x1a2036, 1);
    g.fillRect(6, dh - 32, dw - 12, 22);
    g.fillStyle(0x0e1422, 1);
    g.fillRoundedRect(dw / 2 - 16, 6, 32, 22, 3);
    g.fillStyle(0x4edea3, 1);
    g.fillRect(dw / 2 - 3, 26, 6, 6);
    g.generateTexture("desk", dw, dh);
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
    g.fillTriangle(
      pw / 2 - 4,
      ph / 2 - 9,
      pw / 2 + 4,
      ph / 2 - 9,
      pw / 2,
      ph / 2 - 17,
    );
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
    walls.strokeRect(
      WALL_THICKNESS,
      WALL_THICKNESS,
      ROOM_WIDTH - WALL_THICKNESS * 2,
      ROOM_HEIGHT - WALL_THICKNESS * 2,
    );

    const rowY = [240, 440, 640, 840];
    const rowLabels = ["A", "B", "C", "D"];
    const rackSpacingX = 100;
    const startX = 150;
    const rackCols = 14;

    // Racks that double as named "stations" the player can be sent to.
    const namedRackStations: Record<string, StationId> = {
      "B-14": "rack-b14",
      "A-05": "rack-generic-1",
      "C-08": "rack-generic-2",
      "D-04": "rack-generic-3",
    };

    rowLabels.forEach((rowLabel, rowIndex) => {
      for (let col = 0; col < rackCols; col++) {
        const x = startX + col * rackSpacingX;
        const y = rowY[rowIndex];
        const rackId = `${rowLabel}-${(col + 1).toString().padStart(2, "0")}`;
        const stationId = namedRackStations[rackId];

        this.add.image(x, y, "rack").setOrigin(0.5).setDepth(5);

        // Neutral by default — only the station that's actually the
        // current target (see `activateStationMarker`) gets highlighted.
        // Racks/CRAC units unrelated to the current node always look
        // like ordinary background equipment.
        const rackNameText = this.add
          .text(x, y + 74, rackId, {
            fontFamily: "var(--font-mono), monospace",
            fontSize: "11px",
            color: NEUTRAL_LABEL_COLOR,
          })
          .setOrigin(0.5)
          .setDepth(5);

        // All racks share the same calm, neutral ambient look. Nothing
        // ever looks "alarming" unless it's the current active station
        // (handled entirely by the marker system below) — that keeps the
        // visual language unambiguous: red/pulsing == relevant right now.
        for (let i = 0; i < 3; i++) {
          const led = this.add
            .image(x - 24 + i * 11, y - 50, "led")
            .setTint(0x4edea3)
            .setScale(0.85)
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

        if (stationId) {
          this.stations[stationId] = { x, y: y - 70 };
          this.registerStationMarker(stationId, x, y - 70, rackNameText);
        }
      }
    });

    // CRAC units along the top wall
    const cracPositions: { x: number; y: number; id: StationId }[] = [
      { x: 300, y: 100, id: "crac-1" },
      { x: 840, y: 100, id: "crac-2" },
      { x: 1380, y: 100, id: "crac-3" },
    ];
    cracPositions.forEach(({ x, y, id }, idx) => {
      const cracNum = idx + 1;

      // Same neutral treatment as racks — no permanent alarm beacon or
      // camera shake. It only stands out when it's the actual current
      // target (see `activateStationMarker`).
      this.add.image(x, y, "crac").setOrigin(0.5).setDepth(5);
      const cracNameText = this.add
        .text(x, y + 90, `CRAC #${cracNum}`, {
          fontFamily: "var(--font-mono), monospace",
          fontSize: "12px",
          color: NEUTRAL_LABEL_COLOR,
        })
        .setOrigin(0.5)
        .setDepth(5);

      this.stations[id] = { x, y: y + 60 };
      this.registerStationMarker(id, x, y + 60, cracNameText);
    });

    // NOC monitoring terminal (bottom-right)
    const termX = ROOM_WIDTH - 190;
    const termY = ROOM_HEIGHT - 130;
    this.add
      .rectangle(termX, termY, 78, 54, 0x141a2b)
      .setStrokeStyle(2, 0x4edea3)
      .setDepth(5);
    this.add.rectangle(termX, termY - 8, 60, 30, 0x0a2a20).setDepth(6);
    const nocNameText = this.add
      .text(termX, termY - 54, "NOC TERMINAL", {
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        color: NEUTRAL_LABEL_COLOR,
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
    this.stations["noc-terminal"] = { x: termX, y: termY - 70 };
    this.registerStationMarker("noc-terminal", termX, termY - 70, nocNameText);

    // Vendor / escalation desk (bottom-left)
    const deskX = 190;
    const deskY = ROOM_HEIGHT - 130;
    this.add.image(deskX, deskY, "desk").setOrigin(0.5).setDepth(5);
    const deskNameText = this.add
      .text(deskX, deskY + 46, "MEJA ESKALASI", {
        fontFamily: "var(--font-mono), monospace",
        fontSize: "10px",
        color: NEUTRAL_LABEL_COLOR,
      })
      .setOrigin(0.5)
      .setDepth(5);
    this.stations["vendor-desk"] = { x: deskX, y: deskY - 50 };
    this.registerStationMarker("vendor-desk", deskX, deskY - 50, deskNameText);
  }

  /** Creates a hidden marker (attention ring + icon + "press E" label) above a station. */
  private registerStationMarker(
    id: StationId,
    x: number,
    y: number,
    nameText: Phaser.GameObjects.Text,
  ) {
    const ring = this.add
      .circle(x, y + 34, 62, 0xffd166, 0)
      .setStrokeStyle(3, 0xffd166, 0.9)
      .setDepth(19)
      .setVisible(false);

    const icon = this.add
      .text(x, y, "!", {
        fontFamily: "var(--font-display), sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#0b1326",
        backgroundColor: "#ffd166",
        padding: { left: 10, right: 10, top: 3, bottom: 3 },
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false);

    const label = this.add
      .text(x, y + 24, "TEKAN [E]", {
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#ffd166",
      })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false);

    this.stationMarkers[id] = { ring, icon, label, nameText, tweens: [] };
  }

  private activateStationMarker(id: StationId) {
    const marker = this.stationMarkers[id];
    if (!marker) return;

    marker.ring.setVisible(true).setScale(1).setAlpha(0.85);
    marker.icon.setVisible(true);
    marker.nameText.setColor(ACTIVE_LABEL_COLOR).setFontStyle("bold");

    const ringTween = this.tweens.add({
      targets: marker.ring,
      scale: { from: 1, to: 1.6 },
      alpha: { from: 0.85, to: 0 },
      duration: 1100,
      repeat: -1,
      ease: "Sine.easeOut",
    });
    const iconTween = this.tweens.add({
      targets: marker.icon,
      y: marker.icon.y - 6,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    marker.tweens = [ringTween, iconTween];
  }

  private deactivateStationMarker(id: StationId) {
    const marker = this.stationMarkers[id];
    if (!marker) return;

    marker.tweens.forEach((t) => t.stop());
    marker.tweens = [];
    marker.ring.setVisible(false);
    marker.icon.setVisible(false);
    marker.label.setVisible(false);
    marker.nameText.setColor(NEUTRAL_LABEL_COLOR).setFontStyle("normal");
  }

  private focusCameraOnStation(id: StationId) {
    const pos = this.stations[id];
    if (!pos) return;

    const cam = this.cameras.main;
    cam.stopFollow();
    cam.pan(pos.x, pos.y, 650, "Sine.easeInOut", true, (_cam, progress) => {
      if (progress === 1) {
        this.time.delayedCall(450, () => {
          cam.startFollow(this.player, true, 0.08, 0.08);
        });
      }
    });
  }

  private buildPlayer() {
    this.player = this.physics.add.sprite(
      ROOM_WIDTH / 2,
      ROOM_HEIGHT - 70,
      "player",
    );
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
    const state = useDataCenterInteraction.getState();

    // React to the active station changing (new problem statement loaded).
    if (state.activeStationId !== this.lastActiveStationId) {
      if (this.lastActiveStationId)
        this.deactivateStationMarker(this.lastActiveStationId);
      this.lastActiveStationId = state.activeStationId;
      this.wasNear = false;
      if (state.activeStationId) {
        this.activateStationMarker(state.activeStationId);
        this.focusCameraOnStation(state.activeStationId);
      }
    }

    const frozen = state.isPanelOpen;

    if (!frozen) {
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
        if (vx !== 0) this.player.setFlipX(vx < 0);

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
    } else {
      this.player.setAcceleration(0, 0);
      this.player.setVelocity(0, 0);
    }

    // Throttled proximity + compass heading update.
    this.navTimer += delta;
    if (state.activeStationId && this.navTimer >= NAV_UPDATE_INTERVAL) {
      this.navTimer = 0;
      const pos = this.stations[state.activeStationId];
      if (pos) {
        const distance = Phaser.Math.Distance.Between(
          this.player.x,
          this.player.y,
          pos.x,
          pos.y,
        );
        const angle = Phaser.Math.Angle.Between(
          this.player.x,
          this.player.y,
          pos.x,
          pos.y,
        );
        const isNear = distance <= INTERACT_RADIUS;

        if (isNear !== this.wasNear) {
          this.wasNear = isNear;
          state.setNearStation(isNear);
        }
        state.setNavigation({ angle, distance });

        const marker = this.stationMarkers[state.activeStationId];
        if (marker) marker.label.setVisible(isNear && !frozen);
      }
    }
  }
}
