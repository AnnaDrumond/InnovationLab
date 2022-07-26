const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const parameters = new URLSearchParams(window.location.search);
let emailPersonalPage = atob(parameters.get("e"));
let dataUrl = new URLSearchParams(window.location.search);
let viewerList = [];
let filteredListViewers = [];
const headersObj = new Headers();
headersObj.append("email", emailPersonalPage);
const divErrorWarning = document.querySelector(".error-warning");

document.addEventListener("DOMContentLoaded", async () => {
	//
	const typeAction = parameters.get("t");

	// <details class="details"> fechada e normal
	if (typeAction === "delete") {
		document.querySelector(
			".title-delete-by-workplace",
		).parentElement.open = true;
	}

	console.log(emailPersonalPage);
	//ver se tem autorização para cá estar
	//Usercontroller linha 278
	const auth = await doFetchWithResponse(
		urlDefault + "users/has/auth/" + emailPersonalPage,
		{
			method: "GET",
			headers: { "Content-Type": "text/plain" },
		},
	);
	//sem sessao, erro na validação, visitante
	if (auth === 401 || auth === 403) {
		window.location.href = "generalError.html";
		//
	} else if (auth === false) {
		dataUrl.delete("e");
		dataUrl.append("e", btoa(emailPersonalPage));
		window.location.href = "personal-page.html?" + dataUrl;
		//
	} else if (auth === true) {
		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
		getViewers();
	}
});

async function getViewers() {
	console.log("getViewers");
	//
	if (viewerList.length > 0) {
		viewerList = [];
	}
	// buscar lista de visualizadores na bd
	//Usercontroller linha 394
	viewerList = await doFetchWithResponse(
		urlDefault + "users/users/who/can/view/" + emailPersonalPage,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	console.log("voltei do fetch com a lista: ");
	console.log(viewerList);
	//carregar lista
	if (viewerList instanceof Object) {
		loadViewers(viewerList);
		//sem sessao ou visitante
	} else if (forumsList === 403) {
		window.location.href = "generalError.html";
		//erro ao buscar dados
	} else if (forumsList === 401) {
		window.scrollTo(0, 0);
		divErrorWarning.classList.remove("hide");
		divErrorWarning.innerHTML = `<p class = "error-text">Lamentamos, houve um erro ao carregar a lista.Tente mais tarde.</p>`;
		setTimeout(() => {
			divErrorWarning.classList.add("hide");
		}, 4000);
	}
}

const containerViewers = document.querySelector(".users-container");
////////////////////////////////////////////
// carregar lista de viewers
function loadViewers(viewerList) {
	//limpar o container
	for (let i = 0; containerViewers.children.length > 0; i++) {
		console.log("containerGeneral remove child	");
		containerViewers.removeChild(containerViewers.children[0]);
	}
	//
	for (let i = 0; i < viewerList.length; i++) {
		//<div class="user-specific">
		let divUser = document.createElement("div");
		divUser.className = "user-specific";

		//<img id="specific-user-image"
		let userImage = document.createElement("img");
		userImage.id = "specific-user-image";
		if (viewerList[i].photo) {
			userImage.src = viewerList[i].photo;
		} else {
			userImage.src = "photoDefault.jpeg";
		}
		userImage.classList.add("insert-hand");
		userImage.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(viewerList[i].email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		//<span class="specific-user-name" id="specific-user-name">
		let nameUser = document.createElement("span");
		nameUser.className = "specific-user-name";
		nameUser.id = "specific-user-name";
		nameUser.innerHTML = viewerList[i].fullName;

		if (viewerList[i].nickname) {
			nameUser.innerHTML =
				viewerList[i].fullName + " (" + viewerList[i].nickname + ")";
		} else {
			nameUser.innerHTML = viewerList[i].fullName;
		}
		nameUser.classList.add("insert-hand");
		nameUser.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(viewerList[i].email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		//<div class="reject-btn-container">
		let rejectBtnContainer = document.createElement("div");
		rejectBtnContainer.className = "reject-btn-container";

		//<button data-tooltip="eliminar" class="delete-user">
		let rejectBtn = document.createElement("button");
		rejectBtn.className = "delete-user";
		rejectBtn.dataset.tooltip = "eliminar";

		//<i class="fa-solid fa-trash-can delete"></i>
		let rejectIcon = document.createElement("i");
		rejectIcon.className = "fa-solid fa-trash-can delete";
		rejectIcon.addEventListener("click", () => {
			console.log("click em excluir user lixeira");
			//user controller linha 755
			const status = doFetchNoResponse(
				urlDefault + "users/remove/viewerList/" + viewerList[i].email,
				{
					method: "POST",
					"Content-Type": "application/json",
					headers: headersObj,
				},
			);
			console.log("Voltei do fetch " + status);
			containerViewers.removeChild(divUser);
		});

		divUser.appendChild(userImage);
		divUser.appendChild(nameUser);

		//
		rejectBtn.appendChild(rejectIcon);
		rejectBtnContainer.appendChild(rejectBtn);
		divUser.appendChild(rejectBtnContainer);
		containerViewers.appendChild(divUser);
	}
}

const inputSearchUser = document.getElementById("search-name-or-nickname");
//////////////////////////////////////////////////////////////////////////
//botão PESQUISAR
document.querySelector(".search-user").addEventListener("click", async () => {
	console.log("clique em filtrar");
	//
	let inputToSearch = inputSearchUser.value;
	//
	if (inputToSearch.length) {
		//
		if (filteredListViewers.length > 0) {
			filteredListViewers = [];
		}
		//
		// buscar lista filtrada na bd
		//UserController linha 605
		filteredListViewers = await doFetchWithResponse(
			urlDefault +
				"users/filter/" +
				emailPersonalPage +
				"/viewers/by/" +
				inputToSearch,
			{
				method: "GET",
				headers: { "Content-Type": "application/json" },
			},
		);
		console.log("voltei do fetch com a lista filtrada: ");
		console.log(filteredListViewers);
		inputSearchUser.value = "";
		//carregar lista
		if (filteredListViewers instanceof Object) {
			loadViewers(filteredListViewers);
			//erro ao buscar dados
		} else if (filteredListViewers === 401) {
			window.scrollTo(0, 0);
			divErrorWarning.classList.remove("hide");
			divErrorWarning.innerHTML = `<p class = "error-text">Lamentamos, houve um erro ao carregar a lista.Tente mais tarde.</p>`;
			setTimeout(() => {
				divErrorWarning.classList.add("hide");
			}, 4000);
			//sem sessão, sem autorização para estar na página
		} else {
			window.location.href = "generalError.html";
		}

		// se não escreveu nada/selecionou nada na busca
	} else {
		inputSearchUser.placeholder = "Não procuraste por um utilizador!";
		inputSearchUser.classList.add("change-color");
		setTimeout(() => {
			inputSearchUser.placeholder = "Nome, apelido ou alcunha a pesquisar...";
			inputSearchUser.classList.remove("change-color");
		}, 3000);
	}
});
//
//////////////////////////////////////////////////////////////////////////
//botão LIMPAR PESQUISA
document.querySelector(".clear-search").addEventListener("click", () => {
	getViewers();
});
//
//////////////////////////////////////////////////////////////////////////
//Busca ativa por workplace
const inputWorkplace = document.getElementById("search-workplace");
const boxResultsWorkplace = document.querySelector(".results-workplace");
const boxSearchWorkplace = document.querySelector(
	".box-search-workplace-delete",
);
const warningMessageWorkplace = document.querySelector(
	".delete-no-result-workplace",
);

inputWorkplace.addEventListener("keyup", async () => {
	//
	if (boxResultsWorkplace.children.length > 0) {
		boxResultsWorkplace.innerHTML = "";
	}

	if (inputWorkplace.value !== "") {
		//userController linha 856
		const array = await doFetchWithResponse(
			urlDefault + "users/search/active/viewers/" + inputWorkplace.value,
			{
				method: "GET",
				"Content-Type": "application/json",
				headers: headersObj,
			},
		);

		console.log(array);

		if (array.length > 0) {
			renderResultsWorkplace(array);
			//erro ao carregar dados
		} else if (forumsList === 401) {
			window.scrollTo(0, 0);
			divErrorWarning.classList.remove("hide");
			divErrorWarning.innerHTML = `<p class = "error-text">Lamentamos, houve um erro ao carregar a lista.Tente mais tarde.</p>`;
			setTimeout(() => {
				divErrorWarning.classList.add("hide");
			}, 4000);
			//sem sessão, visitante, sem autorização
		} else {
			window.location.href = "generalError.html";
		}
	}
});

//método para renderizar as sugestões na ul
function renderResultsWorkplace(array) {
	//
	if (boxResultsWorkplace.children.length > 0) {
		boxResultsWorkplace.innerHTML = "";
		console.log("ihih");
	}

	//
	if (array.length) {
		boxResultsWorkplace.classList.remove("hide");
		console.log("renderResultsWorkplace");

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-workplace";

		array.forEach((item) => {
			console.log(item);
			let li = document.createElement("li");
			li.className = "li-workplace";

			li.innerText = item;

			//evento ao clicar na li
			li.addEventListener("click", function () {
				//
				console.log("clique escolher ");
				boxResultsWorkplace.classList.add("hide");
				boxSearchWorkplace.classList.remove("show");
				document.querySelector(".ul-workplace").innerHTML = "";
				//colocar o workplace escolhido no input
				inputWorkplace.value = item;
				boxResultsWorkplace.classList.add("hide");
			});

			//colocar cada li dentro da ul
			console.log("li dentro da ul");
			ul.appendChild(li);
		});

		boxResultsWorkplace.appendChild(ul);
		boxSearchWorkplace.classList.add("show");
		//
	} else {
		boxResultsWorkplace.classList.add("hide");

		if (containerViewers.children.length == 0) {
			warningMessageWorkplace.innerHTML = `<p class = "error-text">Sem resultados. Não tens utilizadores em tua lista.</p>`;
		} else {
			warningMessageWorkplace.innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		}

		//  tira a mensagem do ecrã
		setTimeout(function () {
			warningMessageWorkplace.innerHTML = "";
		}, 2500);
		//
		inputWorkplace.value = "";
		return boxSearchWorkplace.classList.remove("show");
	}
}
//////////////////////////////////////////////////////////////////////////
//botão excluir por local de trabalho
document
	.querySelector(".delete-by-workplace")
	.addEventListener("click", async () => {
		//
		let workplace = inputWorkplace.value;

		if (workplace) {
			//UserController linha 821
			let status = await doFetchNoResponse(
				urlDefault +
					"users/remove/viewerList/" +
					emailPersonalPage +
					"/by/" +
					workplace,
				{
					method: "POST",
					"Content-Type": "application/json",
				},
			);

			// console.log("exclui por workplace e tenho o status ");

			if (status === 200) {
				getViewers();
				inputWorkplace.value = "";
				//sem autorizacao
			} else if (status === 403) {
				window.location.href = "generalError.html";
				//erro ao executar a ação
			} else if (status === 401) {
				window.scrollTo(0, 0);
				divErrorWarning.classList.remove("hide");
				divErrorWarning.innerHTML = `<p class = "error-text">Lamentamos, houve um erro ao excluir os utilizadores.Tente mais tarde.</p>`;
				setTimeout(() => {
					divErrorWarning.classList.add("hide");
				}, 4000);
			}

			// erro por não escolher um workplace
		} else {
			warningMessageWorkplace.innerHTML = `<p class = "error-text">Por favor selecione o local de trabalho desejado.</p>`;
		}
		//  tira a mensagem do ecrã
		setTimeout(function () {
			warningMessageWorkplace.innerHTML = "";
		}, 2500);
	});

//////////////////////////////////////////////////////////////////////////
//botão EXCLUIR todos os viewers
document
	.querySelector(".delete-everything")
	.addEventListener("click", async () => {
		document.querySelector(".add-user-one").classList.add("hide");
		document.querySelector(".details").classList.add("hide");
		document.querySelector(".users-container").classList.add("hide");

		const divWithQuestion = document.createElement("div");
		divWithQuestion.className = "project-question";

		const p = document.createElement("p");
		p.className = "project-question-p";
		p.innerText =
			"Confirmas que queres apagar todos os utilizadores da tua lista?";

		divWithQuestion.appendChild(p);

		const errorP = document.createElement("p");
		errorP.className = "project-question-error hide";
		errorP.innerText =
			"Pedimos desculpa mas não foi possível apagar todos os utilizadores da tua lista! Tenta novamente mais tarde!";

		divWithQuestion.appendChild(errorP);

		const buttonDiv = document.createElement("div");
		buttonDiv.className = "project-question-button-div";

		const yesBtn = document.createElement("button");
		yesBtn.className = "div-question-button";
		yesBtn.innerText = "SIM";
		yesBtn.addEventListener("click", async () => {
			// UserController linha 789
			let status = await doFetchNoResponse(
				urlDefault + "users/remove/all/viewerList",
				{
					method: "POST",
					"Content-Type": "application/json",
					headers: headersObj,
				},
			);

			if (status === 200) {
				document.querySelector(".add-user-one").classList.remove("hide");
				document.querySelector(".details").classList.remove("hide");
				document.querySelector(".users-container").classList.remove("hide");
				divWithQuestion.remove();
				//limpar o container
				for (let i = 0; containerViewers.children.length > 0; i++) {
					console.log("containerGeneral remove child	");
					containerViewers.removeChild(containerViewers.children[0]);
				}
				//sem autorização
			} else if (status === 403) {
				window.location.href = "generalError.html";
				//erro ao executar a ação
			} else if (status === 401) {
				window.scrollTo(0, 0);
				divErrorWarning.classList.remove("hide");
				divErrorWarning.innerHTML = `<p class = "error-text">Lamentamos, houve um erro ao apagar os utilizadores! Tente mais tarde.</p>`;
				document.querySelector(".add-user-one").classList.remove("hide");
				document.querySelector(".details").classList.remove("hide");
				document.querySelector(".users-container").classList.remove("hide");
				divWithQuestion.remove();
				setTimeout(() => {
					divErrorWarning.innerHTML = "";
					divErrorWarning.classList.add("hide");
				}, 4000);
			}
		});

		buttonDiv.appendChild(yesBtn);

		const noBtn = document.createElement("button");
		noBtn.className = "div-question-button";
		noBtn.innerText = "NÃO";
		noBtn.addEventListener("click", () => {
			document.querySelector(".add-user-one").classList.remove("hide");
			document.querySelector(".details").classList.remove("hide");
			document.querySelector(".users-container").classList.remove("hide");
			divWithQuestion.remove();
		});

		buttonDiv.appendChild(noBtn);

		divWithQuestion.appendChild(buttonDiv);

		document.querySelector(".body").appendChild(divWithQuestion);
	});

//////////////////////////////////////////////////////////////////////////
//botão VOLTAR
document.querySelector(".go-back-btn").addEventListener("click", () => {
	dataUrl.delete("e");
	dataUrl.append("e", btoa(emailPersonalPage));
	window.location.href = "privacy-security.html?" + dataUrl;
});
