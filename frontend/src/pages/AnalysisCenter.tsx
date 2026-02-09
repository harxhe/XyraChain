import { useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { ethers } from 'ethers';
import XyraChainArtifact from '../contracts/XyraChain.json';

const BACKEND_URL = 'http://localhost:5000';
const CONTRACT_ADDRESS = "0x8E1Fd433627b4b4AC1c8731CE0a4837419DE44Ab"; // XDC Apothem Testnet
const APOTHEM_CHAIN_ID = 51;
const APOTHEM_CHAIN_ID_HEX = '0x33';

const getImageData = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg'));
        };
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

export default function AnalysisCenter() {
    const { account, isConnected } = useWallet();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'complete'>('idle');
    const [result, setResult] = useState<{ diagnosis: string; confidence: number; heatmap: string } | null>(null);
    const [isMinting, setIsMinting] = useState(false);
    const [mintingResult, setMintingResult] = useState<{ txHash: string; cid: string } | null>(null);

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
                setStatus('idle');
                setResult(null);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload a valid image file (PNG, JPG, etc.)');
        }
    };

    const startAnalysis = async () => {
        if (!file) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('xray', file);

        try {
            setStatus('processing');
            const response = await axios.post(`${BACKEND_URL}/api/analysis/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.status === 'success') {
                setStatus('complete');

                let heatmapUrl = response.data.heatmap;
                if (!heatmapUrl.startsWith('http')) {
                    const filename = heatmapUrl.split(/[\\/]/).pop();
                    heatmapUrl = `${BACKEND_URL}/uploads/${filename}`;
                }

                setResult({
                    diagnosis: response.data.diagnosis,
                    confidence: (response.data.confidence * 100).toFixed(2) as unknown as number, // Keeps as number/string compatible
                    heatmap: heatmapUrl
                });
            } else {
                alert('Analysis failed: ' + response.data.message);
                setStatus('idle');
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to analysis server.');
            setStatus('idle');
        }
    };

    const downloadReport = async () => {
        if (!result) return;

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(79, 70, 229); // Indigo 600
            doc.text("XyraChain Medical AI Report", 20, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
            doc.text(`Patient ID (Wallet): ${account || 'Anonymous'}`, 20, 35);
            doc.text(`Analysis ID: ${Date.now()}`, 20, 40);

            // Line
            doc.setLineWidth(0.5);
            doc.setDrawColor(200);
            doc.line(20, 45, 190, 45);

            // Section: Input Data
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Input Data", 20, 55);
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`File Name: ${file?.name}`, 20, 62);
            const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) : "0";
            doc.text(`Size: ${fileSize} MB`, 20, 67);

            // Images
            try {
                // Original (Preview is base64)
                if (preview) {
                    doc.setTextColor(0);
                    doc.text("Original X-Ray Scan:", 20, 80);
                    doc.addImage(preview, 'JPEG', 20, 85, 80, 100);
                }

                // Heatmap (Need to fetch and convert)
                if (result.heatmap) {
                    const heatmapData = await getImageData(result.heatmap);
                    doc.text("AI Attention Heatmap (Grad-CAM):", 110, 80);
                    doc.addImage(heatmapData, 'JPEG', 110, 85, 80, 100);
                }
            } catch (err) {
                console.error("Error loading images for PDF", err);
                doc.text("(Images could not be loaded into PDF due to browser security restrictions)", 20, 85);
            }

            // Results
            const yStart = 200;
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text("Analysis Results", 20, yStart);

            doc.setFontSize(12);
            doc.setTextColor(50);

            const pneumoniaProb = result.diagnosis === 'PNEUMONIA'
                ? result.confidence
                : (100 - (result.confidence as any)).toFixed(2);

            doc.text(`Model Assessment: ${result.diagnosis}`, 20, yStart + 10);
            doc.text(`Pneumonia Probability: ${pneumoniaProb}%`, 20, yStart + 18);
            doc.text(`Model Architecture: CheXNet-v2 (CNN)`, 20, yStart + 26);
            doc.text(`Training Dataset: Kermany Chest X-Ray Data`, 20, yStart + 34);

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Disclaimer: This report is generated by an AI model and should not replace professional medical advice.", 20, 280);
            doc.text("XyraChain Decentralized Health Network © 2024", 20, 285);

            doc.save(`XyraChain_Report_${Date.now()}.pdf`);
        } catch (e) {
            console.error(e);
            alert("Failed to generate PDF");
        }
    };

    const consultDoctor = () => {
        alert("Redirecting to Telemedicine Partner...\n(Feature coming soon!)");
    };

    const mintResults = async () => {
        if (!result || !isConnected) {
            alert('Please process an image and connect your wallet first.');
            return;
        }

        setIsMinting(true);
        try {
            // 0. Ensure Correct Network
            // We use window.ethereum directly to avoid "network changed" errors on the existing provider
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);

            if (chainId !== APOTHEM_CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: APOTHEM_CHAIN_ID_HEX }],
                    });
                    // Wait for switch to propagate
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902 || switchError.code === -32603) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [{
                                    chainId: APOTHEM_CHAIN_ID_HEX,
                                    chainName: 'XDC Apothem Testnet',
                                    nativeCurrency: {
                                        name: 'XDC',
                                        symbol: 'XDC',
                                        decimals: 18
                                    },
                                    rpcUrls: ['https://rpc.apothem.network'],
                                    blockExplorerUrls: ['https://apothem.xdcscan.io']
                                }],
                            });
                        } catch (addError) {
                            console.error("Failed to add network:", addError);
                            alert("Please manually add XDC Apothem Testnet (RPC: https://rpc.apothem.network)");
                            setIsMinting(false);
                            return;
                        }
                    } else {
                        alert("Please switch your wallet to XDC Apothem Testnet (Chain ID 51) and try again.");
                        setIsMinting(false);
                        return;
                    }
                }
            }

            // Re-initialize provider to ensure it's on the correct network without error
            const freshProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await freshProvider.getSigner();

            // 1. Generate Report and Pin to IPFS
            const reportData = {
                analysisResult: result,
                chatLogs: [],
                userAddress: account
            };

            const response = await axios.post(`${BACKEND_URL}/api/analysis/generate-report`, reportData);
            let cid = "";

            if (response.data.status === 'success') {
                cid = response.data.cid;
                console.log('Report pinned to IPFS:', cid);
            } else {
                throw new Error(response.data.message);
            }

            // 2. Mint to Blockchain
            try {
                const contract = new ethers.Contract(CONTRACT_ADDRESS, XyraChainArtifact.abi, signer);

                // Ensure confidence is an integer 0-100
                const confidenceInt = Math.floor(result.confidence as any);

                const tx = await contract.addReport(
                    cid,
                    result.diagnosis,
                    confidenceInt
                );

                console.log("Transaction sent:", tx.hash);

                await tx.wait();
                setMintingResult({ txHash: tx.hash, cid: cid });
                // alert(`Minted Successfully!\n\nTx Hash: ${tx.hash}\nIPFS CID: ${cid}\n\nView on Explorer: https://explorer.apothem.network/tx/${tx.hash}`);

            } catch (chainError: any) {
                console.error("Blockchain Error:", chainError);
                alert(`IPFS Upload Success, but Blockchain Minting Failed:\n${chainError.reason || chainError.message || chainError}`);
            }

        } catch (error: any) {
            console.error(error);
            alert('Failed to mint results: ' + (error.reason || error.message));
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="text-stone-500 antialiased min-h-screen flex flex-col selection:bg-emerald-200 selection:text-emerald-900 bg-[#FDFBF7] dark:bg-[#030303] dark:text-stone-400 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow pt-32 pb-20 px-6 relative overflow-hidden">

                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-medium text-stone-800 dark:text-white tracking-tight mb-4 transition-colors">
                        Analysis Center
                    </h1>
                    <p className="text-stone-500 dark:text-stone-400 transition-colors">
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
                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                                    : file
                                        ? 'border-stone-200 bg-white shadow-sm dark:bg-[#0a0a0a] dark:border-white/10'
                                        : 'border-stone-200 hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-white/10 dark:hover:border-emerald-500/30 dark:hover:bg-emerald-500/5'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {!file && (
                                    <input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                        onChange={handleChange}
                                        accept="image/*"
                                        disabled={status === 'processing' || status === 'uploading'}
                                    />
                                )}

                                <div className="p-12 text-center relative z-10 transition-all">
                                    {file ? (
                                        <div className="relative">
                                            {/* Preview */}
                                            <div className="w-full h-64 mx-auto rounded-lg overflow-hidden relative mb-6 bg-black/50">
                                                <img src={preview!} alt="Preview" className="h-full w-full object-contain opacity-80" />

                                                {/* Clear Button */}
                                                {status === 'idle' && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                                                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors z-30"
                                                        title="Remove Image"
                                                    >
                                                        <iconify-icon icon="solar:close-circle-bold" width="24"></iconify-icon>
                                                    </button>
                                                )}

                                                {/* Scanning Animation Overlay */}
                                                {(status === 'processing' || status === 'uploading') && (
                                                    <div className="absolute inset-0 z-20 overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.8)] animate-[scan_2s_linear_infinite]"></div>
                                                    </div>
                                                )}
                                            </div>

                                            {(status === 'processing' || status === 'uploading') ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-full max-w-xs bg-stone-200 rounded-full h-1.5 overflow-hidden">
                                                        <div className="h-full bg-emerald-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
                                                    </div>
                                                    <span className="text-sm font-medium text-emerald-600 animate-pulse">Running Neural Analysis...</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <p className="text-stone-800 dark:text-white font-medium mb-1 transition-colors">{file.name}</p>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 transition-colors">{(file.size / 1024 / 1024).toFixed(2)} MB</p>                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); startAnalysis(); }}
                                                        className="relative z-30 px-8 py-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/10"
                                                    >
                                                        <iconify-icon icon="solar:scanner-bold" width="18"></iconify-icon>
                                                        Run Analysis
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mx-auto mb-6 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300 dark:bg-white/5 dark:border-white/10 dark:text-stone-500 dark:group-hover:bg-emerald-500/10 dark:group-hover:text-emerald-400">
                                                <iconify-icon icon="solar:upload-minimalistic-linear" width="32"></iconify-icon>
                                            </div>
                                            <h3 className="text-xl font-medium text-stone-800 dark:text-white mb-2 transition-colors">Upload X-Ray Scans</h3>
                                            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto transition-colors">
                                                Drag and drop your chest X-ray images here, or click to browse files.
                                            </p>
                                            <div className="mt-6 flex items-center justify-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                                                <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200 dark:bg-white/5 dark:border-white/10">PNG</span>
                                                <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200">JPG</span>
                                                <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200">DICOM</span>
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
                                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white transition-colors"
                                >
                                    <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
                                    New Analysis
                                </button>

                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full border border-stone-200 dark:bg-white/5 dark:border-white/10 dark:text-stone-400">
                                        Model: CheXNet-v2
                                    </span>
                                    <button
                                        onClick={mintResults}
                                        disabled={isMinting || !isConnected}
                                        className={`flex items-center gap-2 text-xs font-medium text-white px-4 py-1.5 rounded-full transition-colors shadow-lg ${isMinting || !isConnected ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
                                    >
                                        <iconify-icon icon="solar:file-download-linear" width="14"></iconify-icon>
                                        {isMinting ? 'Securing...' : 'Mint Results'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Left: Original Image */}
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-sm dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                                        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
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
                                    <div className="p-4 rounded-2xl border border-stone-200 bg-white shadow-sm dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                                        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
                                            <iconify-icon icon="solar:layers-linear" width="16"></iconify-icon>
                                            Grad-CAM Attention
                                        </h3>
                                        <div className="rounded-xl overflow-hidden bg-black aspect-[4/5] relative">
                                            {/* Actual Heatmap from Backend */}
                                            <img src={result?.heatmap} alt="Heatmap" className="w-full h-full object-contain" />

                                            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
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
                                    <div className={`p-6 rounded-2xl border ${result?.diagnosis === 'NORMAL' ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/20'} transition-colors`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${result?.diagnosis === 'NORMAL' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    Model Assessment
                                                </p>
                                                <h2 className="text-3xl font-semibold text-stone-800 dark:text-white transition-colors">
                                                    {result?.diagnosis}
                                                </h2>
                                            </div>
                                            <div className={`p-3 rounded-xl ${result?.diagnosis === 'NORMAL' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                                                <iconify-icon icon={result?.diagnosis === 'NORMAL' ? "solar:shield-check-bold" : "solar:danger-triangle-bold"} width="24"></iconify-icon>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-stone-500 dark:text-stone-400">Pneumonia Probability</span>
                                                    <span className="text-stone-800 dark:text-white font-medium">
                                                        {result?.diagnosis === 'PNEUMONIA'
                                                            ? result?.confidence
                                                            : (100 - (result?.confidence || 0)).toFixed(2)}%
                                                    </span>
                                                </div>
                                                <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${result?.diagnosis === 'NORMAL' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                        style={{ width: `${result?.diagnosis === 'PNEUMONIA' ? result?.confidence : (100 - (result?.confidence || 0)).toFixed(2)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats / Details */}
                                    <div className="p-6 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4 dark:bg-[#0a0a0a] dark:border-white/10 transition-colors">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
                                                    <iconify-icon icon="solar:clock-circle-linear" width="16"></iconify-icon>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400">Inference Time</p>
                                                    <p className="text-sm font-medium text-stone-800 dark:text-white">~1.2s</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                    <iconify-icon icon="solar:database-linear" width="16"></iconify-icon>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-stone-500 dark:text-stone-400">Scan Resolution</p>
                                                    <p className="text-sm font-medium text-stone-800 dark:text-white">Original</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={downloadReport}
                                            className="flex-1 py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-sm font-medium transition-colors"
                                        >
                                            Download Report
                                        </button>
                                        <button
                                            onClick={consultDoctor}
                                            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 text-white text-sm font-medium hover:bg-stone-900 transition-colors shadow-lg shadow-stone-200"
                                        >
                                            Consult Doctor
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {mintingResult && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm dark:bg-black/80" onClick={() => setMintingResult(null)}></div>
                        <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-md p-8 relative z-10 animate-fade-in-up text-center shadow-2xl shadow-emerald-900/10 dark:bg-[#0f0f0f] dark:border-white/10 dark:shadow-none transition-colors">

                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 dark:bg-emerald-500/10 dark:text-emerald-400">
                                <iconify-icon icon="solar:verified-check-bold" width="32"></iconify-icon>
                            </div>

                            <h3 className="text-2xl font-semibold text-stone-800 mb-2 dark:text-white">Minting Successful!</h3>
                            <p className="text-stone-500 text-sm mb-8 dark:text-stone-400">
                                Your medical report has been permanently secured on the XDC Blockchain.
                            </p>

                            <div className="space-y-4 mb-8 text-left">
                                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 dark:bg-white/5 dark:border-white/5">
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Transaction Hash</p>
                                    <a
                                        href={`https://apothem.xdcscan.io/tx/${mintingResult.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2 hover:underline truncate"
                                    >
                                        <span className="truncate">{mintingResult.txHash}</span>
                                        <iconify-icon icon="solar:arrow-right-up-linear" width="12" className="flex-shrink-0"></iconify-icon>
                                    </a>
                                </div>

                                <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 dark:bg-white/5 dark:border-white/5">
                                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">IPFS CID</p>
                                    <div className="text-stone-800 text-sm font-mono truncate select-all dark:text-stone-200">
                                        {mintingResult.cid}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setMintingResult(null)}
                                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
