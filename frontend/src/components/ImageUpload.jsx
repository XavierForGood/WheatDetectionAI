import { useCallback } from 'react'
import { Upload, Image as ImageIcon } from 'lucide-react'
import { cn } from '../lib/utils'

export default function ImageUpload({ onImageSelect }) {
    const handleDrop = useCallback((e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file)
        }
    }, [onImageSelect])

    const handleChange = useCallback((e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file)
        }
    }, [onImageSelect])

    return (
        <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="group relative flex h-full w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 transition-all hover:border-wheat-500/50 hover:bg-slate-800/50"
        >
            <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="absolute inset-0 cursor-pointer opacity-0"
            />

            <div className="flex flex-col items-center gap-4 p-8 text-center transition-transform group-hover:scale-105">
                <div className="rounded-full bg-slate-800 p-4 text-wheat-500 group-hover:bg-wheat-500/10">
                    <Upload className="h-8 w-8" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-slate-200">
                        点击或拖拽上传图片
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        支持 JPG, PNG 格式
                    </p>
                </div>
            </div>
        </div>
    )
}
