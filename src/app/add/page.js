'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Camera, Loader2, CheckCircle, X, Globe, Type } from 'lucide-react';
import Link from 'next/link';
import Tesseract from 'tesseract.js';

export default function AddBhajan() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [formData, setFormData] = useState({
    title: '',
    title_guj: '',
    catId: 'user-added',
    lyrics: '',
    isAudio: false,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    if (!selectedImage) return;

    setOcrLoading(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(
        selectedImage,
        ocrLanguage === 'guj' ? 'guj' : 'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      setFormData(prev => ({
        ...prev,
        lyrics: prev.lyrics + (prev.lyrics ? '\n\n' : '') + result.data.text
      }));

      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to extract text from image. Please try again.');
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/bhajans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to add bhajan');
      }
    } catch (error) {
      console.error('Error adding bhajan:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="fixed w-full z-50 glass">
        <div className="container-custom h-16 flex items-center">
          <Link 
            href="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
        </div>
      </nav>

      <main className="pt-24 pb-16 container-custom max-w-3xl">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Contribute</h1>
            <p className="text-slate-500">Share spiritual wisdom with the community</p>
          </div>

          {/* OCR Section */}
          <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Camera size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Scan Lyrics</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOcrLanguage('eng')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    ocrLanguage === 'eng'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setOcrLanguage('guj')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all font-gujarati ${
                    ocrLanguage === 'guj'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  ગુજરાતી
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />

              {!selectedImage ? (
                <label
                  htmlFor="image-upload"
                  className="block border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 transition-all bg-white"
                >
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-medium text-slate-900">Click to upload photo</p>
                  <p className="text-sm text-slate-400 mt-1">Supports JPG, PNG</p>
                </label>
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                  <img src={selectedImage} alt="Selected" className="w-full h-64 object-contain opacity-90" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {selectedImage && (
                <button
                  type="button"
                  onClick={handleOCR}
                  disabled={ocrLoading}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {ocrLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing... {ocrProgress}%
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Extract Text
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Type size={16} /> Title (English)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jamo Thal Jivan"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 focus:bg-white"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2 font-gujarati">
                  <Globe size={16} /> Title (Gujarati)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. જમો થાળ જીવન"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 focus:bg-white font-gujarati"
                  value={formData.title_guj}
                  onChange={(e) => setFormData({ ...formData, title_guj: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lyrics Content
              </label>
              <textarea
                required
                rows={12}
                placeholder="Enter lyrics here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-slate-50 focus:bg-white font-serif resize-none leading-relaxed"
                value={formData.lyrics}
                onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold text-lg hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Publishing...
                </>
              ) : (
                <>
                  <Save size={24} />
                  Publish Bhajan
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
