/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Trash2, 
  Check, 
  AlertCircle,
  Shirt,
  Star,
  Zap,
  Briefcase,
  Camera,
  UserCircle
} from "lucide-react";
import { generateTryOn } from "./services/gemini.ts";

const OUTFIT_OPTIONS = [
  { id: 'office', label: 'Công sở', description: 'Bộ công sở thanh lịch, áo sơ mi trắng, chân váy đen', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'id-photo', label: 'Ảnh thẻ', description: 'Trang phục ảnh thẻ chuyên nghiệp, áo sơ mi trắng có cổ, lịch sự', icon: <UserCircle className="w-4 h-4" /> },
  { id: 'party', label: 'Dự tiệc', description: 'Đầm dự tiệc sang trọng màu đỏ quyến rũ', icon: <Star className="w-4 h-4" /> },
  { id: 'modern', label: 'Hiện đại', description: 'Áo blazer đen hiện đại, quần âu cao cấp', icon: <Shirt className="w-4 h-4" /> },
  { id: 'active', label: 'Năng động', description: 'Trang phục năng động, áo thun trắng và quần jeans', icon: <Zap className="w-4 h-4" /> },
  { id: 'livestream', label: 'Bán hàng', description: 'Váy livestream bán hàng màu pastel, trẻ trung', icon: <Camera className="w-4 h-4" /> },
];

export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [outfitDescription, setOutfitDescription] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Vui lòng tải lên một tệp hình ảnh.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
    setError("");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = () => {
    setImage(null);
    setPreview("");
    setResult("");
    setOutfitDescription("");
    setError("");
  };

  const handleGenerate = async () => {
    if (!image || !outfitDescription) {
      setError("Vui lòng tải ảnh và mô tả trang phục trước khi tạo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const buffer = await image.arrayBuffer();
      const output = await generateTryOn(buffer, image.type, outfitDescription);
      
      if (output) {
        setResult(output);
      } else {
        throw new Error("Không nhận được kết quả từ AI.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Có lỗi xảy ra trong quá trình tạo ảnh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result;
    link.download = `app-thu-do-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-zinc-950 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 group cursor-default">
              <Sparkles className="w-4 h-4 text-teal-400 group-hover:animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Powered by Gemini AI</span>
            </div>
            <h1 className="text-6xl font-serif mb-6 tracking-tight">
              APP <span className="italic text-teal-400">Thử Đồ</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Trải nghiệm thử đồ ảo cao cấp ngay tại nhà. Tải ảnh của bạn, mô tả phong cách mong muốn và để trí tuệ nhân tạo hoàn thiện vẻ ngoài của bạn.
            </p>
          </motion.div>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Image Area */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-sm font-serif italic text-teal-400">1</span>
                Tải ảnh của bạn
              </h2>
              {image && (
                <button 
                  onClick={clearSelection}
                  className="text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa ảnh
                </button>
              )}
            </div>

            <motion.div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative glass-panel group ${dragActive ? 'border-teal-500/50 bg-teal-500/5' : ''}`}
            >
              {!preview ? (
                <div 
                  className="aspect-[3/4] flex flex-col items-center justify-center p-12 text-center cursor-pointer"
                  onClick={triggerUpload}
                >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-teal-400" />
                  </div>
                  <p className="text-zinc-100 font-medium mb-2">Kéo thả ảnh vào đây</p>
                  <p className="text-zinc-500 text-sm">Hoặc nhấn để chọn tệp (JPG, PNG, WEBP)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={onFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <img 
                    src={preview} 
                    alt="Current selection" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={triggerUpload}
                      className="bg-white text-black px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-zinc-200"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Thay đổi ảnh
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={onFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </motion.div>
            
            <div className="flex items-start gap-3 p-4 bg-zinc-900/50 border border-white/5 rounded-xl text-xs text-zinc-500 italic">
              <AlertCircle className="w-4 h-4 text-zinc-600 shrink-0" />
              <p>Lưu ý: Chỉ sử dụng ảnh của chính bạn hoặc ảnh có quyền sử dụng. Dữ liệu của bạn được xử lý bảo mật.</p>
            </div>
          </section>

          {/* Right Column: Customization */}
          <section className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-medium tracking-tight flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-sm font-serif italic text-teal-400">2</span>
                Lựa chọn trang phục
              </h2>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-zinc-500 uppercase tracking-widest block">Chọn nhanh phong cách</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {OUTFIT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setOutfitDescription(opt.description)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        outfitDescription === opt.description 
                        ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)]' 
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-zinc-500 uppercase tracking-widest block">Mô tả chi tiết (Tùy chỉnh)</label>
                <textarea
                  value={outfitDescription}
                  onChange={(e) => setOutfitDescription(e.target.value)}
                  placeholder="Ví dụ: Đầm lụa màu kem, cổ chữ V, phong cách nhẹ nhàng cho buổi tối..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                onClick={handleGenerate}
                disabled={loading || !image || !outfitDescription}
                className="w-full h-14 luxury-button bg-teal-500 hover:bg-teal-400 text-black font-bold text-lg rounded-full flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI đang thiết kế...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Tạo ảnh thử đồ AI</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-24 text-center space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <Check className="w-3 h-3" />
                Hoàn tất
              </div>
              <h2 className="text-4xl font-serif tracking-tight">Kết Quả Tuyệt Vời Của Bạn</h2>
              
              <div className="relative max-w-xl mx-auto glass-panel p-2 shadow-2xl">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900">
                  <img 
                    src={result} 
                    alt="AI Transformation Result" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={downloadResult}
                  className="px-8 h-14 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Tải ảnh xuống
                </button>
                <button
                  onClick={handleGenerate}
                  className="px-8 h-14 glass-panel font-bold rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Thử lại
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/5 py-12 text-center text-zinc-600 text-sm">
        <p>© 2026 APP thử đồ. Công nghệ Trí tuệ nhân tạo cho thời trang Việt.</p>
      </footer>
    </div>
  );
}
