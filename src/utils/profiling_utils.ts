import { useEffect, useRef } from 'react';

export const useRenderCounter = (componentName: string) => {
    const renderedTimes = useRef(0);

    useEffect(() => {
        renderedTimes.current += 1;
        console.log(`${componentName} Rendered ${renderedTimes.current}`);
    });
};

export const useRenderSpeed = (componentName: string) => {
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        startTimeRef.current = performance.now();
        return () => {
            const endTime = performance.now();
            if (startTimeRef.current) {
                const renderTime = endTime - startTimeRef.current;
                console.log(
                    `${componentName} Render Time: ${renderTime.toFixed(2)}ms`
                );
            }
        };
    });
};
