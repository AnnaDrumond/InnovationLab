const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let contentMessage = "";
let emailsToSendMsg = [];
let usersFound = [];
let userWithSession = "";
const searchUserInput = document.getElementById("input-receiver");
const boxSearchUser = document.querySelector(".box-search-users");
const boxResultsUser = document.querySelector(".results-users");
const divSpanUser = document.querySelector(".span-users");

document.addEventListener("DOMContentLoaded", async () => {
	//confirmar se o user logado não é um visitante
	//user controller linha 425
	userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});
	// 403 - loggedUser.getTypeUser().equals(UserType.VISITOR) ou null
	if (userWithSession == 401 || userWithSession == 403) {
		window.location.href = "generalError.html";
	} else {
		if (userWithSession.type) {
			if (userWithSession.type === UserType.VISITOR) {
				window.location.href = "feedForum.html"; //FALTA ver como ficará
			}
		}
	}

	if (boxResultsUser.children.length > 0) {
		console.log("entrei no if boxResultsUser.children.length > 0");
		boxResultsUser.innerHTML = "";
		// boxResultsUser.removeChild(boxResultsUser.children[0]);
	}

	if (usersFound) {
		usersFound = [];
	}
	getNotificationsOnMenu();
	// só carrega o número de notificações e de mensagens se não for visitante
	setInterval(getNotificationsOnMenu, 5000);
});

//////////////////////////////////////////////////
//Busca ativa por user

searchUserInput.addEventListener("keyup", () => {
	//
	console.log("addEventListener keyup");
	console.log(
		"boxResultsUser.children.length " + boxResultsUser.children.length,
	);

	if (boxResultsUser.children.length > 0) {
		console.log("entrei no if boxResultsUser.children.length > 0");
		boxResultsUser.innerHTML = "";
		// boxResultsUser.removeChild(boxResultsUser.children[0]);
	}

	//Cada vez que for digitada uma letra:
	//pegar a/s letra/s que o user digitou:
	let input = searchUserInput.value;

	// Se tiver algo digitado no input:
	if (input.length) {
		getUsersBySearchKey(input);
	}
});

//fetch buscar user por nome/alcunha/apelido
async function getUsersBySearchKey(input) {
	//
	if (usersFound.length > 0) {
		usersFound = [];
	}

	//users controller linha 577
	usersFound = await doFetchWithResponse(urlDefault + "users/search/" + input, {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	console.log("trouxe os users da BD: ");
	console.log(usersFound);

	if(usersFound === 403){
		window.location.href = "generalError.html";
	} else if(usersFound === 401){
		document.querySelector(
			".no-empty-fields",
		).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a desassociar as ideias!</p>`;
		setTimeout(() => {
			document.querySelector(
				".no-empty-fields",
			).innerHTML = "";
		}, 3000);
	} else if(usersFound instanceof Object){
		if (usersFound.length > 0) {
			for (let j = 0; j < usersFound.length; j++) {
				//
				if (userWithSession.email == usersFound[j].email) {
					usersFound.splice(j, 1);
				}
				//
			}

			for (let i = 0; i < emailsToSendMsg.length; i++) {
				for (let j = 0; j < usersFound.length; j++) {
					if (usersFound[j].email == emailsToSendMsg[i]) {
						usersFound.splice(j, 1);
					}
				}
			}

			console.log("vou renderizar as lis e tenho a lista : ");
			console.log(usersFound);
			// enviar a lista já "limpa" para renderizar na ul
			renderUsersResults(usersFound);
		}
	}
}

//renderizar na ul
function renderUsersResults(usersFound) {
	console.log("renderUsersResults");
	console.log(usersFound);

	if (boxResultsUser.children.length > 0) {
		console.log("entrei no if boxResultsUser.children.length > 0");
		boxResultsUser.innerHTML = "";
		// boxResultsUser.removeChild(boxResultsUser.children[0]);
	}
	//
	if (!usersFound.length) {
		document.querySelector(
			".no-result",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result").innerHTML = "";
		}, 2000);
		searchUserInput.value = "";
		return boxSearchUser.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-users";

	for (let i = 0; i < usersFound.length; i++) {
		//
		let li = document.createElement("li");
		li.className = "li-user";

		if (usersFound[i].nickname) {
			li.innerText =
				usersFound[i].fullName + " (" + usersFound[i].nickname + ")";
		} else {
			li.innerText = usersFound[i].fullName;
		}

		let userImage = document.createElement("img");
		userImage.id = "userImage-active-search";

		if (usersFound[i].photo) {
			userImage.src = usersFound[i].photo;
		} else {
			userImage.src = "photoDefault.jpeg";
		}

		li.appendChild(userImage);

		//evento de adicionar a span com a user escolhida
		li.addEventListener("click", function (e) {
			console.log("clique  escolher user");
			loadSpanUser(usersFound[i]); // aqui seria o user todo
		});

		//colocar cada li dentro da ul
		ul.appendChild(li);
	}
	//colocar a ul dentro da div
	boxResultsUser.appendChild(ul);
	boxSearchUser.classList.add("show");
}

//Aqui vai construir o span respetivo
function loadSpanUser(user) {
	console.log("load user -------------------");
	console.log(user);

	//exibir o espaço onde entrarão os spans
	divSpanUser.classList.remove("hide");

	////////////////////////////////////////////////////////
	//guardar email do destinatário no array que será enviado ao backend
	emailsToSendMsg.push(user.email);

	const sectionSpan = document.getElementById("ids-users");
	let spanCreated = document.createElement("span"); // criar a span
	spanCreated.className = "span-to-user";

	if (user.nickname) {
		spanCreated.innerText = user.fullName + " (" + user.nickname + ")";
	} else {
		spanCreated.innerText = user.fullName;
	}

	let userImage = document.createElement("img");
	userImage.className = "userImage-span-search";
	userImage.setAttribute("align", "center");

	if (user.photo) {
		userImage.src = user.photo;
	} else {
		userImage.src = "photoDefault.jpeg";
	}

	spanCreated.appendChild(userImage);

	//icone de excluir
	let icon = document.createElement("i"); //icone
	icon.className = "fa-solid fa-xmark delete-icon";

	// evento do botão excluir de cada span
	icon.addEventListener("click", function (e) {
		// console.log(e.target.parentElement);

		for (let i = 0; i < emailsToSendMsg.length; i++) {
			if (emailsToSendMsg[i] == user.email) {
				emailsToSendMsg.splice(i, 1);
				sectionSpan.removeChild(e.target.parentElement);
			}
		}

		if (emailsToSendMsg.length === 0) {
			divSpanUser.classList.add("hide");
		}
	});

	spanCreated.appendChild(icon);
	//
	sectionSpan.appendChild(spanCreated);
	// console.log("criei a span e tenho o array de destinatários: ");
	// console.log(emailsToSendMsg);

	//limpar tudo
	searchUserInput.value = "";
	if (boxResultsUser.children[0]) {
		boxResultsUser.removeChild(boxResultsUser.children[0]);
	}
}

//enviar msg
document.querySelector(".send-btn").addEventListener("click", async () => {
	//
	let message = document.getElementById("input-new-message").value;
	let messageTrim = message.trim();

	if (
		emailsToSendMsg.length > 0 &&
		messageTrim.length > 0 &&
		message.value != ""
	) {
		let bodyMessage = {
			content: message,
		};

		for (let i = 0; i < emailsToSendMsg.length; i++) {
			//messages controller linha 50
			responseFetch = await doFetchNoResponse(
				urlDefault + "messages/new/for/" + emailsToSendMsg[i],
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(bodyMessage),
				},
			);
			if(responseFetch ===403){
				window.location.href = "generalError.html";
			}
		}

		// mensagens e erro, sucesso e warning
		document.querySelector(".new-messages-input").classList.add("hide");
		document.querySelector(".send-btn").classList.add("hide");
		document.querySelector(".new-message-label").classList.add("hide");

		const h4 = document.createElement("h4");
		h4.className = "message-sent";

		if (responseFetch == 200) {
			console.log("mensagem enviada");
			h4.innerText = "Mensagem enviada!";
			//
			setTimeout(() => {
				window.location.href = "messages.html?tp=ibx"
			}, 3000);
		} else {
			console.log("erro");
			h4.innerText =
				"Pedimos desculpa, mas ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.";
		}

		document.querySelector(".new-message-container").append(h4);

		setTimeout(function () {
			document.querySelector(".new-message-container").removeChild(h4);
			document.querySelector(".new-messages-input").classList.remove("hide");
			document.querySelector(".send-btn").classList.remove("hide");
			document.querySelector(".new-message-label").classList.remove("hide");
		}, 3000);

		//Limpar tudo
		emailsToSendMsg = [];
		console.log("limpar emailsToSendMsg");
		console.log(emailsToSendMsg);
		document.getElementById("input-new-message").value = "";

		//retirar os spans
		if (divSpanUser.children.length > 0) {
			for (let i = 0; divSpanUser.children.length > 0; i++) {
				divSpanUser.removeChild(divSpanUser.children[0]);
			}
		}
		//fechar areas de spans
		divSpanUser.classList.add("hide");

		//campos vazios
		//no-empty-fields
	} else {
		const pEmptyFields = document.querySelector(".no-empty-fields");
		pEmptyFields.innerText = "Não podem existir campos vazios!";
		setTimeout(() => {
			pEmptyFields.innerText = "";
		}, 3000);
	}
});

//VOLTAR
document.querySelector(".go-back-btn").addEventListener("click", function (e) {
	window.location.href = "messages.html?tp=ibx";
});
