import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { IoIosCloseCircle } from 'react-icons/io';
import { FaCamera } from 'react-icons/fa';
import VideoCamera from './VideoCamera'; // Import the single video component

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: () => void;
    cameraReady: boolean;
    error: string;
    stream: MediaStream | null; // Use stream instead of ref
    onVideoReady: (videoElement: HTMLVideoElement) => void;   // Callback when video is ready
}

const CameraModal: React.FC<CameraModalProps> = ({
    isOpen,
    onClose,
    onCapture,
    cameraReady,
    error,
    stream,
    onVideoReady
}) => {
    if (!isOpen) return null;

    return (
        <Box
            bg="rgba(0, 0, 0, 0.9)"
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={999}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={{ base: "10px", md: "20px" }}
            shadow="0 4px 12px rgba(0, 0, 0, 0.5)"
        >
            {/* Portrait Layout - Controlled by CSS */}
            <Box id="webcam-container-sm" display={{ base: "none", sm: "block" }}>
                <Box
                    bg="white"
                    borderRadius="24px"
                    boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                    w="90%"
                    mx="auto"
                    maxW="400px"
                    maxH="550px"
                    minH="270px"
                    h="90vh"
                    position="relative"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                >
                    {/* Header */}
                    <Box
                        bg="linear-gradient(135deg, #fd1774 0%, #e91e63 100%)"
                        p="20px"
                        textAlign="center"
                        position="relative"
                        flexShrink={0}
                    >
                        <Text color="white" fontSize="18px" fontWeight="600" mb="8px" my={0}>
                            Scan Your ID Card
                        </Text>
                        <Text color="rgba(255,255,255,0.8)" fontSize="14px" my={0}>
                            Position your ID within the frame below
                        </Text>

                        <Box
                            position="absolute"
                            top="20px"
                            right="20px"
                            w="32px"
                            h="32px"
                            bg="rgba(255,255,255,0.2)"
                            borderRadius="50%"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            cursor="pointer"
                            onClick={onClose}
                            _hover={{ bg: "rgba(255,255,255,0.3)" }}
                        >
                            {/* @ts-ignore */}

                            <IoIosCloseCircle color="white" size="20px" />
                        </Box>
                    </Box>

                    {/* Camera Section - Using single video component */}
                    {/* @ts-ignore */}

                    <VideoCamera
                        stream={stream}
                        cameraReady={cameraReady}
                        onVideoReady={onVideoReady}
                        frameWidth="320px"
                        frameHeight="220px"
                        isLandscape={false}
                    />

                    {/* Bottom Controls */}
                    <Box
                        bg="white"
                        p="20px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="80px"
                        position="relative"
                        flexShrink={0}
                    >
                        {cameraReady && (
                            <Box
                                position="absolute"
                                top="-30px"
                                left="20px"
                                right="20px"
                                bg="rgba(255,255,255,0.95)"
                                p="6px"
                                borderRadius="6px"
                                textAlign="center"
                                backdropFilter="blur(4px)"
                                boxShadow="0 2px 8px rgba(0,0,0,0.1)"
                            >
                                <Text fontSize="12px" color="gray.600" my={0}>
                                    💡 Ensure good lighting and hold steady
                                </Text>
                            </Box>
                        )}

                        <Box
                            w="60px"
                            h="60px"
                            bg={cameraReady ? "linear-gradient(135deg, #fd1774 0%, #e91e63 100%)" : "gray.400"}
                            borderRadius="50%"
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            cursor={cameraReady ? "pointer" : "not-allowed"}
                            onClick={cameraReady ? onCapture : undefined}
                            boxShadow="0 4px 12px rgba(253, 23, 116, 0.3)"
                            transition="all 0.2s"
                            _hover={cameraReady ? {
                                transform: "scale(1.05)",
                                boxShadow: "0 6px 16px rgba(253, 23, 116, 0.4)"
                            } : {}}
                        >
                            {/* @ts-ignore */}

                            <FaCamera color="white" size="20px" />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* Landscape Layout - Controlled by CSS */}
          
        

            {/* Error Display */}
            {error && (
                <Box
                    position="absolute"
                    bottom={{ base: "100px", lg: "60px" }}
                    left="50%"
                    transform="translateX(-50%)"
                    bg="red.500"
                    color="white"
                    p="12px"
                    borderRadius="8px"
                    textAlign="center"
                    fontSize="14px"
                    boxShadow="0 4px 12px rgba(244, 67, 54, 0.3)"
                    zIndex="20"
                    maxW="300px"
                >
                    ⚠️ {error}
                </Box>
            )}
        </Box>
    );
};

export default CameraModal;
