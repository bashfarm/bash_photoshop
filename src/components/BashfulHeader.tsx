import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { performHeaderAnimation } from 'utils/animation_utils';

export const BashfulHeader = () => {
    let someRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        performHeaderAnimation(someRef);
    }, []);

    return (
        <h1 ref={someRef} className="h-14 w-28 bg-white text-transparent">
            Bashful
        </h1>
    );
};
