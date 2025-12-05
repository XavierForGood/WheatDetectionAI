import { useEffect, useRef } from 'react'

export default function WheatField() {
    const canvasRef = useRef(null)
    const mouse = useRef({ x: -1000, y: -1000 })
    const timeRef = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationFrameId

        // Wheat stalk class
        class Stalk {
            constructor(x, y) {
                this.x = x
                this.y = y
                this.height = Math.random() * 30 + 40 // Height between 40-70px
                this.angle = (Math.random() - 0.5) * 0.2 // Initial slight random angle
                this.naturalAngle = this.angle
                this.windOffset = Math.random() * Math.PI * 2
                this.stiffness = 0.02 + Math.random() * 0.02
                this.color = `hsl(${35 + Math.random() * 10}, ${60 + Math.random() * 20}%, ${30 + Math.random() * 20}%)`
            }

            update(mouseX, mouseY, time) {
                // 1. Wind force (sine wave)
                const windForce = Math.sin(time * 0.002 + this.windOffset) * 0.05

                // 2. Mouse interaction force
                // Calculate tip position
                const tipX = this.x + Math.sin(this.angle) * this.height
                const tipY = this.y - Math.cos(this.angle) * this.height

                const dx = tipX - mouseX
                const dy = tipY - mouseY
                const dist = Math.sqrt(dx * dx + dy * dy)

                let mouseForce = 0
                if (dist < 100) {
                    // Push away from mouse
                    // Calculate the direction from mouse to stalk
                    const pushDir = dx / dist // Normalized x direction
                    mouseForce = pushDir * (1 - dist / 100) * 0.5 // Stronger when closer
                }

                // 3. Spring force (return to natural angle)
                const springForce = (this.naturalAngle - this.angle) * this.stiffness

                // Apply forces
                this.angle += windForce + mouseForce + springForce

                // Damping to prevent infinite oscillation
                this.angle *= 0.95
            }

            draw(ctx) {
                const tipX = this.x + Math.sin(this.angle) * this.height
                const tipY = this.y - Math.cos(this.angle) * this.height

                // Control point for quadratic curve (gives a slight bend)
                const cpX = this.x + Math.sin(this.angle * 0.5) * (this.height * 0.5)
                const cpY = this.y - Math.cos(this.angle * 0.5) * (this.height * 0.5)

                ctx.beginPath()
                ctx.moveTo(this.x, this.y)
                ctx.quadraticCurveTo(cpX, cpY, tipX, tipY)
                ctx.strokeStyle = this.color
                ctx.lineWidth = 2
                ctx.lineCap = 'round'
                ctx.stroke()
            }
        }

        let stalks = []

        const init = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            stalks = []

            // Create stalks at the bottom
            // Density: one stalk every ~10 pixels
            const density = 8
            for (let x = 0; x < canvas.width; x += density) {
                // Add some randomness to x
                const finalX = x + (Math.random() - 0.5) * 5
                // Add multiple rows for depth
                for (let i = 0; i < 3; i++) {
                    const y = canvas.height + (Math.random() * 20) // Start slightly below or at bottom
                    stalks.push(new Stalk(finalX, y - i * 5))
                }
            }
        }

        const handleResize = () => {
            init()
        }

        const handleMouseMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY }
        }

        const handleMouseLeave = () => {
            mouse.current = { x: -1000, y: -1000 }
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseout', handleMouseLeave)

        init()

        const animate = (timestamp) => {
            timeRef.current = timestamp
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            stalks.forEach(stalk => {
                stalk.update(mouse.current.x, mouse.current.y, timestamp)
                stalk.draw(ctx)
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        animate(0)

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseout', handleMouseLeave)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-0"
            style={{ opacity: 0.4 }} // Subtle effect
        />
    )
}
