import React, { useState, useRef, useEffect } from 'react';
import NativeWebCamWithCrop from './components/webCam/Index';

function App() {
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const handleCapture = (file: File) => {
        console.log(file);
        // Convert the file to a data URL for display
        const reader = new FileReader();
        reader.onload = (e) => {
            setCapturedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
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
                </div>
            )}
        </div>
    );
}

export default App;
