import * as THREE from "three";
import MovableBox from './MovableBox.js';
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";
import TriggerZone from './TriggerZone.js';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.triggerZones = [];
    this.time = 0;

    this.environment = new Environment();

    this.resources.on("ready", () => {
      console.log('✅ All resources ready!');

      this.floor = new Floor();
      this.movableBox = new MovableBox();

      this.loadBlenderModel();
      this.createTriggerZones();

      // Follow mode is the default camera mode
      setTimeout(() => {
        if (this.experience.camera && this.movableBox && this.movableBox.mesh) {
          this.experience.camera.setFollowTarget(this.movableBox.mesh)
        }
      }, 1000);
    });
  }

  createTriggerZones() {
    const zones = [
      {
        name: "Project 1: 3D Modeling",
        position: { x: 5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "🏝️ Rock Island Model",
          description: "I modeled this rock island in Blender for my beach portfolio. It features detailed geometry and realistic materials.",
          images: ["./images/rock-island.jpg"],
          videoUrl: null,
        }
      },
      {
        name: "Project 2: Three.js Portfolio",
        position: { x: -5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "💻 Interactive 3D Portfolio",
          description: "A fully interactive 3D environment built with Three.js, featuring custom camera controls, physics, and imported Blender models.",
          images: ["./images/portfolio.jpg"],
          videoUrl: null,
        }
      },
      {
        name: "Project 3: Beach Environment",
        position: { x: 0, y: 0.5, z: -8 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "🌊 Beach Environment",
          description: "Created a complete beach environment with sand, water effects, and atmospheric lighting using Three.js.",
          images: ["./images/beach.jpg"],
          videoUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID",
        }
      }
    ];

    zones.forEach(zone => {
      const triggerZone = new TriggerZone(zone.position, zone.size, zone.data, this.scene);
      this.triggerZones.push(triggerZone);
      console.log(`✅ Created zone: ${zone.name}`);
    });
  }

  loadBlenderModel() {
    const model = this.resources.items['rockisland'];
    if (!model) return;

    this.blenderModel = model.scene.clone();
    this.blenderModel.position.set(0, -2, -20);
    this.blenderModel.scale.set(1, 1, 1);
    this.scene.add(this.blenderModel);
  }

  update() {
    if (this.movableBox && this.movableBox.update) {
      this.movableBox.update();
    }

    if (this.movableBox && this.movableBox.mesh) {
      const playerPosition = this.movableBox.mesh.position;
      this.time += 0.016;

      this.triggerZones.forEach(zone => {
        zone.update(playerPosition, this.time);
      });
    }
  }
}