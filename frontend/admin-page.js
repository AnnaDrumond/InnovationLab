const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let dataUrl = new URLSearchParams();

document.addEventListener("DOMContentLoaded", async () => {
	//user controller 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});

	if (userWithSession === 403 || userWithSession === 401) {
		window.location.href = "generalError.html";
	} else {
		//utilizador comum não pode ter acesso a esta página 
		if (userWithSession.type !== UserType.ADMINISTRATOR) {
			window.location.href = "generalError.html";
		}

		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
		
		//user controller linha 483
		const timeout = await doFetchWithResponse(
			urlDefault + "users/get/current/timeout",
			{
				method: "GET",
				"Content-Type": "text/plain",
			},
		);

		if(timeout instanceof Object){
			document.querySelector(".input-admin").value = timeout.timeout;
		}

		//SECÇÃO DE GERIR MEMBROS
		//obter a lista de todos os users
		//user controller linha 896
		const users = await doFetchWithResponse(urlDefault + "users/all", {
			method: "GET",
			"Content-Type": "application/json",
		});
		if(users instanceof Object){
			loadUsersInAdminPage(users, userWithSession.email);
		} else if(users === 401){
			document.getElementById("feedback-manage").classList.remove("visibily-hidden");
		}
	}
});

function loadUsersInAdminPage(users, loggedEmail) {
	users.forEach((user) => {
		//<div class="user-to-see">
		const div = document.createElement("div");
		div.className = "user-to-see";
		div.setAttribute("id", user.email);

		//<img src="" alt="foto do utilizador" class="user-image-admin">
		const img = document.createElement("img");
		img.alt = "foto do utilizador";
		img.className = "user-image-admin";
		let imgAux = user.photo;

		if (user.photo === null || user.photo === "") {
			imgAux = "photoDefault.jpeg";
		}
		img.src = imgAux;
		img.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(user.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		div.appendChild(img);

		//<span class="user-name-admin">Madalena Coimbra</span>
		const span = document.createElement("span");
		span.className = "user-name-admin";
		let nameAux = user.fullName;
		if (user.nickname === "" || user.nickname === null) {
			nameAux = user.fullName;
		} else {
			nameAux = user.fullName + " (" + user.nickname + ")";
		}
		span.innerText = nameAux;

		div.appendChild(span);

		if (user.email !== loggedEmail) {
			//se o utilizador for administrador vai criar o botão para o
			//despromover mas caso seja utilizador standar vai criar o botão para promover
			const button = document.createElement("button");
			button.className = "admin-btn-action";
			if (user.type === UserType.ADMINISTRATOR) {
				//tornar a div com este administrador destacada
				div.classList.add("is-admin");
				//<button class="admin-btn-action hide" id="despromote">TORNAR PARTICIPANTE</button>
				button.setAttribute("id", "despromote");
				button.innerText = "TORNAR PARTICIPANTE";
				button.addEventListener("click", () => {
					dispromoteUser(user.email);
				});
			} else if (user.type === UserType.STANDARD) {
				//<button class="admin-btn-action" id="promote">TORNAR ADMINISTRADOR</button>
				button.setAttribute("id", "promote");
				button.innerText = "TORNAR ADMINISTRADOR";
				button.addEventListener("click", async () => {
					promoteUser(user.email);
				});
			}

			div.appendChild(button);
		} else {
			const button = document.createElement("button");
			button.className = "admin-btn-action";
			div.classList.add("is-admin");
			button.innerText = "EU";
			div.appendChild(button);
		}

		document.querySelector(".users-list-admin").appendChild(div);
	});
}

//método para tornar administrador do sistema em user do tipo standard
async function dispromoteUser(email) {
	//user controller linha 540
	const status = await doFetchNoResponse(
		urlDefault + "users/dispromote/admin",
		{
			method: "POST",
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				email: email,
			},
		},
	);

	if (status === 200) {
		document.getElementById(email).classList.remove("is-admin");
		document.getElementById(email).children[2].remove();
		const buttonAux = document.createElement("button");
		buttonAux.className = "admin-btn-action";
		buttonAux.setAttribute("id", "promote");
		buttonAux.innerText = "TORNAR ADMINISTRADOR";
		buttonAux.addEventListener("click", async (e) => {
			promoteUser(e.target.parentElement.id);
		});
		document.getElementById(email).appendChild(buttonAux);
	} else {
		if(status === 403){
			window.location.href = "generalError.html";
		}
		window.scrollTo(0, 0);
		document.getElementById("feedback-manage").classList.remove("visibily-hidden");

		setTimeout(() => {
			document.getElementById("feedback-manage").classList.add("visibily-hidden");
		}, 3000);
	}
}

//método para promover user do tipo standard a administrador do sistema
async function promoteUser(email) {
	//user controller linha 507
	const status = await doFetchNoResponse(
		urlDefault + "users/promote/to/admin",
		{
			method: "POST",
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				email: email,
			},
		},
	);

	if (status === 200) {
		document.getElementById(email).classList.add("is-admin");
		document.getElementById(email).children[2].remove();
		const buttonAux = document.createElement("button");
		buttonAux.className = "admin-btn-action";
		buttonAux.setAttribute("id", "despromote");
		buttonAux.innerText = "TORNAR PARTICIPANTE";
		buttonAux.addEventListener("click", async (e) => {
			dispromoteUser(e.target.parentElement.id); //
		});
		document.getElementById(email).appendChild(buttonAux);
	} else {
		if(status === 403){
			window.location.href = "generalError.html";
		}
		window.scrollTo(0, 0);
		document.getElementById("feedback-manage").classList.remove("visibily-hidden");

		setTimeout(() => {
			document.getElementById("feedback-manage").classList.add("visibily-hidden");
		}, 3000);
	}
}

//////////////////////////////////////////////////////////////
//BUSCA ATIVA DE UTILIZADORES
const input = document.getElementById("name-or-nickname-admin-page");
const suggestions = document.querySelector(".results-user-admin");
const boxSearch = document.querySelector(".box-search-user-admin");

input.addEventListener("keyup", async () => {
	if (suggestions.children.length > 0) {
		suggestions.removeChild(document.querySelector(".ul-users"));
	}

	if (input.value !== "") {
		//user controller linha 577
		const usersArray = await doFetchWithResponse(
			urlDefault + "users/search/" + input.value,
			{
				method: "GET",
				"Content-Type": "application/json",
			},
		);
		if(usersArray === 403){
			window.location.hred = "generalError.html";
		} if(usersArray === 401){
			document.querySelector(".no-result-users").innerHTML = `<p class = "error-text">Ocorreu um erro a procurar os utilizadores!</p>`;
			setTimeout(() => {
				document.querySelector(".no-result-users").innerHTML = "";
			});
		} else if(usersArray instanceof Object){
			renderResults(usersArray);
		}
	}
});

const boxResultsUser = document.querySelector(".results-user-admin");
//método para renderizar as sugestões na ul
function renderResults(users) {
	if (boxResultsUser.children.length > 0) {
		boxResultsUser.innerHTML = "";
	}

	if (users.length) {
		document.querySelector(".results-user-admin").classList.remove("hide");
		console.log("bué length");

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-users";

		users.forEach((user) => {
			let li = document.createElement("li");
			li.className = "li-user";

			if (user.nickname) {
				li.innerText = user.fullName + " (" + user.nickname + ")";
			} else {
				li.innerText = user.fullName;
			}

			let userImage = document.createElement("img");
			userImage.id = "userImage-active-search";

			if (user.photo) {
				userImage.src = user.photo;
			} else {
				userImage.src = "photoDefault.jpeg";
			}

			li.appendChild(userImage);

			//evento ao clicar na li
			li.addEventListener("click", function () {
				console.log("clique escolher ");
				boxSearch.classList.remove("show");
				document.querySelector(".ul-users").innerHTML = "";
				input.value = user.fullName;
				input.setAttribute("email", user.email);
				document.querySelector(".results-user-admin").classList.add("hide");
			});

			ul.appendChild(li);
		});

		suggestions.appendChild(ul);
		boxSearch.classList.add("show");
	} else {
		document.querySelector(".results-user-admin").classList.add("hide");
		document.querySelector(
			".no-result-users",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-users").innerHTML = "";
		}, 3000);
		input.value = "";
		return boxSearch.classList.remove("show");
	}
}

document.querySelector(".search-user").addEventListener("click", () => {
	let emailToGet = "";
	console.log(emailToGet);
	if (boxResultsUser.children.length > 0) {
		boxResultsUser.innerHTML = "";
	}
	if (input.value === "") {
		emailToGet = null;
	} else {
		emailToGet = input.getAttribute("email");
	}
	if (emailToGet === null || (emailToGet === "" && input.value === "")) {
		document.querySelector(
			".no-result-users",
		).innerHTML = `<p class = "error-text">Preencha a caixa de pesquisa</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-users").innerHTML = "";
		}, 3000);
		input.removeAttribute("email");
		const usersDivs = document.querySelectorAll(".user-to-see");
		usersDivs.forEach((div) => {
			if (div.id !== emailToGet) {
				div.classList.remove("hide");
			}
		});
	} else {
		input.value = "";
		input.removeAttribute("email");
		const usersDivs = document.querySelectorAll(".user-to-see");
		usersDivs.forEach((div) => {
			if (div.id !== emailToGet) {
				div.classList.add("hide");
			} else {
				div.classList.remove("hide");
			}
		});
	}
});

//quando se carrega no botão para mostrar apenas utilizadores do tipo standard
document.getElementById("only-standards").addEventListener("click", () => {
	if (boxResultsUser.children.length > 0) {
		boxResultsUser.innerHTML = "";
	}
	const usersDivs = document.querySelectorAll(".user-to-see");
	usersDivs.forEach((div) => {
		if (div.classList.contains("is-admin")) {
			div.classList.add("hide");
		} else {
			div.classList.remove("hide");
		}
	});
});

//quando se carrega no botão para mostrar apenas administradores do sistema
document.getElementById("only-admins").addEventListener("click", () => {
	if (boxResultsUser.children.length > 0) {
		boxResultsUser.innerHTML = "";
	}
	const usersDivs = document.querySelectorAll(".user-to-see");
	usersDivs.forEach((div) => {
		if (!div.classList.contains("is-admin")) {
			div.classList.add("hide");
		} else {
			div.classList.remove("hide");
		}
	});
});

//para mostrar todos os utilizadores administradores do sistema e do tipo standard
document.getElementById("everyone").addEventListener("click", () => {
	if (boxResultsUser.children.length > 0) {
		boxResultsUser.innerHTML = "";
	}
	const usersDivs = document.querySelectorAll(".user-to-see");
	usersDivs.forEach((div) => {
		div.classList.remove("hide");
	});
});

//GERIR TIMEOUT
document.querySelector(".save-admin").addEventListener("click", async () => {
	const inputValue = document.querySelector(".input-admin").value;

	if (parseInt(inputValue) > 0) {
		//user controller linha 455
		const status = await doFetchNoResponse(
			urlDefault + "users/manage/timeout",
			{
				method: "POST",
				headers: {
					Accept: "*/*",
					"Content-Type": "application/json",
					timeout: inputValue,
				},
			},
		);
		console.log(status);
		if (status === 200) {
			document
				.querySelector("#timeout-warning")
				.classList.remove("visibily-hidden");

			setTimeout(() => {
				document
					.querySelector("#timeout-warning")
					.classList.add("visibily-hidden");
			}, 3000);
		} else {
			if (status === 403) {
				window.location.href = "generalError.html";
			} else {
				document.querySelector("#timeout-warning").innerText =
					"Ocorreu um erro!";
				document
					.querySelector("#timeout-warning")
					.classList.remove("visibily-hidden");

				setTimeout(() => {
					document
						.querySelector("#timeout-warning")
						.classList.add("visibily-hidden");
					document.querySelector("#timeout-warning").innerText =
						"Alterações guardadas!";
				}, 3000);
			}
		}
	} else {
		document.querySelector("#timeout-warning").innerText =
			"Valor inválido!";
		document
			.querySelector("#timeout-warning")
			.classList.remove("visibily-hidden");

		setTimeout(() => {
			document
				.querySelector("#timeout-warning")
				.classList.add("visibily-hidden");
			document.querySelector("#timeout-warning").innerText =
				"Alterações guardadas!";
		}, 3000);
	}
});
