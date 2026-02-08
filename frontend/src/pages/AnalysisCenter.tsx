import { useState, useCallback} from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AnalysisCenter() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
    const [result, setResult] = useState<{ diagnosis: string; confidence: number } | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target?.result as string);
                setFile(file);
                setStatus('idle'); // Reset status if a new file is uploaded
                setResult(null);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid image file (PNG, JPG, etc.)');
        }
    };

    const startAnalysis = () => {
        if (!file) return;
        setStatus('processing');

        // Simulate API processing
        setTimeout(() => {
            setStatus('complete');
            setResult({
                diagnosis: Math.random() > 0.3 ? 'Normal' : 'Pneumonia',
                confidence: 85 + Math.floor(Math.random() * 14) // 85-99%
            });
        }, 3000);
    };

    return (
        <div className="text-slate-400 antialiased min-h-screen flex flex-col selection:bg-sky-500/20 selection:text-sky-200">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6 relative overflow-hidden">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-4">
                        Analysis Center
                    </h1>
                    <p className="text-slate-400">
                        Upload a chest X-ray to detect potential anomalies using our decentralized AI network.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    {status !== 'complete' ? (
                        /* Upload & Processing View */
                        <div className="max-w-2xl mx-auto">
                            {/* Dropzone */}
                            <div
                                className={`relative group rounded-3xl border-2 border-dashed transition-all duration-300 ${isDragging
                                        ? 'border-sky-500 bg-sky-500/10'
                                        : file
                                            ? 'border-white/10 bg-white/5'
                                            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    onChange={handleChange}
                                    accept="image/*"
                                    disabled={status === 'processing'}
                                />

                                <div className="p-12 text-center relative z-10 transition-all">
                                    {file ? (
                                        <div className="relative">
                                            {/* Preview */}
                                            <div className="w-full h-64 mx-auto rounded-lg overflow-hidden relative mb-6 bg-black/50">
                                                <img src={preview!} alt="Preview" className="h-full w-full object-contain opacity-80" />

                                                {/* Scanning Animation Overlay */}
                                                {status === 'processing' && (
                                                    <div className="absolute inset-0 z-20 overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-[scan_2s_linear_infinite]"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {status === 'processing' ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                        <div className="h-full bg-sky-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-sky-400 animate-pulse">Running Neural Analysis...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <p className="text-white font-medium mb-1">{file.name}</p>
                                                    <p className="text-xs text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startAnalysis(); }}
                                                        className="relative z-30 px-8 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg shadow-white/5"
                                                    >
                                                        <iconify-icon icon="solar:scanner-bold" width="18"></iconify-icon>
                                                        Run Analysis
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto mb-6 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                                                <iconify-icon icon="solar:upload-minimalistic-linear" width="32"></iconify-icon>
                                            </div>
                                            <h3 className="text-xl font-medium text-white mb-2">Upload X-Ray Scans</h3>
                                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                                Drag and drop your chest X-ray images here, or click to browse files.
                                            </p>
                                            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-slate-600">
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/5">PNG</span>
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/5">JPG</span>
                                                <span className="px-2 py-1 rounded bg-white/5 border border-white/5">DICOM</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Results View */
                        <div className="animate-fade-in-up">
                            {/* Result Header */}
                            <div className="flex items-center justify-between mb-8">
                                <button
                                    onClick={() => { setStatus('idle'); setFile(null); setPreview(null); }}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
                                    New Analysis
                                </button>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                        Model: CheXNet-v2
                                    </span>
                                    <button className="flex items-center gap-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-full transition-colors shadow-lg shadow-indigo-500/20">
                                        <iconify-icon icon="solar:file-download-linear" width="14"></iconify-icon>
                                        Mint Results
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Left: Original Image */}
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                                        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                            <iconify-icon icon="solar:gallery-linear" width="16"></iconify-icon>
                                            Original Scan
                                        </h3>
                                        <div className="rounded-xl overflow-hidden bg-black aspect-[4/5] relative group">
                                            <img src={preview!} alt="Original" className="w-full h-full object-contain" />
                                        </div>
                                    </div>
                                </div>

                                {/* Center: Heatmap Visualization */}
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                                        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                            <iconify-icon icon="solar:layers-linear" width="16"></iconify-icon>
                                            Grad-CAM Attention
                                        </h3>
                                        <div className="rounded-xl overflow-hidden bg-black aspect-[4/5] relative">
                                            {/* Using CSS filters to simulate a heatmap overlay for now */}
                                            <img src={preview!} alt="Heatmap" className="w-full h-full object-contain opacity-50 absolute inset-0 mix-blend-luminosity" />
                                            <div className="absolute inset-0 mix-blend-overlay bg-gradient-to-tr from-blue-900/40 via-transparent to-red-900/40 pointer-events-none"></div>

                                            {/* Simulated Activation Map Overlay */}
                                            {result?.diagnosis === 'Pneumonia' && (
                                                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-red-500/40 blur-3xl rounded-full mix-blend-color-dodge"></div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="bg-black/60 backdrop-blur-sm text-xs text-white px-3 py-1 rounded-full border border-white/10">
                                                    AI Interest Region
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Diagnosis & Metadata */}
                                <div className="lg:col-span-1 space-y-6">

                                    {/* Diagnosis Card */}
                                    <div className={`p-6 rounded-2xl border ${result?.diagnosis === 'Normal' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${result?.diagnosis === 'Normal' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    Diagnosis
                                                </p>
                                                <h2 className="text-3xl font-semibold text-white">
                                                    {result?.diagnosis}
                                                </h2>
                                            </div>
                                            <div className={`p-3 rounded-xl ${result?.diagnosis === 'Normal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                <iconify-icon icon={result?.diagnosis === 'Normal' ? "solar:shield-check-bold" : "solar:danger-triangle-bold"} width="24"></iconify-icon>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-slate-400">Confidence Score</span>
                                                    <span className="text-white font-medium">{result?.confidence}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${result?.diagnosis === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${result?.confidence}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats / Details */}
                                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                                                    <iconify-icon icon="solar:clock-circle-linear" width="16"></iconify-icon>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Inference Time</p>
                                                    <p className="text-sm font-medium text-white">124 ms</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                                    <iconify-icon icon="solar:database-linear" width="16"></iconify-icon>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400">Scan Resolution</p>
                                                    <p className="text-sm font-medium text-white">1024x1024 px</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:bg-white/5 text-white text-sm font-medium transition-colors">
                                            Download Report
                                        </button>
                                        <button className="flex-1 py-3 px-4 rounded-xl bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors">
                                            Consult Doctor
                                        </button>
                                    </div>

                                </div>

                            </div>
                        </div>
                    )}
                </div>

            </main>

            <Footer />
        </div>
    );
}
