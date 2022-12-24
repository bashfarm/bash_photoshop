import Spectrum from 'react-uxp-spectrum';
import { ContextProps } from './ContextProps';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { delayStateEventsForStateValue } from 'hooks/utilHooks';
import { getSaveAnimationTimeline } from 'utils/animation_utils';

interface ContextDropdownProps extends ContextProps {
    options: Array<string>;
}

export function ContextDropdown(props: ContextDropdownProps) {
    const [selectedDocType, setSelectedDocType] = React.useState<string>(null);
    const [docTypes, setDocTypes] = React.useState<Array<string>>(
        props.options
    );

    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });

    let timelineAnimation = useRef<GSAPTimeline | null>();

    let debouncedValue = delayStateEventsForStateValue(
        selectedDocType,
        props.inputDelayTime || 0
    );

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
    }, [debouncedValue]);

    return (
        <Spectrum.Dropdown>
            <Spectrum.Menu slot="options">
                {docTypes &&
                    docTypes.map((docType: string) => {
                        try {
                            return (
                                <Spectrum.MenuItem
                                    key={docType}
                                    onClick={() => {
                                        setSelectedDocType(docType);
                                        let copyOfContext = getContextFromStore(
                                            props.contextID
                                        ).copy();
                                        copyOfContext[props.contextKey] =
                                            docType;
                                        saveContextToStore(copyOfContext);
                                    }}
                                    selected={selectedDocType == docType}
                                >
                                    {docType}
                                </Spectrum.MenuItem>
                            );
                        } catch (e) {
                            console.error(e);
                        }
                    })}
            </Spectrum.Menu>
        </Spectrum.Dropdown>
    );
}
