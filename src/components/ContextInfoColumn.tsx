import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { ContextLabel } from './ContextLabel';

export type ContextInfoColumnProps = {
    layerContext: LayerAIContext;
};

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    console.log('in context info column');
    console.log(props);
    return (
        <div className="flex flex-col bg-brand-dark">
            <ContextLabel
                value={props.layerContext.layers[0].name}
                labelText={'Layer Name:'}
            />
            <ContextLabel
                value={props.layerContext.layers[0].id}
                labelText={'Layer Id:'}
            />
            <ContextLabel
                value={props.layerContext.id as number}
                labelText={'Context Id'}
            />
        </div>
    );
};
