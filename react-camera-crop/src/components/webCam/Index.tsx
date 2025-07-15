import React from "react";
import { FaCamera, FaCrop, FaCheck } from "react-icons/fa";
import { IoIosCloseCircle } from "react-icons/io";
import { useState, useRef, useEffect } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { IoSaveOutline } from "react-icons/io5";
import { FaRedo } from "react-icons/fa";
import EXIF from 'exif-js';
import ImagePreviewModal from "./ImagePreviewmodal";
import CameraModal from "./CameraModal";

export default function NativeWebCamWithCrop({ onCapture }: { onCapture: Function }): React.ReactElement {
    const [openCamera, setOpenCamera] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cropMode, setCropMode] = useState(false);
    const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [currentVideoElement, setCurrentVideoElement] = useState<HTMLVideoElement | null>(null);

    // Single video ref for both orientations
    const videoRef = useRef<HTMLVideoElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const cropCanvasRef = useRef<HTMLCanvasElement>(null);

    // Start camera when component opens
    useEffect(() => {
        if (openCamera && !stream) {
            startCamera();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [openCamera]);

    // Handle stream assignment when orientation changes or component mounts
    useEffect(() => {
        if (stream && videoRef.current) {
            // console.log('Assigning stream to video element');
            videoRef.current.srcObject = stream;

            // Reset camera ready state and wait for metadata
            setCameraReady(false);

            videoRef.current.onloadedmetadata = () => {
                // console.log('Video metadata loaded');
                setCameraReady(true);
            };

            // Force play if needed
            videoRef.current.play().catch(err => {
                // console.warn('Video play failed:', err);
            });
        }
    }, [stream]); // Only depend on stream, CSS handles orientation

    // Initialize crop area when image loads
    useEffect(() => {
        setTimeout(() => {
            if (image && imageRef.current && !cropMode) {
                const img = imageRef.current;
                const containerRect = img.getBoundingClientRect();

                // Default crop area (centered, 90% of image)
                const defaultWidth = containerRect.width * 0.9;
                const defaultHeight = containerRect.height * 0.5;
                const defaultX = (containerRect.width - defaultWidth) / 2;
                const defaultY = (containerRect.height - defaultHeight) / 2;

                setCropArea({
                    x: defaultX,
                    y: defaultY,
                    width: defaultWidth,
                    height: defaultHeight
                });
            }
        }, 1000);
    }, [image, cropMode]);

    const retakePhoto = () => {
        setImage(null);
        setCropMode(false);
        startCamera();
    };

    const savePhoto = (imageToSave?: string) => {


        const imageData = imageToSave || image;
        if (!imageData) return;

        rotateImage(imageData, (rotatedImage: string) => {
            fetch(rotatedImage)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], `id_card_${Date.now()}.jpeg`, {
                        type: 'image/jpeg'
                    });
                    onCapture(file);
                    closeCamera();
                });
        });
    };

    // Event handler version for buttons
    const handleSaveClick = () => {
        savePhoto();
    };

    const closeCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setOpenCamera(false);
        setImage(null);
        setError("");
        setCameraReady(false);
        setCurrentVideoElement(null);
        setCropMode(false);
    };

    // Mouse/Touch handlers for crop area
    const handleStart = (clientX: number, clientY: number) => {
        if (!cropMode) return;
        setIsDragging(true);
        const rect = imageRef.current?.getBoundingClientRect();
        if (rect) {
            setDragStart({
                x: clientX - rect.left,
                y: clientY - rect.top
            });
        }
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging || !cropMode || !imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const currentX = clientX - rect.left;
        const currentY = clientY - rect.top;

        const newWidth = Math.abs(currentX - dragStart.x);
        const newHeight = Math.abs(currentY - dragStart.y);
        const newX = Math.min(dragStart.x, currentX);
        const newY = Math.min(dragStart.y, currentY);

        // Constrain to image bounds
        const maxX = Math.max(0, Math.min(newX, rect.width - newWidth));
        const maxY = Math.max(0, Math.min(newY, rect.height - newHeight));
        const maxWidth = Math.min(newWidth, rect.width - maxX);
        const maxHeight = Math.min(newHeight, rect.height - maxY);

        setCropArea({
            x: maxX,
            y: maxY,
            width: maxWidth,
            height: maxHeight
        });
    };

    const handleEnd = () => {
        setIsDragging(false);
    };

    // Mouse event handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        e.preventDefault();
        handleEnd();
    };

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleEnd();
    };

    // Enhanced rotation function (keeping your existing logic)
    const rotateImage = (imageBase64: string, cb: (image: string) => void) => {
        const img = new Image();
        img.src = imageBase64;
        img.crossOrigin = "Anonymous";

        img.onload = () => {
            EXIF.getData(img as any, () => {
                const orientation = EXIF.getTag(img as any, "Orientation") || 1;

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) return;

                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;

                if (orientation === 6 || orientation === 8) {
                    canvas.width = height;
                    canvas.height = width;
                } else {
                    canvas.width = width;
                    canvas.height = height;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);

                switch (orientation) {
                    case 2: ctx.scale(-1, 1); break;
                    case 3: ctx.rotate(Math.PI); break;
                    case 4: ctx.scale(1, -1); break;
                    case 5: ctx.rotate(0.5 * Math.PI); ctx.scale(1, -1); break;
                    case 6: ctx.rotate(0.5 * Math.PI); break;
                    case 7: ctx.rotate(0.5 * Math.PI); ctx.scale(-1, 1); break;
                    case 8: ctx.rotate(-0.5 * Math.PI); break;
                    default: break;
                }

                if (orientation > 4) {
                    ctx.drawImage(img, -height / 2, -width / 2, height, width);
                } else {
                    ctx.drawImage(img, -width / 2, -height / 2, width, height);
                }

                ctx.restore();

                cb(canvas.toDataURL("image/jpeg", 0.95));
            });
        };
    };

    // Add this function to initialize crop area if not set
    const initializeCropArea = () => {
        if (imageRef.current && (cropArea.width === 0 || cropArea.height === 0)) {
            const img = imageRef.current;
            const rect = img.getBoundingClientRect();
            const defaultWidth = rect.width * 0.5;
            const defaultHeight = rect.height * 0.4;
            const defaultX = (rect.width - defaultWidth) / 2;
            const defaultY = (rect.height - defaultHeight) / 2;
            setCropArea({
                x: defaultX,
                y: defaultY,
                width: defaultWidth,
                height: defaultHeight
            });
        }
    };

    // Update enableCropMode to initialize crop area
    const enableCropMode = () => {
        initializeCropArea();
        setCropMode(true);
    };

    const cancelCrop = () => {
        setCropMode(false);
    };

    const applyCrop = () => {
        if (!image || !imageRef.current) return;

        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Calculate scale factors
        const containerRect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / containerRect.width;
        const scaleY = img.naturalHeight / containerRect.height;

        // Convert crop area to actual image coordinates
        const cropX = cropArea.x * scaleX;
        const cropY = cropArea.y * scaleY;
        const cropWidth = cropArea.width * scaleX;
        const cropHeight = cropArea.height * scaleY;

        // Set canvas size to crop dimensions
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        // Create new image for cropping
        const tempImg = new Image();
        tempImg.onload = () => {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw cropped portion
            ctx.drawImage(
                tempImg,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );

            const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
            setImage(croppedImage);
            setCropMode(false);
        };
        tempImg.src = image;
    };

    // Auto crop function - same logic as applyCrop but automatically applies
    const autoCrop = (imageDataUrl: string) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    resolve(imageDataUrl); // Return original if canvas context fails
                    return;
                }

                // Calculate default crop area (same as useEffect logic)
                const imgWidth = img.width;
                const imgHeight = img.height;

                // Default crop area (centered, 80% width, 60% height)
                const defaultWidth = imgWidth * 0.8;
                const defaultHeight = imgHeight * 0.6;
                const defaultX = (imgWidth - defaultWidth) / 2;
                const defaultY = (imgHeight - defaultHeight) / 2;

                // Set canvas size to crop dimensions
                canvas.width = defaultWidth;
                canvas.height = defaultHeight;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                // Draw cropped portion
                ctx.drawImage(
                    img,
                    defaultX, defaultY, defaultWidth, defaultHeight,
                    0, 0, defaultWidth, defaultHeight
                );

                const croppedImage = canvas.toDataURL('image/jpeg', 0.95);
                resolve(croppedImage);
            };
            img.src = imageDataUrl;
        });
    };

    const startCamera = async (): Promise<void> => {
        try {
            console.log('🔍 Starting camera...');
            setError("");
            setCameraReady(false);
            setCurrentVideoElement(null);

            const constraints = {
                video: {
                    facingMode: "environment",
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 },
                    frameRate: { ideal: 30, min: 15 },
                    aspectRatio: { ideal: 16 / 9 },
                    resizeMode: "crop-and-scale"
                },
                audio: false
            };

            console.log('📹 Requesting camera permission...');
            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Camera permission granted!');
            setStream(mediaStream);
            console.log('🎥 Camera stream obtained');

            // The stream will be assigned to video elements by VideoCamera components
        } catch (err: any) {
            console.error("❌ Camera error:", err);
            if (err.name === 'NotAllowedError') {
                setError("Camera access denied. Please allow camera permissions.");
            } else if (err.name === 'NotFoundError') {
                setError("No camera detected. Please connect a camera.");
            } else if (err.name === 'NotReadableError') {
                setError("Camera is busy. Please close other applications using the camera.");
            } else {
                setError("Cannot access camera. Please try again.");
            }
        }
    };

    const capturePhoto = async (): Promise<void> => {
        if (!currentVideoElement || !cameraReady) {
            // console.warn('Video element not ready for capture');
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) return;

        const video = currentVideoElement;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // console.log('Capturing photo:', { videoWidth, videoHeight });

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(video, 0, 0, videoWidth, videoHeight);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);

        // Auto crop the captured image
        // const croppedImageDataUrl: string = await autoCrop(imageDataUrl) as string;
        setImage(imageDataUrl);

        // Automatically enable crop mode after a short delay to ensure image is loaded
        setTimeout(() => {
            setCropMode(true);
        }, 100);

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setCameraReady(false);
            setCurrentVideoElement(null);
        }
    };
    const onVideoReady = (videoElement: HTMLVideoElement) => {
        setCameraReady(true);                    // Enable camera controls
        setCurrentVideoElement(videoElement);    // Store active video for capture
        // console.log('Video ready, element set for capture');
    };

    return (
        <>
            {/* Camera trigger button */}
            <Button
                className="border border-[#FD1774] w-fit rounded-lg md:p-0 p-2"
                onClick={() => setOpenCamera(true)}
                px={2}
            >
                {/* @ts-ignore */}
                <FaCamera className="text-[#FD1774]" />

            </Button>

            {/* Camera overlay */}
            {openCamera && (
                <>
                    {image ? (
                        // Image preview with cropping functionality
                        /* @ts-ignore */

                        <ImagePreviewModal
                            image={image}
                            onClose={closeCamera}
                            onSave={savePhoto}
                            onRetake={retakePhoto}
                            cropMode={cropMode}
                            onCropModeChange={setCropMode}
                            cropArea={cropArea}
                            onCropAreaChange={setCropArea}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseDown={handleMouseDown}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            onTouchStart={handleTouchStart}
                            showCropButton={false}
                        />
                    ) : (
                        // Camera view with stream-based approach
                        /* @ts-ignore */

                        <CameraModal
                            isOpen={openCamera && !image}
                            onClose={closeCamera}
                            onCapture={capturePhoto}
                            cameraReady={cameraReady}
                            error={error}
                            stream={stream}
                            onVideoReady={onVideoReady}
                        />
                    )}
                </>
            )}

        </>
    );
}
