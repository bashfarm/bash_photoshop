import React, { useState } from 'react';
import { Button, Divider, Icon, ToolTip } from 'react-uxp-spectrum';

import { ArtistDropdowns } from 'components/StyleReferences';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import StyleReference from 'models/StyleReference';
import { ExtendedHTMLDialogElement } from 'common/types';
import _ from 'lodash';
import { ContextDivider } from 'components/ContextDivider';

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

    function removeStyleReference(styleRef: StyleReference) {
        let newStyleReferences = layerContext.styleReferences.filter(
            (contextStyleRef: StyleReference) =>
                contextStyleRef.id !== styleRef.id
        );
        let copyOfContext = layerContext.copy();
        copyOfContext.styleReferences = newStyleReferences;
        saveContextToStore(copyOfContext);
    }

    function createContextStyleRef() {
        let newStyleReferences = layerContext.styleReferences;
        newStyleReferences.push(new StyleReference());
        let copyOfContext = layerContext.copy();
        copyOfContext.styleReferences = newStyleReferences;
        saveContextToStore(copyOfContext);
    }

    return (
        <div className="flex flex-col">
            <ToolTip>yolo</ToolTip>

            <Button variant="primary" onClick={createContextStyleRef}>
                Add new artist
            </Button>

            {layerContext.styleReferences &&
                layerContext.styleReferences.map((styleRef: StyleReference) => (
                    <ArtistDropdowns
                        key={styleRef.id}
                        contextID={props.contextID}
                        styleRef={styleRef}
                        removeStyleReference={() =>
                            removeStyleReference(styleRef)
                        }
                    />
                ))}

            <ContextDivider animate={false} />

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
        </div>
    );
};
