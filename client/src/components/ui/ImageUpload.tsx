'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
    onUpload: (file: File, previewUrl: string) => void;
    onRemove?: () => void;
    currentImage?: string;
    label?: string;
    maxSizeMB?: number;
    acceptedTypes?: string[];
}

export function ImageUpload({
    onUpload,
    onRemove,
    currentImage,
    label = 'Upload Image',
    maxSizeMB = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        if (!acceptedTypes.includes(file.type)) {
            setError('Please upload a JPG, PNG, or WebP image');
            return false;
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            setError(`Image must be less than ${maxSizeMB}MB`);
            return false;
        }

        return true;
    };

    const handleFile = useCallback(async (file: File) => {
        if (!validateFile(file)) return;

        setUploading(true);

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
            const previewUrl = reader.result as string;
            setPreview(previewUrl);
            onUpload(file, previewUrl);
            setUploading(false);
        };
        reader.onerror = () => {
            setError('Failed to read image');
            setUploading(false);
        };
        reader.readAsDataURL(file);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (inputRef.current) inputRef.current.value = '';
        onRemove?.();
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-brown">{label}</label>
            )}

            {preview ? (
                <div className="relative rounded-xl overflow-hidden">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleClick}
                            className="px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100"
                        >
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={handleClick}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragging ? 'border-terracotta bg-orange-50' : 'border-gray-300 hover:border-terracotta'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-3 border-terracotta border-t-transparent rounded-full animate-spin mb-3" />
                            <p className="text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-4xl mb-3">📸</div>
                            <p className="text-gray-600 font-medium">Drag & drop an image</p>
                            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
                            <p className="text-gray-400 text-xs mt-2">
                                JPG, PNG, WebP • Max {maxSizeMB}MB
                            </p>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-red-500 text-sm">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}

// Multiple image upload component
interface MultiImageUploadProps {
    onUpload: (files: Array<{ file: File; previewUrl: string }>) => void;
    currentImages?: string[];
    maxImages?: number;
    label?: string;
}

export function MultiImageUpload({
    onUpload,
    currentImages = [],
    maxImages = 5,
    label = 'Upload Images',
}: MultiImageUploadProps) {
    const [images, setImages] = useState<Array<{ file?: File; previewUrl: string }>>(
        currentImages.map(url => ({ previewUrl: url }))
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList) => {
        const newImages: Array<{ file: File; previewUrl: string }> = [];

        for (let i = 0; i < files.length && images.length + newImages.length < maxImages; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;

            const previewUrl = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });

            newImages.push({ file, previewUrl });
        }

        const updated = [...images, ...newImages];
        setImages(updated);
        onUpload(newImages);
    };

    const handleRemove = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        setImages(updated);
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-brown">{label}</label>
            )}

            <div className="grid grid-cols-3 gap-3">
                {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <img
                            src={img.previewUrl}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {images.length < maxImages && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-terracotta transition-colors"
                    >
                        <span className="text-2xl">+</span>
                        <span className="text-xs text-gray-500 mt-1">Add</span>
                    </button>
                )}
            </div>

            <p className="text-xs text-gray-400">
                {images.length}/{maxImages} images uploaded
            </p>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
            />
        </div>
    );
}
