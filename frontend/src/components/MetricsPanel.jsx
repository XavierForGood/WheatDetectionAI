import { Activity, Sprout, BarChart3 } from 'lucide-react'
import { cn } from '../lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

function CalculationStep({ label, value, unit, highlight, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.3 }}
            className="flex items-center justify-between text-sm"
        >
            <span className="text-slate-400">{label}</span>
            <span className={cn("font-mono", highlight ? "text-lg font-bold text-wheat-400" : "text-white")}>
                {value}{unit && <span className="ml-1 text-xs text-slate-500">{unit}</span>}
            </span>
        </motion.div>
    )
}

function MetricCard({ icon: Icon, title, value, unit, color, calculationContent }) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div className="relative">
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm transition-colors hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={cn("absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 transition-opacity group-hover:opacity-20", color)} />

                {/* Normal View */}
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <p className="text-sm font-medium text-slate-400">{title}</p>
                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">{value}</span>
                            <span className="text-xs text-slate-500">{unit}</span>
                        </div>
                    </div>
                    <div className={cn("rounded-lg p-2 bg-opacity-10", color.replace('bg-', 'text-'))}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </motion.div>

            {/* Calculation Popup Overlay - Left Side */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-full top-0 mr-3 z-[100] min-w-[280px] rounded-xl border border-slate-700 bg-slate-950 p-5 backdrop-blur-xl shadow-2xl shadow-black/50"
                        style={{ pointerEvents: 'auto' }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <div className="space-y-3">
                            {calculationContent}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}


export default function MetricsPanel({ metrics, detections, confidenceThreshold, loading }) {
    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-slate-800/50" />
                ))}
            </div>
        )
    }

    if (!metrics) return null

    // Filter detections by confidence threshold
    const filteredDetections = detections?.filter(det => det.score >= confidenceThreshold) || []
    const filteredCount = filteredDetections.length
    
    // Recalculate yield based on filtered count
    const yieldSteps = metrics.calculation_steps?.yield
    let recalculatedYield = metrics.estimated_yield
    let recalculatedYieldSteps = yieldSteps
    
    if (yieldSteps) {
        const { mu_area, area_scale, avg_grain_weight } = {
            mu_area: 666.67,
            area_scale: 666.67 / 0.6,
            avg_grain_weight: 35.0,
            ...yieldSteps
        }
        
        const estimated_density = filteredCount * area_scale
        recalculatedYield = (estimated_density * avg_grain_weight) / 1000
        
        recalculatedYieldSteps = {
            ...yieldSteps,
            count: filteredCount,
            estimated_density: Math.round(estimated_density),
            result: recalculatedYield
        }
    }
    
    // Recalculate health index based on filtered detections
    const healthSteps = metrics.calculation_steps?.health
    let recalculatedHealthIndex = metrics.health_index
    let recalculatedHealthSteps = healthSteps
    
    if (healthSteps && filteredDetections.length > 0) {
        const avg_confidence = filteredDetections.reduce((sum, det) => sum + det.score, 0) / filteredDetections.length
        const texture_score = 0.95
        recalculatedHealthIndex = (avg_confidence * 0.6 + texture_score * 0.4) * 100
        
        recalculatedHealthSteps = {
            ...healthSteps,
            avg_confidence: Math.round(avg_confidence * 100, 1),
            result: recalculatedHealthIndex
        }
    }

    return (
        <div className="space-y-4">
            <MetricCard
                icon={Sprout}
                title="麦穗数量"
                value={filteredCount}
                unit="个"
                color="bg-wheat-500"
                calculationContent={
                    <>
                        <CalculationStep label="过滤后数量" value={filteredCount} unit="个" highlight delay={0} />
                        <CalculationStep label="原始检测数量" value={metrics.count} unit="个" delay={0.08} />
                        <CalculationStep label="检测灵敏度" value={(100 - confidenceThreshold * 100).toFixed(0)} unit="%" delay={0.16} />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.24 }}
                            className="text-xs text-slate-500 text-center pt-2"
                        >
                            YOLO11x 目标检测
                        </motion.div>
                    </>
                }
            />
            <MetricCard
                icon={BarChart3}
                title="预估产量"
                value={recalculatedYield.toFixed(1)}
                unit="kg/亩"
                color="bg-emerald-500"
                calculationContent={
                    recalculatedYieldSteps ? (
                        <>
                            <CalculationStep label="检测麦穗数" value={recalculatedYieldSteps.count} unit="个" highlight delay={0} />
                            <CalculationStep label="照片面积" value={recalculatedYieldSteps.photo_area} unit="m²" delay={0.08} />
                            <CalculationStep label="面积换算系数" value={recalculatedYieldSteps.area_scale} unit="×" delay={0.16} />
                            <CalculationStep label="估计亩穗数" value={recalculatedYieldSteps.estimated_density?.toLocaleString()} unit="穗" delay={0.24} />
                            <CalculationStep label="单穗粒重" value={recalculatedYieldSteps.avg_grain_weight} unit="g" delay={0.32} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="border-t border-slate-700 pt-3 mt-3"
                            >
                                <CalculationStep label="预估产量" value={recalculatedYieldSteps.result.toFixed(1)} unit="kg/亩" highlight delay={0.6} />
                            </motion.div>
                        </>
                    ) : null
                }
            />
            <MetricCard
                icon={Activity}
                title="健康指数"
                value={recalculatedHealthIndex.toFixed(1)}
                unit="%"
                color="bg-blue-500"
                calculationContent={
                    recalculatedHealthSteps ? (
                        <>
                            <CalculationStep label="平均置信度" value={recalculatedHealthSteps.avg_confidence} unit="%" highlight delay={0} />
                            <CalculationStep label="纹理均匀度" value={recalculatedHealthSteps.texture_score} unit="%" delay={0.1} />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.25 }}
                                className="text-xs text-slate-500 text-center py-1"
                            >
                                置信度×0.6 + 纹理×0.4
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="border-t border-slate-700 pt-2"
                            >
                                <CalculationStep label="健康指数" value={recalculatedHealthSteps.result.toFixed(1)} unit="%" highlight delay={0.5} />
                            </motion.div>
                        </>
                    ) : null
                }
            />
        </div>
    )
}

