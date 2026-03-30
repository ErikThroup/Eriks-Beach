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
        name: "About ME",
        position: { x: 0, y: 0.5, z: -15 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "About ME",
          description: "THi! I’m Erik an internatonal student, studying Creative technology at the Vrije Universiteit van Amsterdam. Im highly motivated to do well in my course to find a career in a field I’ll find fun forfilling.  I love coming up with technical solutions to all sorts of problems in my daily life so I think this course will be a good fit. \/n\ Bit more about me; I was born in Spain in 2003 but I grewup in Amsterdam and attented an international school. I’m a very active person and I love to hike and be outdoors in nature. I able to program in quite a few languages and know the fundamentals of webdevelopment.his assignment was just all around fun I got to program flying dragons that change colors.  was a group project I had in M1 in which we had to make a persuasive video to change a negative behavior. Our group decided to make a video focused on bike safety.",
          images: ["./images/WhatsApp+Image+2025-10-21+at+23.18.41_bfca53af.jpeg"],
          videoUrl: null,
        }
      
      },
      {
        name: "Theme 2: Sense-Process-Act",
        position: { x: 5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Theme 2: Sense-Process-Act",
          description: "This has probaly been one of my favoret assignments. I had to design a dutch windmill in fusion 360 with spesific size peramiters. I was told that there would be a chance for my design to be 3d printed and lazer cut, which is why I was so motivated to do this assignment and basicaly finished it the moment we were told about it.",
          images: ["./images/Screenshot+2025-10-21+120628.png"],
          videoUrl: null,
        }
      },
      {
        name: "Soldering Chrismas tree",
        position: { x: -5, y: 0.5, z: 5 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Soldering Chrismas tree",
          description: "This is the LED chrismas tree I soldered for my M1 workshop. This was a great operunity to learn how to solder and the mechanics behind soldering.",
          images: ["./images/WhatsApp+Image+2025-10-21+at+18.39.22_4a7c0c46.jpeg"],
          videoUrl: null,
        }
      },
      {
        name: "Hackathon-Video PSA",
        position: { x: 5, y: 0.5, z: -10 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Hackathon-Video PSA",
          description: "This was a group project I had in M1 in which we had to make a persuasive video to change a negative behavior. Our group decided to make a video focused on bike safety.",
          images: ["./images/beach.jpg"],
          videoUrl: "https://www.youtube.com/watch?v=k4tOGeTYqSQ",
        }
      },
      {
        name: "Creature assignment",
        position: { x: -5, y: 0.5, z: -10 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Creature assignment",
          description: "This assignment was just all around fun I got to program flying dragons that change colors.  was a group project I had in M1 in which we had to make a persuasive video to change a negative behavior. Our group decided to make a video focused on bike safety.",
          images: ["./images/beach.jpg"],
          videoUrl: "https://www.youhttps://www.youtube.com/watch?v=p5UYFP2AKfUtube.com/watch?v=k4tOGeTYqSQ",
        }
      }
            {
        name: "Creature assignment",
        position: { x: -5, y: 0.5, z: -10 },
        size: { x: 5, y: 2, z: 5 },
        data: {
          title: "Creature assignment",
          description: "This assignment was just all around fun I got to program flying dragons that change colors.  was a group project I had in M1 in which we had to make a persuasive video to change a negative behavior. Our group decided to make a video focused on bike safety.",
          images: ["./images/beach.jpg"],
          videoUrl: "https://www.youhttps://www.youtube.com/watch?v=p5UYFP2AKfUtube.com/watch?v=k4tOGeTYqSQ",
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