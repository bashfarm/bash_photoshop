import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextLabel } from './ContextLabel';
export type ContextInfoColumnProps = {
    contextID: string;
};

function DefaultContextInfoColumn() {
    return (
        <div className="flex flex-col min-w-fit justify-center">
            <ContextLabel value="No layer Selected" labelText={'Layer Name:'} />
            {/* <ContextLabel value="No layer Selected" labelText={'Layer Id:'} />
            <ContextLabel value="No layer Selected" labelText={'Context ID:'} /> */}
        </div>
    );
}

export const ContextInfoColumn = (props: ContextInfoColumnProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    try {
        return (
            <div className="flex flex-col min-w-fit justify-center">
                <ContextLabel
                    value={layerContext.currentLayer?.name}
                    labelText={'Layer Name:'}
                />
                {/* <ContextLabel
                    value={layerContext.currentLayer?.id}
                    labelText={'Layer Id:'}
                />
                <ContextLabel
                    value={layerContext.id}
                    labelText={'Context ID:'}
                /> */}
            </div>
        );
    } catch (e) {
        console.warn('probably a deleted current layer');
        return <DefaultContextInfoColumn></DefaultContextInfoColumn>;
    }
};
