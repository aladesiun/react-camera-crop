import React from 'react';
import { Box, Text } from '@chakra-ui/react';

/**
 * Crop Area Interface
 *
 * Defines the structure of the crop area with position and dimensions
 */
interface CropArea {
    /** X coordinate of the crop area */
    x: number;
    /** Y coordinate of the crop area */
    y: number;
    /** Width of the crop area */
    width: number;
    /** Height of the crop area */
    height: number;
}

/**
 * Enhanced Crop Area Interface
 *
 * Props for the EnhancedCropArea component that provides advanced cropping functionality
 */
interface EnhancedCropAreaProps {
    /** Current crop area definition */
    cropArea: CropArea;
    /** Mouse down event handler for drag operations */
    onMouseDown?: (e: React.MouseEvent<HTMLDivElement>, handle?: string) => void;
    /** Touch start event handler for mobile drag operations */
    onTouchStart?: (e: React.TouchEvent<HTMLDivElement>, handle?: string) => void;
}

/**
 * Enhanced Crop Area Component
 *
 * Provides an advanced cropping interface with:
 * - Visual crop area selection
 * - Corner and edge resize handles
 * - Drag functionality for moving the crop area
 * - Hover effects and visual feedback
 * - Center indicator for positioning reference
 * - Touch and mouse event support
 */
const EnhancedCropArea: React.FC<EnhancedCropAreaProps> = ({
    cropArea,
    onMouseDown,
    onTouchStart
}) => {
    return (
        <Box
            // Position the crop area based on current coordinates
            position="absolute"
            left={`${cropArea.x}px`}
            top={`${cropArea.y}px`}
            width={`${cropArea.width}px`}
            height={`${cropArea.height}px`}

            // Visual styling for the crop area
            border="2px solid #fd1774"
            borderRadius="4px"
            cursor="move"

            // Event handlers for drag operations
            onMouseDown={(e) => onMouseDown?.(e)}
            onTouchStart={(e) => onTouchStart?.(e)}

            // Prevent text selection and touch callouts
            style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                touchAction: 'none'
            }}

            // Data attribute for touch event handling
            data-handle="move"

            // Dark overlay effect around the crop area
            _before={{
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                pointerEvents: 'none'
            }}
        >
            {/* ===== CORNER RESIZE HANDLES ===== */}
            {/* These handles allow resizing from the corners */}

            {/* Top-left corner - resize from top-left */}
            <Box
                position="absolute"
                top="-6px"
                left="-6px"
                w="12px"
                h="12px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="nw-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize corner"
                data-handle="top-left"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'top-left');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'top-left');
                }}
            />

            {/* Top-right corner - resize from top-right */}
            <Box
                position="absolute"
                top="-6px"
                right="-6px"
                w="12px"
                h="12px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="ne-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize corner"
                data-handle="top-right"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'top-right');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'top-right');
                }}
            />

            {/* Bottom-left corner - resize from bottom-left */}
            <Box
                position="absolute"
                bottom="-6px"
                left="-6px"
                w="12px"
                h="12px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="sw-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize corner"
                data-handle="bottom-left"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'bottom-left');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'bottom-left');
                }}
            />

            {/* Bottom-right corner - resize from bottom-right */}
            <Box
                position="absolute"
                bottom="-6px"
                right="-6px"
                w="12px"
                h="12px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="se-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize corner"
                data-handle="bottom-right"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'bottom-right');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'bottom-right');
                }}
            />

            {/* ===== EDGE RESIZE HANDLES ===== */}
            {/* These handles allow resizing from the edges */}

            {/* Top edge - resize from top */}
            <Box
                position="absolute"
                top="-4px"
                left="50%"
                transform="translateX(-50%)"
                w="8px"
                h="8px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="n-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize top"
                data-handle="top"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'top');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'top');
                }}
            />

            {/* Bottom edge - resize from bottom */}
            <Box
                position="absolute"
                bottom="-4px"
                left="50%"
                transform="translateX(-50%)"
                w="8px"
                h="8px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="s-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize bottom"
                data-handle="bottom"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'bottom');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'bottom');
                }}
            />

            {/* Left edge - resize from left */}
            <Box
                position="absolute"
                left="-4px"
                top="50%"
                transform="translateY(-50%)"
                w="8px"
                h="8px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="w-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize left"
                data-handle="left"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'left');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'left');
                }}
            />

            {/* Right edge - resize from right */}
            <Box
                position="absolute"
                right="-4px"
                top="50%"
                transform="translateY(-50%)"
                w="8px"
                h="8px"
                bg="#fd1774"
                borderRadius="50%"
                cursor="e-resize"
                border="2px solid white"
                _hover={{ transform: 'scale(1.2)' }}
                transition="transform 0.2s"
                title="Resize right"
                data-handle="right"
                onMouseDown={(e) => {
                    e.stopPropagation();
                    onMouseDown?.(e, 'right');
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                    onTouchStart?.(e, 'right');
                }}
            />

            {/* ===== CENTER INDICATOR ===== */}
            {/* Visual reference point for the center of the crop area */}
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="20px"
                h="20px"
                border="2px dashed rgba(255,255,255,0.6)"
                borderRadius="50%"
                pointerEvents="none"
            />
        </Box>
    );
};

export default EnhancedCropArea;
