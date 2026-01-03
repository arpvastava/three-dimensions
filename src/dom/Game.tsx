import { PerspectiveCamera, Scene, WebGLRenderer } from "three"

export class Game {
    private container: HTMLDivElement
    private width: number
    private height: number
    private scene: Scene
    private camera: PerspectiveCamera
    private renderer: WebGLRenderer

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
        this.scene.add(this.camera)

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

    setup() {
        this.renderer.render(this.scene, this.camera)
    }

    destroy() {
        // Remove event listeners
        window.removeEventListener("resize", this.handleScreenResize)

        // Disable and remove renderer
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }
}