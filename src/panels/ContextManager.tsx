import LayerAIContext from 'models/LayerAIContext';
import React, { useEffect, useRef } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { MemoizedContextItem } from '../components/ContextItem/ContextItem';
import { Button, Divider } from 'react-uxp-spectrum';
import { BashfulHeader } from 'components/BashfulHeader';
import ContextToolBar from '../components/ContextManagerToolBar';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { shell } from 'uxp';

async function openDiscordLink() {
    try {
        await shell.openExternal('https://discord.gg/UR9qU8WsFt');
    } catch (e) {
        console.error(e);
    }
}

/**
 * This creates the actual <ContextItem/>s list to be displayed.  This renders the contexts
 * in the order the layers are found in the document.
 * @returns
 */
// TODO: move to its own file or something else - needs refactoring though
function ContextItems() {
    let contexts = useContextStore(
        (state: ContextStoreState) => state.layerContexts
    );

    return (
        <>
            {Object.keys(contexts).map((key) => {
                let context = contexts[key];
                return (
                    <>
                        <MemoizedContextItem
                            key={context.id}
                            contextID={context.id}
                        />
                        <Divider
                            key={_.uniqueId()}
                            className="my-2"
                            size="small"
                        />
                    </>
                );
            })}
        </>
    );
}

const MemoizedContextItems = React.memo(ContextItems);

export default function ContextManager() {
    const saveContextToStore = useContextStore(
        (state) => state.saveContextToStore
    );

    const nextID = useRef(1);

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        saveContextToStore(new LayerAIContext(nextID.current.toString()));
        nextID.current++;
    }

    return (
        <>
            <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] m-0 p-1 items-center justify-left">
                <div>
                    <BashfulHeader animate={false} />
                </div>

                <div
                    onClick={openDiscordLink}
                    className="text-left items-center mb-0 mt-5"
                >
                    <FontAwesomeIcon
                        icon={faDiscord}
                        className="text-purple-500 ml-1 w-6 h-6"
                        style={{ color: '#7e4dfb' }}
                    />
                </div>
            </div>
            <ContextToolBar />
            <div className="mb-1">
                <Button variant="primary" onClick={createNewContext}>
                    Create New AI Setting
                </Button>
            </div>
            <MemoizedContextItems />
        </>
    );
}
