import * as THREE from "three";
import MovableBox from './MovableBox.js';
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";

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
