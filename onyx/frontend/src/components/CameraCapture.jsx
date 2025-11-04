import { useState, useRef, useEffect } from 'react';

export default function CameraCapture({ onCapture, onClose, autoOpen = false }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (autoOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please grant permission.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const useCaptured = () => {
    if (capturedImage) {
      // Convert captured image back to file
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          onCapture(file, capturedImage);
        });
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera View */}
      <div className="relative w-full h-full">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {error && (
              <div className="absolute top-20 left-0 right-0 px-4">
                <div className="glass bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-2xl text-center">
                  {error}
                </div>
              </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <button
                  onClick={switchCamera}
                  className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
              <div className="flex items-center justify-center">
                <button
                  onClick={capturePhoto}
                  disabled={!stream}
                  className="w-20 h-20 rounded-full bg-white border-4 border-white/30 hover:scale-110 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-onyx-accent to-onyx-purple"></div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview Captured Image */}
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />

            {/* Preview Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-around">
                <button
                  onClick={retake}
                  className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform"
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Retake</span>
                </button>

                <button
                  onClick={useCaptured}
                  className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-onyx-accent to-onyx-purple flex items-center justify-center shadow-glow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Use Photo</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
