import { Texture, TextureLoader } from "three"

const textures = {
    ground: "textures/kenney_prototype/texture_08.png"
}

type TextureName = keyof typeof textures

export class TextureManager {
    private static instance: TextureManager | null = null

    private loader: TextureLoader = new TextureLoader()
    private cache: Map<string, Texture<HTMLImageElement>> = new Map()

    static getInstance() {
        if (!TextureManager.instance) {
            TextureManager.instance = new TextureManager()
        }

        return TextureManager.instance
    }

    async setup() {
        await Promise.all(
            Object.values(textures).map(value => this.precache(value))
        )
    }

    private async precache(url: string): Promise<void> {
        if (this.cache.has(url)) {
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (data) => {
                    this.cache.set(url, data)
                    resolve()
                },
                undefined,
                reject
            )
        })
    }

    getTexture(name: TextureName) {
        const url = textures[name]
        if (!this.cache.has(url)) {
            return null
        }

        return this.cache.get(url)!
    }
}