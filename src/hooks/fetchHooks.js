import { useState, useEffect } from 'react';

/**
 * @typedef {Object} HookType
 * @property {Object} data - Data state
 * @property {Boolean} loading - Loading state
 * @property {String} error - Error string
 */

export const useFetchOnClick = (makeFetchRequest, ...arg) => {
    const [clicked, setClicked] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

export const useFetch = async (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    console.log('usefetch', data, loading, error);
    return { data, loading, error };
};

/**
 * @param {Function} makeFetchRequest that fetches data from an API
 * @returns {HookType} data, loading, error
 */
export const useFetchFunction = (makeFetchRequest) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
