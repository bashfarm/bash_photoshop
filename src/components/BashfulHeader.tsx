import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { getHeaderAnimationTimeline } from 'utils/animation_utils';

export const BashfulHeader = () => {
    let someRef = useRef<HTMLDivElement>(null);

    let [timelineAnimation, setTimelineAnimation] =
        useState<GSAPTimeline | null>(null);

    useLayoutEffect(() => {
        if (!timelineAnimation) {
            let tl = getHeaderAnimationTimeline(someRef);

            setTimelineAnimation(tl);
        }

        // timelineAnimation?.restart();
    }, []);

    return (
        <h1 ref={someRef} className="h-14 w-28 bg-white text-transparent">
            Bashful
        </h1>
    );
};
