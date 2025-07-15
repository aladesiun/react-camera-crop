
// @ts-ignore
import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { IoIosCloseCircle } from 'react-icons/io';
import { IoSaveOutline } from "react-icons/io5";

import { FaCheck, FaRedo, FaCrop } from 'react-icons/fa';
import ReactCrop, { type Crop, PercentCrop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImagePreviewModalProps {
    image: string;
    onClose: () => void;
    onSave: (image: string) => void;
    onRetake: () => void;
    cropMode?: boolean;
    onCropModeChange?: (cropMode: boolean) => void;
    cropArea?: CropArea;
    onCropAreaChange?: (cropArea: CropArea) => void;
    onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onTouchMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
    onTouchEnd?: (e: React.TouchEvent<HTMLDivElement>) => void;
    onTouchStart?: (e: React.TouchEvent<HTMLDivElement>) => void;
    showCropButton?: boolean;
}

// Move HandleType type to top-level, not exported
type HandleType = 'move' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right' | null;

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    image,
    onClose,
    onSave,
    onRetake,
    cropMode = false,
    onCropModeChange,
    cropArea,
    onCropAreaChange,
    onMouseMove,
    onMouseUp,
    onMouseDown,
    onTouchMove,
    onTouchEnd,
    onTouchStart,
    showCropButton = false
}) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const imageRefLarge = useRef<HTMLImageElement>(null);

    // const enableCropMode = (): void => {
    //     // Initialize crop area when entering crop mode
    //     // For mobile, always use the small screen ref
    //     const currentRef = imageRef.current;
    
    //     if (currentRef) {
    //         // Wait for image to be loaded
    //         if (currentRef.complete && currentRef.naturalWidth > 0) {
    //             const img = currentRef;
    //             const rect = img.getBoundingClientRect();
    //             const defaultWidth = rect.width * 0.8; // 80% of image width
    //             const defaultHeight = rect.height * 0.6;
    //             const defaultX = (rect.width - defaultWidth) / 2;
    //             const defaultY = (rect.height - defaultHeight) / 2;
    
    //             const newCrop = {
    //                 unit: 'px' as const,
    //                 x: defaultX,
    //                 y: defaultY,
    //                 width: defaultWidth,
    //                 height: defaultHeight
    //             };
    
    //             setCrop(newCrop);
                
    //             // Also set completedCrop immediately so save works without moving
    //             setCompletedCrop({
    //                 unit: 'px',
    //                 x: defaultX,
    //                 y: defaultY,
    //                 width: defaultWidth,
    //                 height: defaultHeight
    //             });
    //         } else {
    //             // If image not loaded, set a default crop and update when loaded
    //             const newCrop = {
    //                 unit: 'px' as const,
    //                 x: 20,
    //                 y: 20,
    //                 width: 200,
    //                 height: 150
    //             };
                
    //             setCrop(newCrop);
                
    //             // Also set completedCrop
    //             setCompletedCrop({
    //                 unit: 'px',
    //                 x: 20,
    //                 y: 20,
    //                 width: 200,
    //                 height: 150
    //             });
    //         }
    //     }
    //     onCropModeChange?.(true);
    // };
    const enableCropMode = (): void => {
        const currentRef = imageRef.current;
    
        if (currentRef) {
            if (currentRef.complete && currentRef.naturalWidth > 0) {
                const img = currentRef;
                const rect = img.getBoundingClientRect();
                
                // Mobile-specific: Create a crop that's obviously different from original
                // This ensures Y-axis cropping is visible
                const defaultWidth = rect.width * 0.8;   // 80% of width
                const defaultHeight = rect.height * 0.6; // 60% of height 
                const defaultX = (rect.width - defaultWidth) / 2; // Center horizontally
                const defaultY = rect.height * 0.15; // Start 15% from top (crop more from bottom)
    
                const newCrop = {
                    unit: 'px' as const,
                    x: defaultX,
                    y: defaultY,
                    width: defaultWidth,
                    height: defaultHeight
                };
    
                console.log('MOBILE CROP INIT - Setting crop:', newCrop);
                console.log('MOBILE CROP INIT - Image rect:', rect);
                console.log('MOBILE CROP INIT - Crop will remove:', {
                    topPercent: Math.round((defaultY / rect.height) * 100) + '%',
                    bottomPercent: Math.round(((rect.height - defaultY - defaultHeight) / rect.height) * 100) + '%',
                    leftPercent: Math.round((defaultX / rect.width) * 100) + '%',
                    rightPercent: Math.round(((rect.width - defaultX - defaultWidth) / rect.width) * 100) + '%'
                });
    
                setCrop(newCrop);
                
                // CRITICAL: Immediately set completedCrop so mobile save works
                setCompletedCrop({
                    unit: 'px',
                    x: defaultX,
                    y: defaultY,
                    width: defaultWidth,
                    height: defaultHeight
                });
    
                console.log('MOBILE CROP INIT - Set completedCrop for immediate save capability');
            } else {
                console.log('MOBILE CROP INIT - Image not loaded, using fallback');
                const newCrop = {
                    unit: 'px' as const,
                    x: 60,
                    y: 50,  // Start higher up
                    width: 280,
                    height: 180
                };
                
                setCrop(newCrop);
                setCompletedCrop({
                    unit: 'px',
                    x: 60,
                    y: 50,
                    width: 280,
                    height: 180
                });
            }
        }
        onCropModeChange?.(true);
    };
    const cancelCrop = (): void => {
        onCropModeChange?.(false);
    };

    // Always use pixel units for consistent cropping
    const [crop, setCrop] = useState<Crop>({ unit: 'px', x: 20, y: 20, width: 100, height: 100 });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);

        // When Apply Crop is clicked, generate the cropped image
    const applyCrop = () => {
        // For mobile, always use the small screen ref
        const currentRef = imageRef.current;

        if (!currentRef) {
            console.error('Image ref not found');
            return;
        }

        // Ensure image is loaded
        if (!currentRef.complete || currentRef.naturalWidth === 0) {
            console.error('Image not fully loaded');
            return;
        }

        // Use completedCrop if available, otherwise use current crop state
        let cropToUse: PixelCrop;

        if (completedCrop) {
            cropToUse = completedCrop;
        } else if (crop && crop.width > 0 && crop.height > 0) {
            // Use current crop state if it's valid
            cropToUse = {
                unit: 'px',
                x: crop.x,
                y: crop.y,
                width: crop.width,
                height: crop.height
            };
        } else {
            // Calculate default crop area if no valid crop exists
            const img = currentRef;
            const rect = img.getBoundingClientRect();
            const defaultWidth = rect.width * 0.8; // 80% of image width
            const defaultHeight = rect.height * 0.6;
            const defaultX = (rect.width - defaultWidth) / 2;
            const defaultY = (rect.height - defaultHeight) / 2;

            cropToUse = {
                unit: 'px',
                x: defaultX,
                y: defaultY,
                width: defaultWidth,
                height: defaultHeight
            };
        }

        const img = currentRef;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Get the natural image dimensions
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Get the displayed image dimensions
        const displayRect = img.getBoundingClientRect();
        const displayWidth = displayRect.width;
        const displayHeight = displayRect.height;

        // Calculate scale factors between display and natural size
        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        // Convert crop coordinates from display pixels to natural image pixels
        const cropX = cropToUse.x * scaleX;
        const cropY = cropToUse.y * scaleY;
        const cropWidth = cropToUse.width * scaleX;
        const cropHeight = cropToUse.height * scaleY;

        // Set canvas size to the actual crop dimensions
        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the cropped portion from the natural image
        ctx.drawImage(
            img,
            cropX, cropY, cropWidth, cropHeight,  // Source rectangle (from natural image)
            0, 0, cropWidth, cropHeight            // Destination rectangle (to canvas)
        );

        const cropped = canvas.toDataURL('image/jpeg', 0.95);
        setCroppedImage(cropped);
        onCropModeChange?.(false);
    };

    // Save cropped image and close modal
// Save cropped image and close modal - Debug version
// const saveCroppedImage = () => {
//     // For mobile, always use the small screen ref
//     const currentRef = imageRef.current;

//     if (!currentRef) {
//         console.error('Image ref not found');
//         return;
//     }

//     // Ensure image is loaded
//     if (!currentRef.complete || currentRef.naturalWidth === 0) {
//         console.error('Image not fully loaded');
//         return;
//     }

//     // Use completedCrop if available, otherwise use current crop state
//     let cropToUse: PixelCrop;
    
//     console.log('Debug - Current crop state:', crop);
//     console.log('Debug - Completed crop state:', completedCrop);

//     // Priority order: completedCrop -> current crop -> default crop
//     if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
//         cropToUse = completedCrop;
//         console.log('Debug - Using completedCrop:', cropToUse);
//     } else if (crop && crop.width > 0 && crop.height > 0) {
//         // Ensure we have a valid PixelCrop object
//         cropToUse = {
//             unit: 'px',
//             x: Number(crop.x) || 0,
//             y: Number(crop.y) || 0,
//             width: Number(crop.width) || 0,
//             height: Number(crop.height) || 0
//         };
//         console.log('Debug - Using current crop:', cropToUse);
//     } else {
//         // Calculate default crop area if no valid crop exists
//         const img = currentRef;
//         const rect = img.getBoundingClientRect();
//         const defaultWidth = rect.width * 0.8; // 80% of image width
//         const defaultHeight = rect.height * 0.6;
//         const defaultX = (rect.width - defaultWidth) / 2;
//         const defaultY = (rect.height - defaultHeight) / 2;

//         cropToUse = {
//             unit: 'px',
//             x: defaultX,
//             y: defaultY,
//             width: defaultWidth,
//             height: defaultHeight
//         };
//         console.log('Debug - Using default crop:', cropToUse);
//     }

//     // Additional validation to ensure we have valid crop dimensions
//     if (cropToUse.width <= 0 || cropToUse.height <= 0) {
//         console.error('Invalid crop dimensions, recalculating default');
//         const img = currentRef;
//         const rect = img.getBoundingClientRect();
//         const defaultWidth = rect.width * 0.8;
//         const defaultHeight = rect.height * 0.6;
//         const defaultX = (rect.width - defaultWidth) / 2;
//         const defaultY = (rect.height - defaultHeight) / 2;

//         cropToUse = {
//             unit: 'px',
//             x: defaultX,
//             y: defaultY,
//             width: defaultWidth,
//             height: defaultHeight
//         };
//         console.log('Debug - Recalculated default crop:', cropToUse);
//     }

//     const img = currentRef;
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Get the natural image dimensions
//     const naturalWidth = img.naturalWidth;
//     const naturalHeight = img.naturalHeight;
//     console.log('Debug - Natural image dimensions:', { naturalWidth, naturalHeight });

//     // Get the displayed image dimensions
//     const displayRect = img.getBoundingClientRect();
//     const displayWidth = displayRect.width;
//     const displayHeight = displayRect.height;
//     console.log('Debug - Display image dimensions:', { displayWidth, displayHeight });

//     // Calculate scale factors between display and natural size
//     const scaleX = naturalWidth / displayWidth;
//     const scaleY = naturalHeight / displayHeight;
//     console.log('Debug - Scale factors:', { scaleX, scaleY });

//     // Convert crop coordinates from display pixels to natural image pixels
//     const cropX = cropToUse.x * scaleX;
//     const cropY = cropToUse.y * scaleY;
//     const cropWidth = cropToUse.width * scaleX;
//     const cropHeight = cropToUse.height * scaleY;
    
//     console.log('Debug - Scaled crop coordinates:', { 
//         cropX, 
//         cropY, 
//         cropWidth, 
//         cropHeight 
//     });

//     // Ensure crop dimensions are within bounds
//     const finalCropX = Math.max(0, Math.min(cropX, naturalWidth));
//     const finalCropY = Math.max(0, Math.min(cropY, naturalHeight));
//     const finalCropWidth = Math.min(cropWidth, naturalWidth - finalCropX);
//     const finalCropHeight = Math.min(cropHeight, naturalHeight - finalCropY);
    
//     console.log('Debug - Final crop coordinates:', { 
//         finalCropX, 
//         finalCropY, 
//         finalCropWidth, 
//         finalCropHeight 
//     });

//     // Set canvas size to the actual crop dimensions
//     canvas.width = finalCropWidth;
//     canvas.height = finalCropHeight;
//     console.log('Debug - Canvas dimensions:', { width: canvas.width, height: canvas.height });

//     ctx.imageSmoothingEnabled = true;
//     ctx.imageSmoothingQuality = 'high';

//     // Draw the cropped portion from the natural image
//     ctx.drawImage(
//         img,
//         finalCropX, finalCropY, finalCropWidth, finalCropHeight,  // Source rectangle (from natural image)
//         0, 0, finalCropWidth, finalCropHeight                     // Destination rectangle (to canvas)
//     );

//     const cropped = canvas.toDataURL('image/jpeg', 0.95);
//     console.log('Debug - Cropped image data URL length:', cropped.length);
//     onSave?.(cropped);
// };
// Mobile-specific save function with enhanced Y-axis debugging
// Fixed save function for mobile - addresses coordinate system issues
const saveCroppedImage = () => {
    const currentRef = imageRef.current;

    if (!currentRef) {
        console.error('Image ref not found');
        return;
    }

    if (!currentRef.complete || currentRef.naturalWidth === 0) {
        console.error('Image not fully loaded');
        return;
    }

    let cropToUse: PixelCrop;
    
    console.log('MOBILE FIX - Current crop state:', crop);
    console.log('MOBILE FIX - Completed crop state:', completedCrop);

    // The key fix: Always ensure we have a valid crop, and handle coordinate system properly
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
        cropToUse = completedCrop;
        console.log('MOBILE FIX - Using completedCrop:', cropToUse);
    } else if (crop && crop.width > 0 && crop.height > 0) {
        // IMPORTANT: For mobile, we need to ensure crop coordinates are relative to the image, not the container
        const img = currentRef;
        const imgRect = img.getBoundingClientRect();
        
        // Check if crop coordinates seem relative to container vs image
        // If crop.x + crop.width > image width, coordinates might be container-relative
        const isContainerRelative = (crop.x + crop.width > imgRect.width) || (crop.y + crop.height > imgRect.height);
        
        if (isContainerRelative) {
            console.log('MOBILE FIX - Detected container-relative coordinates, converting...');
            // Convert container-relative to image-relative coordinates
            const containerRect = img.parentElement?.getBoundingClientRect() || imgRect;
            const imgOffsetX = imgRect.left - containerRect.left;
            const imgOffsetY = imgRect.top - containerRect.top;
            
            cropToUse = {
                unit: 'px',
                x: Math.max(0, crop.x - imgOffsetX),
                y: Math.max(0, crop.y - imgOffsetY),
                width: crop.width,
                height: crop.height
            };
            console.log('MOBILE FIX - Converted crop coordinates:', cropToUse);
        } else {
            cropToUse = {
                unit: 'px',
                x: Number(crop.x) || 0,
                y: Number(crop.y) || 0,
                width: Number(crop.width) || 0,
                height: Number(crop.height) || 0
            };
            console.log('MOBILE FIX - Using crop coordinates as-is:', cropToUse);
        }
    } else {
        // Fallback to a guaranteed working crop
        const img = currentRef;
        const rect = img.getBoundingClientRect();
        const defaultWidth = rect.width * 0.7;
        const defaultHeight = rect.height * 0.5; // More aggressive height crop
        const defaultX = (rect.width - defaultWidth) / 2;
        const defaultY = rect.height * 0.2; // Start 20% from top

        cropToUse = {
            unit: 'px',
            x: defaultX,
            y: defaultY,
            width: defaultWidth,
            height: defaultHeight
        };
        console.log('MOBILE FIX - Using fallback crop:', cropToUse);
    }

    // Additional validation - ensure crop is within image bounds
    const img = currentRef;
    const imgRect = img.getBoundingClientRect();
    
    // Clamp crop to image boundaries
    const clampedCrop = {
        unit: 'px' as const,
        x: Math.max(0, Math.min(cropToUse.x, imgRect.width - 10)),
        y: Math.max(0, Math.min(cropToUse.y, imgRect.height - 10)),
        width: Math.max(10, Math.min(cropToUse.width, imgRect.width - cropToUse.x)),
        height: Math.max(10, Math.min(cropToUse.height, imgRect.height - cropToUse.y))
    };
    
    console.log('MOBILE FIX - Clamped crop:', clampedCrop);
    console.log('MOBILE FIX - Image rect for reference:', { width: imgRect.width, height: imgRect.height });

    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    
    // Use the actual rendered image dimensions
    const displayWidth = imgRect.width;
    const displayHeight = imgRect.height;
    
    console.log('MOBILE FIX - Dimensions:', { 
        natural: { width: naturalWidth, height: naturalHeight },
        display: { width: displayWidth, height: displayHeight }
    });

    const scaleX = naturalWidth / displayWidth;
    const scaleY = naturalHeight / displayHeight;
    
    console.log('MOBILE FIX - Scale factors:', { scaleX, scaleY });

    // Apply scaling to clamped crop
    const finalCropX = clampedCrop.x * scaleX;
    const finalCropY = clampedCrop.y * scaleY;
    const finalCropWidth = clampedCrop.width * scaleX;
    const finalCropHeight = clampedCrop.height * scaleY;
    
    console.log('MOBILE FIX - Final scaled crop:', { 
        x: finalCropX, y: finalCropY, 
        width: finalCropWidth, height: finalCropHeight 
    });

    // Verify Y-axis cropping
    const topCropped = finalCropY;
    const bottomCropped = naturalHeight - (finalCropY + finalCropHeight);
    console.log('MOBILE FIX - Y-axis verification:', {
        originalHeight: naturalHeight,
        finalHeight: finalCropHeight,
        topCropped: topCropped,
        bottomCropped: bottomCropped,
        percentageOfOriginalHeight: Math.round((finalCropHeight / naturalHeight) * 100) + '%'
    });

    // Create canvas and draw
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = finalCropWidth;
    canvas.height = finalCropHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    console.log('MOBILE FIX - Drawing with params:', {
        source: [finalCropX, finalCropY, finalCropWidth, finalCropHeight],
        dest: [0, 0, finalCropWidth, finalCropHeight]
    });

    ctx.drawImage(
        img,
        finalCropX, finalCropY, finalCropWidth, finalCropHeight,
        0, 0, finalCropWidth, finalCropHeight
    );

    const cropped = canvas.toDataURL('image/jpeg', 0.95);
    
    // Final verification
    const verifyImg = new Image();
    verifyImg.onload = () => {
        console.log('MOBILE FIX - Final result dimensions:', {
            width: verifyImg.width,
            height: verifyImg.height,
            aspectRatio: Math.round((verifyImg.width / verifyImg.height) * 100) / 100
        });
    };
    verifyImg.src = cropped;
    
    onSave?.(cropped);
};

    // Reset croppedImage and crop state when a new image is loaded or retaken
    useEffect(() => {
        setCroppedImage(null);
        setCompletedCrop(null);
    }, [image]);

    // Initialize crop area when entering crop mode
    useEffect(() => {
        if (cropMode) {
            // Use the appropriate ref based on screen size
            const isLargeScreen = window.innerWidth >= 500; // lg breakpoint
            const currentRef = isLargeScreen ? imageRefLarge.current : imageRef.current;

            if (currentRef) {
                const img = currentRef;
                const rect = img.getBoundingClientRect();
                const defaultWidth = rect.width * 0.85; // 85% of image width for wider default crop
                const defaultHeight = rect.height * 0.8;
                const defaultX = (rect.width - defaultWidth) / 2;
                const defaultY = (rect.height - defaultHeight) / 2;

                setCrop({
                    unit: 'px',
                    x: defaultX,
                    y: defaultY,
                    width: defaultWidth,
                    height: defaultHeight
                });
            }
        }
    }, [cropMode]);

    // Initialize crop area when image loads
    useEffect(() => {
        const timer = setTimeout(() => {
            if (image && !cropMode && onCropAreaChange) {
                // Use the appropriate ref based on screen size
                const isLargeScreen = window.innerWidth >= 500; // lg breakpoint
                const currentRef = isLargeScreen ? imageRefLarge.current : imageRef.current;

                if (currentRef) {
                    const img = currentRef;
                    const containerRect = img.getBoundingClientRect();

                    // Default crop area (centered, 85% of image)
                    const defaultWidth = containerRect.width * 0.85;
                    const defaultHeight = containerRect.height * 0.6;
                    const defaultX = (containerRect.width - defaultWidth) / 2;
                    const defaultY = (containerRect.height - defaultHeight) / 2;

                    onCropAreaChange({
                        x: defaultX,
                        y: defaultY,
                        width: defaultWidth,
                        height: defaultHeight
                    });
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [image, cropMode, onCropAreaChange]);

    return (
        <>
            {/* Dark backdrop overlay */}
            <Box
                position="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="rgba(0, 0, 0, 0.6)"
                zIndex={998}
                onClick={onClose} // Close modal when clicking backdrop
            />

            {/* Small Screen Modal */}
            <Box
                // display={{ base: "block", lg: "none" }}
                id="campreview-container-sm"
                bg="white"
                minH="300px"
                maxH="550px"
                h={{ sm: "370px", md: "470px", lg: "auto" }}
                maxW={"600px"}
                mx={"auto"}
                position="fixed"
                borderRadius="20px"
                top="50%"
                transform="translateY(-50%)"
                left="10px"
                justifyContent="center"
                right="10px"
                zIndex={999}
                p="10px"
                dropShadow="0 4px 12px rgba(0,0,0,0.1)"
                style={{
                    touchAction: cropMode ? 'none' : 'auto'
                }}
            >
                {/* Image container with crop overlay */}
                <Box position="relative"   w="100%" h="30px">
                <Box
                    position="absolute"
                    top="-5px"
                    right="-2px"
                    w="30px"
                    h="30px"
                    bg="rgba(0,0,0,0.5)"
                    borderRadius="50%"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    cursor="pointer"
                    zIndex="50"
                    _hover={{ bg: "rgba(0,0,0,0.7)" }}
                    onClick={onClose}
                >
                    {/* @ts-ignore */}
                    <IoIosCloseCircle color="white" size="20px" />
                </Box>
                </Box>
                <Box
                    position="relative"
                    w="100%"
                    h="100%"
                    maxH={{ sm: "350px", md: "auto" }}
                    flex="1"
                    borderRadius="10px"
                    overflow="hidden"
                    mb="15px"
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                        touchAction: cropMode ? 'none' : 'auto'
                    }}
                >

                    {cropMode && (
                        /* @ts-ignore */
                        <ReactCrop
                            crop={crop}
                            onChange={(c) => {
                                setCrop(c);
                            }}
                            onComplete={(c) => {
                                setCompletedCrop(c);
                            }}
                            minWidth={30}
                            minHeight={30}
                            keepSelection
                            style={{ zIndex: 10 }}
                        >
                            <img
                                ref={imageRef}
                                src={image}
                                alt="Captured ID"
                                style={{ width: '100%', minWidth: "350px", height: '100%', objectFit: 'cover', borderRadius: '10px', userSelect: 'none', maxHeight: '370px' }}
                                draggable={false}
                                onLoad={() => {
                                    // Update crop when image loads
                                    if (cropMode && imageRef.current) {
                                        const img = imageRef.current;
                                        const rect = img.getBoundingClientRect();
                                        const defaultWidth = rect.width * 0.8;
                                        const defaultHeight = rect.height * 0.6;
                                        const defaultX = (rect.width - defaultWidth) / 2;
                                        const defaultY = (rect.height - defaultHeight) / 2;

                                        setCrop({
                                            unit: 'px',
                                            x: defaultX,
                                            y: defaultY,
                                            width: defaultWidth,
                                            height: defaultHeight
                                        });
                                    }
                                }}
                            />
                        </ReactCrop>
                    )}
                    {!cropMode && croppedImage && (
                        <img
                            src={croppedImage}
                            alt="Cropped Preview"
                            style={{
                                width: '100%', minWidth: "350px",
                                height: '100%',
                                maxHeight: '350px',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                display: 'block'
                            }}
                            draggable={false}
                        />
                    )}
                    {!cropMode && !croppedImage && (
                        <img
                            ref={imageRef}
                            src={image}
                            alt="Captured ID"
                            style={{ width: '100%', minWidth: "350px", height: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '10px', userSelect: 'none' }}
                            draggable={false}
                        />
                    )}
                </Box>

                {/* Action buttons */}
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    gap="1rem"
                    px="10px"
                    py="5px"
                >
                    {cropMode ? (
                        // Crop mode buttons
                        <>
                            <Box
                                bg="black"
                                borderRadius="12px"
                                color="white"
                                px="1.5rem"
                                py="12px"
                                minW="100px"
                                h="50px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={onRetake}
                                _hover={{ bg: "gray.600" }}
                                transition="all 0.2s"
                            >
                                <Text fontSize="14px" fontWeight="500" my={0}>
                                    Retake
                                </Text>
                            </Box>

                            <Box
                                bg="#fd1774"
                                borderRadius="12px"
                                color="white"
                                px="1.5rem"
                                py="12px"
                                minW="120px"
                                h="50px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={saveCroppedImage}
                                _hover={{ bg: "#e91560" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(253, 23, 116, 0.25)"
                            >
                                <Text fontSize="14px" fontWeight="500" mr="8px" my={0}>
                                    Save
                                </Text>
                                {/* @ts-ignore */}
                                <FaCheck size={16} color="white" />
                            </Box>
                        </>
                    ) : (
                        // Normal mode buttons
                        <>

                            <Box
                                bg="black"
                                borderRadius="12px"
                                color="white"
                                px="1.5rem"
                                py="12px"
                                minW="100px"
                                h="50px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={enableCropMode}
                                _hover={{ bg: "gray.800" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                            >
                                <Text fontSize="14px" fontWeight="500" mr="8px" my={0}>
                                    Crop
                                </Text>
                                {/* @ts-ignore */}
                                <FaCrop size={16} color="white" />
                            </Box>


                            <Box
                                bg="gray.600"
                                borderRadius="12px"
                                color="black"
                                px="1.5rem"
                                py="12px"
                                minW="100px"
                                h="50px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={() => {
                                    // Use cropped image if available, otherwise use original
                                    if (croppedImage) {
                                        onSave?.(croppedImage);
                                    } else {
                                        onSave?.(image);
                                    }
                                }}
                                _hover={{ bg: "gray.700" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                            >
                                <Text fontSize="14px" fontWeight="500" mr="8px" my={0}>
                                    Save
                                </Text>
                                {/* @ts-ignore */}
                                <IoSaveOutline size={18} color="black" />
                            </Box>

                            <Box
                                bg="#fd1774"
                                borderRadius="12px"
                                color="white"
                                px="1.5rem"
                                py="12px"
                                minW="100px"
                                h="50px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={onRetake}
                                _hover={{ bg: "#e91560" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(253, 23, 116, 0.25)"
                            >
                                <Text fontSize="14px" fontWeight="500" mr="8px" my={0}>
                                    Retake
                                </Text>
                                {/* @ts-ignore */}
                                <FaRedo size={16} color="white" />
                            </Box>
                        </>
                    )}
                </Box>
            </Box>

            {/* Large Screen Modal */}
          
        </>
    );
};

const HANDLE_SIZE = 16;
const MIN_CROP_SIZE = 30;

function CropAreaOverlay({ cropArea, onDragStart }: { cropArea: CropArea, onDragStart: (e: React.MouseEvent | React.TouchEvent, type: HandleType) => void }) {
    // Helper to render a handle
    const handle = (
        pos: { top?: string; left?: string; bottom?: string; right?: string },
        cursor: string,
        handleType: HandleType,
        style: React.CSSProperties = {}
    ) => (
        <Box
            position="absolute"
            {...pos}
            w={`${HANDLE_SIZE}px`}
            h={`${HANDLE_SIZE}px`}
            bg="#fd1774"
            borderRadius="50%"
            border="2px solid white"
            cursor={cursor}
            zIndex={2}
            onMouseDown={e => { e.stopPropagation(); onDragStart(e, handleType); }}
            onTouchStart={e => { e.stopPropagation(); onDragStart(e, handleType); }}
            style={{ ...style, transition: 'transform 0.2s' }}
            _hover={{ transform: 'scale(1.2)' }}
        />
    );
    return (
        <Box
            position="absolute"
            left={`${cropArea.x}px`}
            top={`${cropArea.y}px`}
            width={`${cropArea.width}px`}
            height={`${cropArea.height}px`}
            border="2px solid #fd1774"
            borderRadius="4px"
            cursor="move"
            zIndex={1}
            onMouseDown={e => onDragStart(e, 'move')}
            onTouchStart={e => onDragStart(e, 'move')}
            style={{ userSelect: 'none', touchAction: 'none' }}
        >
            {/* 4 corners */}
            {handle({ top: `-${HANDLE_SIZE / 2}px`, left: `-${HANDLE_SIZE / 2}px` }, 'nw-resize', 'top-left')}
            {handle({ top: `-${HANDLE_SIZE / 2}px`, right: `-${HANDLE_SIZE / 2}px` }, 'ne-resize', 'top-right')}
            {handle({ bottom: `-${HANDLE_SIZE / 2}px`, left: `-${HANDLE_SIZE / 2}px` }, 'sw-resize', 'bottom-left')}
            {handle({ bottom: `-${HANDLE_SIZE / 2}px`, right: `-${HANDLE_SIZE / 2}px` }, 'se-resize', 'bottom-right')}
            {/* 4 edges */}
            {handle({ top: `-${HANDLE_SIZE / 2}px`, left: '50%' }, 'n-resize', 'top', { transform: 'translateX(-50%)' })}
            {handle({ bottom: `-${HANDLE_SIZE / 2}px`, left: '50%' }, 's-resize', 'bottom', { transform: 'translateX(-50%)' })}
            {handle({ left: `-${HANDLE_SIZE / 2}px`, top: '50%' }, 'w-resize', 'left', { transform: 'translateY(-50%)' })}
            {handle({ right: `-${HANDLE_SIZE / 2}px`, top: '50%' }, 'e-resize', 'right', { transform: 'translateY(-50%)' })}
        </Box>
    );
}

export default ImagePreviewModal;
