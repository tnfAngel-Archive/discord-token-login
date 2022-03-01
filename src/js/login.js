const { ipcRenderer } = require('electron');

ipcRenderer.send('token:request');

ipcRenderer.on('token:reply', function (event, token) {
	setInterval(() => {
		document.body.appendChild(
			document.createElement('iframe')
		).contentWindow.localStorage.token = `"${token}"`;
	}, 50);
});
