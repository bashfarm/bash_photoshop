import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-uxp-spectrum';

import { StyleReferencesDialog } from './modals/StyleReferencesDialog';
import { ExtendedHTMLDialogElement } from 'common/types';
import { SmallUIDetailsDialog } from './modals/SmallUIDetailsDialog';

export type RegenerationToolbarProps = {
    contextID: string;
};

export const RegenerationToolbar = (props: RegenerationToolbarProps) => {
    const popupRef = useRef<ExtendedHTMLDialogElement>(); // Reference for the <dialog> element

    function getModal(modalName: string) {
        switch (modalName) {
            case 'styles':
                return (
                    <StyleReferencesDialog
                        handle={popupRef.current}
                        contextID={props.contextID}
                    />
                );
            case 'UIDetail':
                return (
                    <SmallUIDetailsDialog
                        handle={popupRef.current}
                        contextID={props.contextID}
                    />
                );
            default:
                break;
        }
    }

    const popUpModal = async (modalName: string) => {
        if (!popupRef.current) {
            popupRef.current = document.createElement(
                'dialog'
            ) as ExtendedHTMLDialogElement;
            ReactDOM.render(getModal(modalName), popupRef.current);
        }
        document.body.appendChild(popupRef.current);
        await popupRef.current.uxpShowModal({
            title: modalName,
            resize: 'both',
            size: {
                width: 800,
                height: 600,
            },
        });
        popupRef.current.remove();
        popupRef.current = null;
    };
    return (
        <div className="flex flex-row space-x-1">
            <Button onClick={() => popUpModal('styles')}>Styling</Button>
            <Button onClick={() => popUpModal('UIDetail')}>
                Small Details
            </Button>
        </div>
    );
};
