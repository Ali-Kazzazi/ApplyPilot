const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const fs = require("fs");
const path = require("path");
let win;
const empty = () => ({
  universities: [],
  professors: [],
  positions: [],
  letters: [],
  events: [],
  tasks: [],
  settings: {},
});
const dbPath = () => path.join(app.getPath("userData"), "applypilot.json");
function load() {
  try {
    return { ...empty(), ...JSON.parse(fs.readFileSync(dbPath(), "utf8")) };
  } catch {
    return empty();
  }
}
function save(data) {
  const file = dbPath(),
    tmp = file + ".tmp";
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.copyFileSync(file, file + ".bak");
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
  return true;
}
function attachmentDir() {
  return path.join(app.getPath("userData"), "attachments");
}
// A dedicated preview window: no native menu, no application toolbar.
let previewWindow = null;
function openLetterPreview(html) {
  if (typeof html !== "string" || html.length > 1000000)
    throw Error("Preview is too large");
  if (previewWindow && !previewWindow.isDestroyed()) previewWindow.close();
  previewWindow = new BrowserWindow({
    width: 850,
    height: 850,
    minWidth: 500,
    minHeight: 400,
    title: "Letter Preview",
    autoHideMenuBar: true,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preview-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  previewWindow.removeMenu();
  previewWindow.setMenuBarVisibility(false);
  previewWindow.loadFile("letter-preview.html");
  previewWindow.webContents.once("did-finish-load", () => {
    if (previewWindow && !previewWindow.isDestroyed())
      previewWindow.webContents.send("letter:content", html);
  });
  previewWindow.on("closed", () => {
    previewWindow = null;
  });
  return true;
}
function create() {
  win = new BrowserWindow({
    width: 1480,
    height: 920,
    minWidth: 940,
    minHeight: 650,
    backgroundColor: "#f5f7fb",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile("index.html");
  win.removeMenu();
}
app.whenReady().then(() => {
  ipcMain.handle("letter:preview", (_, html) => openLetterPreview(html));
  ipcMain.handle("file:attach", async (_, id) => {
    let r = await dialog.showOpenDialog(win, { properties: ["openFile"] });
    if (r.canceled) return null;
    let source = r.filePaths[0],
      ext = path.extname(source),
      name = path.basename(source);
    fs.mkdirSync(attachmentDir(), { recursive: true });
    let relativePath = id + ext.toLowerCase(),
      dest = path.join(attachmentDir(), relativePath);
    fs.copyFileSync(source, dest);
    return { name, relativePath };
  });
  ipcMain.handle("file:open", async (_, filename) => {
    if (!/^[a-f0-9-]+\.[a-z0-9]{1,12}$/i.test(filename))
      throw Error("Invalid attachment path");
    let file = path.join(attachmentDir(), filename);
    if (!fs.existsSync(file)) throw Error("Attachment not found");
    return shell.openPath(file);
  });
  ipcMain.handle("app:notify", (_, title, body) => {
    const { Notification } = require("electron");
    if (Notification.isSupported())
      new Notification({
        title: String(title).slice(0, 150),
        body: String(body).slice(0, 300),
      }).show();
    return true;
  });
  ipcMain.handle("db:load", () => load());
  ipcMain.handle("db:save", (_, d) => save(d));
  ipcMain.handle("db:export", async (_, data) => {
    let r = await dialog.showSaveDialog(win, {
      defaultPath: "applypilot-backup.json",
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (r.canceled) return false;
    fs.writeFileSync(r.filePath, JSON.stringify(data, null, 2));
    return true;
  });
  ipcMain.handle("db:import", async () => {
    let r = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (r.canceled) return null;
    let d = JSON.parse(fs.readFileSync(r.filePaths[0], "utf8"));
    for (const k of Object.keys(empty())) if (!(k in d)) d[k] = empty()[k];
    save(d);
    return d;
  });
  ipcMain.handle("open:external", (_, url) => {
    try {
      let u = new URL(url);
      if (["https:", "http:", "mailto:"].includes(u.protocol))
        return shell.openExternal(u.toString());
    } catch { }
    return false;
  });
  create();
  app.on("activate", () => {
    if (!BrowserWindow.getAllWindows().length) create();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
