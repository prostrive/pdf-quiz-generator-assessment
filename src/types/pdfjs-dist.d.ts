declare module 'pdfjs-dist/build/pdf' {
    import type { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

    type GetDocumentParams =
        | string
        | Uint8Array
        | ArrayBuffer
        | { url?: string; data?: Uint8Array | ArrayBuffer };

    export const getDocument: (params: GetDocumentParams) => { promise: Promise<PDFDocumentProxy> };
    export const GlobalWorkerOptions: {
        workerSrc: string;
    };
}