import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextHistoryBar } from './ContextHistoryBar';
import { ContextToolBar } from './ContextToolBar';

export type ContexToolColumnProps = {
    layerID: number;
};

export const ContextToolColumn = (props: ContexToolColumnProps) => {
    return (
        <>
            <div className="flex flex-col w-2/3">
                <ContextToolBar layerID={props.layerID} />
                {/* History bar is broken 😭 */}
                {/* <ContextHistoryBar  /> */}
            </div>
        </>
    );
};
