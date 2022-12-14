import React from 'react';
import { Button } from 'react-uxp-spectrum';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from 'services/tools_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

export type ContexToolBarColumnProps = {
    layerID: number;
};

export const ContextToolBar = (props: ContexToolBarColumnProps) => {
    let getAILayerContext = useContextStore(
        (state: ContextStoreState) => state.getAILayerContext
    );
    return (
        <div className="flex flex-row space-x-1">
            <Button
                onClick={() =>
                    toggleOnContextHidingTool(getAILayerContext(props.layerID))
                }
            >
                Hiding Tool
            </Button>
            <Button
                onClick={() =>
                    toggleOffContextHidingTool(getAILayerContext(props.layerID))
                }
            >
                UnHiding Tool
            </Button>
        </div>
    );
};
