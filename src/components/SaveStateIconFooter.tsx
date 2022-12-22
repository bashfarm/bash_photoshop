import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { useContextStore } from 'store/contextStore';
import { fullConfig } from '../constants';
import gsap from 'gsap';

// rotate doesn't work
export function SaveStateIconFooter() {
    let contextStore = useContextStore();
    let someRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.timeline()
            .to(someRef.current, {
                y: 5,
                duration: 0.2,
                repeat: 0,
                ease: 'bounce.in',
            })
            .to(someRef.current, {
                duration: 0.2,
                backgroundColor: '#7e4dfb',
                ease: 'none',
                delay: 0.5,
            })
            .to(someRef.current, {
                duration: 0.2,
                backgroundColor: 'transparent',
                ease: 'none',
                delay: 0.5,
            });
        console.log('detecting save state change');
    }, [contextStore]);

    return (
        <div ref={someRef} className="h-14 w-28 bg-white text-transparent" />
    );
}
