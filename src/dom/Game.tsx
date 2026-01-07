import { AmbientLight, DirectionalLight, FogExp2, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { Player } from "./classes/Player"
import { Ground } from "./classes/Ground"
import { Obstacle } from "./classes/Obstacle"

export class Game {
    private container: HTMLDivElement
    private width: number
    private height: number
    private scene: Scene
    private camera: PerspectiveCamera
    private renderer: WebGLRenderer

    private lastTime: number = 0
    private player: Player | null = null
    private ground: Ground | null = null
    private obstacle: Obstacle | null = null

    constructor(container: HTMLDivElement) {
        this.container = container

        // Set width and height
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Create camera
        this.camera = new PerspectiveCamera(
            60,
            this.width / this.height,
            0.1,
            1000
        )

        // Create scene
        this.scene = new Scene()

        // Create renderer
        this.renderer = new WebGLRenderer()
        this.renderer.setSize(this.width, this.height)
        this.container.appendChild(this.renderer.domElement)

        // Listen for events
        window.addEventListener("resize", this.handleScreenResize)
    }

    private handleScreenResize = () => {
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Update camera
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.width, this.height)
        this.renderer.render(this.scene, this.camera)
    }

    private setupEnvironment() {
        const ambientLight = new AmbientLight("white", 0.5)
        this.scene.add(ambientLight)

        const dirLight = new DirectionalLight("white", 1)
        dirLight.position.set(0, 10, 0)
        this.scene.add(dirLight)

        this.scene.fog = new FogExp2("#111111", 0.06)
        this.renderer.setClearColor(this.scene.fog.color)
    }

    setup() {
        // Setup environment
        this.setupEnvironment()

        // Set camera position
        this.camera.position.set(0, 2, 5)

        // Create ground
        this.ground = new Ground(this.scene)
        this.ground.setup()

        // Create player
        this.player = new Player(this.scene)
        this.player.setup()

        // Create obstacle
        this.obstacle = new Obstacle(this.scene)
        this.obstacle.setup()

        // Render
        this.renderer.render(this.scene, this.camera)
    }

    loop() {
        this.renderer.setAnimationLoop((time: DOMHighResTimeStamp) => {
            // Set delta time
            const delta = (time - this.lastTime) / 1000
            this.lastTime = time

            // Main Loop
            this.ground?.update(delta)
            this.player?.update(delta)
            this.obstacle?.update(delta)

            // Render
            this.renderer.render(this.scene, this.camera)
        })
    }

    destroy() {
        // Remove event listeners
        window.removeEventListener("resize", this.handleScreenResize)

        // Remove game objects
        this.ground?.destroy()
        this.player?.destroy()
        this.obstacle?.destroy()

        // Remove scene and camera
        this.scene.clear()
        this.camera.clear()

        // Disable and remove renderer
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }
}