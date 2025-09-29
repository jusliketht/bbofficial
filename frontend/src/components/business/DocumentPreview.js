import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Download,
  Eye,
  X,
  Maximize,
  Minimize,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const DocumentPreview = ({
  document,
  onClose,
  onDownload,
  onRotate,
  onZoom,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Supported file types
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const pdfTypes = ['application/pdf'];
  // const supportedTypes = [...imageTypes, ...pdfTypes]; // Removed unused variable

  const loadPreview = useCallback(async () => {
    if (!document || !document.file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create object URL for preview
      const url = URL.createObjectURL(document.file);
      setPreviewUrl(url);
    } catch (err) {
      setError('Failed to load document preview');
      console.error('Preview load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [document]);

  useEffect(() => {
    if (document && document.file) {
      loadPreview();
    }
  }, [document, loadPreview]);

  const handleZoom = (direction) => {
    const newZoom = direction === 'in'
      ? Math.min(zoom + 0.25, 3)
      : Math.max(zoom - 0.25, 0.25);

    setZoom(newZoom);
    onZoom && onZoom(newZoom);
  };

  const handleRotate = (direction) => {
    const newRotation = direction === 'cw'
      ? (rotation + 90) % 360
      : (rotation - 90 + 360) % 360;

    setRotation(newRotation);
    onRotate && onRotate(newRotation);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-red-600 mb-2">{error}</p>
            <button
              onClick={loadPreview}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    if (!previewUrl) return null;

    const isImage = imageTypes.includes(document.type);
    const isPDF = pdfTypes.includes(document.type);

    if (isImage) {
      return (
        <div className="relative overflow-hidden bg-gray-100 rounded-lg">
          <img
            ref={imageRef}
            src={previewUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={previewUrl}
            className="w-full h-96 border-0"
            title={document.name}
            onLoad={() => setIsLoading(false)}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      );
    }

    // Fallback for unsupported types
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Preview not available</p>
          <p className="text-sm text-gray-500">{document.type}</p>
        </div>
      </div>
    );
  };

  if (!document) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4 ${className}`}>
      <div
        ref={containerRef}
        className={`bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-hidden ${
          isFullscreen ? 'rounded-none' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {imageTypes.includes(document.type) ? (
              <ImageIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <FileText className="w-5 h-5 text-red-600" />
            )}
            <div>
              <h3 className="font-medium text-gray-900 truncate max-w-xs">
                {document.name}
              </h3>
              <p className="text-sm text-gray-500">
                {(document.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-1 bg-white rounded border">
              <button
                onClick={() => handleZoom('out')}
                disabled={zoom <= 0.25}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 py-1 text-sm font-medium min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                disabled={zoom >= 3}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Rotation Controls */}
            <button
              onClick={() => handleRotate('ccw')}
              className="p-2 hover:bg-gray-100 rounded border bg-white"
              title="Rotate Left"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleRotate('cw')}
              className="p-2 hover:bg-gray-100 rounded border bg-white"
              title="Rotate Right"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-100 rounded border bg-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Download */}
            {onDownload && (
              <button
                onClick={() => onDownload(document)}
                className="p-2 hover:bg-gray-100 rounded border bg-white"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded border bg-white text-gray-600 hover:text-gray-900"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="relative">
          {renderPreview()}
        </div>

        {/* Footer with Document Info */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>Type: {document.type}</span>
              <span>Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              {document.status === 'processed' ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Processed
                </div>
              ) : (
                <div className="flex items-center text-yellow-600">
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Processing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Thumbnail Component
export const DocumentThumbnail = ({
  document,
  onClick,
  onRemove,
  className = '',
  showPreview = true
}) => {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateThumbnail = useCallback(async () => {
    if (!document.file) return;

    setIsLoading(true);
    try {
      // For images, create a small preview
      if (document.type.startsWith('image/')) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          // Create thumbnail (100x100)
          const maxSize = 100;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setThumbnailUrl(canvas.toDataURL());
          setIsLoading(false);
        };

        img.src = URL.createObjectURL(document.file);
      } else {
        // For non-images, show file icon
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      setIsLoading(false);
    }
  }, [document]);

  useEffect(() => {
    if (document && document.file && showPreview) {
      generateThumbnail();
    }
  }, [document, generateThumbnail, showPreview]);

  const getFileIcon = () => {
    if (document.type.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-blue-600" />;
    } else if (document.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-600" />;
    } else {
      return <FileText className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div
      className={`relative group cursor-pointer border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow ${className}`}
      onClick={() => onClick && onClick(document)}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
        {isLoading ? (
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          getFileIcon()
        )}
      </div>

      {/* File Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={document.name}>
          {document.name}
        </p>
        <p className="text-xs text-gray-500">
          {(document.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-2 right-2">
        {document.status === 'processed' ? (
          <CheckCircle className="w-5 h-5 text-green-600 bg-white rounded-full" />
        ) : document.status === 'processing' ? (
          <RefreshCw className="w-5 h-5 text-blue-600 bg-white rounded-full animate-spin" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-600 bg-white rounded-full" />
        )}
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(document.id);
          }}
          className="absolute top-2 left-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Preview Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
        <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default DocumentPreview;
