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

    const enableCropMode = (): void => {
        // Initialize crop area when entering crop mode
        // For mobile, always use the small screen ref
        const currentRef = imageRef.current;

        if (currentRef) {
            // Wait for image to be loaded
            if (currentRef.complete && currentRef.naturalWidth > 0) {
                const img = currentRef;
                const rect = img.getBoundingClientRect();
                const defaultWidth = rect.width * 0.8; // 80% of image width
                const defaultHeight = rect.height * 0.6;  // 60% of image height
                const defaultX = (rect.width - defaultWidth) / 2;
                const defaultY = (rect.height - defaultHeight) / 2;

                setCrop({
                    unit: 'px',
                    x: defaultX,
                    y: defaultY,
                    width: defaultWidth,
                    height: defaultHeight
                });
            } else {
                // If image not loaded, set a default crop and update when loaded
                setCrop({
                    unit: 'px',
                    x: 20,
                    y: 20,
                    width: 200,
                    height: 150
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

        // Force Y dimension to 500px, centered on the original crop
        const targetYHeight = 500;
        const originalCropCenterY = cropY + (cropHeight / 2);
        const newCropY = originalCropCenterY - (targetYHeight / 2);
        const newCropHeight = targetYHeight;

        // Set canvas size to the forced Y dimension
        canvas.width = cropWidth;
        canvas.height = newCropHeight;

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
    const saveCroppedImage = () => {
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
        console.log(cropToUse, "cropToUse");
        console.log(crop, "crop");  
        console.log(completedCrop, "completedCrop");
        
        

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

        // Force Y dimension to 500px, centered on the original crop
        const targetYHeight = 500;
        const originalCropCenterY = cropY + (cropHeight / 2);
        const newCropY = originalCropCenterY - (targetYHeight / 2);
        const newCropHeight = targetYHeight;

        // Set canvas size to the forced Y dimension
        canvas.width = cropWidth;
        canvas.height = newCropHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the cropped portion from the natural image with forced Y dimension
        ctx.drawImage(
            img,
            cropX, newCropY, cropWidth, newCropHeight,  // Source rectangle (from natural image)
            0, 0, cropWidth, newCropHeight              // Destination rectangle (to canvas)
        );

        const cropped = canvas.toDataURL('image/jpeg', 0.95);
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
            <Box
                display={"none"}
                id="campreview-container-lg"
                bg="white"
                minH="270px"
                maxH="80vh"
                maxW={"900px"}
                minW="550px"
                mx={"auto"}
                position="fixed"
                borderRadius="20px"
                top="50%"
                transform="translate(-50%, -50%)"
                left="50%"
                flexDirection="row"
                justifyContent="stretch"
                zIndex={999}
                p="20px"
                boxShadow="0 20px 40px rgba(0,0,0,0.3)"
                style={{
                    touchAction: cropMode ? 'none' : 'auto'
                }}
            >
                {/* Image container */}
                <Box
                    position="relative"
                    flex="1"
                    minW="400px"
                    borderRadius="10px"
                    overflow="hidden"
                    mr="20px"
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
                                ref={imageRefLarge}
                                src={image}
                                alt="Captured ID"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', userSelect: 'none' }}
                                draggable={false}
                            />
                        </ReactCrop>
                    )}
                    {!cropMode && croppedImage && (
                        <img
                            src={croppedImage}
                            alt="Cropped Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '10px',
                                display: 'block'
                            }}
                            draggable={false}
                        />
                    )}
                    {!cropMode && !croppedImage && (
                        <img
                            ref={imageRefLarge}
                            src={image}
                            alt="Captured ID"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', userSelect: 'none' }}
                            draggable={false}
                        />
                    )}
                </Box>

                {/* Action buttons - Side layout */}
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    gap="1.5rem"
                    minW="200px"
                    px="10px"
                    py="20px"
                >
                    {cropMode ? (
                        // Crop mode buttons
                        <>
                            <Box
                                bg="black"
                                borderRadius="12px"
                                color="white"
                                px="2rem"
                                py="15px"
                                w="100%"
                                h="60px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={onRetake}
                                _hover={{ bg: "gray.600" }}
                                transition="all 0.2s"
                            >
                                <Text fontSize="16px" fontWeight="500" my={0}>
                                    Retake
                                </Text>
                            </Box>

                            <Box
                                bg="#fd1774"
                                borderRadius="12px"
                                color="white"
                                px="2rem"
                                py="15px"
                                w="100%"
                                h="60px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={saveCroppedImage}
                                _hover={{ bg: "#e91560" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(253, 23, 116, 0.25)"
                            >
                                <Text fontSize="16px" fontWeight="500" mr="8px" my={0}>
                                    Save
                                </Text>
                                {/* @ts-ignore */}
                                <FaCheck size={18} color="white" />
                            </Box>

                            {/* Close button as third button */}
                            <Box
                                bg="gray.500"
                                borderRadius="12px"
                                color="white"
                                px="2rem"
                                py="15px"
                                w="100%"
                                h="60px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={onClose}
                                _hover={{ bg: "gray.600" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                            >
                                <Text fontSize="16px" color="black" fontWeight="500" mr="8px" my={0}>
                                    Close
                                </Text>
                                {/* @ts-ignore */}
                                <IoIosCloseCircle color="black" size={20} />
                            </Box>
                        </>
                    ) : (
                        // Normal mode buttons
                        <>
                            <Box
                                bg="black"
                                borderRadius="12px"
                                color="white"
                                px="2rem"
                                py="15px"
                                w="100%"
                                h="60px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={enableCropMode}
                                _hover={{ bg: "gray.800" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                            >
                                <Text fontSize="16px" fontWeight="500" mr="8px" my={0}>
                                    Crop
                                </Text>
                                {/* @ts-ignore */}
                                <FaCrop size={18} color="white" />
                            </Box>

                            <Box
                                bg="gray.600"
                                borderRadius="12px"
                                color="black"
                                px="2rem"
                                py="15px"
                                w="100%"
                                h="60px"
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
                                <Text fontSize="16px" fontWeight="500" mr="8px" my={0}>
                                    Save
                                </Text>
                                {/* @ts-ignore */}
                                <IoSaveOutline size={20} color="black" />
                            </Box>

                            <Box
                                bg="gray.500"
                                borderRadius="12px"
                                color="white"
                                px="2rem"
                                py="15px"
                                w="100%"
                                h="60px"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer"
                                onClick={onClose}
                                _hover={{ bg: "gray.600" }}
                                transition="all 0.2s"
                                boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                            >
                                <Text fontSize="16px" fontWeight="500" mr="8px" my={0}>
                                    Close
                                </Text>
                                {/* @ts-ignore */}
                                <IoIosCloseCircle color="white" size={20} />
                            </Box>
                        </>
                    )}
                </Box>
            </Box>
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
