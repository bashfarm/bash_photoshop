import LayerAIContext from 'models/LayerAIContext';
import { storage } from 'uxp';
import useAsyncEffect from 'use-async-effect/types/index';
import React, { useState } from 'react';
import { ContextImage } from './ContextImage';

export type ContexHistoryBarProps = {
    layerContext: LayerAIContext;
};

export const ContextHistoryBar = (props: ContexHistoryBarProps) => {
    let [localContextHistoryFileEntries, setLocalContextHistoryFileEntries] =
        useState<storage.File[]>([]);

    useAsyncEffect(async (isMounted) => {
        const data = await props.layerContext.getContextHistoryFileEntries();

        if (!isMounted()) return;
        setLocalContextHistoryFileEntries(data);
    }, []);

    return (
        <div className="flex flex-row space-x-1">
            {localContextHistoryFileEntries &&
                localContextHistoryFileEntries.map((fEntry, index) => {
                    return (
                        <ContextImage
                            key={index}
                            imageEntry={fEntry}
                            onClick={() => console.log('not implemented')}
                        />
                    );
                })}
        </div>
    );
};
