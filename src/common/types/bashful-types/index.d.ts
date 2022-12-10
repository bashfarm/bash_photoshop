declare module 'bashful' {
    namespace io {
        type Serializer = (fileName: string, data: string | Uint8Array) => void;
    }
}
