import Spectrum, { Label } from 'react-uxp-spectrum';
import { ContextProps } from './ContextProps';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';
import { getSaveAnimationTimeline } from 'utils/animation_utils';

interface ContextDropdownProps extends ContextProps {
    options: Array<string>;
}

export default function ContextDropdown(props: ContextDropdownProps) {
    const [selectedValue, setSelectedValue] = React.useState<string>(null);

    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });

    let timelineAnimation = useRef<GSAPTimeline | null>();

    let debouncedValue = delayStateEventsForStateValue(
        selectedValue,
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
            <Label>{props.label}</Label>
            <Spectrum.Dropdown>
                <Spectrum.Menu slot="options">
                    {props.options &&
                        props.options.map((value: string) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={value}
                                        onClick={(event: any) => {
                                            setSelectedValue(value);
                                            if (props.contextKey) {
                                                let copyOfContext =
                                                    getContextFromStore(
                                                        props.contextID,
                                                        props.contextType
                                                    ).copy();
                                                copyOfContext[
                                                    props.contextKey
                                                ] = value;
                                                saveContextToStore(
                                                    copyOfContext
                                                );
                                            }
                                            props?.onChange?.(event);
                                        }}
                                        selected={selectedValue == value}
                                    >
                                        {value}
                                    </Spectrum.MenuItem>
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        })}
                </Spectrum.Menu>
            </Spectrum.Dropdown>
        </div>
    );
}
