import React from 'react';
import { Box, Text } from '@chakra-ui/react';

/**
 * Crop Instructions Interface
 *
 * Props for the CropInstructions component that shows helpful guidance
 */
interface CropInstructionsProps {
    /** Controls whether the instructions are visible */
    isVisible: boolean;
}

/**
 * Crop Instructions Component
 *
 * Displays animated instructions for the cropping tool with:
 * - Fade in/out animation
 * - Helpful guidance text
 * - Responsive positioning
 * - Auto-hide functionality
 */
const CropInstructions: React.FC<CropInstructionsProps> = ({ isVisible }) => {
    // Don't render if instructions should be hidden
    if (!isVisible) return null;

    return (
        <Box
            // Fixed positioning at the top center of the screen
            position="fixed"
            top="20px"
            left="50%"
            transform="translateX(-50%)"

            // Styling for the instruction bubble
            bg="rgba(253, 23, 116, 0.95)"
            color="white"
            px="16px"
            py="8px"
            borderRadius="20px"
            fontSize="14px"
            fontWeight="500"

            // Z-index to ensure visibility above other elements
            zIndex="1000"

            // Shadow for better visibility
            boxShadow="0 4px 12px rgba(0,0,0,0.3)"

            // Fade in/out animation
            animation="fadeInOut 3s ease-in-out"

            // Custom keyframe animation for smooth fade in/out
            sx={{
                '@keyframes fadeInOut': {
                    // Start: invisible and slightly above position
                    '0%': {
                        opacity: 0,
                        transform: 'translateX(-50%) translateY(-20px)'
                    },
                    // Fade in: visible and in position
                    '20%': {
                        opacity: 1,
                        transform: 'translateX(-50%) translateY(0)'
                    },
                    // Stay visible: maintain position
                    '80%': {
                        opacity: 1,
                        transform: 'translateX(-50%) translateY(0)'
                    },
                    // Fade out: invisible and slightly above position
                    '100%': {
                        opacity: 0,
                        transform: 'translateX(-50%) translateY(-20px)'
                    }
                }
            }}
        >
            {/* Instruction text with emoji for visual appeal */}
            📐 Drag to move, corners to resize
        </Box>
    );
};

export default CropInstructions;
