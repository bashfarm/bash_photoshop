import React from 'react';
import { useRenderCounter } from 'utils/profiling_utils';

export type ContexToolColumnProps = {
    contextID: string;
};

export default function ContextItemToolColumn(props: ContexToolColumnProps) {
    useRenderCounter('ContextItemToolColumn');

    return (
        <>
            <div className="flex flex-col w-2/3"></div>
        </>
    );
}

export const MemoizedContextItemToolColumn = React.memo(ContextItemToolColumn);
