import { UI } from './UI';
import { PageFlip } from '../PageFlip';
import { FlipSetting } from '../Settings';

/**
 * UI for HTML mode
 */
export class DynamicUI extends UI {
    
    constructor(
        inBlock: HTMLElement,
        app: PageFlip,
        setting: FlipSetting
    ) {
        super(inBlock, app, setting);

        // Second wrapper to HTML page
        this.wrapper.innerHTML = '<div class="stf__block"></div>';

        this.distElement = inBlock.querySelector('.stf__block');

        this.setHandlers();
    }

    public clear(): void {
        
    }

    public update(): void {
        this.app.getRender().update();
    }
}
