import { VERSION } from './VERSION';

export function loadScript(source, callback, errorCallback) {
    let script = document.createElement('script');
    let priorScript = document.body.getElementsByTagName('script');
    script.async = true;
    script.setAttribute("data-cfasync", 'false');

    if(priorScript && priorScript.length) {
        priorScript[0].parentNode.insertBefore(script, priorScript[0]);
        priorScript = null;
    } else {
        document.body.appendChild(script);
    }

    function load(_, isAbort) {
        if (script != null) { 
          if (isAbort || !(<any>script).readyState || /loaded|complete/.test((<any>script).readyState)) {
            script.onload = (<any>script).onreadystatechange = null;
            script = null;
            script = null;
            if (!isAbort) {
              if (callback) callback();
              callback = null;
              errorCallback = null;
            }
          }
        }
    }

    (<any>script).addEventListener("load", load, false);
    (<any>script).addEventListener("readystatechange", load, false);
    (<any>script).addEventListener("complete", load, false);

    if (errorCallback) {
        script.addEventListener("error", errorCallback, false);
    }
    
    script.src = source + "?v=" + VERSION;
}