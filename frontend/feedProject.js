const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const projectContainer = document.querySelector(".content-container");
let projectList = [];
let dataUrl = new URLSearchParams(window.location.search);
let resultSortCreationDate = true;
let resultSortMemberVacancies = true;
let statusProject = "";
//let projectList = [];

document.addEventListener("DOMContentLoaded", async () => {
	//user controller linha 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});

	if (userWithSession === 401 || userWithSession === 403) {
		//ACABAR - REDIRECIONAR
		window.location.href = "generalError.html";
	} else {
		if (userWithSession.type === UserType.VISITOR) {
			//ACABAR - REDIRECIONAR
			window.location.href = "feedForum.html";
		} else {
			getNotificationsOnMenu();
			// só carrega o número de notificações e de mensagens se não for visitante
			setInterval(getNotificationsOnMenu, 5000);
			loadAllProjects();
		}
	}
});

document
	.getElementById("apply-filter")
	.addEventListener("click", filterProjects);
document.getElementById("clear-filters").addEventListener("click", () => {
	clearFilters();
	loadAllProjects();
});

//MÉTODO CHAMADO LOGO QUE A PÁGINA É CARREGADA E VAI FAZER LOAD DE TODOS OS PROJETOS QUE NÃO ESTÃO DELETED
async function loadAllProjects() {
	//project controler linha 1089
	projectList = await doFetchWithResponse(urlDefault + "projects/list/all", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
	});

	if(projectList === 401){
		while (document.querySelector(".content-container").children.length > 0) {
			document.querySelector(".content-container").children[0].remove();
		}
		const error = document.createElement("p");
		error.className = "warning-text";
		error.innerText = "Ocorreu um erro! Tenta novamente mais tarde!";
		document.querySelector(".warning-container").appendChild(error);
	} else if(projectList === 403){
		window.location.href = "generalError.html";
	} else if(projectList instanceof Object){
		if (projectList.length) {
			loadProjects(projectList);
		} else {
			const error = document.createElement("p");
			error.className = "warning-text";
			error.innerText = "Sem resultados para esta pesquisa. Tente novamente.";
			document.querySelector(".warning-container").appendChild(error);
		}
	}
}

//MÉTODO QUE VAI CARREGAR A LISTA DOS FORUMS
function loadProjects(list) {
	document.querySelector(".warning-container").innerHTML = "";
	list.forEach((project) => {
		statusProject = "";
		//<div class="project-simple">
		const divProject = document.createElement("div");
		divProject.className = "project-simple";
		divProject.setAttribute("id", project.id);

		if (project.active == false) {
			statusProject = "(TERMINADO)";
		} 

		//<h6 class="project-type">PROJETO</h6>
		const h6 = document.createElement("h6");
		h6.className = "project-type";
		h6.innerText = "PROJETO " + statusProject;
		h6.classList.add("insert-hand");
		h6.addEventListener("click", () => {
			window.location.href = "seeProject.html?p=" + project.id;
		});

		divProject.appendChild(h6);

		//<i class="fa-solid fa-thumbs-up"></i>
		let icon = document.createElement("i");
		icon.className = "fa-solid fa-thumbs-up";

		//<span class="project-votes">25 <i class="fa-solid fa-thumbs-up"></i></span>
		const votes = document.createElement("span");
		votes.className = "project-votes";
		votes.innerText = project.votes + " ";
		votes.appendChild(icon);

		divProject.appendChild(votes);

		//<h6 class="project-title">bla bla bla bla bla bla</h6>
		const title = document.createElement("h6");
		title.classList = "project-title";
		title.innerText = project.title;
		//title.setAttribute("data-tooltip", "ver projeto")
		title.classList.add("insert-hand");
		title.addEventListener("click", () => {
			window.location.href = "seeProject.html?p=" + project.id;
		});

		divProject.appendChild(title);

		const hr = document.createElement("hr");

		divProject.appendChild(hr);

		//<div class="user-info">
		const divUser = document.createElement("div");
		divUser.className = "user-info";

		// <img
		//   id="forum-owner-image"
		//   src="https://randomuser.me/api/portraits/women/32.jpg"
		// />;
		let imageAux;
		if (project.ownerProj.photo === null || project.ownerProj.photo === "") {
			imageAux = "photoDefault.jpeg";
		} else {
			imageAux = project.ownerProj.photo;
		}
		const ownerPic = document.createElement("img");
		ownerPic.id = "forum-owner-image";
		ownerPic.src = imageAux;
		//ownerPic.setAttribute("data-tooltip", "ver página pessoal");
		ownerPic.classList.add("insert-hand");
		ownerPic.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(project.ownerProj.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		divUser.appendChild(ownerPic);

		//<p class="project-owner-name">Madalena Coimbra</p>
		const ownerName = document.createElement("p");
		ownerName.className = "project-owner-name";
		ownerName.innerText = project.ownerProj.fullName;
		//ownerName.setAttribute("data-tooltip", "ver página pessoal");
		ownerName.classList.add("insert-hand");
		ownerName.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(project.ownerProj.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		divUser.appendChild(ownerName);

		//<p class="project-owner-nickname">(madu)</p>
		let nickAux;
		if (
			project.ownerProj.nickname === null ||
			project.ownerProj.nickname === ""
		) {
			nickAux = "";
		} else {
			nickAux = "(" + project.ownerProj.nickname + ")";
		}
		const nicknameP = document.createElement("p");
		nicknameP.className = "project-owner-nickname";
		nicknameP.innerText = nickAux;

		divUser.appendChild(nicknameP);

		divProject.appendChild(divUser);

		//<div class="project-dates">
		const datesDiv = document.createElement("div");
		datesDiv.className = "project-dates";

		let formattedDate =supportFormattedDate(project.creationDate);
		//<p class="project-creation-date-label">Data de criação: <span id="project-creation-date">01/01/2001 12:12:12</span></p>
		const creationDateSpan = document.createElement("span");
		creationDateSpan.id = "project-creation-date";
		creationDateSpan.innerText = formattedDate;

		const creationDateP = document.createElement("p");
		creationDateP.className = "project-creation-date-label";
		creationDateP.innerText = "Data de criação: ";

		creationDateP.appendChild(creationDateSpan);

		datesDiv.appendChild(creationDateP);

		//<p class="project-member-vacancies">Número de vagas para o projeto: <span id="project-member-vacancies">2</span></p>
		const memberVacanciesSpan = document.createElement("span");
		memberVacanciesSpan.id = "project-member-vacancies";
		memberVacanciesSpan.innerText = project.memberVacancies;

		const memberVacanciesP = document.createElement("p");
		memberVacanciesP.className = "project-member-vacancies";
		memberVacanciesP.innerText = "Número de vagas para o projeto: ";

		memberVacanciesP.appendChild(memberVacanciesSpan);

		datesDiv.appendChild(memberVacanciesP);

		divProject.appendChild(datesDiv);

		projectContainer.appendChild(divProject);
	});
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

//********************************************** */
//IMPLEMENTAÇÃO DA LÓGICA DE BUSCA ATIVA EM SKILL
const inputSkill = document.getElementById("input-skill");
const suggestions = document.querySelector(".results-skills");
const divWithSpans = document.getElementById("ids-skills");
const boxSearchSkills = document.querySelector(".box-search-skills");
let idsSkillsArray = [];

//CADA VEZ QUE O USER ESCREVER ALGUMA COISA VAI PEGAR NISSO E PESQUISAR NA BASE DE DADOS PELAS SKILLS QUE TÊM ESTE TÍTULO
inputSkill.addEventListener("keyup", () => {

	if (suggestions.children.length > 0) {
		suggestions.removeChild(document.querySelector(".ul-skills"));
	}

	if (inputSkill.value.length > 0) {
		getSkillsBySearchKey(inputSkill.value);
	}
});

//MÉTODO QUE VAI NA BASE DE DADOS BUSCAR AS SKILLS
async function getSkillsBySearchKey(input) {
	//skill controller linha 279
	let skillsFound = await doFetchWithResponse(
		urlDefault + "skills/search/" + input,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);
	console.log(skillsFound);

	if(skillsFound === 401){
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
	} else if(skillsFound === 403){
		window.location.href = "generalError.html";
	} else if(skillsFound instanceof Object){
		//RETIRA REPETIDOS
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
		renderSkillsResults(skillsFound);
	}
}

//MÉTODO PARA RENDERIZAR AS SUGESTÕES
function renderSkillsResults(skillsFound) {
	if (skillsFound.length) {

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-skills";

		skillsFound.forEach((skill) => {
			let li = document.createElement("li");
			li.className = "li-skill";
			li.innerText = skill.title; // aqui é o titulo da skill
			li.setAttribute("id", skill.idSkill); // aqui seria o id da skill

			//evento de adicionar a span com a skills escolhida
			li.addEventListener("click", function () {
				console.log("clique do botão escolher skill");
				//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
				let repeated = false;
				for (let i = 0; i < idsSkillsArray.length; i++) {
					console.log("for");
					console.log(idsSkillsArray[i]);
					console.log(skill);
					if (idsSkillsArray[i] == skill.idSkill) {
						console.log("if do for");
						repeated = true;
					}
				}
				console.log("sair do for " + repeated);

				if (repeated === false) {
					loadSpanSkill(skill); // aqui seria a skill toda, com id e titulo
				} else {
					//carregar warning:
					document.querySelector(
						".no-result-skills",
					).innerHTML = `<p class = "error-text">Skill já selecionada!</p>`;
					// Depois de 2 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-skills").innerHTML = "";
					}, 2000);
					inputSkill.value = "";
				}
			});

			ul.appendChild(li);
		});

		suggestions.appendChild(ul);
		boxSearchSkills.classList.add("show");
	} else {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
		inputSkill.value = "";
		return boxSearchSkills.classList.remove("show");
	}
}

//QUANDO O USER CLICAR NALGUMA DAS OPÇÕES SUGERIDAS, VAI ADICIONAR UMA SPAN AO DIV
function loadSpanSkill(skill) {
	console.log(skill);

	let repeated = false;
	for (let i = 0; i < idsSkillsArray.length; i++) {
		if (idsSkillsArray[i] === skill.idSkill) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		console.log("achou repetida");
		//carregar warning:
		inputSkill.placeholder = "Skills já escolhida!!!";
		inputSkill.classList.add("warning-repeated");
		setTimeout(() => {
			inputSkill.placeholder = "pesquise por skills";
			inputSkill.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("NÂO achou repetida");

		//exibir o espaço onde entrarão os spans
		divWithSpans.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsSkillsArray.push(skill.idSkill); // aqui algo tipo skillFound.id

		const sectionSpan = document.getElementById("ids-skills");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = skill.title; // aqui algo tipo skillFound.title
		// spanCreated.setAttribute("id", skillFound.idSkill); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			inputSkill.value = "";
			console.log(e.target.parentElement);

			for (let i = 0; i < idsSkillsArray.length; i++) {
				// aqui seria para comparar por ids
				//idsSkills[i].id === skillFound.id
				if (idsSkillsArray[i] == skill.idSkill) {
					//preciso a posição do elemento no array
					idsSkillsArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (idsSkillsArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divWithSpans.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	inputSkill.value = "";
	suggestions.removeChild(document.querySelector(".ul-skills"));
}

//***************************************************************************** */
//BUSCA ATIVA DE IDEIAS
const inputIdea = document.getElementById("input-idea");
const suggestionsIdea = document.querySelector(".results-ideas");
const ideaDivWithSpans = document.getElementById("ids-ideas");
const boxSearchIdea = document.querySelector(".box-search-ideas");
let idsForumArray = [];

//QUANDO O USER ESCREVER ALGUMA COISA NO INPUT, VAI CHAMAR O MÉTODO PARA PROCURAR A IDEIA COM ESTE TÍTULO NA BASE DE DADOS
inputIdea.addEventListener("keyup", () => {

	if (suggestionsIdea.children.length > 0) {
		suggestionsIdea.removeChild(document.querySelector(".ul-ideas"));
	}

	if (inputIdea.value.length > 0) {
		getIdeasBySearchKey(inputIdea.value);
	}
});

//MÉTODO PARA IR BUSCAR AS IDEIAS COM AQUELE PEDAÇO DE TITULO
async function getIdeasBySearchKey(input) {
	//forum controller linha 903
	let ideasFound = await doFetchWithResponse(
		urlDefault + "forum/search/" + input + "/if/idea",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(ideasFound === 401){
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
	} else if(ideasFound === 403){
		window.location.href = "generalError.html";

	} else if(ideasFound instanceof Object){
		console.log(ideasFound);
		for (let i = 0; i < idsForumArray.length; i++) {
			//percorrer o que veio da BD
			for (let j = 0; j < ideasFound.length; j++) {
				//comparar uma lista com a outra e remover a lista que veio da BD aquelas skills que o user já escolheu
				if (ideasFound[j].id == idsForumArray[i]) {
					//preciso a posição do elemento no array
					ideasFound.splice(j, 1);
					//remover o span que o user excluiu
				}
			}
		}
		renderIdeasResults(ideasFound);
	}
	
}

//CARREGAR AS IDEIAS NOS RESULTADOS DE SUGESTÃO
function renderIdeasResults(ideasFound) {
	if (ideasFound.length) {

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-ideas";

		ideasFound.forEach((idea) => {
			let li = document.createElement("li");
			li.className = "li-ideas";
			li.innerText = idea.title; // aqui é o titulo
			li.setAttribute("id", idea.id); // aqui seria o id

			//evento de adicionar a span com a ideia escolhida
			li.addEventListener("click", function () {
				console.log("clique do botão escolher skill");
				//verificar se o user já escolheu esta ideia e se a mesma já está na lista que vai para o backend:
				let repeated = false;
				for (let i = 0; i < idsForumArray.length; i++) {
					console.log("for");
					console.log(idsForumArray[i]);
					console.log(idea);
					if (idsForumArray[i] == idea.id) {
						console.log("if do for");
						repeated = true;
					}
				}
				console.log("sair do for " + repeated);

				if (repeated === false) {
					loadSpanIdea(idea); // aqui seria a skill toda, com id e titulo
				} else {
					//carregar warning:
					document.querySelector(
						".no-result-ideas",
					).innerHTML = `<p class = "error-text">Ideia já selecionada!</p>`;
					// Depois de 2 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-ideas").innerHTML = "";
					}, 2000);
					inputIdea.value = "";
				}
			});
			ul.appendChild(li);
		});

		suggestionsIdea.appendChild(ul);
		boxSearchIdea.classList.add("show");
	} else {
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
		inputIdea.value = "";
		return boxSearchIdea.classList.remove("show");
	}
}

//QUANDO O UTILIZADOR CLICAR NALGUMA DAS SUGESTÕES, VAI PARA UM SPAN NA DIV
function loadSpanIdea(idea) {
	console.log(idea);

	let repeated = false;
	for (let i = 0; i < idsForumArray.length; i++) {
		if (idsForumArray[i] === idea.id) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		console.log("achou repetida");
		//carregar warning:
		inputIdea.placeholder = "Ideia já escolhida!!!";
		inputIdea.classList.add("warning-repeated");
		setTimeout(() => {
			inputIdea.placeholder = "pesquise por ideas";
			inputIdea.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("NÂO achou repetida");

		//exibir o espaço onde entrarão os spans
		ideaDivWithSpans.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsForumArray.push(idea.id); // aqui algo tipo skillFound.id

		const sectionSpan = document.getElementById("ids-ideas");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = idea.title; // aqui algo tipo skillFound.title
		// spanCreated.setAttribute("id", skillFound.idSkill); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			inputIdea.value = "";
			console.log(e.target.parentElement);

			for (let i = 0; i < idsForumArray.length; i++) {
				// aqui seria para comparar por ids
				//idsSkills[i].id === skillFound.id
				if (idsForumArray[i] == idea.id) {
					//preciso a posição do elemento no array
					idsForumArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (idsForumArray.length === 0) {
				//esconder de volta a div onde entram os spans
				ideaDivWithSpans.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	inputIdea.value = "";
	suggestionsIdea.removeChild(document.querySelector(".ul-ideas"));
}

/**************************************************** */
//BUSCA ATIVA DE NECESSIDADES
const inputNecessity = document.getElementById("input-necessity");
const suggestionsNecessity = document.querySelector(".results-necessity");
const necessityDivWithSpans = document.getElementById("ids-necessity");
const boxSearchNecessity = document.querySelector(".box-search-necessity");

//QUANDO O USER ESCREVER ALGUMA COISA NO INPUT, VAI CHAMAR O MÉTODO PARA PROCURAR A NECESSIDADE COM ESTE TÍTULO NA BASE DE DADOS
inputNecessity.addEventListener("keyup", () => {

	if (suggestionsNecessity.children.length > 0) {
		suggestionsNecessity.removeChild(document.querySelector(".ul-necessity"));
	}

	if (inputNecessity.value.length > 0) {
		getNecessityBySearchKey(inputNecessity.value);
	}
});

//MÉTODO PARA IR BUSCAR AS NECESSIDADES COM AQUELE PEDAÇO DE TITULO
async function getNecessityBySearchKey(input) {
	//forum controller linha 903
	let necessitiesFound = await doFetchWithResponse(
		urlDefault + "forum/search/" + input + "/if/necessity",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(necessitiesFound === 403){
		window.location.href = "generalError.html";
	} else if(necessitiesFound === 401){
		document.querySelector(
			".no-result-necessity",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 2 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-necessity").innerHTML = "";
		}, 3000);

	} else if(necessitiesFound instanceof Object){
		console.log(necessitiesFound);
		for (let i = 0; i < idsForumArray.length; i++) {
			//percorrer o que veio da BD
			for (let j = 0; j < necessitiesFound.length; j++) {
				//comparar uma lista com a outra e remover a lista que veio da BD aquelas skills que o user já escolheu
				if (necessitiesFound[j].id == idsForumArray[i]) {
					//preciso a posição do elemento no array
					necessitiesFound.splice(j, 1);
					//remover o span que o user excluiu
				}
			}
		}
		renderNecessityResults(necessitiesFound);
	}
	
}

//CARREGAR AS NECESSIDADES NOS RESULTADOS DE SUGESTÃO
function renderNecessityResults(necessitiesFound) {
	if (necessitiesFound.length) {

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-necessity";

		necessitiesFound.forEach((necessity) => {
			let li = document.createElement("li");
			li.className = "li-necessity";
			li.innerText = necessity.title; // aqui é o titulo
			li.setAttribute("id", necessity.id); // aqui seria o id

			//evento de adicionar a span com a ideia escolhida
			li.addEventListener("click", function () {
				console.log("clique do botão escolher skill");
				//verificar se o user já escolheu esta ideia e se a mesma já está na lista que vai para o backend:
				let repeated = false;
				for (let i = 0; i < idsForumArray.length; i++) {
					console.log("for");
					console.log(idsForumArray[i]);
					console.log(necessity);
					if (idsForumArray[i] == necessity.id) {
						console.log("if do for");
						repeated = true;
					}
				}
				console.log("sair do for " + repeated);

				if (repeated === false) {
					loadSpanNecessity(necessity); // aqui seria a skill toda, com id e titulo
				} else {
					//carregar warning:
					document.querySelector(
						".no-result-necessity",
					).innerHTML = `<p class = "error-text">Ideia já selecionada!<span style='font-size:20px;'>&#128527;</span></p>`;
					// Depois de 2 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-necessity").innerHTML = "";
					}, 3000);
					inputNecessity.value = "";
				}
			});

			ul.appendChild(li);
		});

		suggestionsNecessity.appendChild(ul);
		boxSearchNecessity.classList.add("show");
	} else {
		document.querySelector(
			".no-result-necessity",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.<span style='font-size:20px;'>&#128556;</span></p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-necessity").innerHTML = "";
		}, 3000);
		inputNecessity.value = "";
		return boxSearchNecessity.classList.remove("show");
	}
}

//QUANDO O UTILIZADOR CLICAR NALGUMA DAS SUGESTÕES, VAI PARA UM SPAN NA DIV
function loadSpanNecessity(necessity) {
	console.log(necessity);

	let repeated = false;
	for (let i = 0; i < idsForumArray.length; i++) {
		if (idsForumArray[i] === necessity.id) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		console.log("achou repetida");
		//carregar warning:
		inputNecessity.placeholder = "Necessidade já escolhida!!!";
		inputNecessity.classList.add("warning-repeated");
		setTimeout(() => {
			inputNecessity.placeholder = "pesquise por necessidades";
			inputNecessity.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("NÂO achou repetida");

		//exibir o espaço onde entrarão os spans
		necessityDivWithSpans.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsForumArray.push(necessity.id); // aqui algo tipo skillFound.id

		const sectionSpan = document.getElementById("ids-necessity");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = necessity.title; // aqui algo tipo skillFound.title
		// spanCreated.setAttribute("id", skillFound.idSkill); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			inputNecessity.value = "";
			console.log(e.target.parentElement);

			for (let i = 0; i < idsForumArray.length; i++) {
				// aqui seria para comparar por ids
				//idsSkills[i].id === skillFound.id
				if (idsForumArray[i] == necessity.id) {
					//preciso a posição do elemento no array
					idsForumArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

			if (idsForumArray.length === 0) {
				//esconder de volta a div onde entram os spans
				necessityDivWithSpans.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	inputNecessity.value = "";
	suggestionsNecessity.removeChild(document.querySelector(".ul-necessity"));
}

//***************************************** */
//GET DA LISTA FILTRADA
async function filterProjects() {

	if(idsSkillsArray.length === 0 && idsForumArray.length === 0) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
		document.querySelector(
			".no-result-necessity",
		).innerHTML = `<p class = "error-text">Não selecionaste critérios para a tua pesquisa!</p>`;
		setTimeout(() => {
			document.querySelector(
				".no-result-skills",
			).innerHTML = "";
			document.querySelector(
				".no-result-ideas",
			).innerHTML = "";
			document.querySelector(
				".no-result-necessity",
			).innerHTML = "";
		},3000);
	} else {
			let ids = {
			idsSkills: idsSkillsArray,
			idsForum: idsForumArray,
		};

		//project controller linha 1115
		projectList = await doFetchWithResponse(
			urlDefault + "projects/filter/skill/and/forum",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(ids),
			},
		);

		if(projectList === 401){
			while (document.querySelector(".content-container").children.length > 0) {
				document.querySelector(".content-container").children[0].remove();
			}
			const error = document.createElement("p");
			error.className = "warning-text";
			error.innerText = "Ocorreu um erro! Tenta novamente mais tarde!";
			document.querySelector(".warning-container").appendChild(error);
		} else if(projectList === 403){
			window.location.href = "generalError.html";
		} else if(projectList instanceof Object){
			clearFilters();

			//Garantir que esteja tudo zerado, caso o user queira fazer uma nova pesquisa:
			//Limpar os arrays de ids:
			idsSkillsArray = [];
			idsForumArray = [];

			//remover os spans:
			if (ideaDivWithSpans.children.length > 0) {
				for (let i = 0; ideaDivWithSpans.children.length > 0; i++) {
					ideaDivWithSpans.removeChild(ideaDivWithSpans.children[0]);
				}
			}

			if (divWithSpans.children.length > 0) {
				for (let i = 0; divWithSpans.children.length > 0; i++) {
					divWithSpans.removeChild(divWithSpans.children[0]);
				}
			}

			if (necessityDivWithSpans.children.length > 0) {
				for (let i = 0; necessityDivWithSpans.children.length > 0; i++) {
					necessityDivWithSpans.removeChild(necessityDivWithSpans.children[0]);
				}
			}

			//fechar area de spans
			ideaDivWithSpans.classList.add("hide");
			divWithSpans.classList.add("hide");
			necessityDivWithSpans.classList.add("hide");

			//fechar a aba de filtro
			document.querySelector(".details").removeAttribute("open");

			for (let i = 0; projectContainer.children.length > 0; i++) {
				projectContainer.removeChild(projectContainer.children[0]);
			}

			if (projectList.length) {
				// a pesquisa retornou com resultados
				loadProjects(projectList);
			} else if (projectList.length === 0) {
				// se a pesquisa retornou nenhum resultado
				//exibe mensagem a informar que a pesquisa não teve resultados
				//temos uma div no html para receber o erro
				document.querySelector(
					".warning-container",
				).innerHTML = `<p class = "warning-text">Não há resultados para tua pesquisa...</p>`;
				// Depois de 3 segundos tira a mensagem do ecrã
				// setTimeout(function () {
				// 	document.querySelector(".warning-container").innerHTML = "";
				// }, 2000);
			}
		}
	}
}

function updateData(projectList) {
	while (document.querySelector(".content-container").children.length > 0) {
		document.querySelector(".content-container").children[0].remove();
	}
	loadProjects(projectList);
}

function clearFilters() {
	//Limpar os arrays de ids:
	idsSkillsArray = [];
	idsForumArray = [];

	//remover os spans:
	if (ideaDivWithSpans.children.length > 0) {
		for (let i = 0; ideaDivWithSpans.children.length > 0; i++) {
			ideaDivWithSpans.removeChild(ideaDivWithSpans.children[0]);
		}
	}

	if (divWithSpans.children.length > 0) {
		for (let i = 0; divWithSpans.children.length > 0; i++) {
			divWithSpans.removeChild(divWithSpans.children[0]);
		}
	}

	if (necessityDivWithSpans.children.length > 0) {
		for (let i = 0; necessityDivWithSpans.children.length > 0; i++) {
			necessityDivWithSpans.removeChild(necessityDivWithSpans.children[0]);
		}
	}

	//fechar area de spans
	ideaDivWithSpans.classList.add("hide");
	divWithSpans.classList.add("hide");
	necessityDivWithSpans.classList.add("hide");

	for (let i = 0; projectContainer.children.length > 0; i++) {
		projectContainer.removeChild(projectContainer.children[0]);
	}
}

//ORDENAR POR DATA DE CRIAÇÃO
document.getElementById("order-by-creation").addEventListener("click", () => {
	resultSortCreationDate = !resultSortCreationDate;
	// listOrder = forumsList;
	if (resultSortCreationDate) {
		document.getElementById(
			"order-by-creation",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
	} else {
		document.getElementById(
			"order-by-creation",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
	}
	projectList.sort(function (a, b) {
		//
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
	updateData(projectList);
});

//ORDENAR POR NÚMERO DE VAGAS PARA O PROJETO
document.getElementById("order-by-vacancies").addEventListener("click", () => {
	resultSortMemberVacancies = !resultSortMemberVacancies;

	if (resultSortMemberVacancies) {
		document.getElementById(
			"order-by-vacancies",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
	} else {
		document.getElementById(
			"order-by-vacancies",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
	}
	projectList.sort(function (a, b) {
		//
		let keyA = a.memberVacancies; //seria o nosso creationDate
		let keyB = b.memberVacancies;

		if (resultSortMemberVacancies) {
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
	updateData(projectList);
});
