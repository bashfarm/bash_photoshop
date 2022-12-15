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

interface HistoryFilesHook {
    data: Array<storage.File>;
    loading: boolean;
}

export const ContextHistoryBar = (props: ContexHistoryBarProps) => {
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    let [imageProgress, setImageProgress] = useState(0);
    let [localContextHistoryFileEntries, setLocalContextHistoryFileEntries] =
        useState<Array<storage.File>>([]);

    const { data: historyFiles, loading: filesLoading }: HistoryFilesHook =
        useAsyncEffect(
            async () =>
                await getContextHistoryFiles(
                    getContextFromStore(props.contextID)
                )
        );

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
