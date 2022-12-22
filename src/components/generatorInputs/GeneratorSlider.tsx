import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { GeneratorProps } from './GeneratorProps';
import { Slider, Textarea } from 'react-uxp-spectrum';
import { getSaveAnimationTimeline } from 'utils/animation_utils';

export function GeneratorSlider(props: GeneratorProps) {
    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    const layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    let [timelineAnimation, setTimelineAnimation] =
        useState<GSAPTimeline | null>(null);

    let someRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!timelineAnimation) {
            let tl = getSaveAnimationTimeline(someRef);

            setTimelineAnimation(tl);
        }

        timelineAnimation?.restart();
        console.log('in generator slider');
        console.log(timelineAnimation);

        console.log(timelineAnimation?.isActive());
    }, [layerContext]);

    return (
        <div ref={someRef}>
            {(props.app == 'photoshop' || !props.app) && (
                <Slider
                    variant="filled"
                    min={0}
                    max={100}
                    value={100 * layerContext.stylingStrength}
                    onChange={(event: any) => {
                        let copyOfContext = layerContext.copy();
                        copyOfContext.stylingStrength =
                            parseInt(event.target.value) / 100;
                        saveContextToStore(copyOfContext);
                    }}
                >
                    <sp-label slot="label">{props.children}</sp-label>
                </Slider>
            )}
        </div>
    );
}
