import { PDFPage } from '../Page/PDFPage';
import { Orientation, Render } from '../Render/Render';
import { PageCollection } from './PageCollection';
import { PageFlip } from '../PageFlip';
import { PageDensity } from '../Page/Page';
import { PdfJsSetting } from '../Settings';
import { loadScript } from '../Util';

declare var define: any;
declare var require: any;
declare global {
    interface PDFJS {
        getDocument: (_) => {}
    }
}
declare global {
    interface Window { 
        requirejs: any; 
        PDFJS: {
            getDocument: (_) => {},
            workerSrc: string,
            disableAutoFetch: boolean,
            disableStream: boolean,
            imageResourcesPath: string,
            cMapUrl: string,
            cMapPacked: boolean,
            externalLinkTarget: any
        }
    }
}


/**
 * Сlass representing a collection of pages as images on the canvas
 */
export class PDFPageCollection extends PageCollection {
    private readonly pdfjsSetting: PdfJsSetting;
    private readonly pdfSrc: string;
    private readonly distElement: HTMLElement;
    private pdfLoading: any;
    private pdfDocument: any;
    private firstPagePromise: Promise<any>;
    private currentScale: number = 1;
    private pdfjsLib: any = window['pdfjs-dist/build/pdf'];
    private CSS_UNITS: number = 96.0 / 72.0;

    constructor(app: PageFlip, distElement: HTMLElement, render: Render, pdfSrc: string) {
        super(app, render);
        this.distElement = distElement;
        this.pdfSrc = pdfSrc;
        this.pdfjsSetting = app.getSettings().pdfJsSetting;
        this.currentScale = 1;
    }

    public load(): void {
        this.checkRequiredLib();
        /*for (const href of this.imagesHref) {
            const page = new PdfJsPage(this.render, href, PageDensity.SOFT);

            page.load();
            this.pages.push(page);
        }

        this.createSpread();*/
    }

    public destroy() {
        // TODO: destroy PDFPages
        super.destroy();
    }
    
    public show(pageNum: number|null = null) {
        if (pageNum === null) pageNum = this.currentPageIndex;

        if (pageNum < 0 || pageNum >= this.pages.length) return;

        const spreadIndex = this.getSpreadIndexByPage(pageNum);
        if (spreadIndex !== null) {
            this.currentSpreadIndex = spreadIndex;
            this.showSpread();
        }
    }

    public showNext() {
        if (this.currentSpreadIndex < this.getSpread().length) {
            this.currentSpreadIndex++;
            this.showSpread();
        }
    }

    public showPrev() {
        if (this.currentSpreadIndex > 0) {
            this.currentSpreadIndex--;
            this.showSpread();
        }
    }

    /**
     * Show current spread
     */
     protected showSpread(): void {
        const spread = this.getSpread()[this.currentSpreadIndex];

        if (spread.length === 2) {
            this.render.setLeftPage(this.pages[spread[0]]);
            this.render.setRightPage(this.pages[spread[1]]);
        } else {
            if (this.render.getOrientation() === Orientation.LANDSCAPE) {
                if (spread[0] === this.pages.length - 1) {
                    this.render.setLeftPage(this.pages[spread[0]]);
                    this.render.setRightPage(null!);
                } else {
                    this.render.setLeftPage(null!);
                    this.render.setRightPage(this.pages[spread[0]]);
                }
            } else {
                this.render.setLeftPage(null!);
                this.render.setRightPage(this.pages[spread[0]]);
            }
        }

        this.currentPageIndex = spread[0];
        this.app.updatePageIndex(this.currentPageIndex);
    }

    private checkRequiredLib() {
        if(this.pdfjsLib === null) {
            this.app.trigger('loadingPdfJs', this.app);

            loadScript(
                this.pdfjsSetting.pdfjsSrc, 
                () => this.onLoadPdfJsSuccess(), 
                () => this.onFailToLoadPdfJs()
            );
        } else {
            this.loadPdf();
        }
    }
    
    private loadPdf() {
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = this.pdfjsSetting.pdfjsWorkerSrc;

        const docInitParameters = {
            url: this.pdfSrc,
            disableAutoFetch: true,
            disableStream: true,
            // The URL where the predefined Adobe CMaps are located. Include the trailing slash.
            cMapUrl: null,
            cMapPacked: true,
            // Specify maximum number of bytes fetched per range request.
            rangeChunkSize: 524288
            //disableFontFace: isSafari || isIOS || this.pdfjsSetting.disableFontFace === true
        };

        const loading = this.pdfLoading = this.pdfjsLib.getDocument(docInitParameters);
        
        loading.then((pdfDoc) => this.readContentSource(pdfDoc));
        loading.onProgress = (progressData) => this.onLoadingPdfProgress(progressData.loaded, progressData.total);
    }

    private onLoadPdfJsSuccess() {
        const ctx = this;
        if(!window['pdfjs-dist/build/pdf']) {
            throw new Error('pdf.js is loaded successful, but not found any global `window.pdfjsLib`');
        }
        this.pdfjsLib = window['pdfjs-dist/build/pdf'];
        this.loadPdf();
    }

    private onFailToLoadPdfJs() {
        this.app.trigger('loading-pdfjs-services', this.app);
    }

    private readContentSource(pdfDoc) {
        this.pdfDocument = pdfDoc;

        const pagesCount = pdfDoc.numPages;

        // Fetch a single page so we can get a viewport that will be the default
        // viewport for all pages
        let firstPagePromise = pdfDoc.getPage(1);
        this.firstPagePromise = firstPagePromise;
        firstPagePromise.then((pdfPage) => {
            const scale = this.currentScale;
            const viewport = pdfPage.getViewport({ scale: scale * this.CSS_UNITS });

            for (let pageNum = 1; pageNum <= pagesCount; ++pageNum) {
                let page = new PDFPage(this.render, this.distElement, PageDensity.SOFT);

                this.pages.push(page);
            }
        });
        
        this.createSpread();
    }

    private onLoadingPdfProgress(loaded?: number, total?: number) {
        this.app.trigger('loading-pdf-resource', this.app, { 
            loaded: loaded, 
            total: total 
        });
    }
}
