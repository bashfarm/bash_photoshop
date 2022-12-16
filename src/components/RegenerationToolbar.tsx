import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-uxp-spectrum';

import { ContextStoreState, useContextStore } from 'store/contextStore';
import { StyleReferencesDialog } from './modals/StyleReferencesDialog';

export type RegenerationToolbarProps = {
    contextID: string;
};

export const RegenerationToolbar = (props: RegenerationToolbarProps) => {
    const popupRef = useRef<any>(); // Reference for the <dialog> element

    const popUpModal = async () => {
        if (!popupRef.current) {
            popupRef.current = document.createElement('dialog');
            ReactDOM.render(
                <StyleReferencesDialog
                    handle={popupRef.current}
                    contextID={props.contextID}
                />,
                popupRef.current
            );
        }
        document.body.appendChild(popupRef.current);

        await popupRef.current.uxpShowModal({
            title: 'Please authenticate...',
            resize: 'both',
            size: {
                width: 400,
                height: 200,
            },
        });
        popupRef.current.remove();
    };
    return (
        <div className="flex flex-row space-x-1">
            <Button onClick={popUpModal}>Pop Up</Button>
        </div>
    );
};
