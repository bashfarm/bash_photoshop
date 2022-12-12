import LayerAIContext from 'models/LayerAIContext';
import { storage } from 'uxp';
import React, { useState } from 'react';
import { ContextImage } from './ContextImage';
import { useAsyncEffect } from 'hooks/fetchHooks';
import { getContextHistoryFiles } from 'services/context_service';

export type ContexHistoryBarProps = {
    layerContext: LayerAIContext;
};

export const ContextHistoryBar = (props: ContexHistoryBarProps) => {
    let [localContextHistoryFileEntries, setLocalContextHistoryFileEntries] =
        useState<Array<storage.File>>([]);
    const { data: historyFiles, loading: filesLoading } = useAsyncEffect(() =>
        getContextHistoryFiles(props.layerContext)
    );
    let files = historyFiles as Array<storage.File>;
    setLocalContextHistoryFileEntries(files);

    return (
        <div className="flex flex-row space-x-1">
            {!filesLoading &&
                localContextHistoryFileEntries.map((fEntry, index) => {
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
