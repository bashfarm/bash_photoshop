import React, { useEffect, useRef } from 'react';
import { performHeaderAnimationTimeline } from 'utils/animation_utils';
import _ from 'lodash';
import { BashfulProps } from 'common/props/BashfulProps';

export function BashfulHeader(props: BashfulProps) {
    let someRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        performHeaderAnimationTimeline(someRef);
    }, []);

    return (
        <h1 ref={someRef} className="h-14 w-28">
            <span className="inline-block font-bold text-xl bash">B</span>
            <span className="inline-block font-bold text-xl bash">A</span>
            <span className="inline-block font-bold text-xl bash">S</span>
            <span className="inline-block font-bold text-xl bash">H</span>
            <span className="inline-block font-bold text-xl">F</span>
            <span className="inline-block font-bold text-xl">U</span>
            <span className="inline-block font-bold text-xl">L</span>
        </h1>
    );
}
