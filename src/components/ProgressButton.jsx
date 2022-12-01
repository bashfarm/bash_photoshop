import React, { useState, useEffect } from 'react';
import BlenderIcon from '@mui/icons-material/Blender';
export const ProgressButton = ({
    longRunningFunction,
    progressQueryFunction,
    pollingSeconds,
    queryResponseParser,
    progressSetter,
    children,
}) => {
    let [timer, SetTimer] = useState({});
    let [progress, SetProgress] = useState(0);

    useEffect(() => {
        if (progress == 1) {
            clearInterval(timer);
        }
    }, [progress]);

    return (
        <>
            <sp-button
                onClick={async () => {
                    longRunningFunction();
                    let timeout = (pollingSeconds ? pollingSeconds : 1) * 1000;
                    let prevVal = -1;
                    SetTimer(
                        setInterval(async () => {
                            try {
                                console.log(
                                    `Currently calling the progress function ${
                                        timeout / 1000
                                    } seconds`
                                );
                                let response = await progressQueryFunction();
                                let progressValue =
                                    queryResponseParser(response);

                                prevVal = progressValue;

                                if (prevVal == 0) {
                                    SetProgress(1);
                                    progressSetter(1);

                                    return;
                                }
                                SetProgress(progressValue);
                                if (progressSetter) {
                                    progressSetter(progressValue);
                                }
                            } catch (e) {
                                SetProgress(1);
                                console.error(e);
                            }
                        }, timeout)
                    );
                }}
            >
                <span>
                    <BlenderIcon></BlenderIcon>
                </span>
                {children}
            </sp-button>
        </>
    );
};
