import React, { ReactElement, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-uxp-spectrum';
import { StyleReferencesDialog, SmallUIDetailsDialog } from './modals';
import { ExtendedHTMLDialogElement } from 'common/types';

export type RegenerationToolbarProps = {
    contextID: string;
};

export const RegenerationToolbar = (props: RegenerationToolbarProps) => {
    const popupRef = useRef<ExtendedHTMLDialogElement>();

    const popUpModal = async (modalComponent: ReactElement, title: string) => {
        if (!popupRef.current) {
            popupRef.current = document.createElement(
                'dialog'
            ) as ExtendedHTMLDialogElement;
            ReactDOM.render(modalComponent, popupRef.current);
        }
        document.body.appendChild(popupRef.current);
        await popupRef.current.uxpShowModal({
            title: title,
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
            <Button
                onClick={() =>
                    popUpModal(
                        <StyleReferencesDialog
                            handle={popupRef.current}
                            contextID={props.contextID}
                        />,
                        'Styles'
                    )
                }
            >
                Styling
            </Button>
            <Button
                onClick={() =>
                    popUpModal(
                        <SmallUIDetailsDialog
                            handle={popupRef.current}
                            contextID={props.contextID}
                        />,
                        'UI Details'
                    )
                }
            >
                Small Details
            </Button>
        </div>
    );
};
