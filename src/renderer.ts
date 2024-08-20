import './index.css'

import electron, { IpcMainEvent } from 'electron'

let expressPort: number

function onExpressPortFound(event:IpcMainEvent, port:number){
    expressPort = port
}


// use ipc to bind action express-port-found
electron.ipcMain.on('express-port-found', onExpressPortFound)



