import React, { useState } from 'react';
import { Button, Divider, Icon } from 'react-uxp-spectrum';

import { ArtistDropdowns, StyleImage } from 'components/StyleReferences';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import StyleReference from 'models/StyleReference';
import _ from 'lodash';
import { ExtendedHTMLDialogElement } from 'common/types';

const StyleReferences: Array<StyleReference> = [
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', '', 'img/cat.jpg', [], [], []),
];
interface ModalProps {
    handle: ExtendedHTMLDialogElement;
    contextID: string;
}

export const StyleReferencesDialog = (props: ModalProps) => {
    let layerContext = useContextStore((state: ContextStoreState) =>
        state.getContextFromStore(props.contextID)
    );

    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );

    // TODO(bgarrard): We will want to have styles be more than just strings at some point.
    let [selectedStyles, setSelectedStyles] = useState<StyleReference[]>([]);

    const toggleStyleSelected = (style: StyleReference) => {
        if (selectedStyles.find((i) => i.id === style.id)) {
            setSelectedStyles(selectedStyles.filter((i) => i.id !== style.id));
        } else {
            setSelectedStyles([...selectedStyles, style]);
        }
        console.log(selectedStyles);
    };

    const buttonHandler = (actionString: string) => {
        let retObj = { message: '', save: false };

        switch (actionString) {
            case 'cancel':
                retObj.message = 'Canceled Dialog';
                break;
            case 'saveStyles':
                retObj.message = 'Styles Saved';
                retObj.save = true;
                props.handle.close();
                break;

            default:
                break;
        }
        let copyOfContext = layerContext.copy();
        copyOfContext.styles = selectedStyles;
        saveContextToStore(copyOfContext);

        //TODO: This can only return a string not an object
        // props.handle.close(retObj);
    };
    return (
        <div className="flex flex-col">
            <ArtistDropdowns />

            <Divider className="my-2" size="small" />

            {/* ❤️‍🔥 TODO:MAKE IMAGES REFERENCE STYLES. The images in the dialog to be displayed! ❤️‍🔥  */}
            {/* <div className="flex flex-wrap mb-4 w-full justify-center">
                {StyleReferences.map((item) => (
                    <StyleImage
                        key={`asset-item-${item.id}`}
                        src={item.src}
                        onSelect={() => {
                            console.log('Selected: ', item);

                            toggleStyleSelected(item);
                        }}
                    />
                ))}
            </div> */}
            {/* ❤️‍🔥 The images in the dialog to be displayed! ❤️‍🔥  */}

            <div className="flex w-1/4 justify-between mx-auto">
                <Icon size="m" name="ui:ChevronLeftMedium"></Icon>
                <Icon size="m" name="ui:ChevronRightMedium"></Icon>
            </div>
            <Button variant="secondary" onClick={() => buttonHandler('cancel')}>
                Cancel
            </Button>
            <Button
                variant="primary"
                onClick={() => buttonHandler('saveStyles')}
            >
                Save Styles
            </Button>
        </div>
    );
};
