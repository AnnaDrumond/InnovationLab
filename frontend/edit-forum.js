const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");
let dataUrl = new URLSearchParams();
const paramNewForum = new URLSearchParams(window.location.search);
const type = paramNewForum.get("tp");
const idForum = paramNewForum.get("id"); //// FALTA habilitar e por a funcionar, vindo de seeForum

let responseFetch = ""; // recebe a resposta/status da BD
let allFetchsResponseOk = true;
//
//skills
let idsSkillsArray = []; // array de ids que enviaremos ao backend
let idsSkillsToRemove = []; // array de ids que enviaremos ao backend
let skillsFound = []; //skills encontradas na pesquisa do filtro
let idNewSkill = ""; // recebe a resposta/status da BD

//ideia/necessidade
let forumToEdit = ""; // recebe a ideia/necessidade que será editada
let selectedIdea = ""; // recebe a ideia escolhida pelo user na busca ativa, é invocada na ação do botão associar que vai invocar o loadSpan
let selectedNecessity = ""; // recebe a ideia escolhida pelo user na busca ativa, é invocada na ação do botão associar que vai invocar o loadSpan
let editedIdea = ""; // recebe a ideia editada pelo user
let editedNecessity = ""; // recebe a ideia editada pelo user
let ideasFound = []; //ideais encontradas na pesquisa do filtro
let necessitiesFound = []; //necessidades encontradas na pesquisa do filtro
let forumsArray = []; // armazena o texto da associação e os ids para adicionar --- VAI MUDAR PARA forumsToAdd
let forumsToRemove = []; // armazena o texto da associação e os ids para remover
let forumsAssociated = []; // armazena os forums já associados
// interesse
let idsInterestArray = []; // array de ids que enviaremos ao backend --- VAI MUDAR PARA idsInterestsToAdd
let idsInterestsToRemove = []; // array de ids que enviaremos ao backend
let interestsFound = []; //interesses encontrados na pesquisa do filtro
let idNewInterest = ""; // recebe a resposta/status da BD

//métodos a correr ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
	//verificar se loggedUser pode editar este forum
	//forum controller linha 1009
	const hasAuth = await doFetchWithResponse(
		urlDefault + "forum/has/auth/" + idForum,
		{
			method: "POST",
			headers: { "Content-Type": "text/plain" },
		},
	);
	if(hasAuth === 401) {
		window.location.href = "feedForum.html";
	} else if(hasAuth === 403){
		window.location.href = "generalError.html";
	} else if (hasAuth) {
		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
		//carregar itens
		getForumById();
		getCurrentSkills();
		getCurrentInterests();
		getCurrentForums();
		//
	} 
});

//////////////////////////////////////////////////////////////////
//Define se o user está editando uma ideia ou uma necessidade
//para saber o que renderizar no ecrã
//////////////////////////////////////////////////////////////////
if (type === "id") {
	document.getElementById("container-title").innerText = "Editar Ideia";
	document.title = "Editar Ideia";
	document.getElementById("new-forum-title").placeholder = "título da ideia";
	document.getElementById("associations-title").innerText =
		"Completa a tua Ideia";
	//
} else if (type === "nec") {
	document.getElementById("container-title").innerText = "Editar Necessidade";
	document.title = "Editar Necessidade";
	document.getElementById("new-forum-title").placeholder =
		"título da necessidade";
	document.getElementById("associations-title").innerText =
		"Completa a tua Necessidade";
} else {
	window.location.href = "feedForum.html";
}
/////////////////////////////////////////
//ações de controle do colapsável
selected.addEventListener("click", () => {
	//quando alguém clica naquela div, o container fica com a classe active
	optionsContainer.classList.toggle("active"); //se estiver active, mostra as opções, senão, não mostra nada, está 'fechado'
});

//criar skill
document.querySelector(".question-click").addEventListener("click", () => {
	document.querySelector(".create-new-skill").classList.remove("hide");
	//esconder input de busca ativa - id input-add-skill
	document.getElementById("input-add-skill").classList.add("hide");
	// class question-skill
	document.querySelector(".question-skill").classList.add("hide");
});

//criar interesse
document.querySelector(".question-click-int").addEventListener("click", () => {
	//mostrar
	document.querySelector(".create-new-interests").classList.remove("hide");
	//esconder input de busca ativa - id input-new-interests
	document.getElementById("input-add-interest").classList.add("hide");
	// esconder question-interest
	document.querySelector(".question-interest").classList.add("hide");
});

//////////////////////////////////////////////////////////////////
//Ideia/necessidade a ser editado
//////////////////////////////////////////////////////////////////
async function getForumById() {
	//fetch forum controller linha 557
	forumToEdit = await doFetchWithResponse(
		urlDefault + "forum/with/" + idForum,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (forumToEdit === 496) {
		document.querySelector("#edit-forum-button-div").classList.add("hide");
		document.querySelector(".new-forum-container").classList.add("hide");
		document.getElementById("associations-title").classList.add("hide");
		document.querySelector(".forum-associations").classList.add("hide");
		document.querySelector(".edit-forum").classList.add("hide");
		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "O conteúdo foi apagado!";
		document.querySelector(".body").appendChild(pError);

		setTimeout(() => {
			window.location.href = "feedForum.html";
		}, 3000);
	}
	if (forumToEdit === 401) {
		document.querySelector("#edit-forum-button-div").classList.add("hide");
		document.querySelector(".new-forum-container").classList.add("hide");
		document.getElementById("associations-title").classList.add("hide");
		document.querySelector(".forum-associations").classList.add("hide");
		document.querySelector(".edit-forum").classList.add("hide");
		window.location.href = "feedForum.html";

		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "Ocorreu um erro!";
		document.querySelector(".body").appendChild(pError);

		setTimeout(() => {
			window.location.href = "feedForum.html";
		}, 3000);
	}

	if (forumToEdit instanceof Object) {
		loadForum(forumToEdit);
	}
}

const inputTitle = document.getElementById("new-forum-title");
const quillEditor = document.getElementById("editor");

//////////////////////////////////////////////////////////////////
//Carregar no ecrã Ideia/necessidade a ser editado
function loadForum(forumToEdit) {
	inputTitle.value = forumToEdit.title;
	//let text = document.getElementById("editor").children[0].innerHTML;
	quillEditor.children[0].innerHTML = forumToEdit.description;
}

//////////////////////////////////////////////////////////////////
//Skills
//////////////////////////////////////////////////////////////////
const searchSkillsInput = document.getElementById("input-add-skill");
const boxSearchSkills = document.querySelector(".box-search-skills");
const boxSkillsResults = document.querySelector(".results-skills");
const divSpanSkills = document.querySelector(".span-skills");
//////////////////////////////////
//Buscar skills atuais do forum
async function getCurrentSkills() {
	//fetch skills controller linha 400
	const skillsAssociated = await doFetchWithResponse(
		urlDefault + "skills/associated/forum/" + idForum,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (skillsAssociated === 403) {
		window.location.href = "generalError.html";
	} else if (skillsAssociated === 401) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Erro a carregar as skills!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
	} else if (skillsAssociated instanceof Object) {
		skillsAssociated.forEach((skill) => {
			loadSpanSkill(skill);
		});
	}
}
//////////////////////////////
// Carregar spans skills
function loadSpanSkill(skillFound) {
	//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
	let repeated = false;
	for (let i = 0; i < idsSkillsArray.length; i++) {
		if (idsSkillsArray[i] === skillFound.idSkill) {
			repeated = true;
		}
	}

	if (repeated === true) {
		//carregar warning:
		searchSkillsInput.placeholder = "Skills já escolhida!!!";
		searchSkillsInput.classList.add("warning-repeated");
		setTimeout(function () {
			searchSkillsInput.placeholder = "pesquise por skills";
			searchSkillsInput.classList.remove("warning-repeated");
		}, 3000);
	} else {
		//exibir o espaço onde entrarão os spans
		divSpanSkills.classList.remove("hide");

		//guardar a skill no array de adicionar que será enviado ao backend
		idsSkillsArray.push(skillFound.idSkill);

		//verificar se a skills que estou adicionando está no array de remover
		// se estiver retirar
		for (let i = 0; i < idsSkillsToRemove.length; i++) {
			//NOVO
			if (idsSkillsToRemove[i] === skillFound.idSkill) {
				idsSkillsToRemove.splice(i, 1);
			}
		}

		const sectionSpan = document.getElementById("ids-skills");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-skill";
		spanCreated.innerText = skillFound.title;

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// console.log(e.target.parentElement);

			//guardar a skill no array que será enviado ao backend
			idsSkillsToRemove.push(skillFound.idSkill);

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

//////////////////////////////////////////////////////
//Busca ativa skilss
searchSkillsInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxSkillsResults.children.length > 0) {
		boxSkillsResults.removeChild(boxSkillsResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
	//pegar a/s letra/s que o user digitou:
	let input = searchSkillsInput.value;

	// Se tiver algo digitado no input:
	if (input.length) {
		getSkillsBySearchKey(input);
	}
});

//////////////////////////////////////////////
//fetch
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
///////////////////////
//renderizar na ul
function renderSkillsResults(skillsFound) {
	if (boxSkillsResults.children.length > 0) {
		boxSkillsResults.innerHTML = "";
	}

	if (!skillsFound.length) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
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
			// console.log("clique  escolher skill");
			loadSpanSkill(skillsFound[i]); // aqui seria a skill toda, com id e titulo
		});

		//colocar cada li dentro da ul
		ul.appendChild(li);
	}
	//colocar a ul dentro da div
	boxSkillsResults.appendChild(ul);
	boxSearchSkills.classList.add("show");
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
			//carregar span da nova skill
			loadSpanSkill({
				title: titleNewSkills,
				idSkill: idNewSkill,
			}); // carregar o span

			//////////////////////////////////////////////////////////////////
			//limpar tudo
			document.getElementById("input-new-skill").value = "";
			selected.innerText = "Tipo de Skill";
			document.querySelector(".create-new-skill").classList.add("hide");
			//mostrar input de busca ativa - id input-add-skill
			document.getElementById("input-add-skill").classList.remove("hide");
			// mostrar question-skill
			document.querySelector(".question-skill").classList.remove("hide");
		}
	} else {
		//msg de não pode deixar campos vazios
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
	.addEventListener("click", function (e) {
		//limpar tudo
		document.getElementById("input-new-skill").value = "";
		selected.innerText = "Tipo de Skill";
		document.querySelector(".create-new-skill").classList.add("hide");
		//mostrar input de busca ativa - id input-add-skill
		document.getElementById("input-add-skill").classList.remove("hide");
		// mostrar question-skill
		document.querySelector(".question-skill").classList.remove("hide");
	});

//////////////////////////////////////////////////////////////////
//Interesses
//////////////////////////////////////////////////////////////////
const divSpanInterests = document.querySelector(".span-interests");
const searchInterestsInput = document.getElementById("input-add-interest");
const boxSearchInterests = document.querySelector(".box-search-interests");
const boxInterestsResults = document.querySelector(".results-interests");

//////////////////////////////////////////////////////////////////
//Buscar interesses atuais do forum
//////////////////////////////////////////////////////////////////
async function getCurrentInterests() {
	//fetch interest controller linha 137
	const interestsAssociated = await doFetchWithResponse(
		urlDefault + "interests/associated/forum/" + idForum,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (interestsAssociated === 403) {
		window.location.href = "generalError.html";
	} else if (interestsAssociated === 401) {
		document.querySelector(
			".no-result-interest",
		).innerHTML = `<p class = "error-text">Erro a carregar os interesses!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-interest").innerHTML = "";
		}, 3000);
	} else if (interestsAssociated instanceof Object) {
		interestsAssociated.forEach((interest) => {
			loadSpanInterest(interest);
		});
	}
}

searchInterestsInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxInterestsResults.children.length > 0) {
		boxInterestsResults.removeChild(boxInterestsResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
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
		li.addEventListener("click", function () {
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
	//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
	let repeated = false;
	for (let i = 0; i < idsInterestArray.length; i++) {
		if (idsInterestArray[i] === interestFound.idInterest) {
			repeated = true;
		}
	}

	if (repeated === true) {
		//carregar warning:
		searchInterestsInput.placeholder = "Interesse já escolhido!!!";
		searchInterestsInput.classList.add("warning-repeated");
		setTimeout(function () {
			searchInterestsInput.placeholder = "pesquise por skills";
			searchInterestsInput.classList.remove("warning-repeated");
		}, 3000);
	} else {
		//exibir o espaço onde entrarão os spans
		divSpanInterests.classList.remove("hide");

		//guardar a skill no array de adicionar que será enviado ao backend
		idsInterestArray.push(interestFound.idInterest);

		//verificar se a skills que estou adicionando está no array de remover
		// se estiver retirar
		for (let i = 0; i < idsInterestsToRemove.length; i++) {
			
			if (idsInterestsToRemove[i] === interestFound.idInterest) {
				idsInterestsToRemove.splice(i, 1);
			}
		}

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
			//guardar a skill no array que será enviado ao backend
			idsInterestsToRemove.push(interestFound.idInterest);

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

	let titleNewInterest = document.getElementById("input-new-interests").value;
	let titleNewInterestTrim = titleNewInterest.trim();

	if (titleNewInterest.value != "" && titleNewInterestTrim.length > 0) {
		//criar body
		let newInterest = {
			title: titleNewInterest,
		};

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
			// carregar o span
			loadSpanInterest({
				title: titleNewInterest,
				idInterest: idNewInterest,
			});

			//////////////////////////////////////////////////////////////////
			//limpar tudo
			document.getElementById("input-new-interests").value = "";
			document.querySelector(".create-new-interests").classList.add("hide");
			// //mostrar botão associar - id associate-interest
			// document.getElementById("associate-interest").classList.remove("hide");
			//mostrar input de busca ativa - id input-new-interests
			document.getElementById("input-add-interest").classList.remove("hide");
			// mostrar question-interest
			document.querySelector(".question-interest").classList.remove("hide");
		}
	} else {
		//msg de não pode deixar campos vazios
		const pEmptyFields = document.querySelector(".no-empty-fields-interest");
		pEmptyFields.classList.remove("hide");
		setTimeout(() => {
			pEmptyFields.classList.add("hide");
		}, 2000);
	}
}

document
	.getElementById("cancel-create-interest")
	.addEventListener("click", function () {
		//limpar tudo
		document.getElementById("input-new-interests").value = "";
		document.querySelector(".create-new-interests").classList.add("hide");
		//mostrar input de busca ativa - id input-new-interests
		document.getElementById("input-add-interest").classList.remove("hide");
		// mostrar question-interest
		document.querySelector(".question-interest").classList.remove("hide");
	});

//////////////////////////////////////////////////////////////////
//Buscar ideias/necessidades atuais do forum - linha 443 bakc
//////////////////////////////////////////////////////////////////
async function getCurrentForums() {
	//fetch forum controller linha 446
	///{id}/get/Association
	forumsAssociated = await doFetchWithResponse(
		urlDefault + "forum/" + idForum + "/get/Association",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (forumsAssociated === 403) {
		window.location.href = "generalError.html";
	} else if (forumsAssociated === 401) {
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Erro a carregar as ideias!</p>`;
		document.querySelector(
			".no-result-necessities",
		).innerHTML = `<p class = "error-text">Erro a carregar as necessidades!</p>`;

		setTimeout(() => {
			document.querySelector(".no-result-ideas").innerHTML = "";
			document.querySelector(".no-result-necessities").innerHTML = "";
		});
	} else if (forumsAssociated instanceof Object) {

		//carrregar spans
		for (let i = 0; i < forumsAssociated.length; i++) {
			if (forumsAssociated[i].associatedForum.type == ForumType.IDEA) {
				//carregar span de ideias
				loadSpanIdea(
					forumsAssociated[i].associatedForum,
					forumsAssociated[i].id,
					forumsAssociated[i].description,
				); //seria o id da associação e depois a descrição da associação
			} else {
				//carregar span de necessidades
				loadSpanNecessity(
					forumsAssociated[i].associatedForum,
					forumsAssociated[i].id,
					forumsAssociated[i].description,
				); //seria o id da associação e depois a descrição da associação
			}
		}
	}
}

//////////////////////////////////////////////////////////////////
//Busca ativa por ideias
//////////////////////////////////////////////////////////////////
const divSpanIdeas = document.querySelector(".span-ideas");
const searchIdeasInput = document.getElementById("input-add-idea");
const boxSearchIdeas = document.querySelector(".box-search-ideas");
const boxIdeasResults = document.querySelector(".results-ideas");
const divEditAssociationIdea = document.querySelector(".edit-association-idea");
const divBtnAssociateIdea = document.querySelector(".button-associate-idea");

searchIdeasInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxIdeasResults.children.length > 0) {
		boxIdeasResults.removeChild(boxIdeasResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
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

		for (let j = 0; j < ideasFound.length; j++) {
			if (ideasFound[j].id == idForum) {
				ideasFound.splice(j, 1);
			}
		}

		// enviar a lista já "limpa" para renderizar na ul
		renderIdeasResults(ideasFound);
	}
}

function renderIdeasResults(ideasFound) {
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
		searchIdeasInput.value = "";
		return boxSearchIdeas.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-ideas";

	for (let i = 0; i < ideasFound.length; i++) {
		//evitar mostrar a própria ideia/necessidade que está sendo editada
		//if (ideasFound[i].title != inputTitle.value) {
		let li = document.createElement("li");
		li.className = "li-ideas";
		li.innerText = ideasFound[i].title;
		// li.setAttribute("id", skillsFound[i].idSkill); // aqui seria skillsFound[i].id

		//evento de adicionar a span com a skill escolhida
		li.addEventListener("click", function (e) {
			document.getElementById("input-add-idea").value = ideasFound[i].title;
			selectedIdea = ideasFound[i];
			//retirar as opções
			if (boxIdeasResults.children[0]) {
				boxIdeasResults.removeChild(boxIdeasResults.children[0]);
			}
		});
		ul.appendChild(li);
		//}
	}
	//colocar a ul dentro da div
	boxIdeasResults.appendChild(ul);
	boxSearchIdeas.classList.add("show");
}

//////////////////////////////////////////////////////////////////////////
//ação do botão associar
document.getElementById("associate-idea").addEventListener("click", () => {

	//colocar o texto default de volta no input
	document.getElementById("input-add-idea").placeholder =
		"procura a ideia que queres associar";

	//retirar as opções
	if (boxIdeasResults.children[0]) {
		boxIdeasResults.removeChild(boxIdeasResults.children[0]);
	}

	// pegar a ideia selecionada pelo user e envia para carregar a span
	loadSpanIdea(selectedIdea); // aqui seria a skill toda, com id e titulo
});

//elementos html de editar associação
const divEditIdeasAssociation = document.querySelector(
	".edit-association-idea",
);
const inputEditIdeasAssociation = document.getElementById(
	"input-association-idea",
);

//Aqui vai construir o span respetivo
function loadSpanIdea(ideaFound, idAssociation, descriptionAssociation) {
	//
	if (ideaFound) {
		//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
		let repeated = false;
		for (let i = 0; i < forumsArray.length; i++) {
			if (forumsArray[i].idToAssociate === ideaFound.id) {
				repeated = true;
			}
		}

		if (repeated === true) {
			//carregar warning:
			searchIdeasInput.placeholder = "Ideia já escolhida!!!";
			searchIdeasInput.classList.add("warning-repeated");
			setTimeout(function () {
				searchIdeasInput.placeholder = "procura a ideia que queres associar";
				searchIdeasInput.classList.remove("warning-repeated");
			}, 3000);
		} else {

			//exibir o espaço onde entrarão os spans
			divSpanIdeas.classList.remove("hide");

			// ver se já era um forum adicionado ou se é um novo forum
			let currentForum = false;
			for (let i = 0; i < forumsAssociated.length; i++) {
				if (forumsAssociated[i].associatedForum.id == ideaFound.id) {
					console.log("Found veio da base de dados ");
					currentForum = true;
				}
			}

			//preciso do texto da associação e do id da opção escolhida
			let textAssociation = "";
			if (currentForum) {
				textAssociation = descriptionAssociation;
			} else {
				textAssociation = document.getElementById(
					"association-text-idea",
				).value;
			}
			//colocar no array de adicionar forums em forma de objeto:
			forumsArray.push({
				idToAssociate: ideaFound.id,
				text: textAssociation,
			});

			//verificar se a skills que estou adicionando está no array de remover
			// se estiver retirar
			for (let i = 0; i < forumsToRemove.length; i++) {
				//
				if (forumsToRemove[i].idForum === ideaFound.id) {
					forumsToRemove.splice(i, 1);
				}
			}

			const sectionSpan = document.getElementById("ids-ideas");
			let spanCreated = document.createElement("span"); // criar a span
			spanCreated.className = "span-to-skill";
			spanCreated.innerText = ideaFound.title; // aqui algo tipo skillFound.title
			spanCreated.setAttribute("id", ideaFound.id);

			//icone de excluir
			let icon = document.createElement("i"); //icone
			icon.className = "fa-solid fa-xmark delete-icon";
			icon.setAttribute("id", ideaFound.id + "-icon");
			//
			// evento do botão excluir de cada span
			icon.addEventListener("click", function (e) {
				// excluir do array que vai ao back

				//colocar no array de remover em forma de objeto:

				//Antes evitar repetições no array de remover
				let existInArray = false;
				for (let i = 0; i < forumsToRemove.length; i++) {
					if (forumsToRemove[i].idAssociation == idAssociation) {
						existInArray = true;
					}
				}

				if (existInArray == false) {
					forumsToRemove.push({
						idAssociation: idAssociation,
						idForum: ideaFound.id,
					});
				}

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

			//currentForum = true é forum já associado
			//icone de editar associação
			let editIcon = document.createElement("i"); //icone
			editIcon.className = "fa-solid fa-pen-to-square edit-icon";
			editIcon.setAttribute("id", ideaFound.id + "-editIcon");

			////////////////////////////////////////////////////////////////////////
			// evento do botão editar associação  de cada span
			editIcon.addEventListener("click", function (e) {
				//mostra o botão
				divEditAssociationIdea.classList.remove("hide");
				divBtnAssociateIdea.classList.add("hide");
				//texto no input *******************************
				searchIdeasInput.value = ideaFound.title;

				//Pegar o texto da associação
				for (let i = 0; i < forumsArray.length; i++) {
					if (forumsArray[i].idToAssociate == ideaFound.id) {
						document.getElementById("association-text-idea").value =
							forumsArray[i].text;
					}
				}
				editedIdea = ideaFound; // recebe a ideia que está sendo editada pelo user
			}); //fim editIcon eventListener

			spanCreated.appendChild(icon);
			spanCreated.appendChild(editIcon);
			//adicionar a skill na sectionSpan
			sectionSpan.appendChild(spanCreated);
		}

		//limpar tudo
		searchIdeasInput.value = "";
		document.getElementById("association-text-idea").value = "";
		//retirar as opções
		if (boxIdeasResults.children[0]) {
			boxIdeasResults.removeChild(boxIdeasResults.children[0]);
		}
		selectedIdea = "";
	}
}

//////////////////////////////////////////////////////////////////////////
//ação do botão guardar edição da associação de ideia
document
	.getElementById("edit-association-btn-idea")
	.addEventListener("click", () => {
		

		let currentForum = false;
		let idCurrentAssociation = 0;
		for (let i = 0; i < forumsAssociated.length; i++) {
			if (forumsAssociated[i].associatedForum.id == editedIdea.id) {
				currentForum = true;
				idCurrentAssociation = forumsAssociated[i].id;
			}
		}

		//Se forum veio da bd:
		if (currentForum) {
			//  tirar de forumArray
			for (let i = 0; i < forumsArray.length; i++) {
				if (forumsArray[i].idToAssociate == editedIdea.id) {
					forumsArray.splice(i, 1);
				}
			}

			//  colocar em forumToRemove - pois primeiro o forum será desassociado pelo backend
			// e com isso a associação atual deixa de existir
			//colocar no array de removerem forma de objeto:
			// evitar repetições em forumToRemove
			let existInArray = false;
			for (let i = 0; i < forumsToRemove.length; i++) {
				if (forumsToRemove[i].idAssociation == idCurrentAssociation) {
					existInArray = true;
				}
			}

			if (existInArray == false) {
				forumsToRemove.push({
					idAssociation: idCurrentAssociation,
					idForum: editedIdea.id,
				});
			}

			//  Colocar de volta em forumArray com novo texto de associação, pois depois de remover
			// o forum será adicionado de volta, porém atualizado
			//colocar no array de adicionar forums em forma de objeto:
			forumsArray.push({
				idToAssociate: editedIdea.id,
				text: document.getElementById("association-text-idea").value,
			});
			//
		} else {
			// se é um forum recem criado pelo user
			//  Percorre forumArray e troca o texto da associação
			for (let i = 0; i < forumsArray.length; i++) {
				if (forumsArray[i].idToAssociate == editedIdea.id) {
					forumsArray[i].text = document.getElementById(
						"association-text-idea",
					).value;
				}
			}
		}

		//limpar o input
		searchIdeasInput.value = "";
		document.getElementById("association-text-idea").value = "";

		//gerir area do botão
		divEditAssociationIdea.classList.add("hide");
		divBtnAssociateIdea.classList.remove("hide");
	});

// botaõ cancelar
document.getElementById("cancel-edit-idea").addEventListener("click", () => {
	searchIdeasInput.value = "";
	document.getElementById("association-text-idea").value = "";
	divEditAssociationIdea.classList.add("hide");
	divBtnAssociateIdea.classList.remove("hide");
});

//////////////////////////////////////////////////////////////////
//Busca ativa por necessidades
//////////////////////////////////////////////////////////////////
const divSpanNecessities = document.querySelector(".span-necessities");
const searchNecessityInput = document.getElementById("input-add-necessity");
const boxSearchNecessities = document.querySelector(".box-search-necessities");
const boxNecessitiesResults = document.querySelector(".results-necessity");
const divEditAssociationNecessity = document.querySelector(
	".edit-association-necessity",
);
const divBtnAssociateNecessity = document.querySelector(
	".button-associate-necessity",
);

searchNecessityInput.addEventListener("keyup", () => {
	// SE a div de resultados tiver um ul e lis dentro, remover todos
	if (boxNecessitiesResults.children.length > 0) {
		boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
	}
	//Cada vez que for digitada uma letra:
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

		for (let j = 0; j < necessitiesFound.length; j++) {
			if (necessitiesFound[j].id == idForum) {
				necessitiesFound.splice(j, 1);
			}
		}

		// enviar a lista já "limpa" para renderizar na ul
		renderNecessityResults(necessitiesFound);
	}
}

function renderNecessityResults(necessitiesFound) {
	//
	if (boxNecessitiesResults.children.length > 0) {
		boxNecessitiesResults.innerHTML = "";
		//boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
	}

	if (!necessitiesFound.length) {
		document.querySelector(
			".no-result-necessities",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-necessities").innerHTML = "";
		}, 2000);
		searchNecessityInput.value = "";
		return boxSearchNecessities.classList.remove("show");
	}

	let ul = document.createElement("ul"); // criar a lista
	ul.className = "ul-necessity";

	for (let i = 0; i < necessitiesFound.length; i++) {
		//evitar mostrar a própria ideia/necessidade que está sendo editada
		//if (necessitiesFound[i].title != inputTitle.value) {
		let li = document.createElement("li");
		li.className = "li-necessity";
		li.innerText = necessitiesFound[i].title; // aqui seria .title ou algo assim
		// li.setAttribute("id", skillsFound[i].idSkill); // aqui seria skillsFound[i].id

		//evento de adicionar a span com a skill escolhida
		li.addEventListener("click", function () {
			document.getElementById("input-add-necessity").value =
				necessitiesFound[i].title;
			selectedNecessity = necessitiesFound[i];
			//retirar as opções
			if (boxNecessitiesResults.children[0]) {
				boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
			}
		});
		ul.appendChild(li);
		//}
	}
	//colocar a ul dentro da div
	boxNecessitiesResults.appendChild(ul);
	boxSearchNecessities.classList.add("show");
}

//////////////////////////////////////////////////////////////////////////
//ação do botão associar
document.getElementById("associate-necessity").addEventListener("click", () => {

	//colocar o texto default de volta no input
	document.getElementById("input-add-necessity").placeholder =
		"procura a necessidade que queres associar";

	//retirar as opções
	if (boxNecessitiesResults.children[0]) {
		boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
	}

	// pegar a ideia selecionada pelo user e envia para carregar a span
	loadSpanNecessity(selectedNecessity); // aqui seria  com id e titulo
});

//elementos html de editar associação
const divEditNecessityAssociation = document.querySelector(
	".edit-association-necessity",
);
const inputEditNecessityAssociation = document.getElementById(
	"input-association-necessity",
);

//Aqui vai construir o span respetivo
function loadSpanNecessity(
	necessityFound,
	idAssociation,
	descriptionAssociation,
) {

	if (necessityFound) {
		//verificar se o user já escolheu esta opcao e se a mesma já está na lista que vai para o backend:
		let repeated = false;
		for (let i = 0; i < forumsArray.length; i++) {
			if (forumsArray[i].idToAssociate === necessityFound.id) {
				repeated = true;
			}
		}

		if (repeated === true) {
			//carregar warning:
			searchNecessityInput.placeholder = "Necessidade já escolhida!!!";
			searchNecessityInput.classList.add("warning-repeated");
			setTimeout(function () {
				searchNecessityInput.placeholder =
					"procura a necessidade que queres associar";
				searchNecessityInput.classList.remove("warning-repeated");
			}, 3000);
		} else {

			//exibir o espaço onde entrarão os spans
			divSpanNecessities.classList.remove("hide");

			// ver se já era um forum adicionado ou se é um novo forum
			let currentForum = false;
			for (let i = 0; i < forumsAssociated.length; i++) {
				if (forumsAssociated[i].associatedForum.id == necessityFound.id) {
					currentForum = true;
				}
			}

			//preciso do texto da associação e do id da opção escolhida
			let textAssociation = "";
			if (currentForum) {
				textAssociation = descriptionAssociation;
			} else {
				textAssociation = document.getElementById(
					"association-text-necessity",
				).value;
			}

			//colocar no array em forma de objeto:
			forumsArray.push({
				idToAssociate: necessityFound.id,
				text: textAssociation,
			});

			//verificar se a skills que estou adicionando está no array de remover
			// se estiver retirar
			for (let i = 0; i < forumsToRemove.length; i++) {
				//
				if (forumsToRemove[i].idForum === necessityFound.id) {
					forumsToRemove.splice(i, 1);
				}
			}

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

				//colocar no array de removerem forma de objeto evitando repetidos
				let existInArray = false;
				for (let i = 0; i < forumsToRemove.length; i++) {
					if (forumsToRemove[i].idAssociation == idAssociation) {
						existInArray = true;
					}
				}

				if (existInArray == false) {
					forumsToRemove.push({
						idAssociation: idAssociation,
						idForum: necessityFound.id,
					});
				}

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
					divSpanNecessities.classList.add("hide");
				}
			});

			//<i class="fa-solid fa-pen-to-square"></i>
			let editIcon = document.createElement("i"); //icone
			editIcon.className = "fa-solid fa-pen-to-square edit-icon";

			// evento do botão editar associação  de cada span
			editIcon.addEventListener("click", function (e) {

				//exibir a div caso esteja escondida e esconder caso esteja amostra*/
				//el.classList.contains("alguma_classe")

				divEditAssociationNecessity.classList.remove("hide");
				divBtnAssociateNecessity.classList.add("hide");

				searchNecessityInput.value = necessityFound.title;

				//Pegar o texto da associação
				for (let i = 0; i < forumsArray.length; i++) {
					if (forumsArray[i].idToAssociate == necessityFound.id) {
						document.getElementById("association-text-necessity").value =
							forumsArray[i].text;
					}
				}
				editedNecessity = necessityFound;
			}); //fim editIcon eventListener

			spanCreated.appendChild(icon);
			spanCreated.appendChild(editIcon);
			//adicionar a skill na sectionSpan
			sectionSpan.appendChild(spanCreated);
		}

		//limpar tudo
		searchNecessityInput.value = "";
		document.getElementById("association-text-necessity").value = "";

		//retirar as opções
		if (boxNecessitiesResults.children[0]) {
			boxNecessitiesResults.removeChild(boxNecessitiesResults.children[0]);
		}
		selectedNecessity = "";
	}
}

//////////////////////////////////////////////////////////////////////////
//ação do botão guardar edição da associação de necessidade
document
	.getElementById("edit-association-btn-nec")
	.addEventListener("click", () => {

		let currentForum = false;
		let idCurrentAssociation = 0;
		for (let i = 0; i < forumsAssociated.length; i++) {
			if (forumsAssociated[i].associatedForum.id == editedNecessity.id) {
				currentForum = true;
				idCurrentAssociation = forumsAssociated[i].id;
			}
		}

		//Se forum veio da bd:
		if (currentForum) {
			//  tirar de forumArray
			for (let i = 0; i < forumsArray.length; i++) {
				if (forumsArray[i].idToAssociate == editedNecessity.id) {
					forumsArray.splice(i, 1);
				}
			}

			//  colocar em forumToRemove - pois primeiro o forum será desassociado pelo backend
			// e com isso a associação atual deixa de existir
			//colocar no array de removerem forma de objeto, evitando repetições
			let existInArray = false;
			for (let i = 0; i < forumsToRemove.length; i++) {
				if (forumsToRemove[i].idAssociation == idCurrentAssociation) {
					existInArray = true;
				}
			}

			if (existInArray == false) {
				forumsToRemove.push({
					idAssociation: idCurrentAssociation,
					idForum: editedNecessity.id,
				});
			}

			//  Colocar de volta em forumArray com novo texto de associação, pois depois de remover
			// o forum será adicionado de volta, porém atualizado
			//colocar no array de adicionar forums em forma de objeto:
			forumsArray.push({
				idToAssociate: editedNecessity.id,
				text: document.getElementById("association-text-necessity").value,
			});
			//
		} else {
			// se é um forum recem criado pelo user
			//  Percorre forumArray e troca o texto da associação
			for (let i = 0; i < forumsArray.length; i++) {
				if (forumsArray[i].idToAssociate == editedNecessity.id) {
					forumsArray[i].text = document.getElementById(
						"association-text-necessity",
					).value;
				}
			}
		}

		//limpar o input
		searchNecessityInput.value = "";
		document.getElementById("association-text-necessity").value = "";
		divEditAssociationNecessity.classList.add("hide");
		divBtnAssociateNecessity.classList.remove("hide");
	});

// botaõ cancelar
document
	.getElementById("cancel-edit-necessity")
	.addEventListener("click", () => {
		searchNecessityInput.value = "";
		document.getElementById("association-text-necessity").value = "";
		divEditAssociationNecessity.classList.add("hide");
		divBtnAssociateNecessity.classList.remove("hide");
	});

//////////////////////////////////////////////////////////////////
//Editar Forum
//////////////////////////////////////////////////////////////////
document.querySelector(".edit-forum").addEventListener("click", function (e) {
	editForum();
});

async function editForum() {
	console.log("******** CLICK BOTAO EDITAR FORUM ********************");
	console.log("idsSkillsToRemove");
	console.log(idsSkillsToRemove);
	console.log("idsSkillsArray");
	console.log(idsSkillsArray);

	console.log("idsInterestsToRemove");
	console.log(idsInterestsToRemove);
	console.log("idsInterestArray");
	console.log(idsInterestArray);

	console.log("forumsToRemove");
	console.log(forumsToRemove);

	console.log("forumsArray *****************************************");
	console.log(forumsArray);

	const title = inputTitle.value;
	const titleTrim = inputTitle.value.trim();

	//pegar a descrição
	const descriptionQuill = quillEditor.children[0].innerHTML;

	if (
		title.value != "" &&
		titleTrim.length > 0 &&
		quillEditor.children[0].children[0].innerHTML !== `<br>`
	) {
		//criar body
		let newForum = {
			description: descriptionQuill,
			title: title,
		};

		//forum controler linha 325
		const responseEdit = await doFetchNoResponse(
			urlDefault + "forum/edit/" + idForum,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newForum),
			},
		);

		if (responseEdit == 200) {
			////////////////////////////////////////////////////////////////////////
			//chamar método que vai verificar as associações a serem editadas
			supportEditAssociations();
		} else {
			if (responseEdit === 403) {
				window.location.href = "generalError.html";
			}
			const pEmptyFields = document.querySelector(".no-empty-fields-edit");
			window.scrollTo(0, 0); //ir para topo da página
			aux = "";
			if (type === "id") {
				aux =
					"Não foi possível guardar as alterações feitas no texto da sua ideia!";
			} else if (type === "nec") {
				aux =
					"Não foi possível guardar as alterações feitas no texto da sua necessidade!";
			}
			pEmptyFields.innerText = aux;
			pEmptyFields.classList.remove("hide");
			setTimeout(() => {
				pEmptyFields.innerText = "";
				pEmptyFields.classList.add("hide");
			}, 3000);
			allFetchsResponseOk = false;
		}

		////////////////////////////////////////////////////////////////
		//Se tudo correu bem levar user para ver como ficou o Forum
		/*if (allFetchsResponseOk == true) {
			dataUrl.delete("id");
			dataUrl.append("id", idForum);
			//window.location.href = "seeForum.html?" + dataUrl.toString();
		} else {
			//FALTA e se alguma requisição correu mal e allFetchsResponseOk== false ???
			//mandar a página de erro???
		}*/
	} else {
		// msg de não pode deixar campos vazios
		const pEmptyFields = document.querySelector(".no-empty-fields-edit");
		window.scrollTo(0, 0); //ir para topo da página
		pEmptyFields.innerText =
			"Por favor complete o título e/ou descrição. Estes campos não podem estar vazios!";
		pEmptyFields.classList.remove("hide");
		setTimeout(() => {
			pEmptyFields.innerText = "";
			pEmptyFields.classList.add("hide");
		}, 3000);
	}
}

//////////////////////////////////////////////////////////////////
//Verificar alterações nas associações a serem feitas
//////////////////////////////////////////////////////////////////
async function supportEditAssociations() {
	/////////////////////////////////////////////////////
	//Ver se foram selecionadas skills para DESassociar:
	/////////////////////////////////////////////////////
	if (idsSkillsToRemove.length > 0) {
		//criar o body com os ids
		let ids = {
			idsSkills: idsSkillsToRemove,
		};
		//skill controller linha 243
		responseFetch = await doFetchNoResponse(
			urlDefault + "skills/desassociate/forum/" + idForum,
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
			).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a desassociar as skills!</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".no-result-skills").innerHTML = "";
			}, 3000);
		}
		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		idsSkillsToRemove = [];
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
	//Ver se foram selecionadas skills para associar:
	/////////////////////////////////////////////////////
	// Aqui poderia ter ainda && deu200 == true;
	if (idsSkillsArray.length > 0) {
		//criar o body com os ids
		let ids = {
			idsSkills: idsSkillsArray,
		};

		//skill controller linha 210
		responseFetch = await doFetchNoResponse(
			urlDefault + "skills/associate/with/forum/" + idForum,
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
		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		idsSkillsArray = [];
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
	//Ver se foram selecionadas interesses para DESassociar:
	/////////////////////////////////////////////////////
	if (idsInterestsToRemove.length > 0) {
		//criar o body com os ids
		let ids = {
			idsInterest: idsInterestsToRemove,
		};
		//interest controller linha 172
		responseFetch = await doFetchNoResponse(
			urlDefault + "interests/desassociate/forum/" + idForum,
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
				".no-result-interest",
			).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a desassociar os interesses!</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".no-result-interest").innerHTML = "";
			}, 3000);
		}
		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		idsInterestsToRemove = [];
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
	//Ver se foram selecionadas interesses para associar:
	/////////////////////////////////////////////////////
	if (idsInterestArray.length > 0) {
		//criar o body com os ids
		let ids = {
			idsInterest: idsInterestArray,
		};
		//interest controller linha 137
		responseFetch = await doFetchNoResponse(
			urlDefault + "interests/associate/with/forum/" + idForum,
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
		// remover os spans:
		if (divSpanInterests.children.length > 0) {
			for (let i = 0; divSpanInterests.children.length > 0; i++) {
				divSpanInterests.removeChild(divSpanInterests.children[0]);
			}
		}
		//fechar area de spans
		divSpanInterests.classList.add("hide");
	}

	//
	let auxiliaryCounter = 0;
	let length = forumsToRemove.length;
	/////////////////////////////////////////////////////
	//PRIMEIRO REMOVER FORUMS~
	if (forumsToRemove.length > 0) {

		//
		for (let i = 0; i < forumsToRemove.length; i++) {
			//
			if (forumsToRemove[i].idAssociation !== null) {
				// chamar endpoint para DESassociar uma ideia/necessidade a outra ideia/necessidade
				//o id é o id da associação
				//forum controller linha 292
				responseFetch = await doFetchNoResponse(
					urlDefault + "forum/desassociate/" + forumsToRemove[i].idAssociation,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
					},
				);
				// verificar se resposta da requisição foi 200
				if (responseFetch == 200) {
					// successfullyRemoved = true;
					auxiliaryCounter++;
				} else {
					allFetchsResponseOk = false;
					document.querySelector(
						".no-result-ideas",
					).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a desassociar as ideias!</p>`;
					document.querySelector(
						".no-result-necessities",
					).innerHTML = `<p class = "error-text">Pedimos desculpa, mas ocorreu um erro a desassociar as necessidades!</p>`;
					// Depois de 3 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-ideas").innerHTML = "";
						document.querySelector(".no-result-necessities").innerHTML = "";
					}, 3000);
				}
			}
		}

		//////////////////////////////////////////////////////////////////
		//Limpar tudo
		forumsToRemove = [];
		console.log("limpar forumsArray");
		console.log(forumsToRemove);
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

		console.log(
			"Antes do if de adicionar auxiliaryCounter " + auxiliaryCounter,
		);
	}

	let lengthForumsToAdd = forumsArray.length;
	let counter = 0;
	//if de add forums
	if (
		// successfullyRemoved == true &&
		(forumsArray.length > 0 && auxiliaryCounter == length) ||
		(forumsArray.length > 0 && forumsToRemove.length == 0)
	) {
		console.log("entrei no if do adicionar");
		console.log("array ", forumsArray);

		for (let i = 0; i < forumsArray.length; i++) {
			//gerar o body
			let bodyAssociation = {
				description: forumsArray[i].text,
			};

			console.log("criei o body para o forum " + forumsArray[i].title);
			console.log(bodyAssociation);

			// chamar endpoint para associar uma ideia/necessidade a outra ideia/necessidade
			// firstId é o id do forum original
			// secondId é o id do forum a ser adicionado
			///associate/{firstId}/with/{secondId}
			//forum controller linha 253
			responseFetch = await doFetchNoResponse(
				urlDefault +
					"forum/associate/" +
					idForum +
					"/with/" +
					forumsArray[i].idToAssociate,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(bodyAssociation),
				},
			);

			counter++;
			console.log("voltei do fetch associar forums");
			console.log(responseFetch);
			// verificar se resposta da requisição foi 200
			if (responseFetch != 200) {
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
		}

		// Associou todos os foruns que tinha para associar
		if (allFetchsResponseOk == true && counter == lengthForumsToAdd) {
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
			dataUrl.delete("id");
			dataUrl.append("id", idForum);
			window.location.href = "seeForum.html?" + dataUrl.toString();

			// algo correu mal em todo o editar, espera uns segundos para exibir o respetivo erro e depois encaminha o user
		} else if (allFetchsResponseOk == false && counter == lengthForumsToAdd) {
			setTimeout(() => {
				location.reload();
			}, 6000);
		}
	}
} // fim support

//botão de voltar para o ver forum
document.getElementById("go-back-to-edit").addEventListener("click", () => {
	window.location.href = "seeForum.html?id=" + idForum;
});

//////////////////////////////////////////////////////////////////
//Apagar forum
/////////////////////////////////////////////////////////////////
document
	.getElementById("softDelete-btn")
	.addEventListener("click", deleteForum);

async function deleteForum() {
	document.querySelector("#edit-forum-button-div").classList.add("hide");
	document.querySelector(".new-forum-container").classList.add("hide");
	document.getElementById("associations-title").classList.add("hide");
	document.querySelector(".forum-associations").classList.add("hide");
	document.querySelector(".edit-forum").classList.add("hide");

	const divWithQuestion = document.createElement("div");
	divWithQuestion.className = "project-question";

	const p = document.createElement("p");
	p.className = "project-question-p";
	let questionAux = "";
	if (type === "id") {
		questionAux = "Quer eliminar esta ideia?";
	} else if (type === "nec") {
		questionAux = "Quer eliminar esta necessidade?";
	}
	p.innerText = questionAux;

	divWithQuestion.appendChild(p);

	const errorP = document.createElement("p");
	errorP.className = "project-question-error hide";
	let textAux = "";
	errorP.innerText = textAux;

	divWithQuestion.appendChild(errorP);

	const buttonDiv = document.createElement("div");
	buttonDiv.className = "project-question-button-div";

	const yesBtn = document.createElement("button");
	yesBtn.className = "div-question-button";
	yesBtn.innerText = "SIM";
	yesBtn.addEventListener("click", async () => {
		//forum controller linha 863
		const status = await doFetchNoResponse(
			urlDefault + "forum/delete/" + idForum,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			},
		);

		if (status === 200) {
			divWithQuestion.classList.add("hide");

			const h4 = document.createElement("h4");
			h4.className = "finished-forum-info";

			/*ACABAR - VER CSS*/
			if (type === "id") {
				questionAux = "Ideia eliminada com sucesso!";
			} else if (type === "nec") {
				questionAux = "Necessidade eliminada com sucesso!";
			}
			h4.innerText = questionAux;

			document.querySelector(".body").append(h4);

			setTimeout(() => {
				window.location.href = "feedForum.html";
			}, 4000);
		} else {
			//VERIFICAR SE FOI UM ERRO SOBRE NÃO SER POSSÍVEL APAGAR AQUELA IDEIA OU NECESSIDADE
			//POR ESTAR ASSOCIADA A UM PROJETO OU SE FOI O PRÓPRIO SISTEMA QUE NÃO CONSEGUIU
			let aux = "";
			//485	não pode apagar o forum porque é o único (ativo) que se encontra associado ao projeto
			if (status === 485) {
				if (type === "id") {
					aux =
						"Pedimos desculpa mas não foi possível eliminar esta ideia pois é a única associada a um projeto!";
				} else if (type === "nec") {
					aux =
						"Pedimos desculpa mas não foi possível eliminar esta necessidade pois é a única associada a um projeto!";
				}
				errorP.innerText = aux;
			} else {
				if (type === "id") {
					aux =
						"Pedimos desculpa mas não foi possível eliminar esta ideia! Tenta novamente mais tarde!";
				} else if (type === "nec") {
					aux =
						"Pedimos desculpa mas não foi possível eliminar esta necessidade! Tenta novamente mais tarde!";
				}
				errorP.innerText = aux;
			}
			errorP.classList.remove("hide");
			buttonDiv.remove();

			const newbuttonDiv = document.createElement("div");
			newbuttonDiv.className = "project-question-button-div";

			const goBack = document.createElement("button");
			goBack.className = "div-question-button-error";
			goBack.innerText = "VOLTAR";
			goBack.addEventListener("click", () => {
				document
					.querySelector("#edit-forum-button-div")
					.classList.remove("hide");
				document.querySelector(".new-forum-container").classList.remove("hide");
				document.getElementById("associations-title").classList.remove("hide");
				document.querySelector(".forum-associations").classList.remove("hide");
				document.querySelector(".edit-forum").classList.remove("hide");
				divWithQuestion.remove();
			});

			newbuttonDiv.appendChild(goBack);
			divWithQuestion.appendChild(newbuttonDiv);
		}
	});

	buttonDiv.appendChild(yesBtn);

	const noBtn = document.createElement("button");
	noBtn.className = "div-question-button";
	noBtn.innerText = "NÃO";
	noBtn.addEventListener("click", () => {
		document.querySelector("#edit-forum-button-div").classList.remove("hide");
		document.querySelector(".new-forum-container").classList.remove("hide");
		document.getElementById("associations-title").classList.remove("hide");
		document.querySelector(".forum-associations").classList.remove("hide");
		document.querySelector(".edit-forum").classList.remove("hide");
		divWithQuestion.remove();
	});

	buttonDiv.appendChild(noBtn);

	divWithQuestion.appendChild(buttonDiv);

	document.querySelector(".body").appendChild(divWithQuestion);
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
