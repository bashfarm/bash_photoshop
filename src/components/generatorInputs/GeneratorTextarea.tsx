import React, { useRef, useLayoutEffect, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { GeneratorProps } from './GeneratorProps';
import { Textarea } from 'react-uxp-spectrum';
import { getSaveAnimationTimeline } from 'utils/animation_utils';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';

export function GeneratorTextArea(props: GeneratorProps) {
    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });

    let [timelineAnimation, setTimelineAnimation] =
        useState<GSAPTimeline | null>(null);
    let [textValue, setTextValue] = useState<string>(null);
    let debouncedValue = delayStateEventsForStateValue(
        textValue,
        props.inputDelayTime || 0
    );

    function saveText(event: any) {
        let layerContext = getContextFromStore(props.contextID);
        let copyOfContext = layerContext.copy();
        copyOfContext.currentPrompt = event.target.value;
        saveContextToStore(copyOfContext);
        setTextValue(event.target.value);
    }

    let someRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!timelineAnimation) {
            let tl = getSaveAnimationTimeline(someRef);

            setTimelineAnimation(tl);
        }

        timelineAnimation?.restart();
    }, [debouncedValue]);

    return (
        <div ref={someRef} className={props.className}>
            {(props.app == 'photoshop' || !props.app) && (
                <Textarea
                    className={props.className}
                    placeholder="Enter a description of the content in this layer"
                    onInput={(event) => {
                        try {
                            saveText(event);
                        } catch (e) {
                            console.log(e);
                        }
                    }}
                />
            )}
        </div>
    );
}
