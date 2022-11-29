import React, { useState, useEffect } from 'react';

export const ProgressButton = ({ longRunningFunction, progressQueryFunction, pollingSeconds, queryResponseParser, progressSetter, children }) => {

	var [timer, SetTimer] = useState({});
	var [progress, SetProgress] = useState(0);
    var [timer, SetTimer] = useState({});

	useEffect(() => {
		if (progress == 1) {
			clearInterval(timer)
		}
	}, [progress]);

	return (
		<>
			<sp-button

				onClick={async () => {
					// Probably always going to be a wrapped function.  Cause you are gonna wanna use the promise at some point.
					longRunningFunction()
					
					let timeout = (pollingSeconds ? pollingSeconds : 1) * 1000;
					let prevVal = -1;
					SetTimer(setInterval(async () => {
						try {
							console.log(`Currently calling the progress function ${timeout / 1000} seconds`)
							let response = await progressQueryFunction()
							let progressValue = queryResponseParser(response)

							prevVal = progressValue

							console.log(prevVal)
							if (prevVal == 0) {
								SetProgress(1)
								progressSetter(1)

								return
							}
							SetProgress(progressValue)
							if(progressSetter){
								progressSetter(progressValue)
							}

						} catch (e) {
							console.error(e)
						}

					}, timeout))
				}
				}
			>
				{children}
			</sp-button>
		</>
	);
};