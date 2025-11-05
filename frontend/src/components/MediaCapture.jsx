import { useState, useRef, useEffect } from 'react';

export default function MediaCapture({ onCapture, onClose, autoOpen = false, mode = 'photo' }) {
  const [stream, setStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(mode); // 'photo' or 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (autoOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mediaType === 'video'
      });

      console.log('Camera access granted!');
      setStream(mediaStream);
      setError('');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      const errorMessage = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in your browser settings.'
        : err.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : 'Unable to access camera. Please check your browser permissions.';
      setError(errorMessage);
      alert(errorMessage); // Show alert so user definitely sees it
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
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedMedia({ type: 'photo', url: imageUrl, blob });
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const startRecording = () => {
    if (!stream) return;

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setCapturedMedia({ type: 'video', url: videoUrl, blob });
      stopCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const retake = () => {
    setCapturedMedia(null);
    setRecordingTime(0);
    startCamera();
  };

  const useCapture = () => {
    if (capturedMedia) {
      const file = new File(
        [capturedMedia.blob],
        capturedMedia.type === 'photo' ? 'capture.jpg' : 'video.webm',
        { type: capturedMedia.type === 'photo' ? 'image/jpeg' : 'video/webm' }
      );
      onCapture(file, capturedMedia.url, capturedMedia.type);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const switchMode = () => {
    setMediaType(prev => {
      const newMode = prev === 'photo' ? 'video' : 'photo';
      stopCamera();
      setTimeout(() => startCamera(), 100);
      return newMode;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {!capturedMedia ? (
          <>
            {/* Live Camera View */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {error && (
              <div className="absolute top-20 left-0 right-0 px-4 animate-slide-down">
                <div className="glass bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-2xl text-center">
                  {error}
                </div>
              </div>
            )}

            {/* Recording Timer */}
            {isRecording && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 animate-pulse">
                <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-bold text-lg">{formatTime(recordingTime)}</span>
                </div>
              </div>
            )}

            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="p-3 rounded-full glass hover:bg-white/20 transition-all"
                  disabled={isRecording}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-center gap-2">
                  {/* Mode Switch */}
                  <button
                    onClick={switchMode}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${
                      mediaType === 'photo'
                        ? 'bg-white text-black'
                        : 'glass text-white'
                    }`}
                    disabled={isRecording}
                  >
                    Photo
                  </button>
                  <button
                    onClick={switchMode}
                    className={`px-4 py-2 rounded-full font-semibold transition-all ${
                      mediaType === 'video'
                        ? 'bg-white text-black'
                        : 'glass text-white'
                    }`}
                    disabled={isRecording}
                  >
                    Video
                  </button>
                </div>

                <button
                  onClick={switchCamera}
                  className="p-3 rounded-full glass hover:bg-white/20 transition-all"
                  disabled={isRecording}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center">
                {mediaType === 'photo' ? (
                  <button
                    onClick={capturePhoto}
                    disabled={!stream}
                    className="w-20 h-20 rounded-full bg-white/20 border-4 border-white hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 backdrop-blur-sm"
                  >
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </button>
                ) : (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!stream}
                    className={`w-20 h-20 rounded-full border-4 border-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 ${
                      isRecording ? 'bg-red-500' : 'bg-white/20 backdrop-blur-sm'
                    }`}
                  >
                    <div className={`w-full h-full flex items-center justify-center ${
                      isRecording ? 'p-6' : ''
                    }`}>
                      <div className={`${
                        isRecording
                          ? 'w-full h-full bg-white rounded-sm'
                          : 'w-full h-full bg-red-500 rounded-full'
                      }`}></div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview */}
            {capturedMedia.type === 'photo' ? (
              <img
                src={capturedMedia.url}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={capturedMedia.url}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover"
              />
            )}

            {/* Preview Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
              <div className="flex items-center justify-around">
                <button
                  onClick={retake}
                  className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full glass flex items-center justify-center">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">Retake</span>
                </button>

                <button
                  onClick={useCapture}
                  className="flex flex-col items-center gap-2 text-white hover:scale-110 transition-transform"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-onyx-accent to-onyx-purple flex items-center justify-center shadow-glow-lg">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold">Use {capturedMedia.type === 'photo' ? 'Photo' : 'Video'}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
