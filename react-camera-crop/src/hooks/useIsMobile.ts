import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 800) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

        const handleMediaChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(event.matches);
        };

        // Initial check
        handleMediaChange(mediaQuery);

        // Event listener for media query change
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleMediaChange);
        } else {
            // For Safari and other older browsers
            mediaQuery.addListener(handleMediaChange);
        }

        // Fallback for resize event in case of browser compatibility issues
        const handleResize = () => {
            handleMediaChange(mediaQuery);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup event listeners on component unmount
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleMediaChange);
            } else {
                mediaQuery.removeListener(handleMediaChange);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;
