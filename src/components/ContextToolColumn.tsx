import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { ContextHistoryBar } from './ContextHistoryBar';
import { ContextToolBar } from './ContextToolBar';

export type ContexToolColumnProps = {
    layerContext: LayerAIContext;
};

export const ContextToolColumn = (props: ContexToolColumnProps) => {
    return (
        <>
            <div className="flex flex-col w-2/3">
                <ContextToolBar layerContext={props.layerContext} />
                {/* History bar is broken 😭 */}
                {/* <ContextHistoryBar layerContext={props.layerContext} /> */}
            </div>
        </>
    );
};
