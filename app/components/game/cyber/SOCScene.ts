import Phaser from "phaser";
import { useCyberFxStore } from "@/app/store/cyberFxStore";

const WORLD_WIDTH = 1600;
const WORLD_HEIGHT = 900;

const PULSE_COLORS: Record<string, number> = {
  success: 0x4edea3,
  warning: 0xffb95f,
  critical: 0xff4d4d,
  neutral: 0x8083ff,
};

/**
 * Ambient SOC (Security Operations Center) environment. Unlike the Data
 * Center room, there is no player to move around — the analyst is seated
 * at a workstation looking at a monitor wall. This scene is purely
 * decorative/atmospheric: a network topology visualization, scrolling log
 * feeds, a live clock, and scanline overlay. It reads `useCyberFxStore`
 * only to know when to flash the wall on a decision outcome; it never
 * fetches or decides scenario data.
 */
export default class SOCScene extends Phaser.Scene {
  private lastPulseNonce = 0;
  private flashOverlay!: Phaser.GameObjects.Rectangle;
  private logLines: Phaser.GameObjects.Text[] = [];
  private clockText!: Phaser.GameObjects.Text;
  private nodeDots: {
    obj: Phaser.GameObjects.Arc;
    baseX: number;
    baseY: number;
  }[] = [];

  constructor() {
    super("SOCScene");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x070a14);
    this.buildBackground();
    this.buildMonitorWall();
    this.buildNetworkGraph();
    this.buildLogFeed();
    this.buildClock();
    this.buildScanlines();
    this.buildFlashOverlay();

    // Slow ambient camera drift (Ken Burns) since there's no player to follow.
    this.cameras.main.setZoom(1.02);
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.08,
      duration: 14000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private buildBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x0a0f1f, 0x0a0f1f, 0x050810, 0x050810, 1);
    g.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Floor reflection strip
    g.fillStyle(0x0d1428, 0.6);
    g.fillRect(0, WORLD_HEIGHT - 160, WORLD_WIDTH, 160);
  }

  private buildMonitorWall() {
    const wallX = WORLD_WIDTH / 2;
    const wallY = 230;
    const cols = 4;
    const rows = 2;
    const monitorW = 260;
    const monitorH = 150;
    const gap = 18;
    const totalW = cols * monitorW + (cols - 1) * gap;
    const startX = wallX - totalW / 2 + monitorW / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (monitorW + gap);
        const y = wallY + row * (monitorH + gap);

        const bezel = this.add.rectangle(x, y, monitorW, monitorH, 0x0e1422);
        bezel.setStrokeStyle(2, 0x1f2b45, 1);

        const screenColor = (row + col) % 3 === 0 ? 0x0d2a22 : 0x0a1730;
        const screen = this.add.rectangle(
          x,
          y,
          monitorW - 14,
          monitorH - 14,
          screenColor,
        );
        this.tweens.add({
          targets: screen,
          alpha: { from: 0.85, to: 1 },
          duration: Phaser.Math.Between(2200, 4000),
          yoyo: true,
          repeat: -1,
        });

        // Faint scrolling "data" bars per monitor.
        for (let i = 0; i < 4; i++) {
          const barY = y - monitorH / 2 + 18 + i * 22;
          const bar = this.add.rectangle(
            x - monitorW / 2 + 16,
            barY,
            Phaser.Math.Between(60, monitorW - 40),
            6,
            0x4edea3,
            0.35,
          );
          bar.setOrigin(0, 0.5);
          this.tweens.add({
            targets: bar,
            width: Phaser.Math.Between(40, monitorW - 30),
            duration: Phaser.Math.Between(1400, 2600),
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }
    }
  }

  private buildNetworkGraph() {
    const centerX = WORLD_WIDTH / 2;
    const centerY = 560;
    const radius = 160;
    const nodeCount = 8;

    const lineGfx = this.add.graphics();
    const positions: { x: number; y: number }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius * 0.55,
      });
    }

    lineGfx.lineStyle(1, 0x2a3550, 0.7);
    positions.forEach((pos) => {
      lineGfx.beginPath();
      lineGfx.moveTo(centerX, centerY);
      lineGfx.lineTo(pos.x, pos.y);
      lineGfx.strokePath();
    });

    const hub = this.add.circle(centerX, centerY, 14, 0x8083ff, 1);
    this.tweens.add({
      targets: hub,
      scale: { from: 1, to: 1.25 },
      duration: 1400,
      yoyo: true,
      repeat: -1,
    });

    positions.forEach((pos, i) => {
      const isSuspicious = i === 2;
      const node = this.add.circle(
        pos.x,
        pos.y,
        8,
        isSuspicious ? 0xff4d4d : 0x4edea3,
        1,
      );
      this.tweens.add({
        targets: node,
        alpha: { from: 1, to: 0.4 },
        duration: Phaser.Math.Between(700, 1600),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 600),
      });
      this.nodeDots.push({ obj: node, baseX: pos.x, baseY: pos.y });
    });
  }

  private buildLogFeed() {
    const lines = [
      "auth.log: session established",
      "fw.rule: inbound checked",
      "ids.scan: heuristics ok",
      "vpn.tunnel: stable",
      "dns.query: resolved",
      "edr.agent: heartbeat ok",
    ];

    const startX = 40;
    const y = WORLD_HEIGHT - 130;

    lines.forEach((line, i) => {
      const text = this.add.text(startX, y + i * 18, line, {
        fontFamily: "var(--font-mono), monospace",
        fontSize: "11px",
        color: "#4a5578",
      });
      this.logLines.push(text);
    });

    this.time.addEvent({
      delay: 2200,
      loop: true,
      callback: () => this.scrollLogFeed(lines),
    });
  }

  private scrollLogFeed(lines: string[]) {
    const idx = Phaser.Math.Between(0, this.logLines.length - 1);
    const line = this.logLines[idx];
    const options = [
      "auth.log: token refreshed",
      "fw.rule: packet inspected",
      "ids.scan: pattern match 0",
      "edr.agent: process scan ok",
      "dns.query: cache hit",
      "siem.ingest: event queued",
    ];
    line.setText(options[Phaser.Math.Between(0, options.length - 1)]);
    this.tweens.add({
      targets: line,
      alpha: { from: 0.2, to: 1 },
      duration: 500,
    });
    void lines;
  }

  private buildClock() {
    this.clockText = this.add
      .text(WORLD_WIDTH - 40, 40, "", {
        fontFamily: "var(--font-mono), monospace",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#4edea3",
      })
      .setOrigin(1, 0);

    this.updateClock();
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.updateClock(),
    });
  }

  private updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    this.clockText.setText(`${hh}:${mm}:${ss}`);
  }

  private buildScanlines() {
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.03);
    for (let y = 0; y < 8; y += 2) {
      g.fillRect(0, y, 8, 1);
    }
    g.generateTexture("scanline-tile", 8, 8);
    g.destroy();

    this.add
      .tileSprite(0, 0, WORLD_WIDTH, WORLD_HEIGHT, "scanline-tile")
      .setOrigin(0, 0)
      .setDepth(50)
      .setAlpha(0.5);
  }

  private buildFlashOverlay() {
    this.flashOverlay = this.add
      .rectangle(0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0xffffff, 0)
      .setOrigin(0, 0)
      .setDepth(60);
  }

  private playPulse(status: string) {
    const color = PULSE_COLORS[status] ?? PULSE_COLORS.neutral;
    this.flashOverlay.setFillStyle(color, 0.28);
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 0.28, to: 0 },
      duration: status === "critical" ? 650 : 450,
      ease: "Sine.easeOut",
    });

    if (status === "critical") {
      this.cameras.main.shake(220, 0.0025);
    }
  }

  update() {
    const fx = useCyberFxStore.getState();
    if (fx.pulse && fx.pulse.nonce !== this.lastPulseNonce) {
      this.lastPulseNonce = fx.pulse.nonce;
      this.playPulse((fx.pulse.status ?? "neutral").toLowerCase());
    }
  }
}
