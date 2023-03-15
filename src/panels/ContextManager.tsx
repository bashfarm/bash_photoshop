import LayerAIContext from 'models/LayerAIContext';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import ContextItem from '../components/Context/ContextItem';
import { Button, Divider } from 'react-uxp-spectrum';
import { BashfulHeader } from 'components/BashfulHeader';
import ContextToolBar from '../components/ContextManagerToolBar';
import _ from 'lodash';

export default function ContextManager() {
    const saveContextToStore = useContextStore(
        (state) => state.saveContextToStore
    );


	let [contexts, setContexts] = React.useState<LayerAIContext[]>([])


    try {
        return (
            <>
                {/* <BashfulHeader animate={true} /> */}
                <ContextToolBar />
                <div className="mb-1">
                    <Button
                        variant="primary"
                        onClick={async () => {
							let context = new LayerAIContext();
							saveContextToStore(context);
							setContexts([...contexts, context])
							return context;
                        }}
                    >
                        Create New AI Setting
                    </Button>
                </div>
                {contexts.map((context: LayerAIContext) => {
                return (
                    <>
                        <ContextItem key={_.uniqueId()} contextID={context.id} />
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
    } catch (e) {
        console.error(e);
        return <div>error</div>;
    }
}
