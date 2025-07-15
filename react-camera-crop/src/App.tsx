import React, { useState, useRef, useEffect } from 'react';
import NativeWebCamWithCrop from './components/webCam/Index';

function App() {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    const handleCapture = (file: File) => {
        console.log(file);
        setOriginalFile(file);
        
        // Convert the file to a data URL for display
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setCapturedImage(dataUrl);
            
            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                setImageDimensions({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    const downloadImage = () => {
        if (originalFile) {
            // Create a download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(originalFile);
            link.download = `captured-image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Simple Camera Test new 4</h1>
            <p>Testing basic camera functionality without external dependencies</p>
            
            <NativeWebCamWithCrop onCapture={handleCapture} />
            
            {/* Display captured image in a box */}
            {capturedImage && (
                <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    border: '2px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '15px', color: '#333' }}>Captured Image</h3>
                    
                    {/* Image dimensions display */}
                    {imageDimensions && (
                        <div style={{
                            marginBottom: '15px',
                            padding: '10px',
                            backgroundColor: '#e8f4fd',
                            borderRadius: '6px',
                            border: '1px solid #b3d9ff'
                        }}>
                            <strong>Image Dimensions:</strong> X: {imageDimensions.width} × Y: {imageDimensions.height} pixels
                        </div>
                    )}
                    
                    <div style={{
                        display: 'inline-block',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <img 
                            src={capturedImage} 
                            alt="Captured" 
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                display: 'block'
                            }}
                        />
                    </div>
                    
                    {/* Download button */}
                    <div style={{ marginTop: '15px' }}>
                        <button 
                            onClick={downloadImage}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
                        >
                            📥 Download Image
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
