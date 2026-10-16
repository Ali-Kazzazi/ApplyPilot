const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('letterPreview',{onContent:callback=>ipcRenderer.on('letter:content',(_event,html)=>callback(html))});
