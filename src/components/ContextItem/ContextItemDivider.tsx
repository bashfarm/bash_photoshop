import { BashfulProps } from 'common/props/BashfulProps';
import React from 'react';
import { useRef, useLayoutEffect } from 'react';
import { getSaveAnimationTimeline } from 'utils/animation_utils';

export function ContextItemDivider(props: BashfulProps) {
    let timelineAnimation = useRef<GSAPTimeline | null>();

    let someRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!timelineAnimation?.current) {
            timelineAnimation.current = getSaveAnimationTimeline(someRef);
        }

        if (
            !timelineAnimation.current?.isActive() &&
            (props.animate == null || props.animate)
        ) {
            timelineAnimation.current?.restart();
        }
    });
    return (
        <div
            ref={someRef}
            className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch my-2"
        ></div>
    );
}
