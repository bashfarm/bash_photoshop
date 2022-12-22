import React from 'react';
// import { ContextHistoryBar } from './ContextHistoryBar';

export type ContexToolColumnProps = {
    contextID: string;
};

export const ContextToolColumn = (props: ContexToolColumnProps) => {
    return (
        <>
            <div className="flex flex-col w-2/3">
                {/* History bar is broken 😭 */}
                {/* <ContextHistoryBar  layerID={props.layerID}/> */}
            </div>
        </>
    );
};
