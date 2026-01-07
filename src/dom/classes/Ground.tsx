import { BoxGeometry, Mesh, MeshStandardMaterial, RepeatWrapping, TextureLoader, type Scene } from "three";

export class Ground {
    ground: Mesh | null = null
    scene: Scene
    dimensions = { length: 10, breadth: 1000 }
    texTileSize: number = 0.5

    speed: number = 2.5

    constructor(scene: Scene) {
        this.scene = scene
    }

    setup() {
        const loader = new TextureLoader()
        const texture = loader.load("/textures/kenney_prototype/texture_08.png")
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(
            this.dimensions.length * this.texTileSize,
            this.dimensions.breadth * this.texTileSize,
        )

        const geometry = new BoxGeometry(this.dimensions.length, 1, this.dimensions.breadth)
        const material = new MeshStandardMaterial({ map: texture })
        this.ground = new Mesh(geometry, material)

        this.scene.add(this.ground)
    }

    update(delta: number) {
        if (!this.ground)
            return

        const material = this.ground.material as MeshStandardMaterial
        const map = material.map
        if (!map)
            return

        map.offset.y = (map.offset.y + (this.speed * delta)) % 1
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