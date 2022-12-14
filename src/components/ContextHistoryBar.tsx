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

interface HistoryFilesHook {
    data: Array<storage.File>;
    loading: boolean;
}

export const ContextHistoryBar = (props: ContexHistoryBarProps) => {
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );
    let [imageProgress, setImageProgress] = useState(0);
    let [localContextHistoryFileEntries, setLocalContextHistoryFileEntries] =
        useState<Array<storage.File>>([]);

    const { data: historyFiles, loading: filesLoading }: HistoryFilesHook =
        useAsyncEffect(
            async () =>
                await getContextHistoryFiles(getAILayerContext(props.layerID))
        );

    // if (!filesLoading) {
    //     console.log(filesLoading);
    //     console.log(historyFiles);
    //     // setLocalContextHistoryFileEntries(historyFiles);
    // }

    // const testfunction = async () => {
    //     console.log(layerID2Context);
    //     console.log(props.layerID);
    //     const t = await getContextHistoryFiles(
    //         getAILayerContext(props.layerID)
    //     );
    //     console.log('resp', t);
    // };
    return (
        <div className="flex flex-row space-x-1">
            {!filesLoading &&
                historyFiles.map((fEntry, index) => {
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
