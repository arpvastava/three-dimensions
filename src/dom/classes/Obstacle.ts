import { BoxGeometry, Mesh, MeshStandardMaterial, Scene } from "three";

export class Obstacle {
    obstacle: Mesh | null = null
    scene: Scene

    speed: number = 25

    constructor(scene: Scene) {
        this.scene = scene
    }

    setup(xPos: number) {
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshStandardMaterial({ color: "skyblue" })
        this.obstacle = new Mesh(geometry, material)
        this.obstacle.position.set(xPos, 1, -50)

        this.scene.add(this.obstacle)
    }

    update(delta: number) {
        if (!this.obstacle)
            return

        this.obstacle.position.z += this.speed * delta
    }

    destroy() {
        if (!this.obstacle)
            return

        // Clear main reference beforehand
        const o = this.obstacle
        this.obstacle = null

        // Clear out geometry and material
        o.geometry.dispose()

        if (Array.isArray(o.material)) {
            o.material.forEach(m => m.dispose())
        }
        else {
            o.material.dispose()
        }

        // Remove from scene
        this.scene.remove(o)
    }
}