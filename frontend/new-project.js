const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");

//NÂO ESQUECER :Projetos para serem criados tem que obrigatoriamente ter um titulo, descrição, associar uma ideia OOUU uma necessidade

let paramNewForum = new URLSearchParams(window.location.search);
const idProject = paramNewForum.get("id");

document.addEventListener("DOMContentLoaded", async () => {
	// user controller linha 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
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

	getNotificationsOnMenu();
	// só carrega o número de notificações e de mensagens se não for visitante
	setInterval(getNotificationsOnMenu, 5000);
	if (idProject === null) {
		//ESTÁ A CRIAR UM PROJETO
		//project controller linha 1302
		const envolved = await doFetchWithResponse(
			urlDefault + "projects/envolved/in/active",
			{
				method: "POST",
				headers: { "Content-Type": "text/plain" },
			},
		);
		if(envolved === 403){
			window.location.href = "generalError.html";
		}
		console.log(envolved);
		if (envolved === false) {
			console.log("fALSOOOOOOOO");
			document
				.querySelector(".create-new-project")
				.addEventListener("click", createProject);
		} else {
			document.querySelector(".new-project-container").classList.add("hide");
			document.querySelector(".create-new-project").classList.add("hide");

			const h4 = document.createElement("h4");
			h4.className = "already-have-project";
			h4.innerText =
				"Já possui um projeto ativo! Termine-o antes de começar um novo!";

			document.querySelector(".body").append(h4);

			const p = document.createElement("p");
			p.className = "error-going-to-project visibily-hidden";
			p.innerText = "Ocorreu um erro!";

			document.querySelector(".body").append(p);

			const button = document.createElement("button");
			button.className = "go-to-my-project";
			button.innerText = "IR PARA O MEU PROJETO ATIVO";
			button.addEventListener("click", async () => {
				//project controller linha 1278
				const id = await doFetchWithResponse(
					urlDefault + "projects/my/active",
					{
						method: "GET",
						headers: { "Content-Type": "text/plain" },
					},
				);

				console.log(id.id);

				if(id === 403){
					window.location.href = "generalError.html";
				}
				if (id.id == null || id === 401) {
					console.log("undefined");
					document
						.querySelector(".error-going-to-project")
						.classList.remove("visibily-hidden");

					setTimeout(() => {
						window.location.href = "feedProjects.html";
					}, 2000);
				} else {
					window.location.href = "seeProject.html?p=" + id.id;
				}
			});

			document.querySelector(".body").appendChild(button);
		}
	} else {
		//está a tentar editar um projeto

		//VERIFICAR SE TEM AUTORIZAÇÃO PARA EDITAR O PROJETO
		//project controller linha 1327
		const hasAuth = await doFetchWithResponse(
			urlDefault + "projects/has/auth/" + idProject,
			{
				method: "POST",
				headers: { "Content-Type": "text/plain" },
			},
		);

		if(hasAuth === 403){
			window.location.href = "generalError.html"
		} else if(hasAuth === 401){
			document.querySelector(".new-project-container").classList.add("hide");
			document.querySelector(".create-new-project").classList.add("hide");

			const h4 = document.createElement("h4");
			h4.className = "already-have-project";
			h4.innerText =
				"Pedimos desculpa, mas ocorreu um erro!";

			document.querySelector(".body").append(h4);

			setTimeout(() => {
				window.location.href = "seeProject.html?p=" + idProject;
			});
		} else {
			console.log(hasAuth);

			//se user for admin do sistema ou admin do projeto
			if (hasAuth) {
				let projectToLoad;
				//try{
					//project controller linha 1145
				projectToLoad = await doFetchWithResponse(
					urlDefault + "projects/by/id/" + idProject,
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
					},
				);
	
				if (projectToLoad === 493) {
					document.querySelector(".new-project-container").classList.add("hide");
					document.querySelector(".create-new-project").classList.add("hide");

					const h4 = document.createElement("h4");
					h4.className = "already-have-project";
					h4.innerText =
						"Este projeto está eliminado!";

					document.querySelector(".body").append(h4);

					setTimeout(() => {
						window.location.href = "feedProjects.html?p=" + idProject;
					});
				}
	
				if(projectToLoad === 401){
					document.querySelector(".new-project-container").classList.add("hide");
					document.querySelector(".create-new-project").classList.add("hide");

					const h4 = document.createElement("h4");
					h4.className = "already-have-project";
					h4.innerText =
						"Pedimos desculpa, mas ocorreu um erro!";

					document.querySelector(".body").append(h4);

					setTimeout(() => {
						window.location.href = "seeProject?p=" + idProject;
					});
				}
	
				if(projectToLoad.active == false){
					document.querySelector(".new-project-container").classList.add("hide");
					document.querySelector(".create-new-project").classList.add("hide");

					const h4 = document.createElement("h4");
					h4.className = "already-have-project";
					h4.innerText =
						"Este projeto está terminado!";

					document.querySelector(".body").append(h4);

					setTimeout(() => {
						window.location.href = "seeProject?p=" + idProject;
					});
					
				}
	
				document.title = "Editar projeto";
				document.getElementById("container-title").innerText = "Editar Projeto";
				document
					.querySelector(".buttons-project-options")
					.classList.remove("hide");
	
					document
						.getElementById("finished-project")
						.addEventListener("click", finishProject);
	
				document
					.getElementById("go-back-to-edit")
					.addEventListener("click", () => {
						window.location.href = "seeProject.html?p=" + idProject
					});
				document
					.getElementById("delete-project")
					.addEventListener("click", deleteProject);
				document.querySelector(".create-new-project").innerText = "GUARDAR";
				document
					.querySelector(".create-new-project")
					.addEventListener("click", saveAlterations);
				loadProjectInformation(projectToLoad);
			} else {
				//redirecionar
				window.location.href = "seeProject.html?p=" + idProject
			}
		}

		
	}
});

async function finishProject() {
	document.querySelector(".buttons-project-options").classList.add("hide");
	document.querySelector(".new-project-container").classList.add("hide");
	document.querySelector(".create-new-project").classList.add("hide");

	const divWithQuestion = document.createElement("div");
	divWithQuestion.className = "project-question";

	const p = document.createElement("p");
	p.className = "project-question-p";
	p.innerText = "Quer dar este projeto por terminado?";

	divWithQuestion.appendChild(p);

	const errorP = document.createElement("p");
	errorP.className = "project-question-error hide";
	errorP.innerText =
		"Pedimos desculpa mas não foi possível dar o projeto por terminado! Tenta novamente mais tarde!";

	divWithQuestion.appendChild(errorP);

	const buttonDiv = document.createElement("div");
	buttonDiv.className = "project-question-button-div";

	const yesBtn = document.createElement("button");
	yesBtn.className = "div-question-button";
	yesBtn.innerText = "SIM";
	yesBtn.addEventListener("click", async () => {
		//project controller linha 594
		const status = await doFetchNoResponse(
			urlDefault + "projects/finished/" + idProject,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			},
		);

		if (status === 200) {
			divWithQuestion.classList.add("hide");

			const h4 = document.createElement("h4");
			h4.className = "finished-project-info";
			h4.innerText = "Projeto terminado com sucesso!";

			document.querySelector(".body").append(h4);

			setTimeout(() => {
				window.location.href = "seeProject.html?p=" + idProject;
			}, 4000);
		} else {
			if(status === 403){
				window.location.href = "seeProject.html?p=" + idProject;
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
					.querySelector(".buttons-project-options")
					.classList.remove("hide");
				document
					.querySelector(".new-project-container")
					.classList.remove("hide");
				document.querySelector(".create-new-project").classList.remove("hide");
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
		document.querySelector(".buttons-project-options").classList.remove("hide");
		document.querySelector(".new-project-container").classList.remove("hide");
		document.querySelector(".create-new-project").classList.remove("hide");
		divWithQuestion.remove();
	});

	buttonDiv.appendChild(noBtn);

	divWithQuestion.appendChild(buttonDiv);

	document.querySelector(".body").appendChild(divWithQuestion);
}

async function deleteProject() {
	document.querySelector(".buttons-project-options").classList.add("hide");
	document.querySelector(".new-project-container").classList.add("hide");
	document.querySelector(".create-new-project").classList.add("hide");

	const divWithQuestion = document.createElement("div");
	divWithQuestion.className = "project-question";

	const p = document.createElement("p");
	p.className = "project-question-p";
	p.innerText = "Quer eliminar este projeto?";

	divWithQuestion.appendChild(p);

	const errorP = document.createElement("p");
	errorP.className = "project-question-error hide";
	errorP.innerText =
		"Pedimos desculpa mas não foi possível eliminar este projeto! Tenta novamente mais tarde!";

	divWithQuestion.appendChild(errorP);

	const buttonDiv = document.createElement("div");
	buttonDiv.className = "project-question-button-div";

	const yesBtn = document.createElement("button");
	yesBtn.className = "div-question-button";
	yesBtn.innerText = "SIM";
	yesBtn.addEventListener("click", async () => {
		//project controller linha 1437
		const status = await doFetchNoResponse(
			urlDefault + "projects/delete/" + idProject,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			},
		);

		if (status === 200) {
			divWithQuestion.classList.add("hide");

			const h4 = document.createElement("h4");
			h4.className = "finished-project-info";
			h4.innerText = "Projeto eliminado com sucesso!";

			document.querySelector(".body").append(h4);

			setTimeout(() => {
				window.location.href = "feedProject.html";
			}, 4000);
		} else {

			if(status === 403){
				window.location.href = "feedProject.html";
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
					.querySelector(".buttons-project-options")
					.classList.remove("hide");
				document
					.querySelector(".new-project-container")
					.classList.remove("hide");
				document.querySelector(".create-new-project").classList.remove("hide");
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
		document.querySelector(".buttons-project-options").classList.remove("hide");
		document.querySelector(".new-project-container").classList.remove("hide");
		document.querySelector(".create-new-project").classList.remove("hide");
		divWithQuestion.remove();
	});

	buttonDiv.appendChild(noBtn);

	divWithQuestion.appendChild(buttonDiv);

	document.querySelector(".body").appendChild(divWithQuestion);
}

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

const optionsList = document.querySelectorAll(".option");
optionsList.forEach((o) => {
	//event listener para todos os itens da combo box
	o.addEventListener("click", () => {
		selected.innerHTML = o.querySelector("label").innerHTML; //guarda o inner html da label dentro da caixa selected
		optionsContainer.classList.remove("active"); //depois remove a classe active para fechar a combo box
	});
});

selected.addEventListener("click", () => {
	//quando alguém clica naquela div, o container fica com a classe active
	optionsContainer.classList.toggle("active"); //se estiver active, mostra as opções, senão, não mostra nada, está 'fechado'
});

document.querySelector(".question-click").addEventListener("click", () => {
	console.log(document.querySelector(".create-new-skill"));
	document.querySelector(".create-new-skill").classList.remove("hide");
});

document.getElementById("cancel-create-skill").addEventListener("click", () => {
	document.querySelector(".create-new-skill").classList.add("hide");
});

//CRIAR UMA NOVA SKILL
document
	.getElementById("create-new-skill")
	.addEventListener("click", async () => {
		const inputNewSkill = document.getElementById("input-new-skill").value;
		const inputNewSkillTrim = inputNewSkill.trim();

		let typeOfSkill = "";

		switch (selected.innerText) {
			case "Conhecimento":
				typeOfSkill = SkillType.KNOWLEDGE;
				break;
			case "Software":
				typeOfSkill = SkillType.SOFTWARE;
				break;
			case "Hardware":
				typeOfSkill = SkillType.HARDWARE;
				break;
			case "Ferramentas":
				typeOfSkill = SkillType.WORKINGTOOLS;
				break;
			default:
				break;
		}

		console.log(inputNewSkill);
		console.log(typeOfSkill);

		if (
			inputNewSkill !== "" &&
			inputNewSkillTrim.length > 0 &&
			typeOfSkill !== ""
		) {
			let newSkill = {
				title: inputNewSkillTrim,
				skillType: typeOfSkill,
			};

			const fetchOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newSkill),
			};

			//skill controller linha 45
			let idNewSkill = await doFetchWithIdResponse(
				urlDefault + "skills/new",
				fetchOptions,
			);

			if(idNewSkill instanceof Object){
				if(idNewSkill.error == 401){
					document.querySelector(
						".no-result-skills",
					).innerHTML = `<p class = "error-text">Ocorreu um erro a criar a skill!</p>`;
					// Depois de 3 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-skills").innerHTML = "";
					}, 3000);
				} else if(idNewSkill.error == 403){
					window.location.href = "generalError.html";
				}
			} else {
				loadSpanSkill({
					title: inputNewSkillTrim,
					idSkill: idNewSkill,
				});

				//LIMPAR
				document.getElementById("input-new-skill").value = "";
				selected.innerText = "Tipo de Skill";
				document.querySelector(".create-new-skill").classList.add("hide");
			}
		} else {
			document.querySelector(".empty-skill").innerText =
				"Certifica-te primeiro que preencheste as duas caixas antes de criar uma nova skill!";
			document.querySelector(".empty-skill").classList.remove("hide");

			setTimeout(() => {
				document.querySelector(".empty-skill").classList.add("hide");
				document.querySelector(".empty-skill").innerText = "";
			}, 3000);
		}
	});

// ********************************************
//BUSCA ATIVA DAS IDEIAS
//LÓGICA PARA ADICIONAR UMA IDEIA À SPAN PARA ASSOCIAR AO PROJETO
const inputIdea = document.getElementById("input-idea-proj");
const suggestionsIdea = document.querySelector(".results-ideas");
const ideaDivWithSpans = document.getElementById("ids-ideas");
const boxSearchIdea = document.querySelector(".box-search-ideas");
let idsForumArray = [];
let idsForumArrayToRemove = [];

//QUANDO O USER ESCREVER ALGUMA COISA NO INPUT, VAI CHAMAR O MÉTODO PARA PROCURAR A IDEIA COM ESTE TÍTULO NA BASE DE DADOS
inputIdea.addEventListener("keyup", () => {
	console.log("lolIdeia");

	if (suggestionsIdea.children.length > 0) {
		suggestionsIdea.innerHTML = "";
		console.log("ihih");
	}

	if (inputIdea.value.length > 0) {
		console.log("haha", inputIdea.value);
		getIdeasBySearchKey(inputIdea.value);
	}
});

//MÉTODO PARA IR BUSCAR AS IDEIAS COM AQUELE PEDAÇO DE TITULO
async function getIdeasBySearchKey(input) {
	//forum controller linha 982
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
	} else if (ideasFound instanceof Object){

		//verificar para não carregar itens que o utilizador já selecionou
		// console.log("antes do for - depois do fetch - tenho o forumsArray : ");
		// console.log(forumsArray);
		console.log("FORUMS ARRAY", ideasFound);
		console.log("IDS FORUM ARRAY", idsForumArray);
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

		console.log("antes de chamar o renderizar");
		console.log(ideasFound);
		// enviar a lista já "limpa" para renderizar na ul
		renderIdeasResults(ideasFound);
	}
}

//CARREGAR AS IDEIAS NOS RESULTADOS DE SUGESTÃO
function renderIdeasResults(ideasFound) {

	if (suggestionsIdea.children.length > 0) {
		suggestionsIdea.innerHTML = "";
		console.log("ihih");
	}

	if (ideasFound.length) {
		console.log("bué length");

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-ideas";

		ideasFound.forEach((idea) => {
			let li = document.createElement("li");
			li.className = "li-ideas";
			li.innerText = idea.title; // aqui é o titulo
			li.setAttribute("id", idea.id); // aqui seria o id

			console.log(li);

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

			//colocar cada li dentro da ul
			console.log("li dentro da ul");
			ul.appendChild(li);
		});

		console.log("namaste");
		suggestionsIdea.appendChild(ul);
		boxSearchIdea.classList.add("show");
		console.log(boxSearchIdea);
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
		for (let k = 0; k < idsForumArrayToRemove.length; k++) {
			if (idsForumArrayToRemove[k] === idea.id) {
				idsForumArrayToRemove.splice(k, 1);
			}
		}

		//console.log(skillFound);
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

			idsForumArrayToRemove.push(idea.id);
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
			console.log("idsForumArray REMOVE ", idsForumArray);
			console.log("idsForumArrayToRemove REMOVE ", idsForumArrayToRemove);

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
	if (suggestionsIdea.children.length > 0) {
		suggestionsIdea.removeChild(document.querySelector(".ul-ideas"));
	}
}

/**************************************************** */
//BUSCA ATIVA DE NECESSIDADES
const inputNecessity = document.getElementById("input-necessity-proj");
const suggestionsNecessity = document.querySelector(".results-necessity");
const necessityDivWithSpans = document.getElementById("ids-necessity");
const boxSearchNecessity = document.querySelector(".box-search-necessity");

//QUANDO O USER ESCREVER ALGUMA COISA NO INPUT, VAI CHAMAR O MÉTODO PARA PROCURAR A NECESSIDADE COM ESTE TÍTULO NA BASE DE DADOS
inputNecessity.addEventListener("keyup", () => {
	console.log("nec");

	if (suggestionsNecessity.children.length > 0) {
		suggestionsNecessity.innerHTML = "";
		console.log("ihih");
	}

	if (inputNecessity.value.length > 0) {
		console.log("haha", inputNecessity.value);
		getNecessityBySearchKey(inputNecessity.value);
	}
});

//MÉTODO PARA IR BUSCAR AS NECESSIDADES COM AQUELE PEDAÇO DE TITULO
async function getNecessityBySearchKey(input) {
	//forum controller linha 982
	let necessitiesFound = await doFetchWithResponse(
		urlDefault + "forum/search/" + input + "/if/necessity",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(necessitiesFound === 401){

		document.querySelector(
			".no-result-ideas",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-ideas").innerHTML = "";
		}, 3000);
	} else if(necessitiesFound === 403){
		window.location.href = "generalError.html";
	} else if (necessitiesFound instanceof Object){

		//verificar para não carregar itens que o utilizador já selecionou
		console.log("antes do for - depois do fetch - tenho o forumsArray : ");
		console.log(idsForumArray);
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

		// console.log("antes de chamar o renderizar");
		// console.log(necessitiesFound);
		// enviar a lista já "limpa" para renderizar na ul
		renderNecessityResults(necessitiesFound);
	}
}

//CARREGAR AS NECESSIDADES NOS RESULTADOS DE SUGESTÃO
function renderNecessityResults(necessitiesFound) {

	if (suggestionsNecessity.children.length > 0) {
		suggestionsNecessity.innerHTML = "";
		console.log("ihih");
	}

	if (necessitiesFound.length) {
		console.log("bué length");

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-necessity";

		necessitiesFound.forEach((necessity) => {
			let li = document.createElement("li");
			li.className = "li-necessity";
			li.innerText = necessity.title; // aqui é o titulo
			li.setAttribute("id", necessity.id); // aqui seria o id

			console.log(li);

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
					).innerHTML = `<p class = "error-text">Ideia já selecionada!</p>`;
					// Depois de 2 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-necessity").innerHTML = "";
					}, 2000);
					inputNecessity.value = "";
				}
			});

			//colocar cada li dentro da ul
			console.log("li dentro da ul");
			ul.appendChild(li);
		});

		console.log("namaste");
		suggestionsNecessity.appendChild(ul);
		boxSearchNecessity.classList.add("show");
		console.log(boxSearchNecessity);
	} else {
		document.querySelector(
			".no-result-necessity",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
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
		for (let o = 0; o < idsForumArrayToRemove.length; o++) {
			if (idsForumArrayToRemove[o] === necessity.id) {
				idsForumArrayToRemove.splice(o, 1);
			}
		}
		console.log("idsForumArray ", idsForumArray);
		console.log("idsForumArrayToRemove ", idsForumArrayToRemove);

		//console.log(skillFound);
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

			idsForumArrayToRemove.push(necessity.id);
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
			console.log("idsForumArray REMOVE ", idsForumArray);
			console.log("idsForumArrayToRemove REMOVE ", idsForumArrayToRemove);

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
	if (suggestionsNecessity.children.length > 0) {
		suggestionsNecessity.removeChild(document.querySelector(".ul-necessity"));
	}
}

// *****************************************
//IMPLEMENTAÇÃO DA LÓGICA DE BUSCA ATIVA EM SKILL
const inputSkill = document.getElementById("input-skill-proj");
const suggestions = document.querySelector(".results-skills");
const divWithSpans = document.getElementById("ids-skills");
const boxSearchSkills = document.querySelector(".box-search-skills");
let idsSkillsArray = [];
let idsSkillsArrayToRemove = [];

//CADA VEZ QUE O USER ESCREVER ALGUMA COISA VAI PEGAR NISSO E PESQUISAR NA BASE DE DADOS PELAS SKILLS QUE TÊM ESTE TÍTULO
inputSkill.addEventListener("keyup", () => {
	console.log("lol");

	if (suggestions.children.length > 0) {
		suggestions.innerHTML = "";
		console.log("ihih");
	}

	if (inputSkill.value.length > 0) {
		console.log("haha", inputSkill.value);
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

//MÉTODO PARA RENDERIZAR AS SUGESTÕES
function renderSkillsResults(skillsFound) {

	if (suggestions.children.length > 0) {
		suggestions.innerHTML = "";
		console.log("ihih");
	}

	if (skillsFound.length) {
		console.log("bué length");

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
		for (let a = 0; a < idsSkillsArrayToRemove.length; a++) {
			if (idsSkillsArrayToRemove[a] === skill.idSkill) {
				idsSkillsArrayToRemove.splice(a, 1);
			}
		}

		console.log("idsSkillsArray ", idsSkillsArray);
		console.log("idsSkillsArrayToRemove ", idsSkillsArrayToRemove);

		//console.log(skillFound);
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

			idsSkillsArrayToRemove.push(skill.idSkill);
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
			console.log("idsSkillsArray REMOVEEE  ", idsSkillsArray);
			console.log("idsSkillsArrayToRemove REMOVE   ", idsSkillsArrayToRemove);

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
	if (document.querySelector(".ul-skills")) {
		suggestions.removeChild(document.querySelector(".ul-skills"));
	}
}

console.log(idProject);

async function createProject() {
	console.log(idsForumArray.length);
	console.log(idsSkillsArray);

	const inputProjectTitle = document.getElementById("new-project-title").value;
	const inputProjectTitleTrim = inputProjectTitle.trim();

	const inputProjectDescription = document.getElementById("editor");

	const inputNecessaryResources = document.getElementById(
		"necessary-resources",
	).value;
	const inputNecessaryResourcesTrim = inputNecessaryResources.trim();

	const inputExecutionPlan = document.getElementById("execution-plan").value;
	const inputExecutionPlanTrim = inputExecutionPlan.trim();

	console.log(inputProjectTitleTrim.length, "1");
	console.log(inputProjectTitle, "2");
	console.log(
		inputProjectDescription.children[0].children[0].innerHTML === `<br>`,
		"4",
	);
	console.log(inputProjectDescription.children[0].innerHTML);
	console.log(idsForumArray.length, "5");

	if (
		inputProjectTitleTrim.length > 0 &&
		inputProjectTitle !== "" &&
		inputProjectDescription.children[0].children[0].innerHTML !== `<br>` &&
		idsForumArray.length > 0
	) {
		console.log("não vazio");

		let body = {
			title: inputProjectTitleTrim,
			description: inputProjectDescription.children[0].innerHTML,
			necessaryResources: inputNecessaryResourcesTrim,
			executionPlan: inputExecutionPlanTrim,
		};

		let fetchOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		};

		//criar projeto, devolve o id do projeto acabado de criar
		//project controller linha 53
		let id = await doFetchWithIdResponse(
			urlDefault + "projects/new",
			fetchOptions,
		);
		console.log(id);
		if(id instanceof Object){
			if(id.error === 401){
				document.querySelector(".error-title-missing").innerText = "Pedimos desculpa mas ocorreu um erro a criar o projeto!";
				document.querySelector(".error-title-missing").classList.remove("hide");

				setTimeout(() => {
					document.querySelector(".error-title-missing").classList.add("hide");
					document.querySelector(".error-title-missing").innerText = "";
				}, 3000);
			} else if(id.error === 403){
				window.location.href = "generalError.html";
			}
		} else {
			let status;
			//associar este projeto às skills que o user selecionou
			if(idsSkillsArray.length > 0){
				body = {
					idsSkills: idsSkillsArray,
				};
	
				fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};
	
				//skills controller linha 144
				status = await doFetchNoResponse(
					urlDefault + "skills/associate/with/project/" + id,
					fetchOptions,
				);
				console.log(status, "associar skills");
				if(status === 401){
					window.scrollTo(0, 0);
					document.querySelector(".error-idea-or-necessity").innerText =
						"Pedimos desculpa, mas ocorreu um erro a associar ideias e necessidades que selecionaste ao teu projeto";
					document
						.querySelector(".error-idea-or-necessity")
						.classList.remove("hide");

						setTimeout(() => {
							document.querySelector(".error-idea-or-necessity").innerText =
						"";
					document
						.querySelector(".error-idea-or-necessity")
						.classList.add("hide");
						}, 3000);
				}
			}
			
				//associar este projeto às ideias e necessidades que o user selecionou
				body = {
					idsForum: idsForumArray,
				};

				fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};

				//project controller 254
				status = await doFetchNoResponse(
					urlDefault + "projects/associate/with/project/" + id,
					fetchOptions,
				);

				//associar projeto a ideias e necessidades foi feito com sucesso
				if (status === 200) {
					window.location.href = "manage-members.html?id=" + id + "&m=inv";
				} else {
					document.querySelector(".error-idea-or-necessity").innerText =
						"Pedimos desculpa, mas ocorreu um erro a associar ideias e necessidades que selecionaste ao teu projeto";
					document
						.querySelector(".error-idea-or-necessity")
						.classList.remove("hide");
				}
			
		}
	} else {
		if (inputProjectTitleTrim.length === 0) {
			console.log("titulo vazio");
			document.querySelector(".error-title-missing").innerText =
				"Não te esqueças de escolher um título para o teu projeto!";
			document.querySelector(".error-title-missing").classList.remove("hide");

			setTimeout(() => {
				document.querySelector(".error-title-missing").classList.add("hide");
				document.querySelector(".error-title-missing").innerText = "";
			}, 3000);
		}

		if (inputProjectDescription.children[0].children[0].innerHTML === `<br>`) {
			console.log("descrição vazio");
			document.querySelector(".error-description-missing").innerText =
				"Não te esqueças de descrever o teu projeto!";
			document
				.querySelector(".error-description-missing")
				.classList.remove("hide");

			setTimeout(() => {
				document
					.querySelector(".error-description-missing")
					.classList.add("hide");
				document.querySelector(".error-description-missing").innerText = "";
			}, 3000);
		}

		if (idsForumArray.length === 0) {
			console.log("FALTA ASSOCIAÇÕES ");
			document.querySelector(".error-idea-or-necessity").innerText =
				"Precisas de associar pelo menos uma ideia ou uma necessidade ao teu projeto!";
			document
				.querySelector(".error-idea-or-necessity")
				.classList.remove("hide");

			setTimeout(() => {
				document
					.querySelector(".error-idea-or-necessity")
					.classList.add("hide");
				document.querySelector(".error-idea-or-necessity").innerText = "";
			}, 3000);
		}
		window.scrollTo(0, 0);
	}
}

//CARREGAR INFORMAÇÕES DO PROJETO QUANDO O USER O ESTÁ A TENTAR EDITAR
async function loadProjectInformation(projectToLoad) {
	console.log(projectToLoad);
	document.getElementById("new-project-title").value = projectToLoad.title;
	document.getElementById("editor").children[0].innerHTML =
		projectToLoad.description;
	document.getElementById("necessary-resources").value =
		projectToLoad.necessaryResources;
	document.getElementById("execution-plan").value = projectToLoad.executionPlan;

	//OBTER A LISTA DE SKILLS ASSOCIADAS ÀQUELE PROJETO
	//skill controler linha 366
	const skillsAssociated = await doFetchWithResponse(
		urlDefault + "skills/associated/project/" + idProject,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(skillsAssociated === 401){
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as skills do projeto!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
	} else if(skillsAssociated === 403){
		window.location.href = "generalError.html";
	} else if(skillsAssociated instanceof Object){
		console.log(skillsAssociated);
		skillsAssociated.forEach((skill) => {
			loadSpanSkill(skill);
		});
	}

	//OBTER A LISTA DE IDEIAS E NECESSIDADES ASSOCIADAS A UM DETERMINADO PROJETO
	//project controller linha 349
	const forumsAssociated = await doFetchWithResponse(
		urlDefault + "projects/list/forums/" + idProject,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(forumsAssociated === 401){
		document.querySelector(".error-idea-or-necessity").innerText =
				"Ocorreu um erro a carregar as ideias e necessidades do projeto!";
			document
				.querySelector(".error-idea-or-necessity")
				.classList.remove("hide");

			setTimeout(() => {
				document
					.querySelector(".error-idea-or-necessity")
					.classList.add("hide");
				document.querySelector(".error-idea-or-necessity").innerText = "";
			}, 3000);
	} else if(forumsAssociated === 403){
		window.location.href = "generalError.html";
	} else if(forumsAssociated instanceof Object){
		console.log(forumsAssociated);
		forumsAssociated.forEach((forum) => {
			if (forum.type === "IDEA") {
				loadSpanIdea(forum);
			} else if (forum.type === "NECESSITY") {
				loadSpanNecessity(forum);
			}
		});
	}
}

async function saveAlterations() {
	const inputProjectTitle = document.getElementById("new-project-title").value;
	const inputProjectTitleTrim = inputProjectTitle.trim();

	const inputProjectDescription = document.getElementById("editor");

	const inputNecessaryResources = document.getElementById(
		"necessary-resources",
	).value;
	const inputNecessaryResourcesTrim = inputNecessaryResources.trim();

	const inputExecutionPlan = document.getElementById("execution-plan").value;
	const inputExecutionPlanTrim = inputExecutionPlan.trim();

	if (
		inputProjectTitleTrim.length > 0 &&
		inputProjectTitle !== "" &&
		inputProjectDescription.children[0].children[0].innerHTML !== `<br>` &&
		idsForumArray.length > 0
	) {
		//PROCEDER À EDIÇÃO DO PROJETO
		let body = {
			title: inputProjectTitleTrim,
			description: inputProjectDescription.children[0].innerHTML,
			necessaryResources: inputNecessaryResourcesTrim,
			executionPlan: inputExecutionPlanTrim,
		};

		let fetchOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		};

		//project controller linha 208
		let status = await doFetchNoResponse(
			urlDefault + "projects/edit/" + idProject,
			fetchOptions,
		);

		console.log("FEITO");

		//se consegui guardar as alterações feitas ao projeto
		if (status === 200) {
			//desasociar este projeto às skills que o user retirou

			if(idsSkillsArrayToRemove.length > 0){
				body = {
					idsSkills: idsSkillsArrayToRemove,
				};
	
				fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};
	
				//skill controlller linha 177
				status = await doFetchNoResponse(
					urlDefault + "skills/desassociate/project/" + idProject,
					fetchOptions,
				);
				console.log(status, "desassociar skills");

				if(status === 401){
					document.querySelector(".error-skill").innerText =
					"Pedimos desculpa, mas ocorreu um erro a desassociar as skills que selecionaste ao teu projeto!";
					document.querySelector(".error-skill").classList.remove("hide");
					setTimeout(() => {
						document.querySelector(".error-skill").classList.add("hide");
						document.querySelector(".error-skill").innerText =
					"";
					}, 3000);
				}
			}

			if(idsSkillsArray.length > 0) {
				//associar este projeto às skills que o user selecionou
				body = {
					idsSkills: idsSkillsArray,
				};

				fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};

				//skills controller linha 144
				status = await doFetchNoResponse(
					urlDefault + "skills/associate/with/project/" + idProject,
					fetchOptions,
				);
				console.log(status, "associar skills");

				if(status === 401){
					document.querySelector(".error-skill").innerText =
						"Pedimos desculpa, mas ocorreu um erro a associar as skills que selecionaste ao teu projeto!";
					document.querySelector(".error-skill").classList.remove("hide");
					setTimeout(() => {
						document.querySelector(".error-skill").classList.add("hide");
						document.querySelector(".error-skill").innerText =
						"";
						
					}, 3000);
				}
			}
				
			if(idsForumArrayToRemove.length > 0){
				body = {
					idsForum: idsForumArrayToRemove,
				};

				fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};

				//project controller linha 301
				status = await doFetchNoResponse(
					urlDefault + "projects/desassociate/from/" + idProject,
					fetchOptions,
				);

				if(status === 401){
					window.scrollTo(0, 0);
					document.querySelector(".error-idea-or-necessity").innerText =
					"Pedimos desculpa, mas ocorreu um erro a desassociar ideias e necessidades que selecionaste ao teu projeto";
				document
					.querySelector(".error-idea-or-necessity")
					.classList.remove("hide");
					setTimeout(() => {
						document
							.querySelector(".error-idea-or-necessity")
							.classList.add("hide");
						document.querySelector(".error-idea-or-necessity").innerText =
							"";
						

					}, 3000);
				}
			}

						console.log(status, "desassociar forums");

						//associar este projeto às ideias e necessidades que o user selecionou
						body = {
							idsForum: idsForumArray,
						};

						fetchOptions = {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(body),
						};

						//project controller linha 254
						status = await doFetchNoResponse(
							urlDefault + "projects/associate/with/project/" + idProject,
							fetchOptions,
						);
						console.log(status, "associar forums");
						//se consegui associar as ideias e ou necessidades ao projeto
						if (status === 200) {
							window.location.href =
								"manage-members.html?id=" + idProject + "&m=inv";

							//se não consegui associar as ideias e ou necessidades ao projeto
						} else {
							window.scrollTo(0, 0);
							document.querySelector(".error-idea-or-necessity").innerText =
								"Pedimos desculpa, mas ocorreu um erro a associar ideias e necessidades que selecionaste ao teu projeto";
							document
								.querySelector(".error-idea-or-necessity")
								.classList.remove("hide");
						}

						//se não consegui desassociar as ideias e ou necessidades do projeto
					/*} else {
						document.querySelector(".error-idea-or-necessity").innerText =
							"Pedimos desculpa, mas ocorreu um erro a desassociar ideias e necessidades que selecionaste ao teu projeto";
						document
							.querySelector(".error-idea-or-necessity")
							.classList.remove("hide");
					}

					//se não consegui associar as skills ao projeto
				/*} else {
					document.querySelector(".error-skill").innerText =
						"Pedimos desculpa, mas ocorreu um erro a associar as skills que selecionaste ao teu projeto!";
					document.querySelector(".error-skill").classList.remove("hide");
				}

				//se não consegui desassociar as skills do projeto
			/*} /*else {
				document.querySelector(".error-skill").innerText =
					"Pedimos desculpa, mas ocorreu um erro a desassociar as skills que selecionaste ao teu projeto!";
				document.querySelector(".error-skill").classList.remove("hide");
			}*/
			//se não consegui editar o projeto com sucesso
		} else {
			if (status === 494) {
				document.querySelector(".error-title-missing").innerText =
					"Pedimos desculpa, mas não podes editar um projeto inativo!";
				document.querySelector(".error-title-missing").classList.remove("hide");
				setTimeout(() => {
					window.location.href = "seeProject.html?p=" + idProject;
				}, 2000);
			} else if(status === 403){
				window.location.href = "generalError.html";
			}
			document.querySelector(".error-title-missing").innerText =
				"Pedimos desculpa, mas ocorreu um erro a guardar as alterações realizadas ao projeto!";
			document.querySelector(".error-title-missing").classList.remove("hide");
		}
	} else {
		console.log("nope");

		if (inputProjectTitleTrim.length === 0) {
			console.log("titulo vazio");
			document.querySelector(".error-title-missing").innerText =
				"Não te esqueças de escolher um título para o teu projeto!";
			document.querySelector(".error-title-missing").classList.remove("hide");

			setTimeout(() => {
				document.querySelector(".error-title-missing").classList.add("hide");
				document.querySelector(".error-title-missing").innerText = "";
			}, 4000);
		}

		if (inputProjectDescription.children[0].children[0].innerHTML === `<br>`) {
			console.log("descrição vazio");
			document.querySelector(".error-description-missing").innerText =
				"Não te esqueças de descrever o teu projeto!";
			document
				.querySelector(".error-description-missing")
				.classList.remove("hide");

			setTimeout(() => {
				document
					.querySelector(".error-description-missing")
					.classList.add("hide");
				document.querySelector(".error-description-missing").innerText = "";
			}, 4000);
		}

		if (idsForumArray.length === 0) {
			console.log("FALTA ASSOCIAÇÕES ");
			document.querySelector(".error-idea-or-necessity").innerText =
				"Precisas de associar pelo menos uma ideia ou uma necessidade ao teu projeto!";
			document
				.querySelector(".error-idea-or-necessity")
				.classList.remove("hide");

			setTimeout(() => {
				document
					.querySelector(".error-idea-or-necessity")
					.classList.add("hide");
				document.querySelector(".error-idea-or-necessity").innerText = "";
			}, 4000);
		}
		window.scrollTo(0, 0);
	}
}
