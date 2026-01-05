import { BoxGeometry, Mesh, MeshBasicMaterial, type Scene } from "three";

export class Ground {
    ground: Mesh | null = null
    scene: Scene
    dimensions = { length: 10, breadth: 1000 }

    constructor(scene: Scene) {
        this.scene = scene
    }

    setup() {
        const geometry = new BoxGeometry(this.dimensions.length, 1, this.dimensions.breadth)
        const material = new MeshBasicMaterial({ color: "skyblue" })

        this.ground = new Mesh(geometry, material)
        this.ground.position.set(0, -1, 0)

        this.scene.add(this.ground)
    }

    update(_delta: number) {

    }

    destroy() {
        if (!this.ground)
            return

        // Clear main reference beforehand
        const g = this.ground
        this.ground = null

        // Clear out geometry and material
        g.geometry.dispose()

        if (Array.isArray(g.material)) {
            g.material.forEach(m => m.dispose())
        }
        else {
            g.material.dispose()
        }

        // Remove from scene
        this.scene.remove(g)
    }
}