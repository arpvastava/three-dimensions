import { Audio, AudioListener, AudioLoader, type PerspectiveCamera } from "three"

const audios = {
    main: "audio/music/Cipher2/Cipher2.mp3",
    click: "audio/effects/kenney-ui/click4.ogg",
    move: "audio/effects/kenney-rpg/handleSmallLeather.ogg",
    collided: "audio/effects/kenney-digital/pepSound2.ogg"
}

type AudioName = keyof typeof audios

export class AudioManager {
    private static instance: AudioManager | null = null

    private listener: AudioListener = new AudioListener()
    private loader: AudioLoader = new AudioLoader()
    private cache: Map<string, AudioBuffer> = new Map()

    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager()
        }

        return AudioManager.instance
    }

    async setup(camera: PerspectiveCamera) {
        camera.add(this.listener)

        // Load all audios
        await Promise.all(
            Object.values(audios).map(value => this.precache(value))
        )
    }

    private precache(url: string): Promise<void> {
        if (this.cache.has(url)) {
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (buffer) => {
                    this.cache.set(url, buffer)
                    resolve()
                },
                undefined,
                reject
            )
        })
    }

    playOneShot(name: AudioName, volume: number = 1) {
        const url = audios[name]

        // Define play function
        const play = (buffer: AudioBuffer) => {
            const sound = new Audio(this.listener)
            sound.setBuffer(buffer)
            sound.setLoop(false)
            sound.setVolume(volume)
            sound.play()

            sound.source!.onended = () => sound.disconnect()
        }

        // Play if buffer already in cache
        if (this.cache.has(url)) {
            play(this.cache.get(url)!)
        }
        // Else load, cache, and play
        else {
            this.precache(url).then(() => {
                play(this.cache.get(url)!)
            })
        }
    }

    playLoop(name: AudioName, volume: number = 1): Promise<Audio> {
        const url = audios[name]

        // Define start function
        const start = (buffer: AudioBuffer) => {
            const sound = new Audio(this.listener)
            sound.setBuffer(buffer)
            sound.setLoop(true)
            sound.setVolume(volume)
            sound.play()

            return sound
        }

        return new Promise(resolve => {
            // Start if buffer already in cache
            if (this.cache.has(url)) {
                resolve(start(this.cache.get(url)!))
            }
            // Else load, cache, and start
            else {
                this.precache(url).then(() => {
                    resolve(start(this.cache.get(url)!))
                })
            }
        })
    }
}