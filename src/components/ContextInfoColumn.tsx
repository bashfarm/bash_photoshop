import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';

export type ContextInfoColumnProps = {
    layerID: number;
};

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );
    return (
        <div className="flex flex-col bg-brand-dark">
            <ContextLabel
                value={getAILayerContext(props.layerID)?.layers[0]?.name}
                labelText={'Layer Name:'}
            />
            <ContextLabel
                value={getAILayerContext(props.layerID)?.layers[0]?.id}
                labelText={'Layer Id:'}
            />
            <ContextLabel
                value={getAILayerContext(props.layerID)?.id}
                labelText={'Context Id'}
            />
        </div>
    );
};
