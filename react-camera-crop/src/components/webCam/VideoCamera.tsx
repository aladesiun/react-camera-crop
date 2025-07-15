import React, { useRef, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';

interface VideoCameraProps {
    stream: MediaStream | null;
    cameraReady: boolean;
    onVideoReady: (videoElement: HTMLVideoElement) => void;
    frameWidth?: string;
    frameHeight?: string;
    isLandscape?: boolean;
}

const VideoCamera: React.FC<VideoCameraProps> = ({
    stream,
    cameraReady,
    onVideoReady,
    frameWidth = "320px",
    frameHeight = "220px",
    isLandscape = false
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);

    // Assign stream to this video element when it changes
    useEffect(() => {
        if (stream && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;

            localVideoRef.current.onloadedmetadata = () => {
                onVideoReady(localVideoRef.current!); // Pass the video element back
            };

            localVideoRef.current.play().catch(err => {
                // Video play failed silently
            });
        }
    }, [stream, isLandscape, onVideoReady]);

    return (
        <Box
            position="relative"
            flex="1"
            bg="black"
            overflow="hidden"
        >
            {/* Each component has its own video element */}
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />

            {/* Loading state */}
            {!cameraReady && (
                <Box
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    bg="rgba(0,0,0,0.8)"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                >
                    <Box
                        w={isLandscape ? "36px" : "40px"}
                        h={isLandscape ? "36px" : "40px"}
                        border="3px solid #fd1774"
                        borderTop="3px solid transparent"
                        borderRadius="50%"
                        animation="spin 1s linear infinite"
                        mb={isLandscape ? "12px" : "16px"}
                        sx={{
                            '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                            }
                        }}
                    />
                    <Text color="white" fontSize={isLandscape ? "13px" : "14px"} my={0}>
                        Starting camera...
                    </Text>
                </Box>
            )}

            {/* Frame overlay when camera is ready */}
            {cameraReady && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    w={frameWidth}
                    h={frameHeight}
                    border="3px dashed #fd1774"
                    borderRadius="12px"
                    pointerEvents="none"
                    zIndex="10"
                    animation="pulse 2s infinite"
                    sx={{
                        '@keyframes pulse': {
                            '0%, 100%': {
                                borderColor: '#fd1774',
                                boxShadow: `0 0 0 0 rgba(253, 23, 116, 0.4)`
                            },
                            '50%': {
                                borderColor: '#ff4081',
                                boxShadow: `0 0 0 ${isLandscape ? '8px' : '10px'} rgba(253, 23, 116, 0)`
                            }
                        }
                    }}
                >
                    {/* Corner markers */}
                    <Box position="absolute" top={isLandscape ? "-6px" : "-8px"} left={isLandscape ? "-6px" : "-8px"}
                         w={isLandscape ? "18px" : "20px"} h={isLandscape ? "18px" : "20px"}
                         border={isLandscape ? "3px solid #fd1774" : "4px solid #fd1774"}
                         borderBottom="transparent" borderRight="transparent" />
                    <Box position="absolute" top={isLandscape ? "-6px" : "-8px"} right={isLandscape ? "-6px" : "-8px"}
                         w={isLandscape ? "18px" : "20px"} h={isLandscape ? "18px" : "20px"}
                         border={isLandscape ? "3px solid #fd1774" : "4px solid #fd1774"}
                         borderBottom="transparent" borderLeft="transparent" />
                    <Box position="absolute" bottom={isLandscape ? "-6px" : "-8px"} left={isLandscape ? "-6px" : "-8px"}
                         w={isLandscape ? "18px" : "20px"} h={isLandscape ? "18px" : "20px"}
                         border={isLandscape ? "3px solid #fd1774" : "4px solid #fd1774"}
                         borderTop="transparent" borderRight="transparent" />
                    <Box position="absolute" bottom={isLandscape ? "-6px" : "-8px"} right={isLandscape ? "-6px" : "-8px"}
                         w={isLandscape ? "18px" : "20px"} h={isLandscape ? "18px" : "20px"}
                         border={isLandscape ? "3px solid #fd1774" : "4px solid #fd1774"}
                         borderTop="transparent" borderLeft="transparent" />

                    {/* Center text */}
                    <Text
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        color="white"
                        fontSize={isLandscape ? "13px" : "14px"}
                        bg={isLandscape ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.8)"}
                        px={isLandscape ? "10px" : "12px"}
                        py={isLandscape ? "5px" : "6px"}
                        borderRadius={isLandscape ? "16px" : "20px"}
                        backdropFilter="blur(4px)"
                        textAlign="center"
                        my={0}
                    >
                        📄 Position ID Card Here
                    </Text>
                </Box>
            )}
        </Box>
    );
};

export default VideoCamera;
