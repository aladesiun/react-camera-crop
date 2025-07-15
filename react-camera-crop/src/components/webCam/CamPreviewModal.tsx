import React, { RefObject } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { IoIosCloseCircle } from 'react-icons/io';
import { IoSaveOutline } from 'react-icons/io5';
import { FaRedo } from 'react-icons/fa';

type CamPreviewModalProps = {
    image: string;
    imageRef: RefObject<HTMLImageElement>;
    onClose: () => void;
    onSave: () => void;
    onRetake: () => void;
    mobileScreen: boolean;
};

const CamPreviewModal: React.FC<CamPreviewModalProps> = ({
    image,
    imageRef,
    onClose,
    onSave,
    onRetake,
    mobileScreen,
}) => {
    return (
        <Box
            bg="white"
            position="fixed"
            borderRadius="20px"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            zIndex={999}
            minW={"350px"}
            shadow="0 4px 12px rgba(0, 0, 0, 0.5)"
            p={{ base: '8px', sm: '10px', md: '15px' }}
            maxH={{ base: '90vh', sm: '85vh', md: '80vh' }}
            h={{ base: 'auto', sm: '500px', md: '500px', lg: '550px' }}
            maxW={{ base: '100%', lg: '900px' }}
            mx="auto"
            overflow="hidden" // Optional, for enforcing rounded corners
        >
            {/* Close button */}

            <Box
                position="absolute"
                top="10px"
                right="10px"
                w="40px"
                h="40px"
                bg="rgba(0,0,0,0.5)"
                borderRadius="50%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                cursor="pointer"
                zIndex="10"
                _hover={{ bg: 'rgba(0,0,0,0.7)' }}
                onClick={onClose}
            >
                {/* @ts-ignore */}
                <IoIosCloseCircle color="white" size={mobileScreen ? 30 : 24} />
            </Box>

            {/* Image container */}
            <Box
                position="relative"
                w="100%"
                h="100%"
                flex="1"
                borderRadius={{ base: '8px', md: '10px' }}
                overflow="hidden"
                mb={{ base: '10px', md: '15px' }}
            >
                <img
                    ref={imageRef}
                    src={image}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 'inherit',
                        userSelect: 'none',
                        maxHeight: mobileScreen ? '400px' : '250px',
                    }}
                    alt="Captured ID"
                    draggable={false}
                />
            </Box>

            {/* Buttons */}
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                gap={".5rem"}
                p={'.5rem'}
            >
                {/* Save */}
                <Box
                    bg="black"
                    borderRadius={"8px"}
                    color="white"
                    p={".5rem"}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    cursor="pointer"
                    onClick={onSave}
                    _hover={{ bg: 'gray.700' }}
                    transition="all 0.2s"
                    boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                >
                    <Text fontSize={{ base: '13px', md: '14px' }} fontWeight="500" mr="8px" my={0}>
                        Save
                    </Text>
                    {/* @ts-ignore */}

                    <IoSaveOutline size={mobileScreen ? 18 : 16} color="white" />
                </Box>

                {/* Retake */}
                <Box
                    bg="#fd1774"
                    borderRadius={"5px"}
                    color="white"
                    p={".5rem"}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    cursor="pointer"
                    onClick={onRetake}
                    _hover={{ bg: '#e91560' }}
                    transition="all 0.2s"
                    boxShadow="0 2px 8px rgba(253, 23, 116, 0.25)"
                >
                    <Text fontSize={{ base: '13px', md: '14px' }} fontWeight="500" mr="8px" my={0}>
                        Retake
                    </Text>
                    {/* @ts-ignore */}

                    <FaRedo size={mobileScreen ? 16 : 14} color="white" />
                </Box>
            </Box>
        </Box>

    );
};

export default CamPreviewModal;
