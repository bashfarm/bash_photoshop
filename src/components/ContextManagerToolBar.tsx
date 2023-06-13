import React, { FC, useState } from 'react';
import { PublishIcon, SaveAltIcon, SmartToyIcon } from 'components/icons/index';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import Tool from 'components/Tool';
import {
    loadBashfulProject,
    saveBashfulProject,
} from 'services/bash_app_service';
import { Button, Divider } from 'react-uxp-spectrum';
import { RefreshIcon } from 'components/icons';

interface ToolSectionProps {
    children: React.ReactNode;
}

const ToolSection: FC<ToolSectionProps> = ({ children }) => {
    return <div className="flex items-center justify-between">{children}</div>;
};

// create a type for the props
type ContextToolbarProps = {
    refresh: () => void;
};

export default function ContextToolBar(props: ContextToolbarProps) {
    const getContextStore = useContextStore(
        (state: ContextStoreState) => state.getContextStore
    );

    const setContextStore = useContextStore(
        (state: ContextStoreState) => state.setContextStore
    );

    return (
        <div className="flex w-full border-b border-uxp-host-border-color mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool
                    icon={SaveAltIcon}
                    label="Export Bashful Template"
                    onClick={async () =>
                        await saveBashfulProject(getContextStore())
                    }
                />
                <Tool
                    icon={PublishIcon}
                    label="Import Bashful Template"
                    onClick={async () => {
                        await loadBashfulProject(setContextStore);
                    }}
                />
                {/* create a refresh icon to refresh the manager */}
                <div className="flex justify-center">
                    <Button
                        className="text-center flex-shrink-0"
                        variant="primary"
                        onClick={() => {
                            props.refresh();
                        }}
                    >
                        <RefreshIcon />
                        Sync Auto111
                    </Button>
                </div>
            </ToolSection>
        </div>
    );
}
