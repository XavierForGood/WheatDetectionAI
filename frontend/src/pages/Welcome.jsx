import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Wheat, Database, Cpu, ArrowRight } from 'lucide-react'
import { cn } from '../lib/utils'

const slides = [
    {
        id: 1,
        title: "智慧麦田 · 丰收之眼",
        subtitle: "Smart Wheat Detection System",
        description: "基于 YOLO11x 的高精度麦穗检测系统，助力精准农业，守护每一份丰收。",
        icon: Wheat,
        color: "text-wheat-400",
        bg: "from-wheat-900/20 to-slate-950"
    },
    {
        id: 2,
        title: "GWHD 2021 数据集",
        subtitle: "Global Wheat Head Detection",
        description: "采用全球最大的麦穗检测数据集 GWHD 2021 进行训练，涵盖多种光照、角度与生长阶段，确保模型泛化能力。",
        icon: Database,
        color: "text-blue-400",
        bg: "from-blue-900/20 to-slate-950"
    },
    {
        id: 3,
        title: "YOLO11x 强力引擎",
        subtitle: "State-of-the-art Performance",
        description: "搭载最新的 YOLO11x 模型，提供毫秒级实时检测与极高的 mAP 指标，精准捕捉每一个麦穗目标。",
        icon: Cpu,
        color: "text-emerald-400",
        bg: "from-emerald-900/20 to-slate-950"
    }
]

export default function Welcome({ onEnter }) {
    const [currentSlide, setCurrentSlide] = useState(0)

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1)
        }
    }

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1)
        }
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-950">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80" />
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-40 transition-colors duration-1000",
                        slides[currentSlide].bg
                    )}
                />
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -50, opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl"
                    >
                        <div className="mb-6 flex justify-center">
                            {(() => {
                                const Icon = slides[currentSlide].icon
                                return <Icon className={cn("h-24 w-24", slides[currentSlide].color)} />
                            })()}
                        </div>

                        <h1 className="mb-2 text-6xl font-bold tracking-tight text-white md:text-7xl">
                            {slides[currentSlide].title}
                        </h1>
                        <p className={cn("mb-8 text-2xl font-light tracking-wider", slides[currentSlide].color)}>
                            {slides[currentSlide].subtitle}
                        </p>
                        <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-400">
                            {slides[currentSlide].description}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="absolute bottom-12 flex w-full flex-col items-center gap-8">
                    <div className="flex gap-4">
                        {slides.map((_, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "h-2 w-16 rounded-full transition-all duration-300",
                                    index === currentSlide ? "bg-white" : "bg-white/20"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        {currentSlide > 0 && (
                            <button
                                onClick={prevSlide}
                                className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            >
                                上一步
                            </button>
                        )}

                        {currentSlide < slides.length - 1 ? (
                            <button
                                onClick={nextSlide}
                                className="group flex items-center gap-2 rounded-full bg-white/10 px-8 py-3 text-lg font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:px-10"
                            >
                                下一步
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        ) : (
                            <button
                                onClick={onEnter}
                                className="group flex items-center gap-2 rounded-full bg-wheat-500 px-8 py-3 text-lg font-medium text-white shadow-lg shadow-wheat-500/20 transition-all hover:bg-wheat-400 hover:px-10 hover:shadow-wheat-500/40"
                            >
                                进入系统
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
