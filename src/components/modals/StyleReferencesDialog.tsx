import React, { useState } from 'react';
import { Button, Divider, Icon } from 'react-uxp-spectrum';

import { ArtistDropdowns, StyleImage } from 'components/StyleReferences';
import LayerAIContext from 'models/LayerAIContext';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import StyleReference from 'models/StyleReference';

const StyleReferences: Array<StyleReference> = [
    new StyleReference('kitty', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', 'img/cat.jpg', [], [], []),
    new StyleReference('kitty', 'img/cat.jpg', [], [], []),
];

interface ModalProps {
    handle: any;
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
    let [selectedStyles, setSelectedStyles] = useState<Array<StyleReference>>();

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

        props.handle.close(retObj);
    };
    return (
        <div className="flex flex-col">
            {/* <ArtistDropdowns /> */}

            <Divider className="my-2" size="small" />

            <div className="flex flex-wrap mb-4 w-full justify-center">
                {StyleReferences.map((item) => (
                    <StyleImage
                        key={`asset-item-${item.id}`}
                        src={item.src}
                        onSelect={() => {
                            console.log('Selected: ', item);
                            setSelectedStyles([item, ...selectedStyles]);
                        }}
                    />
                ))}
            </div>

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
