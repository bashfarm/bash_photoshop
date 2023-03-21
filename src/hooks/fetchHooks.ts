import { useState, useEffect, useCallback } from 'react';

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

interface AsyncHookEffect {
    error: any;
    loading: boolean;
    value: any;
}

export function useAsyncEffect(callback: Function, dependencies: any = []) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [value, setValue] = useState();

    const callbackMemoized = useCallback(() => {
        setLoading(true);
        setError(undefined);
        setValue(undefined);
        callback()
            .then(setValue)
            .catch(setError)
            .finally(() => setLoading(false));
    }, dependencies);

    useEffect(() => {
        callbackMemoized();
    }, [callbackMemoized]);

    return { loading, error, value } as AsyncHookEffect;
}
