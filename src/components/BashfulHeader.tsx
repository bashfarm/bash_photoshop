import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export const BashfulHeader = () => {
    let someRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.timeline()
            .to(someRef.current, {
                duration: 1,
                backgroundColor: '#FFFFFF',
                ease: 'none',
                delay: 1,
            })
            .to(someRef.current, {
                x: 200,
                duration: 2,
                repeat: 0,
                ease: 'bounce.out',
                onComplete: () => {
                    console.log(
                        'probably wanna see the ref class name to justify'
                    );
                    someRef.current.className =
                        'h-14 w-28 text-white text-xl font-bold';
                },
            })
            .to(someRef.current, {
                duration: 1,
                backgroundColor: 'transparent',
                ease: 'none',
                delay: 1,
            });
    }, []);

    return (
        <h1 ref={someRef} className="h-14 w-28 bg-white text-transparent">
            Bashful
        </h1>
    );
};
