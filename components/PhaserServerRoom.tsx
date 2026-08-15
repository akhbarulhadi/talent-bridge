"use client";
import React, { useEffect, useRef } from "react";

interface ServerData {
  id: string;
  name: string;
  x: number;
  y: number;
  isDown: boolean;
  gameObject?: Phaser.Physics.Arcade.Sprite;
  alertIcon?: Phaser.GameObjects.Text;
}

interface PhaserProps {
  missionText: string;
  score: number;
  isModalOpen: boolean;
  currentProblemId: string | null;
  onInteract: () => void;
}

export default function PhaserServerRoom({ missionText, score, isModalOpen, currentProblemId, onInteract }: PhaserProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  const interactCbRef = useRef(onInteract);
  const modalOpenRef = useRef(isModalOpen);

  useEffect(() => { interactCbRef.current = onInteract; }, [onInteract]);
  useEffect(() => { modalOpenRef.current = isModalOpen; }, [isModalOpen]);

  useEffect(() => {
    // 1. Hancurkan game instance sebelumnya jika ada untuk mencegah duplikasi canvas
    if (gameInstanceRef.current) {
      gameInstanceRef.current.destroy(true);
      gameInstanceRef.current = null;
    }

    // 2. Bersihkan isi DOM container secara eksplisit
    if (gameRef.current) {
      gameRef.current.innerHTML = '';
    }

    let isCancelled = false;

    import("phaser").then((Phaser) => {
      // Pastikan useEffect belum dibersihkan (unmounted) saat import selesai
      if (isCancelled) return;

      class ServerRoomScene extends Phaser.Scene {
        private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
        private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
        private wasd!: any;
        
        private servers: ServerData[] = [];
        private activeMission: ServerData | null = null;
        private interactPrompt!: Phaser.GameObjects.Text;

        constructor() {
          super({ key: "ServerRoomScene" });
        }

        preload() {
          if (!this.textures.exists('tech-guy')) {
            this.load.image('tech-guy', '/assets/technician.png');
            this.load.image('server-rack', '/assets/server.png');
            this.load.image('floor-tile', '/assets/floor.png');
          }
        }

        create() {
          sceneRef.current = this;

          this.add.tileSprite(400, 300, 800, 600, 'floor-tile').setAlpha(0.3);

          const serverLayout: ServerData[] = [
            { id: 'S1', name: 'Rack A-01', x: 150, y: 150, isDown: false },
            { id: 'S2', name: 'Rack B-14', x: 400, y: 150, isDown: false },
            { id: 'S3', name: 'Rack C-05', x: 650, y: 150, isDown: false },
            { id: 'S4', name: 'Core Router', x: 250, y: 450, isDown: false },
            { id: 'S5', name: 'Database Node', x: 550, y: 450, isDown: false },
          ];

          const serverGroup = this.physics.add.staticGroup();
          
          serverLayout.forEach((data) => {
            const rack = serverGroup.create(data.x, data.y, 'server-rack') as Phaser.Physics.Arcade.Sprite;
            
            const rackHitboxWidth = rack.width * 0.8;
            const rackHitboxHeight = rack.height * 0.3; 
            
            rack.body!.setSize(rackHitboxWidth, rackHitboxHeight);
            rack.body!.setOffset((rack.width - rackHitboxWidth) / 2, rack.height - rackHitboxHeight);

            const alert = this.add.text(data.x, data.y - (rack.height / 2) - 15, '⚠️', { fontSize: '26px' }).setOrigin(0.5).setVisible(false);
            
            data.gameObject = rack;
            data.alertIcon = alert;
            this.servers.push(data);
          });

          this.player = this.physics.add.sprite(400, 300, 'tech-guy');
          this.player.setCollideWorldBounds(true);
          
          this.player.body!.setSize(20, 20);
          this.player.body!.setOffset((this.player.width - 20) / 2, this.player.height - 20);
          
          this.player.setDepth(5); 
          serverGroup.setDepth(4);

          this.physics.add.collider(this.player, serverGroup);

          if (this.input.keyboard) {
              this.cursors = this.input.keyboard.createCursorKeys();
              this.wasd = this.input.keyboard.addKeys('W,A,S,D');

              this.input.keyboard.on('keydown-E', () => {
                if (modalOpenRef.current) return;

                if (this.activeMission && this.activeMission.gameObject) {
                  const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, 
                    this.activeMission.gameObject.x, this.activeMission.gameObject.y
                  );

                  if (dist < 120) {
                    this.player.setVelocity(0); 
                    interactCbRef.current(); 
                  }
                }
              });
          }

          this.interactPrompt = this.add.text(0, 0, 'Tekan E untuk Inspeksi', { 
            fontSize: '14px', backgroundColor: '#000', padding: { x: 4, y: 4 }, color: '#00ff00'
          }).setOrigin(0.5).setVisible(false).setDepth(10);
          
          this.triggerRandomMission();
        }

        triggerRandomMission() {
          const availableServers = this.servers.filter(s => !s.isDown);
          if (availableServers.length === 0) return;

          const targetServer = availableServers[Phaser.Math.Between(0, availableServers.length - 1)];
          targetServer.isDown = true;
          this.activeMission = targetServer;

          if (targetServer.alertIcon && targetServer.gameObject) {
            targetServer.alertIcon.setVisible(true);
            targetServer.gameObject.setTint(0xff0000);
          }
        }

        update() {
          this.player.setDepth(this.player.y);
          this.servers.forEach(s => {
            if (s.gameObject) s.gameObject.setDepth(s.gameObject.y);
          });

          if (modalOpenRef.current) {
            this.player.setVelocity(0);
            this.interactPrompt.setVisible(false);
            return; 
          }

          const speed = 200;
          let velX = 0;
          let velY = 0;

          if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velX = -speed;
            this.player.setFlipX(true);
          } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velX = speed;
            this.player.setFlipX(false);
          }

          if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velY = -speed;
          } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velY = speed;
          }

          this.player.setVelocity(velX, velY);

          if (velX !== 0 && velY !== 0) {
            this.player.body!.velocity.normalize().scale(speed);
          }

          if (this.activeMission && this.activeMission.gameObject) {
            const dist = Phaser.Math.Distance.Between(
              this.player.x, this.player.y, 
              this.activeMission.gameObject.x, this.activeMission.gameObject.y
            );

            if (dist < 120) {
              this.interactPrompt.setPosition(this.activeMission.gameObject.x, this.activeMission.gameObject.y + (this.activeMission.gameObject.height / 2) + 15);
              this.interactPrompt.setDepth(10000); 
              this.interactPrompt.setVisible(true);
            } else {
              this.interactPrompt.setVisible(false);
            }
          }
        }
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: gameRef.current!,
        backgroundColor: "#111827",
        physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } }, 
        scene: [ServerRoomScene],
      };

      gameInstanceRef.current = new Phaser.Game(config);
    });

    return () => { 
      isCancelled = true;
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true); 
        gameInstanceRef.current = null;
      }
      if (gameRef.current) {
        gameRef.current.innerHTML = '';
      }
    };
  }, [currentProblemId]);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl bg-gray-950 p-6 border-4 border-gray-800 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]">
      <div className="w-full flex justify-between items-center bg-gray-900 p-4 rounded border border-gray-700">
        <div>
          <h3 className="text-gray-400 text-sm font-bold tracking-widest uppercase">Status Operasional</h3>
          <p className={`text-lg font-mono font-bold ${isModalOpen ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`}>
            {isModalOpen ? "SISTEM DITAHAN: MENUNGGU KEPUTUSAN ANDA..." : missionText}
          </p>
        </div>
        <div className="text-right">
          <h3 className="text-gray-400 text-sm font-bold tracking-widest uppercase">Skor Evaluasi</h3>
          <p className="text-3xl font-mono text-green-400 font-bold">{score}</p>
        </div>
      </div>
      <div 
        ref={gameRef} 
        onClick={() => gameRef.current?.focus()} 
        tabIndex={0} 
        className="rounded overflow-hidden shadow-2xl relative border-2 border-gray-800 outline-none cursor-pointer" 
      />
    </div>
  );
}