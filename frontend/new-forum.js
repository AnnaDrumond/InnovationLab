const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
let dataUrl = new URLSearchParams();
const paramNewForum = new URLSearchParams(window.location.search);
const type = paramNewForum.get("tp");
let idNewForum = ""; // recebe o id do Forum recem-criado
let responseFetch = ""; // recebe a resposta/status da BD
let allFetchsResponseOk = true;

//skills
let idNewSkill = ""; // recebe a resposta/status da BD
let idsSkillsArray = []; // array de ids que enviaremos ao backend
let skillsFound = []; //skills encontradas na pesquisa do filtro

//ideia/necessidade
let ideasFound = []; //ideais encontradas na pesquisa do filtro
let necessitiesFound = []; //necessidades encontradas na pesquisa do filtro
let forumsArray = []; // armazena o texto da associação e os ids para construir o fetch
let selectedIdea = ""; // recebe a ideia escolhida pelo user na busca ativa, é invocada na ação do botão associar que vai invocar o loadSpan
let selectedNecessity = ""; // recebe a ideia escolhida pelo user na busca ativa, é invocada na ação do botão associar que vai invocar o loadSpan

// interesse
let idNewInterest = ""; // recebe a resposta/status da BD
let interestsFound = []; //interesses encontrados na pesquisa do filtro
let idsInterestArray = []; // array de ids que enviaremos ao backend

//////////////////////////////////////////////////////////////////
//Define se o user está criando uma ideia ou uma necessidade
//para saber o que renderizar no ecrã
//////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", async () => {
	//confirmar se o user logado não é um visitante
	//user controller linha 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
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

	if (type === "id") {
		document.getElementById("container-title").innerText = "Criar Ideia";
		document.title = "Criar Ideia";
		document.getElementById("new-forum-title").placeholder = "título da ideia";
		document.getElementById("associations-title").innerText =
			"Completa a tua Ideia";
	} else if (type === "nec") {
		document.getElementById("container-title").innerText = "Criar Necessidade";
		document.title = "Criar Necessidade";
		document.getElementById("new-forum-title").placeholder =
			"título da necessidade";
		document.getElementById("associations-title").innerText =
			"Completa a tua Necessidade";
	}
	getNotificationsOnMenu();
	// só carrega o número de notificações e de mensagens se não for visitante
	setInterval(getNotificationsOnMenu, 5000);
});

//////////////////////////////////////////////////////////////////
//Busca ativa por skills
//////////////////////////////////////////////////////////////////
const searchSkillsInput = document.getElementById("input-add-skill");
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

//fetch
async function getSkillsBySearchKey(input) {
	//skill controller linha 279
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
		//verificar para não carregar skills que o utilizador já selecionou
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
//renderizar na ul
function renderSkillsResults(skillsFound) {
	if (boxSkillsResults.children.length > 0) {
		//boxSkillsResults.removeChild(boxSkillsResults.children[0]);
		boxSkillsResults.innerHTML = "";
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
		li.innerText = skillsFound[i].title;

		//evento de adicionar a span com a skill escolhida
		li.addEventListener("click", function (e) {
			console.log("clique  escolher skill");
			loadSpanSkill(skillsFound[i]); // aqui seria a skill toda, com id e titulo
		});

		//colocar cada li dentro da ul
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

		////////////////////////////////////////////////////////
		//guardar a skill no array que será enviado ao backend
		idsSkillsArray.push(skillFound.idSkill);

		//console.log(skillFound);
		const sectionSpan = document.getElementById("ids-skills");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-skill";
		spanCreated.innerText = skillFound.title;

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			console.log(e.target.parentElement);

			for (let i = 0; i < idsSkillsArray.length; i++) {
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
	if (boxSkillsResults.children[0]) {
		boxSkillsResults.removeChild(boxSkillsResults.children[0]);
	}
}

//////////////////////////////////////////////////////////////////
//Criar skill
//////////////////////////////////////////////////////////////////

//checkbox de escolha de tipo de skill
let optionSkill = "";
const optionsList = document.querySelectorAll(".option");
optionsList.forEach((option) => {
	//event listener para todos os itens da combo box
	option.addEventListener("click", () => {
		selected.innerHTML = option.querySelector("label").innerHTML; //guarda o inner html da label dentro da caixa selected
		optionSkill = option.querySelector("label").innerHTML;
		optionsContainer.classList.remove("active"); //depois remove a classe active para fechar a combo box
	});
});

//botão CRIAR SKILL
document
	.querySelector("#create-new-skill")
	.addEventListener("click", createSkill);

//Método de criar skills
async function createSkill() {
	console.log("createSkill");
	console.log("optionSkill " + optionSkill);
	let titleNewSkills = document.getElementById("input-new-skill").value;
	let titleNewSkillsTrim = titleNewSkills.trim();
	let typeToFetch = "";

	//Arranjar o skillType para ficar conforme o que o back espera:
	switch (optionSkill) {
		case "Conhecimento":
			typeToFetch = SkillType.KNOWLEDGE;
			break;
		case "Software":
			typeToFetch = SkillType.SOFTWARE;
			break;
		case "Hardware":
			typeToFetch = SkillType.HARDWARE;
			break;
		case "Ferramentas":
			typeToFetch = SkillType.WORKINGTOOLS;
			break;
		default:
			break;
	}

	if (
		titleNewSkills.value != "" &&
		titleNewSkillsTrim.length > 0 &&
		typeToFetch.value != ""
	) {
		//criar body
		let newSkill = {
			title: titleNewSkills,
			skillType: typeToFetch,
		};

		// console.log("vou ao fetch de criar skill");
		//skill controller linha 45
		idNewSkill = await doFetchWithIdResponse(urlDefault + "skills/new", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newSkill),
		});

		if (idNewSkill instanceof Object) {
			if (idNewSkill.error == 401) {
				document.querySelector(
					".no-result-skills",
				).innerHTML = `<p class = "error-text">Ocorreu um erro a criar a skill!</p>`;
				// Depois de 3 segundos tira a mensagem do ecrã
				setTimeout(function () {
					document.querySelector(".no-result-skills").innerHTML = "";
				}, 3000);
			} else if (idNewSkill.error == 403) {
				window.location.href = "generalError.html";
			}
		} else {
			console.log("VOLTEI fetch de criar skill");

			loadSpanSkill({
				title: titleNewSkills,
				idSkill: idNewSkill,
			}); // carregar o span

			//////////////////////////////////////////////////////////////////
			//limpar tudo
			document.getElementById("input-new-skill").value = "";
			selected.innerText = "Tipo de Skill";
			document.querySelector(".create-new-skill").classList.add("hide");
			//mostrar botão associar - id associate-skill
			// document.getElementById("associate-skill").classList.remove("hide");
			//mostrar input de busca ativa - id input-add-skill
			document.getElementById("input-add-skill").classList.remove("hide");
			// mostrar question-skill
			document.querySelector(".question-skill").classList.remove("hide");
		}
	} else {
		const pEmptyFields = document.querySelector(".no-empty-fields-skill");
		pEmptyFields.classList.remove("hide");
		setTimeout(() => {
			pEmptyFields.classList.add("hide");
		}, 2000);
	}
}

//cancelar criar skill
document
	.getElementById("cancel-create-skill")
	.addEventListener("click", function () {
		//limpar tudo
		document.getElementById("input-new-skill").value = "";
		selected.innerText = "Tipo de Skill";
		document.querySelector(".create-new-skill").classList.add("hide");
		//mostrar botão associar - id associate-skill
		// document.getElementById("associate-skill").classList.remove("hide");
		//mostrar input de busca ativa - id input-add-skill
		document.getElementById("input-add-skill").classList.remove("hide");
		// mostrar question-skill
		document.querySelector(".question-skill").classList.remove("hide");
	});

//ações de controle do colapsável
selected.addEventListener("click", () => {
	//quando alguém clica naquela div, o container fica com a classe active
	optionsContainer.classList.toggle("active"); //se estiver active, mostra as opções, senão, não mostra nada, está 'fechado'
});

//criar skill
document.querySelector(".question-click").addEventListener("click", () => {
	// console.log(document.querySelector(".create-new-skill"));
	document.querySelector(".create-new-skill").classList.remove("hide");
	//esconder botão associar - id associate-skill
	// document.getElementById("associate-skill").classList.add("hide");
	//esconder input de busca ativa - id input-add-skill
	document.getElementById("input-add-skill").classList.add("hide");
	// class question-skill
	document.querySelector(".question-skill").classList.add("hide");
});

//criar interesse
document.querySelector(".question-click-int").addEventListener("click", () => {
	// console.log(document.querySelector(".create-new-skill"));
	document.querySelector(".create-new-interests").classList.remove("hide");
	//esconder botão associar - id associate-interest
	// document.getElementById("associate-interest").classList.add("hide");
	//esconder input de busca ativa - id input-new-interests
	document.getElementById("input-add-interest").classList.add("hide");
	// esconder question-interest
	document.querySelector(".question-interest").classList.add("hide");
});

//////////////////////////////////////////////////////////////////
//Busca ativa por interesses
//////////////////////////////////////////////////////////////////
const divSpanInterests = document.querySelector(".span-interests");
const searchInterestsInput = document.getElementById("input-add-interest");
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
		// enviar a lista já "limpa" para renderizar na ul
		renderInterestsResults(interestsFound);
	}
}
//renderizar na ul
function renderInterestsResults(interestsFound) {
	if (boxInterestsResults.children.length > 0) {
		//boxInterestsResults.removeChild(boxInterestsResults.children[0]);
		boxInterestsResults.innerHTML = "";
	}

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
		li.addEventListener("click", function () {
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
		idsInterestArray.push(interestFound.idInterest);

		const sectionSpan = document.getElementById("ids-interests");
		let spanCreated = document.createElement("span");
		spanCreated.className = "span-to-skill";
		spanCreated.innerText = interestFound.title;
		spanCreated.setAttribute("id", interestFound.idInterest);

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			// console.log(e.target.parentElement);

			for (let i = 0; i < idsInterestArray.length; i++) {
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

	if (boxInterestsResults.children[0]) {
		boxInterestsResults.removeChild(boxInterestsResults.children[0]);
	}
}

//////////////////////////////////////////////////////////////////
//Criar interesse
//////////////////////////////////////////////////////////////////
//botão CRIAR
document
	.querySelector("#create-new-interest")
	.addEventListener("click", createInterest);

//Método de criar skills
async function createInterest() {
	console.log("createInterest");

	let titleNewInterest = document.getElementById("input-new-interests").value;
	let titleNewInterestTrim = titleNewInterest.trim();

	if (titleNewInterest.value != "" && titleNewInterestTrim.length > 0) {
		//criar body
		let newInterest = {
			title: titleNewInterest,
		};

		// console.log("vou ao fetch de criar skill");
		//interest controller linha 44
		idNewInterest = await doFetchWithIdResponse(urlDefault + "interests/new", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newInterest),
		});

		if (idNewInterest instanceof Object) {
			if (idNewInterest.error == 401) {
				document.querySelector(
					".no-result-interest",
				).innerHTML = `<p class = "error-text">Ocorreu um erro a criar o interesse!</p>`;
				// Depois de 3 segundos tira a mensagem do ecrã
				setTimeout(function () {
					document.querySelector(".no-result-interest").innerHTML = "";
				}, 3000);
			} else if (idNewSkill.error == 403) {
				window.location.href = "generalError.html";
			}
		} else {
			// console.log("VOLTEI fetch de criar interesse");
			// carregar o span
			loadSpanInterest({
				title: titleNewInterest,
				idInterest: idNewInterest,
			});

			//////////////////////////////////////////////////////////////////
			//limpar tudo
			document.getElementById("input-new-interests").value = "";
			document.querySelector(".create-new-interests").classList.add("hide");
			//mostrar botão associar - id associate-interest
			// document.getElementById("associate-interest").classList.remove("hide");
			//mostrar input de busca ativa - id input-new-interests
			document.getElementById("input-add-interest").classList.remove("hide");
			// mostrar question-interest
			document.querySelector(".question-interest").classList.remove("hide");
		}
	} else {
		const pEmptyFields = document.querySelector(".no-empty-fields-interest");
		pEmptyFields.classList.remove("hide");
		setTimeout(() => {
			pEmptyFields.classList.add("hide");
		}, 3000);
	}
}

document
	.getElementById("cancel-create-interest")
	.addEventListener("click", function () {
		//limpar tudo
		document.getElementById("input-new-interests").value = "";
		document.querySelector(".create-new-interests").classList.add("hide");
		//mostrar botão associar - id associate-interest
		// document.getElementById("associate-interest").classList.remove("hide");
		//mostrar input de busca ativa - id input-new-interests
		document.getElementById("input-add-interest").classList.remove("hide");
		// mostrar question-interest
		document.querySelector(".question-interest").classList.remove("hide");
	});

//////////////////////////////////////////////////////////////////
//Busca ativa por ideias
//////////////////////////////////////////////////////////////////
const divSpanIdeas = document.querySelector(".span-ideas");
const searchIdeasInput = document.getElementById("input-add-idea");
const boxSearchIdeas = document.querySelector(".box-search-ideas");
const boxIdeasResults = document.querySelector(".results-ideas");

searchIdeasInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxIdeasResults.children.length > 0) {
		boxIdeasResults.removeChild(boxIdeasResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
	console.log("addEventListener keyup");
	//pegar a/s letra/s que o user digitou:
	let input = searchIdeasInput.value;

	// Se tiver algo digitado no input:
	if (input.length) {
		getIdeasBySearchKey(input);
	}
});

//fetch
async function getIdeasBySearchKey(input) {
	//forum controller linha 982
	ideasFound = await doFetchWithResponse(
		urlDefault + "forum/search/" + input + "/if/idea",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (ideasFound === 401) {
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
	} else if (ideasFound === 403) {
		window.location.href = "generalError.html";
	} else if (ideasFound instanceof Object) {
		console.log("ideiasssss  ", ideasFound);

		//verificar para não carregar itens que o utilizador já selecionou
		// console.log("antes do for - depois do fetch - tenho o forumsArray : ");
		// console.log(forumsArray);
		for (let i = 0; i < forumsArray.length; i++) {
			//percorrer o que veio da BD
			for (let j = 0; j < ideasFound.length; j++) {
				//comparar uma lista com a outra e remover a lista que veio da BD aquelas skills que o user já escolheu
				if (ideasFound[j].id == forumsArray[i].idToAssociate) {
					//preciso a posição do elemento no array
					ideasFound.splice(j, 1);
					//remover o span que o user excluiu
				}
			}
		}

		console.log("antes de chamar o renderizar");
		console.log(ideasFound);
		// enviar a lista já "limpa" para renderizar na ul
		renderideasResults(ideasFound);
	}
}

function renderideasResults(ideasFound) {
	if (boxIdeasResults.children.length > 0) {
		//boxIdeasResults.removeChild(boxIdeasResults.children[0]);
		boxIdeasResults.innerHTML = "";
	}

	if (!ideasFound.length) {
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
		searchIdeasInputInput.value = "";
		return boxSearchIdeas.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-ideas";

	for (let i = 0; i < ideasFound.length; i++) {
		let li = document.createElement("li");
		li.className = "li-ideas";
		li.innerText = ideasFound[i].title;
		// li.setAttribute("id", skillsFound[i].idSkill); // aqui seria skillsFound[i].id

		//evento de adicionar a span com a skill escolhida
		li.addEventListener("click", function () {
			console.log("clique  escolher ideia");
			document.getElementById("input-add-idea").value = ideasFound[i].title;
			selectedIdea = ideasFound[i];
			//retirar as opções
			if (boxIdeasResults.children[0]) {
				boxIdeasResults.removeChild(boxIdeasResults.children[0]);
			}
		});
		ul.appendChild(li);
	}
	//colocar a ul dentro da div
	boxIdeasResults.appendChild(ul);
	boxSearchIdeas.classList.add("show");
}

//////////////////////////////////////////////////////////////////////////
//ação do botão associar
document.getElementById("associate-idea").addEventListener("click", () => {
	console.log("cliquei no botão");
	console.log(selectedIdea);

	if (selectedIdea === "") {
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Não escolheste uma ideia para associar!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
	} else {
		//colocar o texto default de volta no input
		document.getElementById("input-add-idea").value = "";
		document.getElementById("input-add-idea").placeholder =
			"procura a ideia que queres associar";

		//retirar as opções
		if (boxIdeasResults.children[0]) {
			boxIdeasResults.removeChild(boxIdeasResults.children[0]);
		}

		// pegar a ideia selecionada pelo user e envia para carregar a span
		loadSpanIdea(selectedIdea); // aqui seria a skill toda, com id e titulo
	}
});

//Aqui vai construir o span respetivo
function loadSpanIdea(ideaFound) {
	// console.log("loadSpanSkill -------------------");
	// console.log(skillFound);
	//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
	let repeated = false;
	for (let i = 0; i < forumsArray.length; i++) {
		if (forumsArray[i].idToAssociate === ideaFound.id) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		// console.log("achou repetida");
		//carregar warning:
		searchIdeasInput.placeholder = "Ideia já escolhida!!!";
		searchIdeasInput.classList.add("warning-repeated");
		setTimeout(function () {
			searchIdeasInput.placeholder = "procura a ideia que queres associar";
			searchIdeasInput.classList.remove("warning-repeated");
		}, 3000);
	} else {
		// console.log("NÂO achou repetida");

		//preciso do texto da associação e do id da opção escolhida
		let textAssociation = document.getElementById(
			"association-text-idea",
		).value;
		let id = selectedIdea.id;

		//colocar no array em forma de objeto:
		forumsArray.push({
			idToAssociate: id,
			text: textAssociation,
		});

		//exibir o espaço onde entrarão os spans
		divSpanIdeas.classList.remove("hide");

		const sectionSpan = document.getElementById("ids-ideas");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-skill";
		spanCreated.innerText = ideaFound.title; // aqui algo tipo skillFound.title

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			// console.log(e.target.parentElement);

			for (let i = 0; i < forumsArray.length; i++) {
				if (forumsArray[i].idToAssociate == ideaFound.id) {
					//preciso a posição do elemento no array
					forumsArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (forumsArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divSpanIdeas.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	searchIdeasInput.value = "";
	document.getElementById("association-text-idea").value = "";
	selectedIdea = "";
	//retirar as opções
	if (boxIdeasResults.children[0]) {
		boxIdeasResults.removeChild(boxIdeasResults.children[0]);
	}
	console.log("criei a span e tenho o array final: ");
	console.log(forumsArray);
}

//////////////////////////////////////////////////////////////////
//Busca ativa por necessidades
//////////////////////////////////////////////////////////////////
const divSpanNecessities = document.querySelector(".span-necessities");
const searchNecessityInput = document.getElementById("input-add-necessity");
const boxSearchNecessities = document.querySelector(".box-search-necessities");
const boxNecessitiesResults = document.querySelector(".results-necessity");

searchNecessityInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxNecessitiesResults.children.length > 0) {
		boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
	console.log("addEventListener keyup");
	//pegar a/s letra/s que o user digitou:
	let input = searchNecessityInput.value;

	// Se tiver algo digitado no input:
	if (input.length) {
		getNecessitiesBySearchKey(input);
	}
});

//fetch skills
async function getNecessitiesBySearchKey(input) {
	//forum controller linha 982
	necessitiesFound = await doFetchWithResponse(
		urlDefault + "forum/search/" + input + "/if/necessity",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (necessitiesFound === 401) {
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
	} else if (necessitiesFound === 403) {
		window.location.href = "generalError.html";
	} else if (necessitiesFound instanceof Object) {
		//verificar para não carregar itens que o utilizador já selecionou
		console.log("antes do for - depois do fetch - tenho o forumsArray : ");
		console.log(forumsArray);
		for (let i = 0; i < forumsArray.length; i++) {
			//percorrer o que veio da BD
			for (let j = 0; j < necessitiesFound.length; j++) {
				//comparar uma lista com a outra e remover a lista que veio da BD aquelas skills que o user já escolheu
				if (necessitiesFound[j].id == forumsArray[i].idToAssociate) {
					//preciso a posição do elemento no array
					necessitiesFound.splice(j, 1);
					//remover o span que o user excluiu
				}
			}
		}

		// console.log("antes de chamar o renderizar");
		// console.log(necessitiesFound);
		// enviar a lista já "limpa" para renderizar na ul
		renderNecessityResults(necessitiesFound);
	}
}

function renderNecessityResults(necessitiesFound) {
	if (boxNecessitiesResults.children.length > 0) {
		//boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
		boxNecessitiesResults.innerHTML = "";
	}

	if (!necessitiesFound.length) {
		document.querySelector(
			".no-result-necessities",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-necessities").innerHTML = "";
		}, 3000);
		searchNecessityInput.value = "";
		return boxSearchNecessities.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-necessity";

	for (let i = 0; i < necessitiesFound.length; i++) {
		let li = document.createElement("li");
		li.className = "li-necessity";
		li.innerText = necessitiesFound[i].title; // aqui seria .title ou algo assim
		// li.setAttribute("id", skillsFound[i].idSkill); // aqui seria skillsFound[i].id

		//evento de adicionar a span com a skill escolhida
		li.addEventListener("click", function (e) {
			console.log("clique  escolher ideia");
			document.getElementById("input-add-necessity").value =
				necessitiesFound[i].title;
			selectedNecessity = necessitiesFound[i];
			//retirar as opções
			if (boxNecessitiesResults.children[0]) {
				boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
			}
		});
		ul.appendChild(li);
	}
	//colocar a ul dentro da div
	boxNecessitiesResults.appendChild(ul);
	boxSearchNecessities.classList.add("show");
}

//////////////////////////////////////////////////////////////////////////
//ação do botão associar
document.getElementById("associate-necessity").addEventListener("click", () => {
	console.log("cliquei no botão associar necessidade");
	console.log(selectedNecessity);

	if (selectedNecessity === "") {
		document.querySelector(
			".no-result-necessities",
		).innerHTML = `<p class = "error-text">Não escolheste uma necessidade para associar!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-necessities").innerHTML = "";
		}, 3000);
	} else {
		//colocar o texto default de volta no input
		document.getElementById("input-add-necessity").value = "";
		document.getElementById("input-add-necessity").placeholder =
			"procura a necessidade que queres associar";

		//retirar as opções
		if (boxNecessitiesResults.children[0]) {
			boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
		}

		// pegar a ideia selecionada pelo user e envia para carregar a span
		loadSpanNecessity(selectedNecessity); // aqui seria  com id e titulo
	}
});

//Aqui vai construir o span respetivo
function loadSpanNecessity(necessityFound) {
	//verificar se o user já escolheu esta opcao e se a mesma já está na lista que vai para o backend:
	let repeated = false;
	for (let i = 0; i < forumsArray.length; i++) {
		if (forumsArray[i].idToAssociate === necessityFound.id) {
			repeated = true;
		}
	}

	if (repeated === true) {
		// console.log("achou repetida");
		//carregar warning:
		searchNecessityInput.placeholder = "Necessidade já escolhida!!!";
		searchNecessityInput.classList.add("warning-repeated");
		setTimeout(function () {
			searchNecessityInput.placeholder =
				"procura a necessidade que queres associar";
			searchNecessityInput.classList.remove("warning-repeated");
		}, 3000);
	} else {
		// console.log("NÂO achou repetida");

		//preciso do texto da associação e do id da opção escolhida
		let textAssociation = document.getElementById(
			"association-text-necessity",
		).value;
		let id = selectedNecessity.id;

		//colocar no array em forma de objeto:
		forumsArray.push({
			idToAssociate: id,
			text: textAssociation,
		});

		//exibir o espaço onde entrarão os spans
		divSpanNecessities.classList.remove("hide");

		const sectionSpan = document.getElementById("ids-necessities");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-necessity";
		spanCreated.innerText = necessityFound.title; // aqui algo tipo skillFound.title
		// spanCreated.setAttribute("id", skillFound.idSkill); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			console.log(e.target.parentElement);

			for (let i = 0; i < forumsArray.length; i++) {
				if (forumsArray[i].idToAssociate == necessityFound.id) {
					//preciso a posição do elemento no array
					forumsArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (forumsArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divSpanIdeas.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	searchNecessityInput.value = "";
	document.getElementById("association-text-necessity").value = "";
	selectedNecessity = "";

	//retirar as opções
	if (boxNecessitiesResults.children[0]) {
		boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
	}

	console.log("criei a span da necessidade e tenho o array final: ");
	console.log(forumsArray);
}

//////////////////////////////////////////////////////////////////
//Criar uma ideia/necessidade
//////////////////////////////////////////////////////////////////

//botão criar
document
	.querySelector(".create-new-forum")
	.addEventListener("click", function (e) {
		createNewForum();
	});

const inputTitle = document.getElementById("new-forum-title");
const quillEditor = document.getElementById("editor");

//Método de criar Forums
async function createNewForum() {
	console.log("createNewForum");
	console.log("forumsArray");
	console.log(forumsArray); /// aqui OKK

	//pegar o titulo
	const title = inputTitle.value;
	const titleTrim = inputTitle.value.trim();
	//pegar a descrição
	const descriptionQuill = quillEditor.children[0].innerHTML;

	let category = "";
	if (type === "id") {
		category = ForumType.IDEA;
	} else {
		category = ForumType.NECESSITY;
	}

	// console.log("editor: ");
	// console.log(descriptionQuill);

	if (
		title.value != "" &&
		titleTrim.length > 0 &&
		quillEditor.children[0].children[0].innerHTML !== `<br>`
	) {
		//criar body
		let newForum = {
			type: category,
			description: descriptionQuill,
			title: title,
		};

		//forum controller linha 49
		idNewForum = await doFetchWithIdResponse(urlDefault + "forum/new", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newForum),
		});
		//
		console.log("voltei do fetch createNewForum da categoria " + category);
		console.log(idNewForum);

		if (idNewForum instanceof Object) {
			console.log("idNewForum instanceof Object");
			//
			if (idNewForum.error === 403) {
				window.location.href = "generalError.html";
			} else if (idNewForum.error === 401) {
				//
				allFetchsResponseOk = false;
				const pEmptyFields = document.querySelector(".no-empty-fields-edit");
				window.scrollTo(0, 0); //ir para topo da página
				let aux = "";
				if (type === "id") {
					aux = "Pedimos desculpa mas ocorreu um erro a criar a ideia!";
				} else {
					aux = "Pedimos desculpa mas ocorreu um erro a criar a necessidade!";
				}
				pEmptyFields.innerText = aux;
				setTimeout(() => {
					pEmptyFields.innerText = "";
				}, 3000);
			}
			//
		} else {
			console.log("Else de idNewForum instanceof Object");
			supportAssociations(idNewForum);
		}
		//
	} else {
		// msg de não pode deixar campos vazios
		const pEmptyFields = document.querySelector(".no-empty-fields-edit");
		window.scrollTo(0, 0); //ir para topo da página
		pEmptyFields.innerText =
			"Por favor completa o título e/ou descrição. Estes campos não podem estar vazios!";
		setTimeout(() => {
			pEmptyFields.innerText = "";
		}, 3000);
	}
}

//////////////////////////////////////////////////////////////////
//Verificar se existem associações a serem feitas
//////////////////////////////////////////////////////////////////
async function supportAssociations(idNewForum) {
	/////////////////////////////////////////////////////
	//Ver se foram selecionadas skills para associar:
	/////////////////////////////////////////////////////
	console.log("supportAssociations");
	//
	if (idsSkillsArray.length > 0) {
		//criar o body com os ids
		let ids = {
			idsSkills: idsSkillsArray,
		};
		console.log("criei o body ");
		console.log(ids);
		//skill controller linha 210
		responseFetch = await doFetchNoResponse(
			urlDefault + "skills/associate/with/forum/" + idNewForum,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ids),
			},
		);
		// verificar se resposta da requisição foi 200
		if (responseFetch != 200) {
			allFetchsResponseOk = false;
			document.querySelector(
				".no-result-skills",
			).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a associar as skills!</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".no-result-skills").innerHTML = "";
			}, 3000);
		}

		console.log("voltei do fetch associar skills");
		//FALTA - tratar se a resposta for diferente de 200
		console.log(responseFetch); // O que fazer com a resposta???*********************************************************************************************

		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		idsSkillsArray = [];
		console.log(idsSkillsArray);
		//retirar os spans
		if (divSpanSkills.children.length > 0) {
			for (let i = 0; divSpanSkills.children.length > 0; i++) {
				divSpanSkills.removeChild(divSpanSkills.children[0]);
			}
		}
		//fechar area de spans
		divSpanSkills.classList.add("hide");
	}
	/////////////////////////////////////////////////////
	//Ver se foram selecionadas interesses para associar:
	/////////////////////////////////////////////////////
	if (idsInterestArray.length > 0) {
		//criar o body com os ids
		let ids = {
			idsInterest: idsInterestArray,
		};
		console.log("criei o body ");
		console.log(ids);
		//interest controller linha 137
		responseFetch = await doFetchNoResponse(
			urlDefault + "interests/associate/with/forum/" + idNewForum,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ids),
			},
		);
		console.log("voltei do fetch associar interesses");
		//FALTA - tratar se a resposta for diferente de 200
		console.log(responseFetch);
		// verificar se resposta da requisição foi 200
		if (responseFetch != 200) {
			allFetchsResponseOk = false;
			document.querySelector(
				".no-result-interest",
			).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a associar os interesses!</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".no-result-interest").innerHTML = "";
			}, 3000);
		}
		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		idsInterestArray = [];
		console.log(idsInterestArray);
		// remover os spans:
		if (divSpanInterests.children.length > 0) {
			for (let i = 0; divSpanInterests.children.length > 0; i++) {
				divSpanInterests.removeChild(divSpanInterests.children[0]);
			}
		}
		//fechar area de spans
		divSpanInterests.classList.add("hide");
	}

	/////////////////////////////////////////////////////
	//Ver se foram selecionadas ideias/necessidades para associar:
	/////////////////////////////////////////////////////

	//
	if (forumsArray.length > 0) {
		//auxiliares de controle do fetch:
		let length = forumsArray.length;
		let counter = 0;
		console.log("entrei no for");
		console.log(forumsArray);
		let responseStatusAddForum = true;

		for (let i = 0; i < forumsArray.length; i++) {
			//gerar o body
			let bodyAssociation = {
				description: forumsArray[i].text,
			};

			console.log("criei o body ");
			console.log(bodyAssociation);

			// chamar endpoint para associar uma ideia/necessidade a outra ideia/necessidade
			// firstId é o id do forum original
			// secondId é o id do forum a ser adicionado
			// /associate/{firstId}/with/{secondId}
			//forum controller linha 253
			responseFetch = await doFetchNoResponse(
				urlDefault +
					"forum/associate/" +
					idNewForum +
					"/with/" +
					forumsArray[i].idToAssociate,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(bodyAssociation),
				},
			);

			counter++;
			//
			if (responseFetch != 200) {
				responseStatusAddForum = false;
			}

			console.log("voltei do fetch associar forums");
			console.log(responseFetch);
		}

		// Se forem iguais fez todas as associações

		console.log("fiz tudo e allFetchsResponseOk " + allFetchsResponseOk);
		////////////////////////////////////////////////////////////////
		// Depois de associar todos os foruns e se tudo correu bem levar user para ver como ficou o Forum
		if (allFetchsResponseOk == true && counter == length) {
			////////////////////////////////////////////////////////////////
			// Limpar tudo
			console.log("allFetchsResponseOk == true && counter == length");
			inputTitle.value = "";
			quillEditor.children[0].innerHTML = "";
			dataUrl.delete("id");
			dataUrl.append("id", idNewForum);
			window.location.href = "seeForum.html?" + dataUrl.toString();
			// algo correu mal, espera uns segundos para exibir o respetivo erro e depois encaminha o user
		} else if (allFetchsResponseOk == false && counter == length) {
			console.log("allFetchsResponseOk == FALSE && counter == length");
			setTimeout(() => {
				inputTitle.value = "";
				quillEditor.children[0].innerHTML = "";
				dataUrl.delete("id");
				dataUrl.append("id", idNewForum);
				window.location.href = "seeForum.html?" + dataUrl.toString();
			}, 6000);
		}

		// deixou de associar alguma ideia ou necessidade
		if (responseStatusAddForum == false) {
			//
			allFetchsResponseOk = false;
			document.querySelector(
				".no-result-ideas",
			).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a associar as ideias!</p>`;
			document.querySelector(
				".no-result-necessities",
			).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a associar as necessidades!</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".no-result-ideas").innerHTML = "";
				document.querySelector(".no-result-necessities").innerHTML = "";
			}, 3000);
		}

		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		forumsArray = [];
		console.log("limpar forumsArray");
		console.log(forumsArray);
		//retirar os spans
		if (divSpanIdeas.children.length > 0) {
			for (let i = 0; divSpanIdeas.children.length > 0; i++) {
				divSpanIdeas.removeChild(divSpanIdeas.children[0]);
			}
		}

		if (divSpanNecessities.children.length > 0) {
			for (let i = 0; divSpanNecessities.children.length > 0; i++) {
				divSpanNecessities.removeChild(divSpanNecessities.children[0]);
			}
		}
		//fechar areas de spans
		divSpanIdeas.classList.add("hide");
		divSpanNecessities.classList.add("hide");
	}
}

//////////////////////////////////////////////////////////////////
//Rich text quill
/////////////////////////////////////////////////////////////////
var quill = new Quill(document.getElementById("editor"), {
	modules: {
		toolbar: [
			[{ header: [1, 2, 3, 4, 5, 6, false] }],
			[{ font: [] }],
			["bold", "italic", "underline", "strike"], // toggled buttons
			["blockquote"],
			[{ list: "ordered" }, { list: "bullet" }],
			//[{ align: [] }],
			[{ indent: "-1" }, { indent: "+1" }], // outdent/indent
			[{ color: [] }, { background: [] }], // dropdown with defaults from theme
			["link", "image"], // add's image support
			["clean"], // remove formatting button
		],
	},
	theme: "snow",
});
