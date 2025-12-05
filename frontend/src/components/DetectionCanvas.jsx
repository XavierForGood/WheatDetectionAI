import { useEffect, useRef } from 'react'

export default function DetectionCanvas({ image, detections, threshold }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        if (!image || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.src = URL.createObjectURL(image)

        img.onload = () => {
            // Set canvas size to match image aspect ratio but fit within container
            const container = canvas.parentElement
            const scale = Math.min(
                container.clientWidth / img.width,
                container.clientHeight / img.height
            )

            canvas.width = img.width * scale
            canvas.height = img.height * scale

            // Draw image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

            // Draw detections
            if (detections) {
                detections.forEach(det => {
                    // Filter by confidence threshold
                    if (det.score >= threshold) {
                        const [x1, y1, x2, y2] = det.box
                        const w = x2 - x1
                        const h = y2 - y1

                        // Scale coordinates
                        const sx = scale

                        // Box
                        ctx.strokeStyle = '#3b82f6' // blue-500
                        ctx.lineWidth = 2
                        ctx.strokeRect(x1 * sx, y1 * sx, w * sx, h * sx)

                        // Label background
                        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
                        ctx.fillRect(x1 * sx, y1 * sx, w * sx, h * sx)
                    }
                })
            }
        }
    }, [image, detections, threshold])

    return (
        <canvas
            ref={canvasRef}
            id="detection-canvas"
            className="w-full h-full object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: 'calc(100vh - 18rem)', maxWidth: '100%' }}
        />
    )
}
