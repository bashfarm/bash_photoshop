import React from 'react';
import { Button } from 'react-uxp-spectrum';
import {
    toggleOffContextHidingTool,
    toggleOnContextHidingTool,
} from 'services/tools_service';
import { ContextStoreState, useContextStore } from 'store/contextStore';

export type ContexToolBarColumnProps = {
    contextID: string;
};

export const ContextToolBar = (props: ContexToolBarColumnProps) => {
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    return (
        <div className="flex flex-row space-x-1">
            <Button
                onClick={() =>
                    toggleOnContextHidingTool(
                        getContextFromStore(props.contextID)
                    )
                }
            >
                Hiding Tool
            </Button>
            <Button
                onClick={() =>
                    toggleOffContextHidingTool(
                        getContextFromStore(props.contextID)
                    )
                }
            >
                UnHiding Tool
            </Button>
        </div>
    );
};
