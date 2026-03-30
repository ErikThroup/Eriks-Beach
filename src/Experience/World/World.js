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
      this.loadFlyingMachine();
      this.createTriggerZones();

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
        name: "About ME",
        position: { x: 0, y: 0.5, z: -15 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "About ME",
          description: "Hi! I'm Erik an international student, studying Creative Technology at the Vrije Universiteit van Amsterdam. I'm highly motivated to find a career in a field I'll find fun and fulfilling. I love coming up with technical solutions to problems in my daily life. I was born in Spain in 2003 but grew up in Amsterdam and attended an international school. I'm a very active person and love to hike and be outdoors in nature.",
          images: ["./images/WhatsApp+Image+2025-10-21+at+23.18.41_bfca53af.webp"],
          videoUrl: null,
        }
      },
      {
        name: "Sense-Process-Act",
        position: { x: 5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Sense-Process-Act",
          description: "This has probably been one of my favorite assignments. I had to design a Dutch windmill in Fusion 360 with specific size parameters. I was told there would be a chance for my design to be 3D printed and laser cut, which is why I was so motivated to finish it.",
          images: ["./images/Screenshot+2025-10-21+120628.webp"],
          videoUrl: null,
        }
      },
      {
        name: "Soldering Christmas Tree",
        position: { x: -5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Soldering Christmas Tree",
          description: "This is the LED Christmas tree I soldered for my M1 workshop. This was a great opportunity to learn how to solder and the mechanics behind it.",
          images: ["./images/WhatsApp+Image+2025-10-21+at+18.39.22_4a7c0c46.webp"],
          videoUrl: null,
        }
      },
      {
        name: "Hackathon-Video PSA",
        position: { x: 5, y: 0.5, z: -10 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Hackathon-Video PSA",
          description: "This was a group project in M1 where we had to make a persuasive video to change a negative behavior. Our group decided to make a video focused on bike safety.",
          images: [],
          videoUrl: "https://www.youtube.com/embed/k4tOGeTYqSQ",
        }
      },
      {
        name: "Creature Assignment",
        position: { x: -5, y: 0.5, z: -10 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Creature Assignment",
          description: "This assignment was just all around fun — I got to program flying dragons that change colors!",
          images: [],
          videoUrl: "https://www.youtube.com/embed/p5UYFP2AKfU",
        }
      },
      {
        name: "Smart Self Monitoring Mushroom Grow Kit",
        position: { x: 0, y: 0.5, z: 15 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Smart Self Monitoring Mushroom Grow Kit",
          description: "This was a group project in M2 for smart environments. We chose to make a smart mushroom grow kit that uses sensors to monitor the mushrooms and the environment they grow in. The system could water, heat and refresh the air in the grow kit based on sensor data. We also made a website and Processing program to monitor the mushrooms and control the system.",
          images: [],
          videoUrl: "https://www.youtube.com/embed/oSsGmyDUjwg",
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
    this.blenderModel.position.set(0, -2, -25);
    this.blenderModel.scale.set(1, 1, 1);
    this.scene.add(this.blenderModel);
  }

  loadFlyingMachine() {
    const model = this.resources.items['flyingMachine'];
    if (!model) return;

    this.flyingMachine = model.scene.clone();

    // Apply textures based on mesh names
    const denim = this.resources.items['flyingMachineDenim']
    const wood = this.resources.items['flyingMachineWood']
    const goldColor = this.resources.items['flyingMachineGoldColor']
    const goldNormal = this.resources.items['flyingMachineGoldNormal']

    this.flyingMachine.traverse((child) => {
      if (child.isMesh) {
        // Log mesh names so you can see what's in the model
        console.log('Flying machine mesh:', child.name)

        const name = child.name.toLowerCase()
        if (name.includes('denim') || name.includes('fabric')) {
          child.material = new THREE.MeshStandardMaterial({ map: denim })
        } else if (name.includes('wood')) {
          child.material = new THREE.MeshStandardMaterial({ map: wood })
        } else if (name.includes('gold') || name.includes('metal')) {
          child.material = new THREE.MeshStandardMaterial({
            map: goldColor,
            normalMap: goldNormal,
            metalness: 0.8,
            roughness: 0.3
          })
        }

        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // 40 metres away along Z axis
    this.flyingMachine.position.set(0, 0.4, 40);
    this.flyingMachine.scale.set(0.33, 0.33, 0.33);
    this.scene.add(this.flyingMachine);
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