const axios = require('axios');

const electron = require('electron');

const ipc = electron.ipcRenderer;

$(document).ready(function () {
	function agregarToken(datos) {
		const tokens = localStorage.getItem('cuentas');

		if (!tokens) {
			localStorage.setItem('cuentas', JSON.stringify([datos]));

			return true;
		} else {
			const tokensArr = JSON.parse(tokens);

			const existe = tokensArr.find(
				(x) => x.token && x.token == datos.token
			);

			if (existe) return false;

			tokensArr.push(datos);

			localStorage.setItem('cuentas', JSON.stringify(tokensArr));

			return true;
		}
	}

	$('#login').click(function () {
		ipc.send('app:login', token());
	});

	$('#guardar').click(function () {
		const cuenta = JSON.parse($('#objToken').val());

		if (!agregarToken(cuenta))
			return (document.getElementById('consola').innerHTML =
				"{'text': 'Unable to save the account. Make sure the token is unique.'}");

		document.getElementById(
			'consola'
		).innerHTML = `{'text': 'The account ${cuenta.nombre} has been saved.'}`;

		$('#cuentas-token').html(
			`<img src="${cuenta.avatar}" class="foto-token" alt="Avatar"> ${
				cuenta.nombre.length >= 12
					? cuenta.nombre.substr(0, 12).toUpperCase().concat('...')
					: cuenta.nombre.toUpperCase()
			}`
		);

		actualizarCuentas();

		verGuardar(false);
	});

	$('#eliminar').click(function () {
		const cuenta = JSON.parse($('#objToken').val());

		const tokensArr = JSON.parse(localStorage.getItem('cuentas'));

		const index = tokensArr
			.map(function (x) {
				return x.token;
			})
			.indexOf(cuenta.token);

		tokensArr.splice(index, 1);

		localStorage.setItem('cuentas', JSON.stringify(tokensArr));

		document.getElementById(
			'consola'
		).innerHTML = `{'text': 'The account ${cuenta.nombre} has been deleted successfully.'}`;

		actualizarCuentas();

		$('#cuentas-token').html('Select account');

		verGuardar(true);
	});

	actualizarCuentas();
});

function token() {
	return $('#token').val().trim();
}

function verGuardar(bool) {
	if (bool) {
		$('#guardar').show();
		$('#eliminar').hide();
	} else {
		$('#guardar').hide();
		$('#eliminar').show();
	}
}

function actualizarCuentas() {
	let cuentasArr = [];

	let cuentas = localStorage.getItem('cuentas');

	if (cuentas && JSON.parse(cuentas).length > 0) {
		JSON.parse(cuentas)
			.reverse()
			.forEach((cuenta) => {
				if (cuenta.token != token()) {
					cuentasArr.push(
						`<li><div class="dropdown-item seleccionar-cuenta" value="${
							cuenta.token
						}" title="Token: ${cuenta.token}"><img src="${
							cuenta.avatar
						}" class="foto-token" alt="Avatar"> ${
							cuenta.nombre.length >= 15
								? cuenta.nombre
										.substr(0, 15)
										.toUpperCase()
										.concat('...')
								: cuenta.nombre.toUpperCase()
						}</div></li>`
					);
				}
			});

		if (cuentasArr.length == 0)
			cuentasArr.push(
				`<li><div class="dropdown-item sin-seleccionar">NO MORE ACCOUNTS</div></li>`
			);
	} else {
		cuentasArr.push(
			`<li><div class="dropdown-item sin-seleccionar">WITHOUT SAVED ACCOUNTS</div></li>`
		);
	}

	document.getElementById('cuentas-dropdown').innerHTML = cuentasArr.join(``);

	let elements = document.querySelectorAll('.seleccionar-cuenta');

	for (const element of elements) {
		element.addEventListener(
			'click',
			async function () {
				const tokenVal = this.getAttribute('value');
				$('#token').val(tokenVal);
				const tokens = JSON.parse(localStorage.getItem('cuentas'));
				const cuenta = tokens.find((x) => x.token == tokenVal);
				$('#cuentas-token').html(
					`<img src="${
						cuenta.avatar
					}" class="foto-token" alt="Avatar"> ${
						cuenta.nombre.length >= 12
							? cuenta.nombre
									.substr(0, 12)
									.toUpperCase()
									.concat('...')
							: cuenta.nombre.toUpperCase()
					}`
				);
				verGuardar(false);
				await peticionDiscord();
			},
			false
		);
	}
}

let ejecutado = false;

function actualizarPerfil(usuario) {
	const phoneFns = require('phone-fns');

	const perfil = `
                    <div class="fondo" style="background-image: url('${
						usuario.id
							? usuario.banner
								? `https://cdn.discordapp.com/banners/${usuario.id}/${usuario.banner}.webp`
								: usuario.avatar
								? `https://cdn.discordapp.com/avatars/${usuario.id}/${usuario.avatar}.webp`
								: 'https://cdn.discordapp.com/embed/avatars/0.png'
							: 'https://images4.alphacoders.com/909/thumb-1920-909912.png'
					}');">

                    </div>
                    <div id="contenido" class="contenido${
						ejecutado ? '' : ' anim_arriba_insta'
					}">
                        
                        <button class="menu-token" style="background: transparent; border: none; color: #fff" id="menu-sub" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-ellipsis-h"></i></button>
                        <ul class="dropdown-menu dropdown-menu-end menu-app" style="width: 200px;">
                            <li><div class="dropdown-item seleccionar-menu" id="menu-debug">VIEW DEBUG</div></li>
                            ${
								usuario.id
									? `
                            <li><hr class="dropdown-divider"></li>
                            <li><div class="dropdown-item seleccionar-menu" id="menu-login">LOG IN</div></li>
                            <li><hr class="dropdown-divider"></li>
                            `
									: ''
							}
                        </ul>
                        <img src="${
							usuario.avatar
								? `https://cdn.discordapp.com/avatars/${usuario.id}/${usuario.avatar}.webp`
								: 'https://cdn.discordapp.com/embed/avatars/0.png'
						}" id="avatar" class="foto${
		ejecutado ? '' : ' anim_imagen'
	}" alt="AVATAR OF ${
		usuario.username
			? usuario.username.toUpperCase()
			: 'UNKNOWN'
	}">
                        <div class="texto-foto">
                            <h1 style="font-size: 60px; line-height: 85%; margin: 0;">${
								usuario.username
									? usuario.username.toUpperCase()
									: 'UNKNOWN'
							}<span class="blurple" style="letter-spacing: -2px;">#${
		usuario.discriminator ? usuario.discriminator : '0000'
	}</span></h1>
                            <h4 style="margin-top: 5px; margin-bottom: 10px;">${
								usuario.bio
									? usuario.bio.toUpperCase()
									: 'UNKNOWN DESCRIPTION'
							}</h4>
                            <hr style="background-color: #00000090; height: 10px; margin: 0px 0px 10px 0px; border: none;">
                            <div class="row">
                                <div class="col">
                                    ${
										usuario.email
											? usuario.email.toUpperCase()
											: 'WITHOUT EMAIL'
									}
                                </div>
                                <div class="col">
                                    VERIFIED: ${
										usuario.verified ? 'YES' : 'NO'
									}
                                </div>
                                <div class="col">
                                    NITRO: ${
										usuario.premium_type
											? usuario.premium_type == 1
												? 'CLASSIC'
												: 'BOOST'
											: 'NO'
									}
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    ${
										usuario.phone
											? 'PHONE: '.concat(
													phoneFns.format(
														'+NN NNN NN NN NN',
														usuario.phone
													)
											  )
											: 'WITHOUT PHONE'
									}
                                </div>
                                <div class="col">
                                    2FA ENABLED: ${
										usuario.mfa_enabled ? 'SÍ' : 'NO'
									}
                                </div>
                                <div class="col">
                                    LANGUAGE: ${
										usuario.locale
											? usuario.locale.toUpperCase()
											: 'NO'
									}
                                </div>
                            </div>
                        </div>
                    </div>
                    `;

	ejecutado = true;

	document.getElementById('infousuario').innerHTML = perfil;

	$('#menu-debug').click(function () {
		ipc.send('app:debug');
	});

	$('#menu-login').click(function () {
		ipc.send('app:login', token());
	});

	$('#menu-nada').click(function () {
		alert('Nada');
	});
}

async function peticionDiscord() {
	const resultado = await axios
		.get('https://discordapp.com/api/v9/users/@me', {
			headers: {
				authorization: token()
			}
		})
		.catch((e) => {
			actualizarPerfil({});

			verGuardar(true);

			$('#login').attr('disabled', 'disabled');
			$('#guardar').attr('disabled', 'disabled');
			$('#cuentas-token').html('Select account');

			const tokens = localStorage.getItem('cuentas');

			if (tokens) {
				const tokensArr = JSON.parse(tokens);

				const existe = tokensArr.find(
					(x) => x.token && x.token == token()
				);

				if (existe) {
					document.getElementById(
						'consola'
					).innerHTML = `{'text': 'The account with the token ${token()} has been remove because the token is no longer valid.'}`;
				} else {
					if (e.response) {
						document.getElementById('consola').innerHTML =
							JSON.stringify(e.response.data, null, 2);
					} else {
						document.getElementById('consola').innerHTML =
							e.toString();
					}

					return;
				}

				const index = tokensArr
					.map(function (x) {
						return x.token;
					})
					.indexOf(token());

				tokensArr.splice(index, 1);

				localStorage.setItem('cuentas', JSON.stringify(tokensArr));
			} else {
				if (e.response) {
					document.getElementById('consola').innerHTML =
						JSON.stringify(e.response.data, null, 2);
				} else {
					document.getElementById('consola').innerHTML = e.toString();
				}
			}

			actualizarCuentas();
		});

	if (resultado) {
		const usuario = resultado.data;

		const datosObj = {
			token: token(),
			nombre: usuario.username,
			avatar: usuario.avatar
				? `https://cdn.discordapp.com/avatars/${usuario.id}/${usuario.avatar}.webp`
				: 'https://cdn.discordapp.com/embed/avatars/0.png'
		};

		actualizarPerfil(usuario);

		$('#login').removeAttr('disabled');
		$('#guardar').removeAttr('disabled', 'disabled');
		$('#objToken').val(JSON.stringify(datosObj));

		document.getElementById('consola').innerHTML = JSON.stringify(
			usuario,
			null,
			2
		);

		const tokens = localStorage.getItem('cuentas');

		if (tokens) {
			const tokensArr = JSON.parse(tokens);

			const existe = tokensArr.find(
				(x) => x.token && x.token == datosObj.token
			);

			if (!existe) {
				$('#cuentas-token').html('Select account');

				verGuardar(true);

				actualizarCuentas();

				return;
			}

			const index = tokensArr
				.map(function (x) {
					return x.token;
				})
				.indexOf(datosObj.token);

			tokensArr.splice(index, 1);

			tokensArr.push(datosObj);

			localStorage.setItem('cuentas', JSON.stringify(tokensArr));

			actualizarCuentas();

			$('#cuentas-token').html(
				`<img src="${
					datosObj.avatar
				}" class="foto-token" alt="Avatar"> ${
					datosObj.nombre.length >= 12
						? datosObj.nombre
								.substr(0, 12)
								.toUpperCase()
								.concat('...')
						: datosObj.nombre.toUpperCase()
				}`
			);

			verGuardar(false);
		}
	}
}

document.getElementById('token').addEventListener('input', async function () {
	await peticionDiscord();
});

actualizarPerfil({});
