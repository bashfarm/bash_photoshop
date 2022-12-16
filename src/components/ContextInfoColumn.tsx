import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';

export type ContextInfoColumnProps = {
    contextID: string;
};

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    return (
        <div className="flex flex-col bg-brand-dark">
            <ContextLabel
                value={layerContext.currentLayer?.name}
                labelText={'Layer Name:'}
            />
            <ContextLabel
                value={layerContext.currentLayer?.id}
                labelText={'Layer Id:'}
            />
            <ContextLabel
                value={layerContext.currentLayer?.id}
                labelText={'Context Id'}
            />
        </div>
    );
};
