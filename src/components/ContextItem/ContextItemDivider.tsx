import { BashfulProps } from 'common/props/BashfulProps';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';
import React from 'react';
import { useRef, useState, useLayoutEffect } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { getSaveAnimationTimeline } from 'utils/animation_utils';
import { useRenderCounter } from 'utils/profiling_utils';

export function ContextItemDivider(props: BashfulProps) {
    useRenderCounter('ContextItemDivider');
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
