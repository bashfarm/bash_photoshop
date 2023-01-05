import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { performHeaderAnimationTimeline } from 'utils/animation_utils';
import _ from 'lodash';
import { BashfulProps } from 'common/props/BashfulProps';
import { useContextStore } from 'store/contextStore';

export function BashfulHeader(props: BashfulProps) {
    let store = useContextStore();

    let someRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        performHeaderAnimationTimeline(someRef);
    });

    return (
        <h1 ref={someRef} className="h-14 w-28">
            <span className="inline-block font-bold text-xl bash">B</span>
            <span className="inline-block font-bold text-xl bash">A</span>
            <span className="inline-block font-bold text-xl bash">S</span>
            <span className="inline-block font-bold text-xl bash">H</span>
            <span className="inline-block font-bold text-xl">F</span>
            <span className="inline-block font-bold text-xl">U</span>
            <span className="inline-block font-bold text-xl">L</span>
            {/* Don't do this, leaving this here as a lesson.  This will cause the animations to run before they elements appear */}
            {/* {"Bashful".split('').map((letter, index) => {
				return (
					<span key={index} className="inline-block">
						{letter}
					</span>
				);
			})} */}
        </h1>
    );
}
