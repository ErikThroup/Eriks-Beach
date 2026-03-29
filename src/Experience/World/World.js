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
    this.environment = new Environment();
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      console.log('✅ All resources ready!');
      console.log('Available resources:', Object.keys(this.resources.items));
      
      // Setup everything that needs resources (same as original)
      this.floor = new Floor();
      this.movableBox = new MovableBox();
      this.environment = new Environment();
      
      this.loadBlenderModel();
      
      // Set camera to follow box (from original)
      setTimeout(() => {
        if (this.experience.camera && this.movableBox && this.movableBox.mesh) {
          this.experience.camera.setOrbitTarget(this.movableBox.mesh);
        }
      }, 1000);
    });

        this.triggerZones = []
    this.time = 0
    
    // Wait for resources
    this.resources.on("ready", () => {
      // ... your existing setup ...
      
      // Create trigger zones AFTER movableBox is created
      this.createTriggerZones()
    })
  }
  
  createTriggerZones() {
    // Define zones on your beach (5x5 meter areas)
    const zones = [
      {
        name: "Project 1: 3D Modeling",
        position: { x: 5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "🏝️ Rock Island Model",
          description: "I modeled this rock island in Blender for my beach portfolio. It features detailed geometry and realistic materials.",
          imageUrl: "./images/rock-island.jpg", // Add your image path
          projectLink: "https://github.com/ErikThroup/Eriks-Beach"
        }
      },
      {
        name: "Project 2: Three.js Portfolio",
        position: { x: -5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "💻 Interactive 3D Portfolio",
          description: "A fully interactive 3D environment built with Three.js, featuring custom camera controls, physics, and imported Blender models.",
          imageUrl: "./images/portfolio.jpg",
          projectLink: "https://github.com/ErikThroup/Eriks-Beach"
        }
      },
      {
        name: "Project 3: Beach Environment",
        position: { x: 0, y: 0.5, z: -8 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "🌊 Beach Environment",
          description: "Created a complete beach environment with sand, water effects, and atmospheric lighting using Three.js.",
          imageUrl: "./images/beach.jpg",
          projectLink: "#"
        }
      }
    ]
    
    // Create each zone
    zones.forEach(zone => {
      const triggerZone = new TriggerZone(
        zone.position,
        zone.size,
        zone.data,
        this.scene
      )
      this.triggerZones.push(triggerZone)
      console.log(`✅ Created zone: ${zone.name} at position`, zone.position)
    })
  }
  
  update() {
    // Update movable box
    if (this.movableBox && this.movableBox.update) {
      this.movableBox.update()
    }
    
    // Update trigger zones
    if (this.movableBox && this.movableBox.mesh) {
      const playerPosition = this.movableBox.mesh.position
      this.time += 0.016 // Approximate delta time
      
      this.triggerZones.forEach(zone => {
        zone.update(playerPosition, this.time)
      })
    }
  }
  }
  
  loadBlenderModel() {

    const modelName = 'rockisland'; 
      
      // Get the scene from the loaded GLB
      this.blenderModel = this.resources.items[modelName].scene.clone();
      
      // Position on the beach
      this.blenderModel.position.set(50, 0, 25);
      
      // scale 
      this.blenderModel.scale.set(1, 1, 1);
      
      this.scene.add(this.blenderModel);
      
   
  }
  
  update() {
    // Update movable box (from original)
    if (this.movableBox && this.movableBox.update) {
      this.movableBox.update();
    }
  }
}
