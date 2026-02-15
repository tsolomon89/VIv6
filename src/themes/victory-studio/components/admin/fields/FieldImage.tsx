import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { FieldStruct } from '../../../../../core/types';

interface FieldImageProps {
  field: FieldStruct;
  value: string | null;
  onChange: (value: string | null) => void;
  onUpload?: (file: File) => Promise<string>;
  error?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function FieldImage({
  field,
  value,
  onChange,
  onUpload,
  error,
  accept = 'image/*',
  maxSizeMB = 5
}: FieldImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploadError(null);

    if (onUpload) {
      // Use custom upload handler
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (err) {
        setUploadError('Upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Create local preview URL (for demo/dev purposes)
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(null);
    setUploadError(null);
  };

  const displayError = error || uploadError;

  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
        <ImageIcon className="w-3 h-3" />
        {field.nameField}
      </label>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={field.nameField}
            className="w-full h-48 object-cover rounded border border-neutral-700"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition"
            >
              <Upload className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-900 rounded-lg hover:bg-red-800 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition
            ${isUploading
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
            }
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-400">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-neutral-500" />
              <span className="text-sm text-neutral-400">
                Click to upload image
              </span>
              <span className="text-xs text-neutral-500">
                Max size: {maxSizeMB}MB
              </span>
            </>
          )}
        </button>
      )}

      {displayError && (
        <span className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {displayError}
        </span>
      )}
    </div>
  );
}
