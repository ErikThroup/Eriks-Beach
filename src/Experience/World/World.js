import * as THREE from "three";
import MovableBox from './MovableBox.js';
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import Floor from "./Floor.js";

export default class World {
  constructor() {
    // IMPORTANT: Use the same pattern as your original working code
    this.experience = new Experience();  // ← Keep this line from original
    this.scene = this.experience.scene;
    this.environment = new Environment();
    this.resources = this.experience.resources;

    // Add your Blender model reference
    this.blenderModel = null;
    
    console.log('🌍 World constructor - waiting for resources...');

    // Wait for resources
    this.resources.on("ready", () => {
      console.log('✅ All resources ready!');
      console.log('Available resources:', Object.keys(this.resources.items));
      
      // Setup everything that needs resources (same as original)
      this.floor = new Floor();
      this.movableBox = new MovableBox();
      this.environment = new Environment();
      
      // ADDED: Load your Blender model
      this.loadBlenderModel();
      
      // Set camera to follow box (from original)
      setTimeout(() => {
        if (this.experience.camera && this.movableBox && this.movableBox.mesh) {
          this.experience.camera.setOrbitTarget(this.movableBox.mesh);
          console.log('🎯 Camera set to orbit around movable box');
        }
      }, 1000);
    });
  }
  
  loadBlenderModel() {
    // Check if your model loaded
    const modelName = 'rockisland'; // Your source name
    
    if (this.resources.items[modelName]) {
      console.log(`📦 Found ${modelName} in resources!`);
      
      // Get the scene from the loaded GLB
      this.blenderModel = this.resources.items[modelName].scene.clone();
      
      // Position it on your beach
      this.blenderModel.position.set(5, 0, 5);
      
      // Adjust scale if needed
      this.blenderModel.scale.set(1, 1, 1);
      
      // Fix materials for Three.js lighting
      this.blenderModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          
          if (child.material && child.material.isMaterial) {
            const newMaterial = new THREE.MeshStandardMaterial({
              color: child.material.color || 0xffffff,
              map: child.material.map,
              normalMap: child.material.normalMap,
              roughness: 0.8,
              metalness: 0.1
            });
            
            if (!child.material.map && !child.material.color) {
              child.material = newMaterial;
            }
          }
        }
      });
      
      this.scene.add(this.blenderModel);
      console.log(`✅ ${modelName} added to scene`);
      
    } else {
      console.warn(`⚠️ ${modelName} not found in resources.`);
      console.log('Available resources:', Object.keys(this.resources.items));
    }
  }
  
  update() {
    // Update movable box (from original)
    if (this.movableBox && this.movableBox.update) {
      this.movableBox.update();
    }
    
    // Update physics boxes if you have them
    if (this.physicsBoxes) {
      this.physicsBoxes.forEach(box => {
        if (box.update) box.update();
      });
    }
    
    // Optional: Animate your Blender model
    if (this.blenderModel) {
      // this.blenderModel.rotation.y += 0.005;
    }
  }
}