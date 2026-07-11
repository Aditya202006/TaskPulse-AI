import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, RefreshCw } from 'lucide-react';

export const UploadZone = ({ onUploadSuccess, isProcessing, progressStep }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndUpload = (file) => {
    setError(null);
    if (!file) return;

    // Check size limit: 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File is too large. Max file size is 5MB.');
      return;
    }

    // Check mime types
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      setError('Invalid file format. Please upload PDF, PNG, JPEG, or TXT.');
      return;
    }

    onUploadSuccess(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400'
        } ${isProcessing ? 'pointer-events-none bg-slate-50 border-slate-200' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleChange}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center py-6 space-y-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              {/* Spinning Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <RefreshCw className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800 animate-pulse">
                Extracting Deadlines
              </h3>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {progressStep || 'Initializing pipeline...'}
              </p>
            </div>
            <p className="max-w-xs text-xs text-slate-500">
              We are running OCR Space text extraction and prompting Gemini AI to structure your events. This usually takes 5-10 seconds.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm shadow-blue-50">
              <UploadCloud className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your file here, or{' '}
                <button
                  type="button"
                  onClick={onButtonClick}
                  className="font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-slate-500">
                Supports college circulars, screenshots, assignments, emails & letters
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-2xs font-semibold text-slate-600 uppercase tracking-wide">
                PDF
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-2xs font-semibold text-slate-600 uppercase tracking-wide">
                PNG
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-2xs font-semibold text-slate-600 uppercase tracking-wide">
                JPG
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-2xs font-semibold text-slate-600 uppercase tracking-wide">
                TXT
              </span>
              <span className="inline-flex items-center gap-1 text-2xs text-slate-400 italic">
                (Max 5MB)
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-rose-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="font-medium">{error}</div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
