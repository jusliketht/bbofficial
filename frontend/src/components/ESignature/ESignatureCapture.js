// =====================================================
// E-SIGNATURE CAPTURE COMPONENT
// Burnblack ITR Filing Platform - Module 7 Frontend
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../UI';

/**
 * ESignatureCapture Component
 * 
 * Provides digital signature capture functionality with:
 * - Canvas-based signature drawing
 * - Signature validation
 * - Base64 image generation
 * - Feature flag controlled activation
 */

const ESignatureCapture = ({ 
  onSignatureCaptured, 
  onError, 
  disabled = false,
  width = 400,
  height = 200,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureData, setSignatureData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e) => {
    if (disabled) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (disabled) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    
    // Check if signature has content
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some(pixel => pixel !== 0);
    
    if (hasContent) {
      setHasSignature(true);
      generateSignatureData();
    }
  };

  const generateSignatureData = () => {
    const canvas = canvasRef.current;
    const base64 = canvas.toDataURL('image/png');
    
    const signatureData = {
      signature: base64,
      type: 'draw',
      capturedAt: new Date().toISOString(),
      dimensions: {
        width: canvas.width,
        height: canvas.height
      }
    };
    
    setSignatureData(signatureData);
  };

  const clearSignature = () => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    setSignatureData(null);
  };

  const captureSignature = () => {
    if (!hasSignature || !signatureData) {
      onError?.('No signature to capture');
      return;
    }

    try {
      onSignatureCaptured?.(signatureData);
    } catch (error) {
      onError?.(error.message);
    }
  };

  return (
    <div className={`esignature-capture ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Digital Signature
        </h3>
        <p className="text-sm text-gray-600">
          Please sign in the box below using your mouse or touch device.
        </p>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            startDrawing(mouseEvent);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
              clientX: touch.clientX,
              clientY: touch.clientY
            });
            draw(mouseEvent);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopDrawing();
          }}
          style={{
            backgroundColor: '#ffffff',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'crosshair'
          }}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={disabled || !hasSignature}
          >
            Clear
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={captureSignature}
            disabled={disabled || !hasSignature}
          >
            Capture Signature
          </Button>
        </div>
      </div>

      {hasSignature && (
        <div className="mt-2 text-sm text-green-600">
          ✓ Signature captured successfully
        </div>
      )}
    </div>
  );
};

export default ESignatureCapture;
