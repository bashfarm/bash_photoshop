import LayerAIContext from 'models/LayerAIContext';
import { storage } from 'uxp';
import React, { useState } from 'react';
import { ContextImage } from './ContextImage';
import { useAsyncEffect } from 'hooks/fetchHooks';
import { getContextHistoryFiles } from 'services/context_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

export type ContexHistoryBarProps = {
    layerID: number;
};

export const ContextHistoryBar = (props: ContexHistoryBarProps) => {
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );
    let [imageProgress, setImageProgress] = useState(0);
    let [localContextHistoryFileEntries, setLocalContextHistoryFileEntries] =
        useState<Array<storage.File>>([]);
    const { data: historyFiles, loading: filesLoading } = useAsyncEffect(() =>
        getContextHistoryFiles(getAILayerContext(props.layerID))
    );
    setLocalContextHistoryFileEntries(historyFiles);

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
