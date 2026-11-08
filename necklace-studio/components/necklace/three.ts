/**
 * 3D view: the server's GLBs placed by the same simulation, in three.js.
 *
 * Coordinates: physics is mm, Y DOWN. three.js is mm, Y UP, so y → -y and
 * angle → -angle at exactly one place (`apply`). Plates are the extruded
 * outline from engine/render/mesh.ts; links are instanced from the link GLB
 * (smooth tori at Oleg's link dimensions).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { Necklace } from './physics.ts';
import type { LoadedLinks, LoadedPlate } from './assets.ts';
import { placeLinks } from './chain.ts';

export class ThreeNecklace {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 500);
  plates: THREE.Group[] = [];
  chain?: THREE.InstancedMesh;
  rings?: THREE.InstancedMesh;
  private tmp = new THREE.Object3D();
  private edgeTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  /** A slight forward lean so the flat face catches the studio light and the plate edge shows. */
  tilt = -0.32;
  yaw = 0.12;
  showChain = true;
  private chainCap = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    // Neutral, not ACES: ACES desaturates bright highlights, and a flat polished
    // plate face is one big highlight — gold came out cream-white (measured in
    // the browser, 2026-11-04). Neutral keeps the metal's hue.
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    // RoomEnvironment is a bright white box; at full strength a tilted gold face
    // mirrors it as near-white. Dim it so baseColor carries the metal's hue.
    this.scene.environmentIntensity = 0.45;
    const key = new THREE.DirectionalLight(0xfff3e0, 2.2);
    key.position.set(-60, 90, 70);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 0.8);
    rim.position.set(80, -40, 40);
    this.scene.add(key, rim);
  }

  /** True only while plates AND chain meshes for the current necklace are all in the scene. */
  ready = false;
  private loadSeq = 0;

  /**
   * Load everything first, then swap it in at once. The render loop calls
   * apply() every frame; it must never see plates without the chain meshes —
   * that half-loaded state threw inside requestAnimationFrame and stopped the
   * whole animation (the "3D is blank" bug, 2026-11-04).
   */
  async load(plates: LoadedPlate[], links: LoadedLinks, linkCapacity: number) {
    const seq = ++this.loadSeq;
    this.ready = false;
    const loader = new GLTFLoader();
    const [gltfs, lg] = await Promise.all([Promise.all(plates.map((p) => loader.loadAsync(p.meta.glbUrl))), loader.loadAsync(links.meta.glbUrl)]);
    if (seq !== this.loadSeq) return; // a newer necklace started loading meanwhile
    const groups = gltfs.map((gltf, k) => {
      const m = plates[k].meta;
      const inner = gltf.scene;
      // Put the FIRST loop centre (mid-thickness) at the group origin.
      inner.position.set(-m.attachMm[0].x, -m.attachMm[0].y, -m.thicknessMm / 2);
      const group = new THREE.Group();
      group.add(inner);
      return group;
    });
    const mesh = (name: string) => (lg.scene.getObjectByName(name) as THREE.Mesh | undefined) ?? (lg.scene.getObjectByName(name)?.children[0] as THREE.Mesh);
    const chainSrc = mesh('chainLink'), ringSrc = mesh('connectionLink');
    // Swap: remove the old necklace, add the new one, in one synchronous step.
    for (const g of this.plates) this.scene.remove(g);
    if (this.chain) this.scene.remove(this.chain);
    if (this.rings) this.scene.remove(this.rings);
    this.plates = groups;
    this.chainCap = linkCapacity;
    this.chain = new THREE.InstancedMesh(chainSrc.geometry, chainSrc.material, linkCapacity);
    this.rings = new THREE.InstancedMesh(ringSrc.geometry, ringSrc.material, 64);
    this.scene.add(...groups, this.chain, this.rings);
    this.ready = true;
  }

  resize(w: number, h: number, dpr: number, view: { scale: number; ox: number; oy: number }) {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    // Same framing as the sprite view: canvas px = ox + x·scale.
    const left = -view.ox / view.scale, right = (w - view.ox) / view.scale;
    const top = view.oy / view.scale, bottom = -(h - view.oy) / view.scale;
    Object.assign(this.camera, { left, right, top, bottom });
    this.camera.updateProjectionMatrix();
  }

  /** Copy the simulation into the scene. The only place Y and angle flip. */
  apply(nk: Necklace) {
    this.plates.forEach((g, k) => {
      const pose = nk.platePose(k);
      g.position.set(pose.origin.x, -pose.origin.y, 0);
      g.rotation.set(0, 0, -pose.angle);
    });
    let ci = 0, ri = 0;
    const zRot = new THREE.Quaternion();
    for (const l of placeLinks(nk)) {
      zRot.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -l.angle);
      this.tmp.position.set(l.x, -l.y, 0);
      if (l.kind === 'edge') this.tmp.quaternion.copy(zRot).multiply(this.edgeTilt);
      else this.tmp.quaternion.copy(zRot);
      this.tmp.updateMatrix();
      if (l.kind === 'connection') this.rings!.setMatrixAt(ri++, this.tmp.matrix);
      else if (ci < this.chainCap) this.chain!.setMatrixAt(ci++, this.tmp.matrix);
    }
    this.chain!.count = ci;
    this.rings!.count = ri;
    this.chain!.instanceMatrix.needsUpdate = true;
    this.rings!.instanceMatrix.needsUpdate = true;
  }

  /** METAL MATERIAL + view settings, applied live to every mesh. */
  setMaterial(m: { metalMetallic: number; metalRoughness: number; envIntensity: number; viewTilt: number; enable3dChain: boolean }) {
    this.scene.environmentIntensity = m.envIntensity;
    this.tilt = -(m.viewTilt * Math.PI) / 180;
    this.showChain = m.enable3dChain;
    this.scene.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (mat && 'metalness' in mat) {
        mat.metalness = m.metalMetallic;
        mat.roughness = m.metalRoughness;
      }
    });
  }

  render(dark: boolean) {
    if (this.chain) this.chain.visible = this.showChain;
    if (this.rings) this.rings.visible = this.showChain;
    this.scene.background = new THREE.Color(dark ? 0x16171a : 0xf4f1ec);
    this.scene.rotation.set(this.tilt, this.yaw, 0);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
  }
}
