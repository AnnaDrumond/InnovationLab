const containerForums = document.querySelector(".content-container");
const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let forumsList = []; //recebe as listas de forums que vierem da BD
let idsSkillsArray = []; // array de ids que enviaremos ao backend
let skillsFound = []; //skills encontradas na pesquisa do filtro
let idsInterestArray = []; // array de ids que enviaremos ao backend
let interestsFound = []; //interesses encontrados na pesquisa do filtro
let currentCategory = "ALL"; // muda, caso o user acione os botões
let dataUrl = new URLSearchParams();
let listOrder = [];
const forumsDiv = document.querySelector(".content-container");
let resultSortCreationDate = true;
let resultSortLastUpDate = true;
let resultSortVotes = true;
let formattedDate = "";
let userWithSession = "";
let clicked = false;

document.addEventListener("DOMContentLoaded", async () => {
		//user controller 425
	userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});
	//visitantes podem ver o feedForum
	if (userWithSession === 401 || userWithSession === 403) {
		window.location.href = "generalError.html";
	}
	//
	//visitantes também podem ver a lista de foruns
	getAllForums();
	// Se visitante, retirar as opções do Menu e deixar somente o logout
	if (userWithSession.type === UserType.VISITOR) {
		//div de adicionar conteúdos
		document.getElementById("add-dropdown-container").classList.add("hide");
		//icones
		document.getElementById("feed-forum").classList.add("hide");
		document.getElementById("feed-projects").classList.add("hide");
		document.getElementById("feed-notifications").classList.add("hide");
		document.getElementById("my-messages").classList.add("hide");
		//itens dropdown user
		const aMyProfile = document.getElementById("my-profile");
		aMyProfile.parentNode.removeChild(aMyProfile);
		const aEditMyProfile = document.getElementById("edit-my-profile");
		aEditMyProfile.parentNode.removeChild(aEditMyProfile);
		const aPrivacy = document.getElementById("privacy");
		aPrivacy.parentNode.removeChild(aPrivacy);
		const aMyFavorites = document.getElementById("my-favorites");
		aMyFavorites.parentNode.removeChild(aMyFavorites);
		//
		document.getElementById("filter-title").classList.add("hide"),
		document.querySelector(".visitor-warning").classList.remove("hide");
		document.querySelector(".icon-menu").classList.add("width-aux");
		//
	} else {
		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
	}
});

//////////////////////////////////////////////////////////////////
//Ações dos botões
/////////////////////////////////////////////////////////////////
document.getElementById("idea-category").addEventListener("click", () => {
	currentCategory = ForumType.IDEA;
	clicked = true;
	document.getElementById("idea-category").classList.add("clicked");
	document.getElementById("necessity-category").classList.remove("clicked");
	document.getElementById("both-category").classList.remove("clicked");
	//getOnlyIdeas();
});

document.getElementById("necessity-category").addEventListener("click", () => {
	// console.log("click necessidades");
	currentCategory = ForumType.NECESSITY;
	clicked = true;
	document.getElementById("idea-category").classList.remove("clicked");
	document.getElementById("necessity-category").classList.add("clicked");
	document.getElementById("both-category").classList.remove("clicked");
	//getOnlyNecessities();
});

document.getElementById("both-category").addEventListener("click", () => {
	// console.log("click ambos");
	currentCategory = "ALL";
	clicked = true;
	document.getElementById("idea-category").classList.remove("clicked");
	document.getElementById("necessity-category").classList.remove("clicked");
	document.getElementById("both-category").classList.add("clicked");
	//getAllForums();
});

document.getElementById("clear-filters").addEventListener("click", () => {
	/***************************************************************************** */
	document.querySelector(".warning-container").innerHTML = "";
	//fechar a aba de filtro
	document.querySelector(".details").removeAttribute("open");
	currentCategory = "ALL";
	clicked = false;
	document.getElementById("idea-category").classList.remove("clicked");
	document.getElementById("necessity-category").classList.remove("clicked");
	document.getElementById("both-category").classList.remove("clicked");
	getAllForums();
});

// botão filtrar geral
document.getElementById("apply-filter").addEventListener("click", () => {
	document.getElementById("idea-category").classList.remove("clicked");
	document.getElementById("necessity-category").classList.remove("clicked");
	document.getElementById("both-category").classList.remove("clicked");
	filterBySkillAndOrInterest();
});

//////////////////////////////////////////////////////////////////
//Buscar lista geral de Forums - fetch
/////////////////////////////////////////////////////////////////
async function getAllForums() {
	//
	if (forumsList.length) {
		//***************************************** */
		forumsList = [];
	}

	//forum controller linha 472
	forumsList = await doFetchWithResponse(urlDefault + "forum/search/all", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (forumsList === 401) {
		// let forumsDiv = document.querySelector(".content-container");
		for (let i = 0; forumsDiv.children.length > 0; i++) {
			forumsDiv.removeChild(forumsDiv.children[0]);
		}
		document.querySelector(
			".warning-container",
		).innerHTML = `<p class = "warning-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;
	} else if (forumsList === 403) {
		window.location.href = "generalError.html";
	} else if (forumsList instanceof Object) {
		updateData(forumsList);
	}
}

//////////////////////////////////////////////////////////////////
//Buscar lista somente de ideias
/////////////////////////////////////////////////////////////////
async function getOnlyIdeas() {
	//forum controller linha 501
	forumsList = await doFetchWithResponse(urlDefault + "forum/filter/idea", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if (forumsList === 401) {
		for (let i = 0; forumsDiv.children.length > 0; i++) {
			forumsDiv.removeChild(forumsDiv.children[0]);
		}
		document.querySelector(
			".warning-container",
		).innerHTML = `<p class = "warning-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;
	} else if (forumsList === 403) {
		window.location.href = "generalError.html";
	} else if (forumsList instanceof Object) {
		if (forumsList.length) {
			updateData(forumsList);
			//
		} else {
			for (let i = 0; forumsDiv.children.length > 0; i++) {
				forumsDiv.removeChild(forumsDiv.children[0]);
			}
			document.querySelector(
				".warning-container",
			).innerHTML = `<p class = "warning-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		}
	}
}

//////////////////////////////////////////////////////////////////
//Buscar lista somente de necessidades
/////////////////////////////////////////////////////////////////
async function getOnlyNecessities() {
	//forum controller linha 528
	forumsList = await doFetchWithResponse(
		urlDefault + "forum/filter/necessity",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (forumsList === 401) {
		// let forumsDiv = document.querySelector(".content-container");
		for (let i = 0; forumsDiv.children.length > 0; i++) {
			forumsDiv.removeChild(forumsDiv.children[0]);
		}
		document.querySelector(
			".warning-container",
		).innerHTML = `<p class = "warning-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;
		//403 ou outros
	} else if (forumsList === 403) {
		window.location.href = "generalError.html";
	} else if (forumsList instanceof Object) {
		if (forumsList.length) {
			updateData(forumsList);
			//
		} else {
			// let forumsDiv = document.querySelector(".content-container");
			for (let i = 0; forumsDiv.children.length > 0; i++) {
				forumsDiv.removeChild(forumsDiv.children[0]);
			}
			document.querySelector(
				".warning-container",
			).innerHTML = `<p class = "warning-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
			//403 ou outros
		}
	}
}

//////////////////////////////////////////////////////////////////
//Carregar Forum no ecrã
/////////////////////////////////////////////////////////////////
function loadForum(forumsList) {
	document.querySelector(".warning-container").innerHTML = "";

	for (let i = 0; i < forumsList.length; i++) {
		//<div class="forum-simple">
		let divSingleForum = document.createElement("div");
		divSingleForum.className = "forum-simple";

		//<h6 class="forum-type">IDEIA</h6>
		let h6 = document.createElement("h6");
		h6.className = "forum-type";
		if (forumsList[i].type === ForumType.IDEA) {
			h6.textContent = "IDEIA";
		} else {
			h6.textContent = "NECESSIDADE";
		}

		if (userWithSession.type != UserType.VISITOR) {
			//evento ao clicar no titulo do forum
			h6.classList.add("insert-hand");
			h6.addEventListener("click", () => {
				dataUrl.delete("id");
				dataUrl.append("id", forumsList[i].id);
				window.location.href = "seeForum.html?" + dataUrl.toString();
			});
		}

		//<span class="forum-votes">
		let span = document.createElement("span");
		span.className = "forum-votes";
		span.textContent = forumsList[i].totalVotes + " ";

		//<i class="fa-solid fa-thumbs-up"></i>
		let icon = document.createElement("i");
		icon.className = "fa-solid fa-thumbs-up";

		//<h6 class="forum-title">bla bla bla bla bla bla</h6>
		let h6Title = document.createElement("h6");
		h6Title.className = "forum-title";
		h6Title.textContent = forumsList[i].title;

		if (userWithSession.type != UserType.VISITOR) {
			//evento ao clicar no titulo do forum
			h6Title.classList.add("insert-hand");
			h6Title.addEventListener("click", () => {
				dataUrl.delete("id");
				dataUrl.append("id", forumsList[i].id);
				window.location.href = "seeForum.html?" + dataUrl.toString();
			});
		}

		//	<hr />
		let hr = document.createElement("hr");

		//<div class="user-info">
		let divUserInfo = document.createElement("div");
		divUserInfo.className = "user-info";
		//<img id="forum-owner-image"
		let imageUserOwner = document.createElement("img");

		if (forumsList[i].userOwner.photo) {
			imageUserOwner.src = forumsList[i].userOwner.photo;
		} else {
			imageUserOwner.src = "photoDefault.jpeg";
		}

		imageUserOwner.id = "forum-owner-image";

		//<p class="forum-owner-name">Madalena Coimbra</p>
		let pOwnnerName = document.createElement("p");
		pOwnnerName.className = "forum-owner-name";
		pOwnnerName.textContent = forumsList[i].userOwner.fullName + " (criador)";
		//<p class="forum-owner-nickname">(madu)</p>
		let pOwnerNickName = document.createElement("p");
		pOwnerNickName.className = "forum-owner-nickname";
		if (forumsList[i].userOwner.nickName) {
			pOwnerNickName.textContent = "(" + forumsList[i].userOwner.nickname + ")";
		}

		//<!--fim  do que entra na div class="user-info"  -->

		//<div class="forum-dates">
		let divForumDates = document.createElement("div");
		divForumDates.className = "forum-dates";

		//<p class="forum-creation-date-label">
		let pCreationDate = document.createElement("p");
		pCreationDate.className = "forum-creation-date-label";
		pCreationDate.textContent = "Data de criação: ";

		formattedDate = supportFormattedDate(forumsList[i].creationDate);
		//<span id="forum-creation-date">01/01/2001 12:12:12</span>
		let spanDate = document.createElement("span");
		spanDate.id = "forum-creation-date";
		spanDate.textContent = formattedDate;

		//<p class="forum-last-updated-label">
		let pLastUpdated = document.createElement("p");
		pLastUpdated.className = "forum-last-updated-label";
		pLastUpdated.textContent = "Última interação: ";

		formattedDate = supportFormattedDate(forumsList[i].lastUpDate);
		//<span id="forum-last-updated">10/10/2010 12:12:12</span>
		let spanUpdate = document.createElement("span");
		spanUpdate.id = "forum-last-updated";
		spanUpdate.textContent = formattedDate;
		//<!--fim  do que entra em class="forum-dates"  -->

		//Colocar tudo em ordem na div
		divSingleForum.appendChild(h6);

		span.appendChild(icon);
		divSingleForum.appendChild(span);

		divSingleForum.appendChild(h6Title);
		divSingleForum.appendChild(hr);

		//<div class="user-info">:
		divUserInfo.appendChild(imageUserOwner);
		divUserInfo.appendChild(pOwnnerName);
		divUserInfo.appendChild(pOwnerNickName);

		//evento para foto e nome do user
		if (userWithSession.type != UserType.VISITOR) {
			divUserInfo.classList.add("insert-hand");
			divUserInfo.addEventListener("click", () => {
				dataUrl.delete("e");
				dataUrl.append("e", btoa(forumsList[i].userOwner.email));
				window.location.href = "personal-page.html?" + dataUrl;
			});
		}

		divSingleForum.appendChild(divUserInfo);

		//<div class="forum-dates">
		pCreationDate.appendChild(spanDate);
		divForumDates.appendChild(pCreationDate);

		pLastUpdated.appendChild(spanUpdate);
		divForumDates.appendChild(pLastUpdated);
		divSingleForum.appendChild(divForumDates);

		// todos os forums ficam em containerForums
		containerForums.appendChild(divSingleForum);
	}
}

//MÉTODO PARA FAZER A CONVERSÃO DA DATA DO FORMATO AMERICANO PARA O FORMATO EUROPEI (PORTUGUÊS)
function supportFormattedDate(data) {
	let completeDate = data.split(" ");
	let dateFormat = new Date(completeDate[0]);
	if (isNaN(dateFormat)) {
		return data;
	}
	let result =
		dateFormat.getDate().toString().padStart(2, "0") +
		"/" +
		(dateFormat.getMonth() + 1).toString().padStart(2, "0") +
		"/" +
		dateFormat.getFullYear() +
		" " +
		completeDate[1];
	return result;
}

/////////////////////////////////////////////////////////////////
function updateData(forumsList) {
	for (let i = 0; forumsDiv.children.length > 0; i++) {
		forumsDiv.removeChild(forumsDiv.children[0]);
	}
	loadForum(forumsList);
}

//////////////////////////////////////////////////////////////////
//Implementação da lógica de busca ativa/filtros skills
/////////////////////////////////////////////////////////////////
const searchSkillsInput = document.getElementById("input-skill");
const boxSearchSkills = document.querySelector(".box-search-skills");
const boxSkillsResults = document.querySelector(".results-skills");
const divSpanSkills = document.querySelector(".span-skills");

searchSkillsInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxSkillsResults.children.length > 0) {
		boxSkillsResults.removeChild(boxSkillsResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
	console.log("addEventListener keyup");
	//pegar a/s letra/s que o user digitou:
	let input = searchSkillsInput.value;

	// Se tiver algo digitado no input:
	if (input.length) {
		getSkillsBySearchKey(input);
	}
});

//fetch skills
async function getSkillsBySearchKey(input) {
	//skills controller linha 279
	skillsFound = await doFetchWithResponse(
		urlDefault + "skills/search/" + input,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (skillsFound === 401) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
	} else if (skillsFound === 403) {
		window.location.href = "generalError.html";
	} else if (skillsFound instanceof Object) {
		for (let i = 0; i < idsSkillsArray.length; i++) {
			//percorrer o que veio da BD
			for (let j = 0; j < skillsFound.length; j++) {
				//comparar uma lista com a outra e remover a lista que veio da BD aquelas skills que o user já escolheu
				if (skillsFound[j].idSkill == idsSkillsArray[i]) {
					//preciso a posição do elemento no array
					skillsFound.splice(j, 1);
					//remover o span que o user excluiu
				}
			}
		}

		// enviar a lista já "limpa" para renderizar na ul
		renderSkillsResults(skillsFound);
	}
}

function renderSkillsResults(skillsFound) {
	if (!skillsFound.length) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 2000);
		searchSkillsInput.value = "";
		return boxSearchSkills.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-skills";

	for (let i = 0; i < skillsFound.length; i++) {
		let li = document.createElement("li");
		li.className = "li-skill";
		li.innerText = skillsFound[i].title; // aqui seria .title ou algo assim
		// li.setAttribute("id", skillsFound[i].idSkill); // aqui seria skillsFound[i].id

		//evento de adicionar a span com a skill escolhida
		li.addEventListener("click", function (e) {
			console.log("clique  escolher skill");
			loadSpanSkill(skillsFound[i]); // aqui seria a skill toda, com id e titulo
		});
		ul.appendChild(li);
	}
	//colocar a ul dentro da div
	boxSkillsResults.appendChild(ul);
	boxSearchSkills.classList.add("show");
}

//Aqui vai construir o span respetivo
function loadSpanSkill(skillFound) {
	// console.log("loadSpanSkill -------------------");
	// console.log(skillFound);
	//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
	let repeated = false;
	for (let i = 0; i < idsSkillsArray.length; i++) {
		if (idsSkillsArray[i] === skillFound.idSkill) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		console.log("achou repetida");
		//carregar warning:
		searchSkillsInput.placeholder = "Skills já escolhida!!!";
		searchSkillsInput.classList.add("warning-repeated");
		setTimeout(function () {
			searchSkillsInput.placeholder = "pesquise por skills";
			searchSkillsInput.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("NÂO achou repetida");

		//exibir o espaço onde entrarão os spans
		divSpanSkills.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsSkillsArray.push(skillFound.idSkill); // aqui algo tipo skillFound.id

		//console.log(skillFound);
		const sectionSpan = document.getElementById("ids-skills");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = skillFound.title; // aqui algo tipo skillFound.title
		// spanCreated.setAttribute("id", skillFound.idSkill); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			// searchSkillsInput.value = "";
			// removeChild(boxSkillsResults);
			console.log(e.target.parentElement);

			for (let i = 0; i < idsSkillsArray.length; i++) {
				// aqui seria para comparar por ids
				//idsSkills[i].id === skillFound.id
				if (idsSkillsArray[i] == skillFound.idSkill) {
					//preciso a posição do elemento no array
					idsSkillsArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (idsSkillsArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divSpanSkills.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	searchSkillsInput.value = "";
	boxSkillsResults.removeChild(boxSkillsResults.children[0]);
}

//////////////////////////////////////////////////////////////////
//Implementação da lógica de busca ativa/filtros interesses
/////////////////////////////////////////////////////////////////
const divSpanInterests = document.querySelector(".span-interests");
const searchInterestsInput = document.getElementById("input-interest");
const boxSearchInterests = document.querySelector(".box-search-interests");
const boxInterestsResults = document.querySelector(".results-interests");

searchInterestsInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxInterestsResults.children.length > 0) {
		boxInterestsResults.removeChild(boxInterestsResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
	console.log("addEventListener keyup");
	//pegar a/s letra/s que o user digitou:
	let input = searchInterestsInput.value;

	// Se tiver algo digitado no input:
	if (input.length) {
		getInterestsBySearchKey(input);
	}
});

//fetch interesses
async function getInterestsBySearchKey(input) {
	//interest controller linha 206
	interestsFound = await doFetchWithResponse(
		urlDefault + "interests/search/" + input,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (interestsFound === 403) {
		window.location.href = "generalError.html";
	} else if (interestsFound === 401) {
		document.querySelector(
			".no-result-interest",
		).innerHTML = `<p class = "error-text">Erro a carregar os interesses!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-interest").innerHTML = "";
		}, 3000);
	} else if (interestsFound instanceof Object) {
		//percorrer o que o user já escolheu
		for (let i = 0; i < idsInterestArray.length; i++) {
			//percorrer o que veio da BD
			for (let j = 0; j < interestsFound.length; j++) {
				//comparar uma lista com a outra e remover a lista que veio da BD aquelas skills que o user já escolheu
				if (interestsFound[j].idInterest == idsInterestArray[i]) {
					//preciso a posição do elemento no array
					interestsFound.splice(j, 1);
					//remover o span que o user excluiu
				}
			}
		}

		renderInterestsResults(interestsFound);
	}
}

function renderInterestsResults(interestsFound) {
	if (!interestsFound.length) {
		document.querySelector(
			".no-result-interest",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa.</span></p>`;
		// Depois de 2 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-interest").innerHTML = "";
		}, 2000);
		searchInterestsInput.value = "";
		return boxSearchInterests.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-interests";

	for (let i = 0; i < interestsFound.length; i++) {
		let li = document.createElement("li");
		li.className = "li-interest";
		li.innerText = interestsFound[i].title;
		li.setAttribute("id", interestsFound[i].idInterest);

		//evento do botãod e escolher interesse:
		li.addEventListener("click", function (e) {
			// console.log("clique do botão escolher ineteresse");
			loadSpanInterest(interestsFound[i]); // aqui seria tudo, com id e titulo
		});

		//colocar cada li dentro da ul
		ul.appendChild(li);
	}
	//colocar a ul dentro da div
	boxInterestsResults.appendChild(ul);
	boxSearchInterests.classList.add("show");
}

//Aqui vai construir o span respetivo
//ATENÇÂO: tentar evitar que o user escolha duplamente a mesma skills****************************************
function loadSpanInterest(interestFound) {
	//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
	let repeated = false;
	for (let i = 0; i < idsInterestArray.length; i++) {
		if (idsInterestArray[i] === interestFound.idInterest) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		console.log("achou repetida");
		//carregar warning:
		searchInterestsInput.placeholder = "Interesse já escolhido!!!";
		searchInterestsInput.classList.add("warning-repeated");
		setTimeout(function () {
			searchInterestsInput.placeholder = "pesquise por skills";
			searchInterestsInput.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("não achou repetido");
		//exibir o espaço onde entrarão os spans
		divSpanInterests.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsInterestArray.push(interestFound.idInterest); // aqui algo tipo skillFound.id

		const sectionSpan = document.getElementById("ids-interests");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = interestFound.title; // aqui algo tipo skillFound.title
		spanCreated.setAttribute("id", interestFound.idInterest); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			console.log(e.target.parentElement);

			for (let i = 0; i < idsInterestArray.length; i++) {
				// aqui seria para comparar por ids
				//idsSkills[i].id === skillFound.id
				if (idsInterestArray[i] == interestFound.idInterest) {
					//preciso a posição do elemento no array
					idsInterestArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (idsInterestArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divSpanInterests.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	searchInterestsInput.value = "";
	boxInterestsResults.removeChild(boxInterestsResults.children[0]);
}

//////////////////////////////////////////////////////////////////
//Buscar lista filtrada
/////////////////////////////////////////////////////////////////
async function filterBySkillAndOrInterest() {
	console.log("filterBySkillAndOrInterest " + currentCategory);

	let ids = {
		idsSkills: idsSkillsArray,
		idsInterest: idsInterestArray,
	};

	// console.log("criei o body ");
	// console.log(ids);
	// console.log(currentCategory);
	if (forumsList.length) {
		//********************************************************************************** */
		forumsList = [];
	}

	if (
		idsInterestArray.length === 0 &&
		idsSkillsArray.length === 0 &&
		clicked === false
	) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
		document.querySelector(
			".no-result-interest",
		).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
			document.querySelector(".no-result-interest").innerHTML = "";
		}, 2000);
	} else if (
		idsInterestArray.length === 0 &&
		idsSkillsArray.length === 0 &&
		clicked === true
	) {
		//fechar a aba de filtro
		document.querySelector(".details").removeAttribute("open");
		if (currentCategory === ForumType.IDEA) {
			getOnlyIdeas();
		} else if (currentCategory === ForumType.NECESSITY) {
			getOnlyNecessities();
		} else if (currentCategory === "ALL") {
			getAllForums();
		}
	} else {
		//forum controller linha 900
		forumsList = await doFetchWithResponse(
			urlDefault + "forum/filter/skill/andOr/interest/" + currentCategory,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ids),
			},
		);

		if (forumsList === 401) {
			document.querySelector(
				".warning-container",
			).innerHTML = `<p class = "warning-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;
		} else if (forumsList === 403) {
			window.location.href = "generalError.html";
		} else if (forumsList instanceof Object) {
			// console.log("vou limpar tudo.... ");
			//Garantir que esteja tudo zerado, caso o user queira fazer uma nova pesquisa:
			//Limpar os arrays de ids:
			idsSkillsArray = [];
			idsInterestArray = [];

			//remover os spans:
			if (divSpanInterests.children.length > 0) {
				for (let i = 0; divSpanInterests.children.length > 0; i++) {
					divSpanInterests.removeChild(divSpanInterests.children[0]);
				}
			}

			if (divSpanSkills.children.length > 0) {
				for (let i = 0; divSpanSkills.children.length > 0; i++) {
					divSpanSkills.removeChild(divSpanSkills.children[0]);
				}
			}
			//fechar area de spans
			divSpanInterests.classList.add("hide");
			divSpanSkills.classList.add("hide");

			//fechar a aba de filtro
			document.querySelector(".details").removeAttribute("open");

			if (forumsList.length) {
				// a pesquisa retornou com resultados
				updateData(forumsList);
				//
			} else if (forumsList.length === 0) {
				console.log("vou limpar o container");
				for (let i = 0; forumsDiv.children.length > 0; i++) {
					forumsDiv.innerHTML = "";
				}
				//
				document.querySelector(
					".warning-container",
				).innerHTML = `<p class = "warning-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
			} else {
				if (forumsList === 401) {
					// let forumsDiv = document.querySelector(".content-container");
					for (let i = 0; forumsDiv.children.length > 0; i++) {
						forumsDiv.removeChild(forumsDiv.children[0]);
					}
					document.querySelector(
						".warning-container",
					).innerHTML = `<p class = "warning-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;
					//403 ou outros
				} else {
					window.location.href = "generalError.html";
				}
			}
		}
	}
	clicked = false;
}

//////////////////////////////////////////////////////////////////
//Lógica das ordenações
/////////////////////////////////////////////////////////////////
//ORDENAR POR DATA DE CRIAÇÃO
document.getElementById("order-by-creation").addEventListener("click", () => {
	//
	resultSortCreationDate = !resultSortCreationDate;
	// listOrder = forumsList;
	console.log(forumsList);
	if (resultSortCreationDate) {
		console.log(document.getElementById("order-by-creation").children[0]);
		document.getElementById(
			"order-by-creation",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
	} else {
		console.log(document.getElementById("order-by-creation").children[0]);
		document.getElementById(
			"order-by-creation",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
	}
	forumsList.sort(function (a, b) {
		//
		let keyA = new Date(a.creationDate); //seria o nosso creationDate
		let keyB = new Date(b.creationDate);

		console.log("keyA");
		console.log(keyA);
		console.log("keyB");
		console.log(keyB);

		if (resultSortCreationDate) {
			// Essa função deve retornar um número negativo se o primeiro objeto é menor que o segundo
			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			//e zero se ambos são iguais.
			return 0;
			//
		} else {
			//um número positivo se o segundo é menor que o primeiro
			if (keyA < keyB) return 1;
			if (keyA > keyB) return -1;
			//e zero se ambos são iguais.
			return 0;
			//
		}
	});
	console.log("resultSortCreationDate " + resultSortCreationDate);
	console.log("forumsList ordenada ");
	console.log(forumsList);
	updateData(forumsList);
});

//ORDENAR POR LAST UPDATE
document
	.getElementById("order-by-last-updated")
	.addEventListener("click", () => {
		//
		resultSortLastUpDate = !resultSortLastUpDate;
		// listOrder = forumsList;
		console.log(forumsList);
		if (resultSortLastUpDate) {
			console.log(document.getElementById("order-by-last-updated").children[0]);
			document.getElementById(
				"order-by-last-updated",
			).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
		} else {
			console.log(document.getElementById("order-by-last-updated").children[0]);
			document.getElementById(
				"order-by-last-updated",
			).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
		}

		forumsList.sort(function (a, b) {
			//
			let keyA = new Date(a.lastUpDate); //seria o nosso creationDate
			let keyB = new Date(b.lastUpDate);

			console.log("keyA");
			console.log(keyA);
			console.log("keyB");
			console.log(keyB);

			if (resultSortLastUpDate) {
				// Essa função deve retornar um número negativo se o primeiro objeto é menor que o segundo
				if (keyA < keyB) return -1;
				if (keyA > keyB) return 1;
				//e zero se ambos são iguais.
				return 0;
				//
			} else {
				//um número positivo se o segundo é menor que o primeiro
				if (keyA < keyB) return 1;
				if (keyA > keyB) return -1;
				//e zero se ambos são iguais.
				return 0;
				//
			}
		});
		console.log("resultSortLastUpDate " + resultSortLastUpDate);
		console.log("forumsList ordenada ");
		console.log(forumsList);
		updateData(forumsList);
	});

//ORDENAR POR NÚMERO DE VOTOS
document.getElementById("order-by-votes").addEventListener("click", () => {
	//
	resultSortVotes = !resultSortVotes;
	// listOrder = forumsList;
	console.log(forumsList);
	if (resultSortVotes) {
		console.log(document.getElementById("order-by-votes").children[0]);
		document.getElementById(
			"order-by-votes",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
	} else {
		console.log(document.getElementById("order-by-votes").children[0]);
		document.getElementById(
			"order-by-votes",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
	}
	forumsList.sort(function (a, b) {
		//
		let keyA = a.totalVotes;
		let keyB = b.totalVotes;

		console.log("keyA");
		console.log(keyA);
		console.log("keyB");
		console.log(keyB);

		if (resultSortVotes) {
			//DO MENOS NÚMERO DE VOTOS PARA O MAIOR
			// Essa função deve retornar um número negativo se o primeiro objeto é menor que o segundo
			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			//e zero se ambos são iguais.
			return 0;
			//
		} else {
			//DO MAIOR NÚMERO DE VOTOS PARA O MENOR
			//um número positivo se o segundo é menor que o primeiro
			if (keyA < keyB) return 1;
			if (keyA > keyB) return -1;
			//e zero se ambos são iguais.
			return 0;
			//
		}
	});
	updateData(forumsList);
});
