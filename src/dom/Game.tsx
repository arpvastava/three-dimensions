import { AmbientLight, DirectionalLight, FogExp2, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { Player } from "./classes/Player"
import { Ground } from "./classes/Ground"
import { ObstaclesManager } from "./classes/ObstaclesManager"
import { StateManager } from "../state"
import type { GameState } from "../state/StateManager"

export class Game {
    private stateManager: StateManager
    private container: HTMLDivElement
    private width: number
    private height: number
    private scene: Scene
    private camera: PerspectiveCamera
    private renderer: WebGLRenderer

    private lastTime: number = 0
    private player: Player | null = null
    private ground: Ground | null = null
    private obstaclesManager: ObstaclesManager | null = null

    constructor(container: HTMLDivElement) {
        this.container = container

        // Set state manager
        this.stateManager = StateManager.getInstance()

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

        // Create obstacles manager
        this.obstaclesManager = new ObstaclesManager(this.scene, this.player)
        this.obstaclesManager.setup()

        // Render
        this.renderer.render(this.scene, this.camera)

        // Events handling
        this.stateManager.on("stateChange", this.onStateChange)
    }

    loop() {
        this.renderer.setAnimationLoop((time: DOMHighResTimeStamp) => {
            // Set delta time
            const delta = (time - this.lastTime) / 1000
            this.lastTime = time

            // Main Loop
            this.ground?.update(delta)

            if (this.stateManager.getState() === "playing") {
                this.obstaclesManager?.update(delta)

                // Update score
                this.stateManager.setScore(
                    this.stateManager.getScore() + (1 * delta)
                )
            }

            this.player?.update(delta)

            // Render
            this.renderer.render(this.scene, this.camera)
        })
    }

    destroy() {
        // Remove event listeners
        this.stateManager.off("stateChange", this.onStateChange)
        window.removeEventListener("resize", this.handleScreenResize)

        // Remove game objects
        this.ground?.destroy()
        this.obstaclesManager?.destroy()
        this.player?.destroy()

        // Remove scene and camera
        this.scene.clear()
        this.camera.clear()

        // Disable and remove renderer
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }

    // Event handling methods
    private onStateChange = (state: GameState) => {
        if (state === "playing") {
            this.stateManager.setScore(0)
        }

        if (state === "playing" && this.player && this.player.isActive === false) {
            this.player.setup()
        }
    }
}