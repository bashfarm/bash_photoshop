import React, { useRef, useLayoutEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { GeneratorProps } from './GeneratorProps';
import { Slider } from 'react-uxp-spectrum';
import { getSaveAnimationTimeline } from 'utils/animation_utils';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';

export function GeneratorSlider(props: GeneratorProps) {
    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });

    let [timelineAnimation, setTimelineAnimation] =
        useState<GSAPTimeline | null>(null);
    let [sliderValue, setSliderValue] = useState<string>(null);
    let debouncedValue = delayStateEventsForStateValue(
        sliderValue,
        props.inputDelayTime || 0
    );

    let someRef = useRef<HTMLDivElement>(null);

    function getDisplayValue() {
        if (props.inHundreds) {
            return 100 * parseInt(sliderValue);
        }

        return parseInt(sliderValue);
    }

    function getActualValue(event: any) {
        if (props.inHundreds) {
            return parseInt(event.target.value) / 100;
        }

        return parseInt(sliderValue);
    }

    useLayoutEffect(() => {
        if (!timelineAnimation && (props.animate == null || props.animate)) {
            let tl = getSaveAnimationTimeline(someRef);

            setTimelineAnimation(tl);
        }

        timelineAnimation?.restart();
    }, [debouncedValue]);

    return (
        <div ref={someRef}>
            {(props.app == 'photoshop' || !props.app) && (
                <Slider
                    variant="filled"
                    min={0}
                    max={100}
                    value={getDisplayValue()}
                    onChange={(event: any) => {
                        let copyOfContext = getContextFromStore(
                            props.contextID
                        ).copy();
                        copyOfContext[props.contextKey] = getActualValue(event);
                        setSliderValue(event.target.value);
                        saveContextToStore(copyOfContext);
                        props?.onChange(event);
                    }}
                >
                    <sp-label slot="label">{props.children}</sp-label>
                </Slider>
            )}
        </div>
    );
}
