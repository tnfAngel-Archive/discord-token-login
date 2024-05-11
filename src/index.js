console.stdlog = console.log.bind(console);

console.logs = [];

console.log = function () {
	console.logs.push(Array.from(arguments));

	console.stdlog.apply(console, arguments);
};

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

if (process.env.NODE_ENV === 'development')
	require('electron-reload')(__dirname);

const ipc = ipcMain;

let tokenLogin = null;

function getToken() {
	return tokenLogin;
}

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 710,
		frame: true,
		backgroundColor: '#333',
		title: 'Discord Token Login by tnfAngel',
		icon: 'assets/icon.ico',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	mainWindow.setMenu(null);
	mainWindow.setTitle('Discord Token Login');
	mainWindow.loadFile(path.join(__dirname, 'views/index.html'));
	mainWindow.setResizable(false);

	console.log('Main window created.');

	mainWindow.on('closed', () => {
		console.log('Main window closed.');

		app.quit();
	});
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', function () {
		console.log('Main application enabled.');

		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

ipc.on('app:debug', () => {
	debugWindow = new BrowserWindow({
		frame: true,
		width: 600,
		height: 600,
		backgroundColor: '#2C2F33',
		title: 'Discord Token Login by tnfAngel',
		icon: 'assets/icon.ico',
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		}
	});

	console.log('Debug window created.');

	debugWindow.setMenu(null);
	debugWindow.setTitle('Discord Token Login Debug');
	debugWindow.loadFile(path.join(__dirname, 'views/debug.html'));

	debugWindow.on('closed', () => console.log('Debug window closed.'));
});

ipc.on('app:login', (event, token) => {
	const discordWindow = new BrowserWindow({
		frame: true,
		width: 1200,
		height: 900,
		backgroundColor: '#2C2F33',
		title: 'Discord Token Login by tnfAngel',
		icon: 'assets/icon.ico',
		webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, 'js/login.js')
		}
	});

	discordWindow.setMenu(null);
	discordWindow.setTitle('Discord Token Login by tnfAngel');
	discordWindow.loadURL('https://discord.com/login');

	discordWindow.on('closed', () =>
		console.log('Discord window closed.')
	);

	console.log('Discord window created.');

	console.log('Login using token:', token);

	tokenLogin = token;

	discordWindow.webContents.setWindowOpenHandler(({ url }) => {
		console.log('External window open:', url);

		return {
			action: 'allow',
			overrideBrowserWindowOptions: {
				frame: true,
				backgroundColor: '#2C2F33',
				title: 'Discord Token Login by tnfAngel',
				icon: 'assets/icon.ico',
				menu: null,
				autoHideMenuBar: true,
				webPreferences: {
					nodeIntegration: false,
					devTools: false
				}
			}
		};
	});
});

app.on('window-all-closed', function () {
	console.log('Every window closed.');

	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('token:request', function (event) {
	event.sender.send('token:reply', getToken());
});

ipcMain.on('debug:request', function (event) {
	event.sender.send('debug:reply', console.logs);
});
