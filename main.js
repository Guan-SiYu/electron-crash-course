const electron = require("electron");
const url = require("url");
const path = require("path");

const isMac = process.platform === "darwin";
// set env
console.log("isMac =>", isMac, "node_env =>", process.env.NODE_ENV);

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addItemWindow;
// process.env.NODE_ENV = "production";

//Listen for app to be ready
app.on("ready", function () {
    //创建新窗口
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, //要设置为false，才能在渲染进程里面使用require字样
        },
    });
    // 将HTML文件加载到窗口中
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "mainWindow.html"),
            protocol: "file:",
            slashes: true,
        })
    );
    // Quit app when closed
    mainWindow.on("closed", function () {
        app.quit();
    });
    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle create add window
function createAddWindow() {
    // 基本上我们只是要做上面的那些步骤：创建一个新窗口，然后我们加载URL
    //创建新窗口
    addItemWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Shopping List Item",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, //要设置为false，才能在渲染进程里面使用require字样
        },
    });
    // 将HTML文件加载到窗口中
    addItemWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "addWindow.html"),
            protocol: "file:",
            slashes: true,
        })
    );

    //垃圾收集处理:当关闭addItemWindow窗口时，应该将addItemWindow变量设置为null，不然这个窗口会继续继续继续占用内存
    //Garbage collection handle
    addItemWindow.on("close", function () {
        addItemWindow = null;
    });
}

/* receive from addWindow.html and reply 'pong' string as reply-message
ipcMain.on("item:add", function (event, item) {
    console.log(item);
    event.reply("item:add-reply", "pong");
});
*/
ipcMain.on("item:add", (_, itemValue) => {
    console.log("i already receive item value from addWindow.html", itemValue);
    mainWindow.webContents.send("handle-add:item", itemValue);
});

// Create menu template
const mainMenuTemplate = [
    // { role: 'appMenu' }
    ...(isMac
        ? [
              {
                  label: "guan",
                  submenu: [
                      { role: "about" },
                      { type: "separator" },
                      { role: "services" },
                      { type: "separator" },
                      { role: "hide" },
                      { role: "hideOthers" },
                      { role: "unhide" },
                      { type: "separator" },
                      { role: "quit" },
                  ],
              },
          ]
        : []),
    // { role: 'fileMenu' }
    {
        label: "File",
        submenu: isMac
            ? [
                  {
                      label: "要退出",
                      accelerator:
                          process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                      click() {
                          app.quit();
                      },
                  },
                  {
                      label: "Add Item",
                      click() {
                          createAddWindow();
                      },
                  },
                  {
                      label: "Clear Items",
                      click() {
                          mainWindow.webContents.send("handle-clear");
                      },
                  },
              ]
            : [{ role: "quit" }],
    },
    // { role: 'editMenu' }
    {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            ...(isMac
                ? [
                      { role: "pasteAndMatchStyle" },
                      { role: "delete" },
                      { role: "selectAll" },
                      { type: "separator" },
                      {
                          label: "Speech",
                          submenu: [
                              { role: "startSpeaking" },
                              { role: "stopSpeaking" },
                          ],
                      },
                  ]
                : [
                      { role: "delete" },
                      { type: "separator" },
                      { role: "selectAll" },
                  ]),
        ],
    },
    // { role: 'viewMenu' }
    {
        label: "View",
        submenu: [
            { role: "reload" },
            { role: "forceReload" },
            ...(process.env.NODE_ENV !== "production" && [
                {
                    role: "toggleDevTools",
                    /*
					{
						label:'Developer Tools',
						submenu:[{
							label:'Toggle DevTools',
							accerator:process.platform == 'darwin' ? 'Command+I':'Ctrl+I',
							click(item,focusedWindow){
								focusedWindow toggleDevTools()l
							}
						}]
					}
				*/
                },
            ]),
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "togglefullscreen" },
        ],
    },
];
