import * as RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export default class Physics {
    constructor() {
        this.experience = window.experience;
        this.scene = this.experience.scene;
        this.ready = false;
        this.initPhysics();
    }

async initPhysics() {
    await RAPIER.init();
    this.gravity = { x: 0.0, y: -9.81, z: 0.0 };
    this.world = new RAPIER.World(this.gravity);
    this.ready = true;
    this.createGround();
    
    // Fire event so World.js knows physics is ready
    window.dispatchEvent(new Event('physicsReady'))
    console.log('✅ Physics ready!')
    if (this.onReady) this.onReady();
}

    createGround() {
        let groundColliderDesc = RAPIER.ColliderDesc.cuboid(200.0, 0.1, 200.0);
        this.groundCollider = this.world.createCollider(groundColliderDesc);
        this.groundCollider.setTranslation({ x: 0.0, y: -0.1, z: 0.0 });
    }

    createPlayerBody(position = { x: 0, y: 3, z: 0 }) {
        let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(position.x, position.y, position.z)
            .lockRotations() // prevent tipping over
        let rigidBody = this.world.createRigidBody(rigidBodyDesc);

        let colliderDesc = RAPIER.ColliderDesc.capsule(0.4, 0.3)
            .setFriction(0.5)
        this.world.createCollider(colliderDesc, rigidBody);

        return rigidBody;
    }

    createTrimeshFromModel(model) {
        if (!this.ready) return;

        model.traverse((child) => {
            if (!child.isMesh) return;

            const geometry = child.geometry;
            if (!geometry) return;

            // Get world transform
            child.updateWorldMatrix(true, false);
            const worldMatrix = child.matrixWorld;

            // Get vertices
            const posAttr = geometry.attributes.position;
            if (!posAttr) return;

            const vertices = new Float32Array(posAttr.count * 3);
            const tempVec = new THREE.Vector3();

            for (let i = 0; i < posAttr.count; i++) {
                tempVec.fromBufferAttribute(posAttr, i);
                tempVec.applyMatrix4(worldMatrix);
                vertices[i * 3] = tempVec.x;
                vertices[i * 3 + 1] = tempVec.y;
                vertices[i * 3 + 2] = tempVec.z;
            }

            // Get indices
            let indices;
            if (geometry.index) {
                indices = new Uint32Array(geometry.index.array);
            } else {
                // Non-indexed geometry
                indices = new Uint32Array(posAttr.count);
                for (let i = 0; i < posAttr.count; i++) indices[i] = i;
            }

            try {
                const colliderDesc = RAPIER.ColliderDesc.trimesh(vertices, indices);
                this.world.createCollider(colliderDesc);
            } catch (e) {
                console.warn('Trimesh failed for mesh:', child.name, e);
            }
        });
    }
    waitForPhysicsThenAddTrimesh(model) {
    const tryAdd = () => {
        const physics = this.environment?.physics
        if (physics && physics.ready) {
            model.updateWorldMatrix(true, true)
            physics.createTrimeshFromModel(model)
            console.log('✅ Trimesh collision added for model')
        } else {
            setTimeout(tryAdd, 200)
        }
    }
    // Try immediately and also listen for the physics ready event
    tryAdd()
    window.addEventListener('physicsReady', () => tryAdd(), { once: true })
}

    update() {
        if (this.world && this.ready) {
            this.world.step();
        }
    }
}