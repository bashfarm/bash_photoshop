import LayerAIContext from 'models/LayerAIContext';
import React, { useEffect, useRef } from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { MemoizedContextItem } from '../components/ContextItem/ContextItem';
import { Button, Divider } from 'react-uxp-spectrum';
import { BashfulHeader } from 'components/BashfulHeader';
import ContextToolBar from '../components/ContextManagerToolBar';
import _, { set } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { shell } from 'uxp';
import { getAPIErrors, popUpAPIErrors } from 'services/validation_service';
import { useAsyncEffect } from 'hooks/fetchHooks';
import { RefreshIcon } from 'components/icons';

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
                if (key == '1') {
                    return null;
                }
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
    const getContextFromStore = useContextStore(
        (state) => state.getContextFromStore
    );
    // create a refresh variable to force a rerender
    const [refresh, setRefresh] = React.useState(false);

    const nextID = useRef(1);

    // TODO: This can also be moved since it's using the store, and the store can be called from anywhere
    async function createNewContext() {
        let apiErrors = await getAPIErrors();

        if (apiErrors?.length == 0) {
            saveContextToStore(new LayerAIContext(nextID.current.toString()));
            nextID.current++;
        } else {
            await popUpAPIErrors(apiErrors);
        }
    }

    // create a context setting if there is none by checking the store
    let { loading, value } = useAsyncEffect(async () => {
        if (!getContextFromStore(1)) {
            // While this does work, this is for the future where we batch run the models, currently
            // we would have to make sure each local user swaps out the models when they want to use
            // a different model on a specific layer.  We will collect the selection of models for them
            // queue them up and run them in sequence using the currently loaded model and swap only when
            // necessary.
            await createNewContext();
        } else {
            return getContextFromStore(1);
        }
    }, [refresh]);

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
            <ContextToolBar
                refresh={() => {
                    setRefresh(true);
                    setRefresh(false);
                }}
            />
            {/* create an refresh icon to refresh the manager
            <div className="flex justify-center">
                <Button
                    className="text-center"
                    variant="primary"
                    onClick={() => {
                        setRefresh(true);
                        setRefresh(false);
                    }}
                >
                    <RefreshIcon />
                    Sync Auto111
                </Button>
            </div> */}

            <>
                {!loading && (
                    <>
                        <MemoizedContextItem
                            key={1}
                            contextID={'1'}
                            isPrimary={true}
                        />
                        <Divider
                            key={_.uniqueId()}
                            className="bg-bash_color bash my-2"
                            size="medium"
                        />
                        <div className="mb-1">
                            <Button
                                variant="primary"
                                onClick={createNewContext}
                            >
                                Create New Layer AI Setting
                            </Button>
                            <span className="ml-2 text-white">
                                <em>
                                    *Unlike the above where the setting
                                    regenerates the document, the settings you
                                    create here are to regenerate layers!
                                </em>
                            </span>
                        </div>
                        <MemoizedContextItems />
                    </>
                )}
            </>
        </>
    );
}
