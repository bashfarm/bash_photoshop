import React, { useRef, useLayoutEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextItemProps } from './ContextItemProps';
import { Slider } from 'react-uxp-spectrum';
import { getSaveAnimationTimeline } from 'utils/animation_utils';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';
import { useRenderCounter } from 'utils/profiling_utils';

export default function ContextItemSlider(props: ContextItemProps) {
    useRenderCounter('ContextItemSlider');

    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });

    let timelineAnimation = useRef<GSAPTimeline | null>();

    let [sliderValue, setSliderValue] = useState<string>('0');
    let debouncedValue = delayStateEventsForStateValue(
        sliderValue,
        props.inputDelayTime || 0
    );

    let someRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!timelineAnimation?.current) {
            timelineAnimation.current = getSaveAnimationTimeline(someRef);
        }

        if (!timelineAnimation.current?.isActive() && props.animate) {
            timelineAnimation.current?.restart();
        }
    }, [debouncedValue]);

    return (
        <div ref={someRef}>
            {(props.app == 'photoshop' || !props.app) && (
                <Slider
                    variant="filled"
                    min={0}
                    max={100}
                    value={
                        parseFloat(
                            getContextFromStore(props.contextID)[
                                props.contextKey
                            ]
                        ) * 100 || parseInt(sliderValue)
                    }
                    onChange={(event: any) => {
                        setSliderValue(event.target.value);
                        let copyOfContext = getContextFromStore(
                            props.contextID
                        ).copy();
                        copyOfContext[props.contextKey] =
                            parseInt(event.target.value) / 100;
                        saveContextToStore(copyOfContext);
                        if (props.onChange) {
                            props.onChange(event);
                        }
                    }}
                >
                    <sp-label slot="label">{props.children}</sp-label>
                </Slider>
            )}
        </div>
    );
}
