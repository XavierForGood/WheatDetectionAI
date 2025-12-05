import { useState } from 'react'
import { RefreshCw, Image as ImageIcon, X } from 'lucide-react'
import ImageUpload from '../components/ImageUpload'
import DetectionCanvas from '../components/DetectionCanvas'
import MetricsPanel from '../components/MetricsPanel'

import example1 from '../assets/example1.png'
import example2 from '../assets/example2.png'
import example3 from '../assets/example3.png'
import example4 from '../assets/示例4.png'
import example5 from '../assets/示例5.png'
import example6 from '../assets/示例6.png'

const examples = [
    { id: 1, src: example1, label: "示例 1" },
    { id: 2, src: example2, label: "示例 2" },
    { id: 3, src: example3, label: "示例 3" },
    { id: 4, src: example4, label: "示例 4" },
    { id: 5, src: example5, label: "示例 5" },
    { id: 6, src: example6, label: "示例 6" },
]

export default function Dashboard() {
    const [image, setImage] = useState(null)
    const [detections, setDetections] = useState(null)
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(false)
    const [sensitivity, setSensitivity] = useState(100) // 0-100，对应灵敏度，默认最高灵敏度
    const [inferenceTime, setInferenceTime] = useState(null)
    
    // 计算置信度阈值：灵敏度越高，阈值越低
    const confidenceThreshold = 1.0 - (sensitivity / 100.0)

    const processFile = async (file) => {
        setImage(file)
        setLoading(true)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://127.0.0.1:8000/api/detect', {
                method: 'POST',
                body: formData,
            })

            if (response.ok) {
                const data = await response.json()
                setDetections(data.detections)
                setMetrics({
                    count: data.count,
                    estimated_yield: data.estimated_yield,
                    health_index: data.health_index,
                    calculation_steps: data.calculation_steps
                })
                setInferenceTime(data.inference_time)
            } else {
                console.error('Detection failed')
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (file) => {
        processFile(file)
    }

    const handleExampleSelect = async (src) => {
        // Convert URL to Blob/File
        try {
            const response = await fetch(src)
            const blob = await response.blob()
            const file = new File([blob], "example.png", { type: "image/png" })
            processFile(file)
        } catch (e) {
            console.error("Failed to load example", e)
        }
    }

    const handleReset = () => {
        setImage(null)
        setDetections(null)
        setMetrics(null)
    }

    const handleClose = () => {
        if (window.pywebview) {
            window.pywebview.api.close_window()
        } else {
            window.close()
        }
    }

    const handleExport = async () => {
        if (!image || !detections || !metrics) return

        // Get the detection canvas with drawn boxes
        const detectionCanvas = document.getElementById('detection-canvas')
        if (!detectionCanvas) return

        // Create a new canvas for export
        const exportCanvas = document.createElement('canvas')
        const ctx = exportCanvas.getContext('2d')

        // Set canvas dimensions: image on left, data on right
        const imgWidth = detectionCanvas.width
        const imgHeight = detectionCanvas.height
        const dataWidth = 320
        const totalWidth = imgWidth + dataWidth
        const totalHeight = Math.max(imgHeight, 500)

        exportCanvas.width = totalWidth
        exportCanvas.height = totalHeight

        // Draw background
        ctx.fillStyle = '#0f172a' // slate-900
        ctx.fillRect(0, 0, totalWidth, totalHeight)

        // Draw detection image with boxes
        ctx.drawImage(detectionCanvas, 0, 0)

        // Draw data section
        ctx.fillStyle = '#1e293b' // slate-800
        ctx.fillRect(imgWidth, 0, dataWidth, totalHeight)

        // Draw title
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('小麦检测报告', imgWidth + dataWidth / 2, 40)

        // Draw divider
        ctx.strokeStyle = '#475569'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(imgWidth, 60)
        ctx.lineTo(totalWidth, 60)
        ctx.stroke()

        // Calculate filtered detections
        const filteredDetections = detections.filter(det => det.score >= confidenceThreshold)
        const filteredCount = filteredDetections.length
        const recalculatedYield = metrics.estimated_yield * (filteredCount / metrics.count)

        // Draw metrics
        const reportMetrics = [
            { label: '麦穗数量', value: `${filteredCount} 个` },
            { label: '预估产量', value: `${recalculatedYield.toFixed(1)} kg/亩` },
            { label: '健康指数', value: `${metrics.health_index.toFixed(1)}%` },
            { label: '检测灵敏度', value: `${sensitivity}%` },
            { label: '推理耗时', value: `${inferenceTime} ms` },
            { label: '模型版本', value: 'YOLO11x' },
            { label: '推理设备', value: 'CPU / ONNX' },
        ]
        let y = 100
        const lineHeight = 45
        ctx.font = '14px Arial'
        ctx.textAlign = 'left'

        reportMetrics.forEach(metric => {
            // Label
            ctx.fillStyle = '#94a3b8' // slate-400
            ctx.fillText(metric.label, imgWidth + 30, y)
            
            // Value
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 18px Arial'
            ctx.fillText(metric.value, imgWidth + 30, y + 25)
            
            ctx.font = '14px Arial'
            y += lineHeight
        })

        // Add calculation steps if available
        if (metrics.calculation_steps && metrics.calculation_steps.length > 0) {
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('计算过程', imgWidth + dataWidth / 2, y)
            
            ctx.strokeStyle = '#475569'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(imgWidth + 30, y + 15)
            ctx.lineTo(imgWidth + dataWidth - 30, y + 15)
            ctx.stroke()
            
            y += 40
            ctx.font = '12px Arial'
            ctx.textAlign = 'left'
            ctx.fillStyle = '#cbd5e1' // slate-300
            
            metrics.calculation_steps.forEach((step, index) => {
                ctx.fillText(`${index + 1}. ${step}`, imgWidth + 30, y)
                y += 25
            })
        }

        // Add timestamp
        const now = new Date()
        const timestamp = now.toLocaleString()
        ctx.fillStyle = '#64748b' // slate-500
        ctx.font = '12px Arial'
        ctx.textAlign = 'right'
        ctx.fillText(timestamp, totalWidth - 20, totalHeight - 20)

        // Download the canvas as image
        exportCanvas.toBlob(async (blob) => {
            try {
                // Check if showSaveFilePicker is supported (modern browsers)
                if (window.showSaveFilePicker) {
                    const fileName = `wheat_detection_report_${now.getTime()}.png`;
                    const options = {
                        suggestedName: fileName,
                        types: [
                            {
                                description: 'PNG Images',
                                accept: { 'image/png': ['.png'] }
                            }
                        ]
                    };
                    
                    const fileHandle = await window.showSaveFilePicker(options);
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                } else {
                    // Fallback for browsers that don't support showSaveFilePicker
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `wheat_detection_report_${now.getTime()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }
            } catch (error) {
                console.error('Error exporting report:', error);
                // Fallback if showSaveFilePicker is canceled or fails
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wheat_detection_report_${now.getTime()}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        })
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-slate-950 p-6">
            {/* Custom Drag Region for Frameless Window */}
            <div className="fixed inset-x-0 top-0 h-6 z-50 app-drag-region" />

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col gap-6 pr-6">
                <header className="flex items-center justify-between relative z-50">
                    <div>
                        <h1 className="text-2xl font-bold text-white">检测控制台</h1>
                        <p className="text-sm text-slate-400">Wheat Detection Console</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {image && (
                            <>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    重置
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                                    title="导出报告"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    导出报告
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleClose}
                            className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            title="退出系统"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                    {!image ? (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 p-8">
                                <ImageUpload onImageSelect={handleImageSelect} />
                            </div>

                            {/* Example Images Section */}
                            <div className="bg-slate-900/50 p-6">
                                <h3 className="mb-4 text-sm font-medium text-slate-400">或选择示例图片</h3>
                                <div className="flex gap-4 overflow-x-auto pb-2">
                                    {examples.map((ex) => (
                                        <button
                                            key={ex.id}
                                            onClick={() => handleExampleSelect(ex.src)}
                                            className="group relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700 transition-all hover:border-wheat-500 hover:shadow-lg hover:shadow-wheat-500/20"
                                        >
                                            <img src={ex.src} alt={ex.label} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="text-xs font-medium text-white">点击使用</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            {/* Image and Detection Area */}
                            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <DetectionCanvas image={image} detections={detections} threshold={confidenceThreshold} />
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-10">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-wheat-500 border-t-transparent" />
                                                <p className="text-wheat-400">AI 正在分析中...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Detection Sensitivity Slider - Horizontal */}
                            <div 
                                className="bg-slate-900/50 p-6 border-t border-slate-800 z-30 app-no-drag-region"
                                style={{ userSelect: 'none' }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-slate-300">
                                            检测灵敏度
                                        </label>
                                        <span className="text-sm font-semibold text-white">
                                            {sensitivity}%
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={sensitivity}
                                            onChange={(e) => setSensitivity(parseInt(e.target.value))}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onTouchStart={(e) => e.stopPropagation()}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-wheat-500 z-30 relative"
                                            style={{ zIndex: 30, userSelect: 'none' }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>低</span>
                                        <span>中</span>
                                        <span>高</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 space-y-6 pt-12">
                <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md" style={{ zIndex: 15 }}>
                    <h2 className="mb-4 text-lg font-semibold text-white">实时数据</h2>
                    <MetricsPanel metrics={metrics} detections={detections} confidenceThreshold={confidenceThreshold} loading={loading} />

                    {!metrics && !loading && (
                        <div className="mt-4 rounded-lg border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">
                            等待检测结果...
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md" style={{ zIndex: 5 }}>
                    <h2 className="mb-4 text-lg font-semibold text-white">系统状态</h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">引擎状态</span>
                            <span className="flex items-center gap-2 text-emerald-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                运行中
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">模型版本</span>
                            <span className="text-white">YOLO11x</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">推理设备</span>
                            <span className="text-white">CPU / ONNX</span>
                        </div>
                        {inferenceTime !== null && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">推理耗时</span>
                                <span className="text-white">{inferenceTime} ms</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
