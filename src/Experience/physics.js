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
        window.dispatchEvent(new Event('physicsReady'))
        console.log('✅ Physics ready!')
        if (this.onReady) this.onReady();
    }

createGround() {
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(200.0, 0.1, 200.0);
    this.groundCollider = this.world.createCollider(groundColliderDesc);
    this.groundCollider.setTranslation({ x: 0.0, y: 0.0, z: 0.0 });
}

createPlayerBody(position = { x: 0, y: 5, z: 0 }) {
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(position.x, position.y, position.z)
        .lockRotations()
    let rigidBody = this.world.createRigidBody(rigidBodyDesc);

    let colliderDesc = RAPIER.ColliderDesc.cuboid(0.3, 0.5, 0.3)
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

            child.updateWorldMatrix(true, false);
            const worldMatrix = child.matrixWorld;

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

            let indices;
            if (geometry.index) {
                indices = new Uint32Array(geometry.index.array);
            } else {
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

    update() {
        if (this.world && this.ready) {
            this.world.step();
        }
    }
}