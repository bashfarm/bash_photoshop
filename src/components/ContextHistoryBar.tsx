import LayerAIContext from 'models/LayerAIContext';
import { storage } from 'uxp';
import React, { useState } from 'react';
import { ContextImage } from './ContextImage';
import { useAsyncEffect } from 'hooks/fetchHooks';
import { getContextHistoryFiles } from 'services/context_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

export type ContexHistoryBarProps = {
    contextID: string;
};

export const ContextHistoryBar = (props: ContexHistoryBarProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    const { value: historyFiles, loading: filesLoading } = useAsyncEffect(
        async () => await getContextHistoryFiles(layerContext)
    );

    return (
        <div className="flex flex-row space-x-1">
            {!filesLoading &&
                historyFiles.map((fEntry: storage.File, index: number) => {
                    return (
                        <ContextImage
                            key={index}
                            imageEntry={fEntry}
                            onClick={() => {
                                console.log('Not Implemented');
                            }}
                        ></ContextImage>
                    );
                })}
        </div>
    );
};
