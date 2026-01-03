import './App.css'
import { useEffect, useRef } from 'react'
import { Game } from './dom/Game'

function App() {
    const gameRef = useRef<Game | null>(null)
    const gameContainerRef = useRef<HTMLDivElement>(null)

    // Create game instance
    useEffect(() => {
        const game = new Game(gameContainerRef.current!)
        gameRef.current = game
        game.setup()

        return () => {
            game.destroy()
        }

    }, [])

    return (
        <>
            <div
                ref={gameContainerRef}
                style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px"
                }}
            />

            <div className="ui">
                <h1 style={{ color: "white" }}>Hello, world!</h1>
            </div>
        </>
    )
}

export default App
