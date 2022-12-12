import React, { useState, useEffect } from 'react';
import BlenderIcon from '@mui/icons-material/Blender';
import { Button } from 'react-uxp-spectrum';

export type ProgressButtonProps = {
    longRunningFunction: Function;
    progressQueryFunction: Function;
    pollingSeconds: number;
    queryResponseParser: Function;
    progressSetter: Function;
    children: any;
};

export const ProgressButton = (props: ProgressButtonProps) => {
    let [timer, SetTimer] = useState<NodeJS.Timer>(null);
    let [progress, SetProgress] = useState(0);

    useEffect(() => {
        if (progress == 1) {
            clearInterval(timer);
        }
    }, [progress]);

    return (
        <>
            <Button
                onClick={async () => {
                    props.longRunningFunction();
                    let timeout =
                        (props.pollingSeconds ? props.pollingSeconds : 1) *
                        1000;
                    let prevVal = -1;
                    SetTimer(
                        setInterval(async () => {
                            try {
                                console.log(
                                    `Currently calling the progress function ${
                                        timeout / 1000
                                    } seconds`
                                );
                                let response =
                                    await props.progressQueryFunction();
                                let progressValue =
                                    props.queryResponseParser(response);

                                prevVal = progressValue;

                                if (prevVal == 0) {
                                    SetProgress(1);
                                    props.progressSetter(1);

                                    return;
                                }
                                SetProgress(progressValue);
                                if (props.progressSetter) {
                                    props.progressSetter(progressValue);
                                }
                            } catch (e) {
                                console.error(e);
                                // SetProgress(1);
                            }
                        }, timeout)
                    );
                }}
            >
                <span>
                    <BlenderIcon></BlenderIcon>
                </span>
                {props.children}
            </Button>
        </>
    );
};
