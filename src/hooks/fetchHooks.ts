import { useState, useEffect } from 'react';



/**
 * @typedef {Object} HookType
 * @property {Array | Object} data - Data state
 * @property {Boolean} loading - Loading state
 * @property {String} error - Error string
 */

/**
 * 
 * @param makeFetchRequest 
 * @param arg 
 * @returns 
 */
export const useFetchOnClick = (makeFetchRequest: Function, ...arg: any[]) => {
    const [clicked, setClicked] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (clicked) {
            const fetchData = async () => {
                try {
                    setLoading(true);
                    const response = await makeFetchRequest(arg);
                    setData(response);
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [clicked, makeFetchRequest, ...arg]);

    return { data, loading, error, setClicked };
};

/**
 * 
 * @param url 
 * @returns 
 */
export const useFetch = async (url: string) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                setData(await response.json());
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);
    return { data, loading, error };
};

/**
 * 
 * @param makeFetchRequest Fetches data from the api
 * @returns 
 */
export const useAsyncEffect = (makeFetchRequest: Function) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await makeFetchRequest();
                setData(response);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [makeFetchRequest]);
    return { data, loading, error };
};
