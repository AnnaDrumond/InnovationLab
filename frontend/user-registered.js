const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const paramUserRegistered = new URLSearchParams(window.location.search);
let dataUrl = new URLSearchParams();
const type = paramUserRegistered.get("tp");
const emailOwnerPage = atob(paramUserRegistered.get("e"));
//
let statusProject = "";
let contentDataBase = [];
let ideas = []; // array de ideias
let necessities = []; // rarray de necessidades
let contentType = "";
let idsSkillsArray = []; // array de ids que enviaremos ao backend
let skillsFound = []; //skills encontradas na pesquisa do filtro
let idsInterestArray = []; // array de ids que enviaremos ao backend
let interestsFound = []; //interesses encontrados na pesquisa do filtro
let ownerPage = ""; // dono da pagina pessoal
let typeForumToSearch = ""; // categoria do forum a pesquisar (idea/necessity)
let forumsList = [];
let projectList = [];
//
const headersObj = new Headers();
headersObj.append("email", emailOwnerPage);
//
const containerGeneral = document.querySelector(".content-container");
const titlePage = document.querySelector(".user-registered-h4");
const pErrorText = document.querySelector(".already-have-project");
//
let resultSortCreationDate = true;
let resultSortVotes = true;

document.addEventListener("DOMContentLoaded", async () => {
	//confirmar se o user logado não é um visitante
	//pode ser um admin ou o próprio user dono da area pessoal
	//user controller linha 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});
	//
	if (userWithSession == 401 || userWithSession == 403) {
		window.location.href = "generalError.html";
	} else {
		if (userWithSession.type) {
			if (userWithSession.type === UserType.VISITOR) {
				window.location.href = "feedForum.html"; //FALTA ver como ficará
			}
		}
	}

	// se não for visitante segue...
	getNotificationsOnMenu();
	// carregar o total de notificações e de mensagens não lidas, buscando o valor atual a cada 5 segundos
	setInterval(getNotificationsOnMenu, 5000);
	//user controller linha 338
	ownerPage = await doFetchWithResponse(urlDefault + "users/search/by/email", {
		method: "GET",
		"Content-Type": "application/json",
		headers: headersObj,
	});

	if (ownerPage instanceof Object) {
		//
		if (type === "id") {
			contentType = ForumType.IDEA;
			getForumsRegistered();
			document.title = "Ideias Registadas";
			if (ownerPage.nickname) {
				titlePage.innerText =
					"Ideias Registadas por " +
					ownerPage.firstName +
					" " +
					ownerPage.lastName +
					" (" +
					ownerPage.nickname +
					")";
			} else {
				titlePage.innerText =
					"Ideias Registadas por " +
					ownerPage.firstName +
					" " +
					ownerPage.lastName;
			}
			typeForumToSearch = "idea";
			//carregar ideias
		} else if (type === "ncy") {
			contentType = ForumType.NECESSITY;
			getForumsRegistered();
			document.title = "Necessidades Registadas";
			if (ownerPage.nickname) {
				titlePage.innerText =
					"Necessidades Registadas por " +
					ownerPage.firstName +
					" " +
					ownerPage.lastName +
					" (" +
					ownerPage.nickname +
					")";
			} else {
				titlePage.innerText =
					"Necessidades Registadas por " +
					ownerPage.firstName +
					" " +
					ownerPage.lastName;
			}
			typeForumToSearch = "necessity";
		} else if (type === "pjt") {
			//buscar projetos na BD
			getProjectsWithUserParticipation();
			contentType = "PROJECT";
			document.title = "Projetos Registados";
			if (ownerPage.nickname) {
				titlePage.innerText =
					"Projetos Registados por " +
					ownerPage.firstName +
					" " +
					ownerPage.lastName +
					" (" +
					ownerPage.nickname +
					")";
			} else {
				titlePage.innerText =
					"Projetos Registados por " +
					ownerPage.firstName +
					" " +
					ownerPage.lastName;
			}
			document
				.getElementById("filter-interest-user-registered")
				.classList.add("hide");
		}
	} else if (ownerPage == 401 || ownerPage == 403) {
		window.location.href = "feedForum.html";
	}
});

//botão LIMPAR FILTRO
document
	.getElementById("clear-filter-registered")
	.addEventListener("click", () => {
		sort = "";
		document.querySelector(".warning-container").innerHTML = "";
		//fechar a aba de filtro
		document.querySelector(".details").removeAttribute("open");

		if (contentDataBase.length) {
			contentDataBase = [];
		}
		//
		if (type === "id" || type === "ncy") {
			getForumsRegistered();
			//
		} else if (type === "pjt") {
			getProjectsWithUserParticipation();
		}
	});

////////////////////////////////////////////////////////
// BUSCAR IDEIAS/NECESSIDADES REGISTADAS PELO  USER OWNER DA PÁGINA
////////////////////////////////////////////////////////
async function getForumsRegistered() {
	//
	console.log("getForumsRegistered...");

	if (necessities.length || ideas.length) {
		necessities = [];
		ideas = [];
	}

	//fetch linha 419
	forumsList = await doFetchWithResponse(urlDefault + "forum/registered", {
		method: "GET",
		"Content-Type": "application/json",
		headers: headersObj,
	});

	if (forumsList instanceof Object) {
		console.log("voltei do fetch...getForumsRegistered:");
		console.log(forumsList);

		if (forumsList.length > 0) {
			for (let i = 0; i < forumsList.length; i++) {
				if (forumsList[i].type == ForumType.IDEA) {
					ideas.push(forumsList[i]);
				} else {
					necessities.push(forumsList[i]);
				}
			}
		}

		if (contentType == ForumType.IDEA) {
			loadData(ideas);
		} else {
			loadData(necessities);
		}
	} else if (forumsList === 403) {
		window.location.href = "generalError.html";
	} else if (forumsList === 401) {
		console.log("401");
		pErrorText.classList.remove("hide");
	}
}

////////////////////////////////////////////////////////
// BUSCAR PROJETOS COM A PARTICIPAÇÃO DO USER OWNER DA PÁGINA
////////////////////////////////////////////////////////
async function getProjectsWithUserParticipation() {
	//
	console.log("getProjectsWithUserParticipation...");
	//fetch linha 1290
	// No header estará o user de quem estou vendo a area pessoal
	projectList = await doFetchWithResponse(urlDefault + "projects/is/member", {
		method: "GET",
		"Content-Type": "application/json",
		headers: headersObj,
	});

	if (projectList instanceof Object) {
		//
		console.log("voltei do fetch...getProjectsWithUserParticipation:");
		console.log(projectList);
		if (projectList.length > 0) {
			loadData(projectList);
		} else {
			document.getElementById("registered-filter-title").classList.add("hide");
			document.querySelector(".order-forum").classList.add("hide");
			document.querySelector(".content-container").innerHTML = `<p class="already-have-project">
			O utilizador não registou conteúdo</p>`;	
		}
		//
	} else if (projectList === 403) {
		window.location.href = "generalError.html";
	} else if (projectList === 401) {
		pErrorText.classList.remove("hide");
	}
}

////////////////////////////////////////////////////////
// CARREGAR DADOS NA PÁGINA
////////////////////////////////////////////////////////
function loadData(data) {
	console.log("loadData -- ");
	console.log(data);
	//
	for (let i = 0; containerGeneral.children.length > 0; i++) {
		console.log("containerGeneral remove child	");
		containerGeneral.removeChild(containerGeneral.children[0]);
	}

	if(data.length > 0){

	for (let i = 0; i < data.length; i++) {
		//const containerGeneral = document.querySelector(".content-container");
		let divSingleForum = document.createElement("div");
		divSingleForum.className = "forum-simple";

		//<h6 class="forum-type">IDEIA</h6>
		let h6 = document.createElement("h6");
		h6.className = "forum-type";
		if (contentType == ForumType.IDEA) {
			h6.textContent = "IDEIA";
		} else if (contentType == ForumType.NECESSITY) {
			h6.textContent = "NECESSIDADE";
		} else {
			statusProject = "";
			if (data[i].active == false) {
				statusProject = "(TERMINADO)";
			}
			h6.textContent = "PROJETO " + statusProject;
		}

		//<span class="forum-votes">
		//	span.textContent = projects[i].votes + " ";
		let span = document.createElement("span");
		span.className = "forum-votes";
		if (contentType == ForumType.IDEA || contentType == ForumType.NECESSITY) {
			span.textContent = data[i].totalVotes + " ";
		} else {
			span.textContent = data[i].votes + " ";
		}

		//<i class="fa-solid fa-thumbs-up"></i>
		let icon = document.createElement("i");
		icon.className = "fa-solid fa-thumbs-up";

		//<h6 class="forum-title">bla bla bla bla bla bla</h6>
		let h6Title = document.createElement("h6");
		h6Title.className = "forum-title";
		h6Title.textContent = data[i].title;

		//evento ao clicar no titulo do forum
		h6Title.addEventListener("click", () => {
			if (contentType == ForumType.IDEA || contentType == ForumType.NECESSITY) {
				dataUrl.delete("id");
				dataUrl.delete("p");
				dataUrl.append("id", data[i].id);
				window.location.href = "seeForum.html?" + dataUrl.toString();
			} else {
				dataUrl.delete("id");
				dataUrl.delete("p");
				dataUrl.append("p", data[i].id);
				window.location.href = "seeProject.html?" + dataUrl.toString();
			}
		});

		//	<hr />
		let hr = document.createElement("hr");

		//<div class="user-info">
		let divUserInfo = document.createElement("div");
		divUserInfo.className = "user-info";
		divUserInfo.classList.add("insert-hand");
		//<img id="forum-owner-image"
		let imageUserOwner = document.createElement("img");
		imageUserOwner.id = "forum-owner-image";
		if (contentType == ForumType.IDEA || contentType == ForumType.NECESSITY) {
			if (data[i].userOwner.photo) {
				imageUserOwner.src = data[i].userOwner.photo;
			} else {
				imageUserOwner.src = "photoDefault.jpeg";
			}
		} else {
			if (data[i].ownerProj.photo) {
				imageUserOwner.src = data[i].ownerProj.photo;
			} else {
				imageUserOwner.src = "photoDefault.jpeg";
			}
		}

		//<p class="forum-owner-name">Madalena Coimbra</p>
		let pOwnnerName = document.createElement("p");
		pOwnnerName.className = "forum-owner-name";
		if (contentType == ForumType.IDEA || contentType == ForumType.NECESSITY) {
			pOwnnerName.textContent = data[i].userOwner.fullName + " (criador)";
		} else {
			pOwnnerName.textContent = data[i].ownerProj.fullName + " (criador)";
		}

		//<p class="forum-owner-nickname">(madu)</p>
		let pOwnerNickName = document.createElement("p");
		pOwnerNickName.className = "forum-owner-nickname";

		if (contentType == ForumType.IDEA || contentType == ForumType.NECESSITY) {
			if (data[i].userOwner.nickname) {
				pOwnerNickName.textContent = "(" + data[i].userOwner.nickname + ")";
			}
		} else {
			if (data[i].ownerProj.nickname) {
				pOwnerNickName.textContent = "(" + data[i].ownerProj.nickname + ")";
			}
		}

		//<!--fim  do que entra na div class="user-info"  -->

		//<div class="forum-dates">
		let divForumDates = document.createElement("div");
		divForumDates.className = "forum-dates";

		//<p class="forum-creation-date-label">
		let pCreationDate = document.createElement("p");
		pCreationDate.className = "forum-creation-date-label";
		pCreationDate.textContent = "Data de criação: ";

		//<span id="forum-creation-date">01/01/2001 12:12:12</span>
		let formattedDate = supportFormattedDate(data[i].creationDate);
		let spanDate = document.createElement("span");
		spanDate.id = "forum-creation-date";
		spanDate.textContent = formattedDate;

		let pLastUpdated = document.createElement("p");
		pLastUpdated.className = "forum-last-updated-label";
		pLastUpdated.textContent = "Última atualização: ";

		//<p class="forum-last-updated-label">

		//<span id="forum-last-updated">10/10/2010 12:12:12</span>
		formattedDate =
			contentType == ForumType.IDEA || contentType == ForumType.NECESSITY
				? supportFormattedDate(data[i].lastUpDate)
				: supportFormattedDate(data[i].lastUpdate);
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
		divUserInfo.addEventListener("click", () => {
			dataUrl.delete("e");
			if (contentType == ForumType.IDEA || contentType == ForumType.NECESSITY) {
				dataUrl.append("e", btoa(data[i].userOwner.email));
				window.location.href = "personal-page.html?" + dataUrl;
			} else {
				dataUrl.append("e", btoa(data[i].ownerProj.email));
				window.location.href = "personal-page.html?" + dataUrl;
			}
		});

		divSingleForum.appendChild(divUserInfo);

		//<div class="forum-dates">
		pCreationDate.appendChild(spanDate);
		divForumDates.appendChild(pCreationDate);

		pLastUpdated.appendChild(spanUpdate);
		divForumDates.appendChild(pLastUpdated);
		divSingleForum.appendChild(divForumDates);

		// todos os forums ficam em containerForums
		containerGeneral.appendChild(divSingleForum);
	}
	} else {
		document.getElementById("registered-filter-title").classList.add("hide");
		document.querySelector(".order-forum").classList.add("hide");
		document.querySelector(".content-container").innerHTML = `<p class="already-have-project">
			O utilizador não registou conteúdo</p>`;
	}
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
	//pegar a/s letra/s que o user digitou:
	let input = searchSkillsInput.value;
	// Se tiver algo digitado no input:
	if (input.length) {
		getSkillsBySearchKey(input);
	}
});

//fetch skills
async function getSkillsBySearchKey(input) {
	//
	if (type === "id" || type === "ncy") {
		// fettch - linha 782- forumController
		skillsFound = await doFetchWithResponse(
			urlDefault +
				"forum/" +
				typeForumToSearch +
				"/skills/registered/user/by/" +
				input,
			{
				method: "GET",
				"Content-Type": "application/json",
				headers: headersObj,
			},
		);
		console.log("getSkillsBySearchKey");
		console.log("ahahahaah", skillsFound);
	} else if (type === "pjt") {
		console.log("entrei no type === pjt para ir buscar skills");
		//project controller linha 1500
		skillsFound = await doFetchWithResponse(
			urlDefault + "projects/skills/in/projects/registered/" + input,
			{
				method: "GET",
				"Content-Type": "application/json",
				headers: headersObj,
			},
		);
	}

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
		//verificar para não carregar skills que o utilizador já selecionou
		//percorrer o que o user já escolheu
		console.log("dentro de buscar skills e antes do for");
		console.log(idsSkillsArray);

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

		console.log("antes de chamar o renderizar");
		console.log(skillsFound);
		// enviar a lista já "limpa" para renderizar na ul
		renderSkillsResults(skillsFound);
	}
}

function renderSkillsResults(skillsFound) {
	if (boxSkillsResults.children.length > 0) {
		boxSkillsResults.removeChild(boxSkillsResults.children[0]);
	}

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
			//
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
	//
	if (type === "id") {
		// fettch - linha 782- forumController
		interestsFound = await doFetchWithResponse(
			urlDefault + "forum/idea/interests/registered/user/by/" + input,
			{
				method: "GET",
				"Content-Type": "application/json",
				headers: headersObj,
			},
		);
	} else if (type === "ncy") {
		// fettch - linha 782- forumController
		interestsFound = await doFetchWithResponse(
			urlDefault + "forum/necessity/interests/registered/user/by/" + input,
			{
				method: "GET",
				"Content-Type": "application/json",
				headers: headersObj,
			},
		);
	}

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
		console.log("voltei do fetch getInterestsBySearchKey");
		console.log(interestsFound);

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
	if (boxInterestsResults.children.length > 0) {
		boxInterestsResults.removeChild(boxInterestsResults.children[0]);
	}
	//
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
	console.log("loadSpanInterest");
	console.log(interestFound);

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
document
	.getElementById("apply-filter-registered")
	.addEventListener("click", async () => {
		sort = "";
		let noResults = false;
		let error = false;
		//Verificar qual endpoint chamar:
		//Forums:
		if (type === "id" || type === "ncy") {
			console.log("cliquei em filtrar forum" + typeForumToSearch);
			//
			let ids = {
				idsSkills: idsSkillsArray,
				idsInterest: idsInterestArray,
			};

			console.log("criei o body ");
			console.log(ids);

			if (forumsList.length) {
				forumsList = [];
			}
			//SE NÃO TIVER SELECIONADO INTERESSES OU SKILLS
			if (idsInterestArray.length === 0 && idsSkillsArray.length === 0) {
				//
				document.querySelector(
					".no-result-skills",
				).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
				document.querySelector(
					".no-result-interest",
				).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</span></p>`;
				// Depois de 3 segundos tira a mensagem do ecrã
				setTimeout(function () {
					document.querySelector(".no-result-skills").innerHTML = "";
					document.querySelector(".no-result-interest").innerHTML = "";
				}, 2000);
			} else {
				//forum controller linha 903
				forumsList = await doFetchWithResponse(
					urlDefault +
						"forum/" +
						emailOwnerPage +
						"/filter/skill/and/or/interest/" +
						typeForumToSearch,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(ids),
					},
				);

				if (forumsList instanceof Object) {
					console.log("voltei do fetch filterBySkillAndOrInterest");
					console.log(forumsList);

					//NOTA: feedForum linha 648
					ideas = [];
					necessities = [];
					if (forumsList.length) {
						//containerGeneral
						for (let i = 0; containerGeneral.children.length > 0; i++) {
							containerGeneral.removeChild(containerGeneral.children[0]);
						}
						//ACABAR - ORDENAR
						forumsList.forEach((forum) => {
							if (type === "id") {
								ideas.push(forum);
							} else if (type === "ncy") {
								necessities.push(forum);
							}
						});
						if (type === "id") {
							loadData(ideas);
						} else if (type === "ncy") {
							loadData(necessities);
						}

						//sortRegistered(forumsList);
						//
					} else if (forumsList.length === 0) {
						noResults = true;
					} else {
						error = true;
					}

					//fechar a aba de filtro
					document.querySelector(".details").removeAttribute("open");
					//
				} else if (forumsList === 403) {
					window.location.href = "generalError.html";
				} else if (forumsList === 401) {
					document.querySelector(".details").removeAttribute("open");
					pErrorText.classList.remove("hide");
				}
			}

			//Projetos:
		} else if (type === "pjt") {
			console.log("cliquei em filtrar projetos");
			//
			let ids = {
				idsSkills: idsSkillsArray,
			};

			console.log("criei o body ");
			console.log(ids);

			if (projectList.length) {
				projectList = [];
			}

			console.log("antes do fetch do filtro e tenho a projectList: ");
			console.log(projectList);

			if (idsSkillsArray.length > 0) {
				//project controller linha 1363
				projectList = await doFetchWithResponse(
					urlDefault + "projects/is/member/filter/by/skills",
					{
						method: "POST",
						"Content-Type": "application/json",
						body: JSON.stringify(ids),
						headers: headersObj,
					},
				);

				if (projectList instanceof Object) {
					//
					if (projectList.length) {
						//containerGeneral
						for (let i = 0; containerGeneral.children.length > 0; i++) {
							console.log("entrei no for de limpar contentor");
							containerGeneral.removeChild(containerGeneral.children[0]);
						}
						//ACABAR - ORDENAR
						loadData(projectList);
						console.log("ahahahahahahaahs");
						//sortRegistered(projectList);
						//
					} else if (projectList.length === 0) {
						noResults = true;
					} else {
						error = true;
					}

					//fechar a aba de filtro
					document.querySelector(".details").removeAttribute("open");
					//
				} else if (projectList === 403) {
					window.location.href = "generalError.html";
				} else if (projectList === 401) {
					document.querySelector(".details").removeAttribute("open");
					pErrorText.classList.remove("hide");
				}

				console.log("voltei do fetch filterBySkillAndOrInterest -  projeto");
				console.log(projectList);

				//CASO NÃO SELECIONE SKILLS
			} else {
				document.querySelector(
					".no-result-skills",
				).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
				// Depois de 3 segundos tira a mensagem do ecrã
				setTimeout(function () {
					document.querySelector(".no-result-skills").innerHTML = "";
				}, 2000);
			}
		}

		//Se não encontrou resposta para o filtro
		if (noResults == true) {
			console.log("vou limpar o container");
			for (let i = 0; containerGeneral.children.length > 0; i++) {
				containerGeneral.innerHTML = "";
			}
			document.querySelector(
				".warning-container",
			).innerHTML = `<p class = "warning-text">Não há resultados para tua pesquisa...</p>`;
		}

		//Se deu erro
		if (error == true) {
			//faz logout do user para remover os dados da session
			//user controller linha 196
			doFetchNoResponse(urlDefault + "users/logout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			//envia para a página de erro, que por sua vez, após 2 segundo, manda o user para a página de login
			window.location.href = "generalError.html";
		}

		//Limpar os arrays de ids:
		idsSkillsArray = [];
		idsInterestArray = [];
		console.log("limpei os arrays de ids");
		console.log(idsSkillsArray);

		//remover os spans:
		if (divSpanInterests.children.length > 0) {
			for (let i = 0; divSpanInterests.children.length > 0; i++) {
				divSpanInterests.removeChild(divSpanInterests.children[0]);
			}
		}

		console.log("lenght div span de interesses:");
		if (divSpanSkills.children.length > 0) {
			for (let i = 0; divSpanSkills.children.length > 0; i++) {
				divSpanSkills.removeChild(divSpanSkills.children[0]);
			}
		}
		//fechar area de spans
		divSpanInterests.classList.add("hide");
		divSpanSkills.classList.add("hide");

		// //fechar a aba de filtro
		// document.querySelector(".details").removeAttribute("open");
	});

//botão voltar
document.querySelector(".go-back-btn").addEventListener("click", () => {
	dataUrl.delete("e");
	dataUrl.append("e", btoa(emailOwnerPage));
	window.location.href = "personal-page.html?" + dataUrl;
});

//EVENT LISTENERS PARA OS BOTÕES DE ORDENAR - QUANDO CLICO NO BOTÃO, GUARDA NA VARIÁVEL
//SORT QUAL A ORDENAÇÃO QUE VAMOS APLICAR QUANDO FILTRAR
document
	.getElementById("registered-order-by-creation")
	.addEventListener("click", () => {
		resultSortCreationDate = !resultSortCreationDate;
		// listOrder = forumsList;
		console.log(forumsList);
		if (resultSortCreationDate) {
			console.log(
				document.getElementById("registered-order-by-creation").children[0],
			);
			document.getElementById(
				"registered-order-by-creation",
			).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
		} else {
			console.log(
				document.getElementById("registered-order-by-creation").children[0],
			);
			document.getElementById(
				"registered-order-by-creation",
			).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
		}

		let list = [];
		if (type === "pjt") {
			list = [...projectList];
		} else if (type === "id") {
			list = [...ideas];
		} else if (type === "ncy") {
			list = [...necessities];
		}

		list.sort(function (a, b) {
			let keyA = new Date(a.creationDate); //seria o nosso creationDate
			let keyB = new Date(b.creationDate);

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
		loadData(list);
	});

document
	.getElementById("registered-order-by-votes")
	.addEventListener("click", () => {
		resultSortVotes = !resultSortVotes;
		// listOrder = forumsList;
		console.log(forumsList);
		if (resultSortVotes) {
			console.log(
				document.getElementById("registered-order-by-votes").children[0],
			);
			document.getElementById(
				"registered-order-by-votes",
			).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
		} else {
			console.log(
				document.getElementById("registered-order-by-votes").children[0],
			);
			document.getElementById(
				"registered-order-by-votes",
			).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
		}
		if (type === "pjt") {
			console.log(" ao limite eu vou");
			list = [...projectList];
		} else if (type === "id") {
			list = [...ideas];
		} else if (type === "ncy") {
			list = [...necessities];
		}
		list.sort(function (a, b) {
			let keyA = a.totalVotes ? a.totalVotes : a.votes;
			let keyB = b.totalVotes ? b.totalVotes : b.votes;

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
		loadData(list);
	});

//função para fazer a ordenação
/*async function sortRegistered(list){
	console.log(sort);
	console.log(list);
	if(sort === "creation"){
		list.sort(function(a,b){
			let keyA = new Date(a.creationDate); //seria o nosso creationDate
			let keyB = new Date(b.creationDate);

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
		loadData(list);
	} else if(sort === "votes"){
		list.sort(function(a,b){
			let keyA = a.totalVotes? a.totalVotes : a.votes;
			let keyB = b.totalVotes? b.totalVotes : b.votes;

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
		loadData(list);
	} else {
		loadData(list);
	}
	
}*/

//MÉTODO PARA CONVERTER A DATA QUE SE ENCONTRA EM FORMATO AMERICANO PARA O FORMATO EUROPEU (PORTUGUÊS)
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
