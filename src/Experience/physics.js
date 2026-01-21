// src/Experience/Physics.js
import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export default class Physics {
    constructor() {
        this.experience = window.experience;
        this.scene = this.experience.scene;
        
        // Initialize Rapier
        this.initPhysics();
    }
    
    async initPhysics() {
        // Initialize Rapier
        await RAPIER.init();
        
        // Create physics world
        this.gravity = { x: 0.0, y: -9.81, z: 0.0 };
        this.world = new RAPIER.World(this.gravity);
        
        
        // Create ground plane (your beach floor)
        this.createGround();
    }
    
    createGround() {
        // Create a static ground plane
        let groundColliderDesc = RAPIER.ColliderDesc.cuboid(100.0, 0.1, 100.0);
        this.groundCollider = this.world.createCollider(groundColliderDesc);
        
        // Position it at y = -1 (under your beach)
        this.groundCollider.setTranslation({ x: 0.0, y: -1.0, z: 0.0 });
    }
    
    createBox(position = { x: 0, y: 5, z: 0 }, size = { x: 1, y: 1, z: 1 }) {
        // Create dynamic rigid body
        let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y, position.z);
        let rigidBody = this.world.createRigidBody(rigidBodyDesc);
        
        // Create collider for the box
        let colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
        let collider = this.world.createCollider(colliderDesc, rigidBody);
        
        return {
            rigidBody: rigidBody,
            collider: collider
        };
    }
    
    update() {
        // Step the physics simulation
        if (this.world) {
            this.world.step();
        }
    }
}