const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const selected = document.querySelector(".selected-privacy");
const optionsContainer = document.querySelector(".options-container-privacy");
const parameters = new URLSearchParams(window.location.search);
let emailPersonalPage = atob(parameters.get("e"));
let dataUrl = new URLSearchParams(window.location.search);
let usersArray = [];
let viewerList = [];

document.addEventListener("DOMContentLoaded", async () => {
	emailPersonalPage = atob(parameters.get("e"));

	//user controller linha 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});

	if (userWithSession === 403 || userWithSession === 401) {
		//
		window.location.href = "generalError.html";
	} else {
		//
		if (userWithSession.type) {
			if (userWithSession.type === UserType.VISITOR) {
				window.location.href = "feedForum.html";
			}
		}

		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
		//
		const tab = parameters.get("t");
		if (tab === "pw") {
			document.getElementById("security-section").parentElement.open = true;
		} else if (tab === "vi") {
			document.getElementById("privacy-section").parentElement.open = true;
		}

		//user controller linha 278
		const auth = await doFetchWithResponse(
			urlDefault + "users/has/auth/" + emailPersonalPage,
			{
				method: "GET",
				headers: { "Content-Type": "text/plain" },
			},
		);

		if (auth === 403) {
			window.location.href = "generalError.html";
		} else if (auth === 401) {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(emailPersonalPage));
			window.location.href = "personal-page.html?" + dataUrl;
		}

		if (auth === false) {
			//
			dataUrl.delete("e");
			dataUrl.append("e", btoa(emailPersonalPage));
			window.location.href = "personal-page.html?" + dataUrl;
		} else {
			if (emailPersonalPage === userWithSession.email) {
				document.getElementById("security-section").classList.remove("hide");
			}
			const headersObj = new Headers();
			headersObj.append("email", emailPersonalPage);

			//user controller linha 333
			const user = await doFetchWithResponse(
				urlDefault + "users/search/by/email",
				{
					method: "GET",
					"Content-Type": "application/json",
					headers: headersObj,
				},
			);

			if (user === 401) {
				document.querySelector(".user-profile-page").classList.add("hide");
				document.querySelector(".user-envolved").classList.add("hide");

				const h4 = document.createElement("h4");
				h4.className = "information-about-privacy";
				h4.innerText = "Ocorreu um erro a carregar a página pessoal!";
				document.querySelector(".body").appendChild(h4);
			} else if (user === 403) {
				window.location.href = "generalError.html";
			} else if (user instanceof Object) {
				console.log(user.visibility);

				switch (user.visibility) {
					case Visibility.PUBLIC:
						selected.innerHTML =
							"Toda a gente " +
							`<i class="fa-solid fa-caret-down dropdown-arrow">`;
						console.log("hahahaha");
						break;
					case Visibility.ESPECIFIC:
						selected.innerHTML =
							"Quem eu selecionar " +
							`<i class="fa-solid fa-caret-down dropdown-arrow">`;
						document.querySelector(".case-specific").classList.remove("hide");

						break;
					case Visibility.PRIVATE:
						selected.innerHTML =
							"Somente eu " +
							`<i class="fa-solid fa-caret-down dropdown-arrow">`;
						console.log("epico");
						break;
				}
			}
		}
	}
});

const optionsList = document.querySelectorAll(".option-privacy");
optionsList.forEach((o) => {
	//event listener para todos os itens da combo box
	o.addEventListener("click", async () => {
		selected.innerHTML =
			o.querySelector("label").innerHTML +
			`<i class="fa-solid fa-caret-down dropdown-arrow">`; //guarda o inner html da label dentro da caixa selected
		optionsContainer.classList.remove("active"); //depois remove a classe active para fechar a combo box
		console.log("lol");

		//chamar o método que vai mudar a visibilidade do utilizador

		//cria os dados que irão ser enviados pelo fetch
		const fetchOptions = {
			method: "POST",
			body: JSON.stringify({
				visilibityUser: o.children[0].id,
			}),
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				email: emailPersonalPage,
			},
		};

		console.log(fetchOptions);
		console.log(emailPersonalPage);

		//user controller linha 212
		const status = await doFetchNoResponse(
			urlDefault + "users/change/visibility",
			fetchOptions,
		);

		console.log("status: " + status);
		//CONSEGUI MUDAR A VISIBILIDADE COM SUCESSO
		if (status === 200) {
			if (o.children[0].id === "ESPECIFIC") {
				document.querySelector(".case-specific").classList.remove("hide");
			} else {
				document.querySelector(".case-specific").classList.add("hide");
			}

			//ERRO A MUDAR A VISIBILIDADE
		} else {
			if (status === 403) {
				window.location.href = "generalError.html";
			}
			selected.innerHTML = "Pedimos desculpas, mas ocorreu um erro";
			selected.style.color = "#c81d25;";
			setTimeout(function () {
				selected.innerHTML =
					o.querySelector("label").innerHTML +
					`<i class="fa-solid fa-caret-down dropdown-arrow">`;
				selected.style.color = "#333";
			}, 3000);
		}
	});
});

selected.addEventListener("click", () => {
	//quando alguém clica naquela div, o container fica com a classe active
	optionsContainer.classList.toggle("active"); //se estiver active, mostra as opções, senão, não mostra nada, está 'fechado'
});

document.getElementById("add-user-one").addEventListener("click", () => {
	document.querySelector(".add-users-group").classList.add("hide");
	document.querySelector(".add-user-one").classList.remove("hide");
});

document.getElementById("add-users-group").addEventListener("click", () => {
	document.querySelector(".add-user-one").classList.add("hide");
	document.querySelector(".add-users-group").classList.remove("hide");
});

//BUSCA ATIVA DE UTILIZADORES
const input = document.getElementById("name-or-nickname");
const suggestions = document.querySelector(".results-user");
const boxSearch = document.querySelector(".box-search-user");

document
	.getElementById("name-or-nickname")
	.addEventListener("keyup", async () => {
		if (suggestions.children.length > 0) {
			suggestions.innerHTML = "";
		}

		if (input.value !== "") {
			if (usersArray.length > 0) {
				usersArray = [];
			}
			//user controller linha 573
			usersArray = await doFetchWithResponse(
				urlDefault + "users/search/" + input.value,
				{
					method: "GET",
					"Content-Type": "application/json",
				},
			);
			console.log("usersArray");
			console.log(usersArray);

			if (viewerList.length > 0) {
				viewerList = [];
			}
			//
			if (usersArray === 403) {
				window.location.hred = "generalError.html";
			}
			if (usersArray === 401) {
				document.querySelector(
					".no-result-users",
				).innerHTML = `<p class = "error-text">Ocorreu um erro a procurar os utilizadores!</p>`;
				setTimeout(() => {
					document.querySelector(".no-result-users").innerHTML = "";
				});
			} else if (usersArray instanceof Object) {
				//user controller linha 394
				viewerList = await doFetchWithResponse(
					urlDefault + "users/users/who/can/view/" + emailPersonalPage,
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
					},
				);

				console.log("viewerList");
				console.log(viewerList);

				if (viewerList === 401) {
					document.querySelector(
						".no-result-users",
					).innerHTML = `<p class = "error-text">Ocorreu um erro a procurar os utilizadores!</p>`;
					setTimeout(() => {
						document.querySelector(".no-result-users").innerHTML = "";
					});
				} else if (viewerList instanceof Object) {
					//Comparar para não mostrar users que já estão na viewersList na lista das respostas da pesquisa
					for (let i = 0; i < viewerList.length; i++) {
						for (let j = 0; j < usersArray.length; j++) {
							if (usersArray[j].email === viewerList[i].email) {
								usersArray.splice(j, 1);
							}
						}
					}

					//tirar da lista a ser exibida o utilizador a quem pertence a area pessoal
					for (let j = 0; j < usersArray.length; j++) {
						if (usersArray[j].email === emailPersonalPage) {
							usersArray.splice(j, 1);
						}
					}

					console.log(usersArray);
					// enviar a lista já "limpa" para renderizar na ul
					renderResults(usersArray);
				}
			}
		}
	});

const boxResultsUser = document.querySelector(".results-user");
//método para renderizar as sugestões na ul
function renderResults(users) {
	if (boxResultsUser.children.length > 0) {
		boxResultsUser.innerHTML = "";
	}
	//

	if (users.length) {
		document.querySelector(".results-user").classList.remove("hide");
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
				document.querySelector(".results-user").classList.add("hide");
			});

			//colocar cada li dentro da ul
			console.log("li dentro da ul");
			ul.appendChild(li);
		});

		console.log("namaste");
		suggestions.appendChild(ul);
		boxSearch.classList.add("show");
	} else {
		document.querySelector(".results-user").classList.add("hide");
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

//event listener quando a pessoa clica no botão de adicionar aquele utilizador à sua lista
document.querySelector(".search-user").addEventListener("click", async () => {
	if (input.value) {
		//user controller linha 711
		const status = await doFetchNoResponse(
			urlDefault +
				"users/add/viewerList/oneByOne/" +
				input.getAttribute("email"),
			{
				method: "POST",
				headers: {
					Accept: "*/*",
					"Content-Type": "application/json",
					email: emailPersonalPage,
				},
			},
		);
		console.log(input.getAttribute("email"));

		if (status === 200) {
			document
				.querySelector(".alterations-feedback")
				.classList.remove("visibily-hidden");
			input.value = "";

			setTimeout(() => {
				document
					.querySelector(".alterations-feedback")
					.classList.add("visibily-hidden");
			}, 3000);

			if (boxResultsUser.children.length > 0) {
				console.log("entrei no if boxResultsUser.children.length > 0");
				boxResultsUser.innerHTML = "";
				// boxResultsUser.removeChild(boxResultsUser.children[0]);
			}
			input.removeAttribute("email");
			setTimeout(() => {
				document
					.querySelector(".alterations-feedback")
					.classList.add("visibily-hidden");
			}, 3000);
		} else {
			if (status === 450) {
				document.querySelector(
					".no-result-users",
				).innerHTML = `<p class = "error-text">Este utilizador já se encontra na lista!</p>`;
				// Depois de 3 segundos tira a mensagem do ecrã
				setTimeout(function () {
					document.querySelector(".no-result-users").innerHTML = "";
				}, 3000);
				input.value = "";
				input.removeAttribute("email");
			} else {
				if (status === 403) {
					window.location.href = "generalError.html";
				} else {
					document.querySelector(
						".no-result-users",
					).innerHTML = `<p class = "error-text">Ocorreu um erro! Tente novamente mais tarde</p>`;
					// Depois de 3 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-users").innerHTML = "";
					}, 3000);
					input.value = "";
					input.removeAttribute("email");
				}
			}
		}
	} else {
		input.placeholder = "Procure um utilizador a adicionar à lista!";
		input.classList.add("change-color");
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			input.placeholder = "Pesquise pelo utilizador";
			input.classList.remove("change-color");
		}, 3000);
	}
});

//////////////////////////////////////////////////////////////////////////////
//PARTE DE ADICIONAR UM GRUPO À LISTA DE VISUALIZADORES
//BUSCA ATIVA DE UTILIZADORES
const inputWorkplace = document.getElementById("search-workplace");
const suggestionsWorkplace = document.querySelector(".results-workplace");
const boxSearchWorkplace = document.querySelector(".box-search-workplace");

inputWorkplace.addEventListener("keyup", async () => {
	if (suggestionsWorkplace.children.length > 0) {
		suggestionsWorkplace.innerHTML = "";
		console.log("ihih");
	}

	if (inputWorkplace.value !== "") {
		//user controller linha 856
		const array = await doFetchWithResponse(
			urlDefault + "users/search/active/" + inputWorkplace.value,
			{
				method: "GET",
				"Content-Type": "application/json",
			},
		);

		if (array === 403) {
			window.location.href = "generalError.html";
		} else if (array === 401) {
			document.querySelector(
				".no-result-workplace",
			).innerHTML = `<p class = "error-text">Ocorreu um erro a pesquisar o local de trabalho!</p>`;
			setTimeout(() => {
				document.querySelector(".no-result-workplace").innerHTML = "";
			}, 3000);
		} else if (array instanceof Object) {
			console.log(array);
			if (array.length > 0) {
				renderResultsWorkplace(array);
			}
		}
	}
});

//método para renderizar as sugestões na ul
function renderResultsWorkplace(array) {
	if (suggestionsWorkplace.children.length > 0) {
		suggestionsWorkplace.innerHTML = "";
		console.log("ihih");
	}

	if (array.length) {
		document.querySelector(".results-workplace").classList.remove("hide");
		console.log("bué length");

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-workplace";

		array.forEach((item) => {
			console.log(item);
			let li = document.createElement("li");
			li.className = "li-workplace";

			li.innerText = item;

			//evento ao clicar na li
			li.addEventListener("click", function () {
				console.log("clique escolher ");
				document.querySelector(".results-workplace").classList.add("hide");
				boxSearchWorkplace.classList.remove("show");
				document.querySelector(".ul-workplace").innerHTML = "";
				inputWorkplace.value = item;
				document.querySelector(".results-workplace").classList.add("hide");
			});

			//colocar cada li dentro da ul
			console.log("li dentro da ul");
			ul.appendChild(li);
		});

		console.log("namaste");
		suggestionsWorkplace.appendChild(ul);
		boxSearchWorkplace.classList.add("show");
	} else {
		document.querySelector(".results-workplace").classList.add("hide");
		document.querySelector(
			".no-result-workplace",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-workplace").innerHTML = "";
		}, 3000);
		inputWorkplace.value = "";
		return boxSearchWorkplace.classList.remove("show");
	}
}

//BUSCA ATIVA DAS SKILLS
const inputSkill = document.getElementById("input-add-skill");
const suggestionsSkills = document.querySelector(".results-skills");
const divWithSpansSkills = document.getElementById("div-skills-privacy");
const boxSearchSkills = document.querySelector(".box-search-skills");
let idsSkillsArray = [];

//CADA VEZ QUE O USER ESCREVER ALGUMA COISA VAI PEGAR NISSO E PESQUISAR NA BASE DE DADOS PELAS SKILLS QUE TÊM ESTE TÍTULO
inputSkill.addEventListener("keyup", () => {
	console.log("lol");

	if (suggestionsSkills.children.length > 0) {
		suggestionsSkills.innerHTML = "";
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

//MÉTODO PARA RENDERIZAR AS SUGESTÕES
function renderSkillsResults(skillsFound) {
	if (suggestionsSkills.children.length > 0) {
		suggestionsSkills.innerHTML = "";
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
			//colocar cada li dentro da ul
			ul.appendChild(li);
		});

		suggestionsSkills.appendChild(ul);
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
			inputSkill.placeholder = "procura a skill que queres associar";
			inputSkill.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("NÂO achou repetida");

		//exibir o espaço onde entrarão os spans
		divWithSpansSkills.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsSkillsArray.push(skill.idSkill); // aqui algo tipo skillFound.id

		console.log("idsSkillsArray ", idsSkillsArray);

		//console.log(skillFound);
		const sectionSpan = document.getElementById("div-skills-privacy");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = skill.title; // aqui algo tipo skillFound.title

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
				if (idsSkillsArray[i] == skill.idSkill) {
					//preciso a posição do elemento no array
					idsSkillsArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}
			console.log("idsSkillsArray REMOVEEE  ", idsSkillsArray);

			if (idsSkillsArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divWithSpansSkills.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	inputSkill.value = "";
	if (document.querySelector(".ul-skills")) {
		suggestionsSkills.removeChild(document.querySelector(".ul-skills"));
	}
}

//BUSCA ATIVA DOS INTERESSES
const inputInterest = document.getElementById("input-add-interest");
const suggestionsInterest = document.querySelector(".results-interests");
const divWithSpansInterest = document.getElementById("div-interests-privacy");
const boxSearchInterest = document.querySelector(".box-search-interest");
let idsInterestArray = [];

//CADA VEZ QUE O USER ESCREVER ALGUMA COISA VAI PEGAR NISSO E PESQUISAR NA BASE DE DADOS PELAS SKILLS QUE TÊM ESTE TÍTULO
inputInterest.addEventListener("keyup", () => {
	console.log("lol");

	if (suggestionsInterest.children.length > 0) {
		suggestionsInterest.innerHTML = "";
		console.log("ihih");
	}

	if (inputInterest.value.length > 0) {
		console.log("haha", inputInterest.value);
		getInterestsBySearchKey(inputInterest.value);
	}
});

//MÉTODO QUE VAI NA BASE DE DADOS BUSCAR AS SKILLS
async function getInterestsBySearchKey(input) {
	//interest controller linha 206
	let interestsFound = await doFetchWithResponse(
		urlDefault + "interests/search/" + input,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);
	console.log(interestsFound);

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

//MÉTODO PARA RENDERIZAR AS SUGESTÕES
function renderInterestsResults(interestsFound) {
	if (suggestionsInterest.children.length > 0) {
		suggestionsInterest.innerHTML = "";
		console.log("ihih");
	}

	if (interestsFound.length) {
		console.log("bué length");

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-interests";
		ul.id = "ul-interests-privacy";

		interestsFound.forEach((interest) => {
			let li = document.createElement("li");
			li.className = "li-interest";
			li.innerText = interest.title; // aqui é o titulo da skill
			li.setAttribute("id", interest.idInterest); // aqui seria o id da skill

			//evento de adicionar a span com a skills escolhida
			li.addEventListener("click", function () {
				console.log("clique do botão escolher skill");
				//verificar se o user já escolheu esta skill e se a mesma já está na lista que vai para o backend:
				let repeated = false;
				for (let i = 0; i < idsInterestArray.length; i++) {
					console.log("for");
					console.log(idsInterestArray[i]);
					console.log(interest);
					if (idsInterestArray[i] == interest.idInterest) {
						console.log("if do for");
						repeated = true;
					}
				}
				console.log("sair do for " + repeated);

				if (repeated === false) {
					loadSpanInterest(interest); // aqui seria a skill toda, com id e titulo
				} else {
					//carregar warning:
					document.querySelector(
						".no-result-interest",
					).innerHTML = `<p class = "error-text">Interesse já selecionado!</p>`;
					// Depois de 2 segundos tira a mensagem do ecrã
					setTimeout(function () {
						document.querySelector(".no-result-interest").innerHTML = "";
					}, 2000);
					inputInterest.value = "";
				}
			});
			ul.appendChild(li);
		});

		suggestionsInterest.appendChild(ul);
		boxSearchInterest.classList.add("show");
	} else {
		document.querySelector(
			".no-result-interest",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-interest").innerHTML = "";
		}, 3000);
		inputInterest.value = "";
		return boxSearchInterest.classList.remove("show");
	}
}

//QUANDO O USER CLICAR NALGUMA DAS OPÇÕES SUGERIDAS, VAI ADICIONAR UMA SPAN AO DIV
function loadSpanInterest(interest) {
	console.log(interest);

	let repeated = false;
	for (let i = 0; i < idsInterestArray.length; i++) {
		if (idsInterestArray[i] === interest.idInterest) {
			repeated = true;
		}
	}
	console.log("sai do for " + repeated);

	if (repeated === true) {
		console.log("achou repetida");
		//carregar warning:
		inputInterest.placeholder = "Interesse já escolhido!!!";
		inputInterest.classList.add("warning-repeated");
		setTimeout(() => {
			inputInterest.placeholder = "procura o interesse que queres associar";
			inputInterest.classList.remove("warning-repeated");
		}, 3000);
	} else {
		console.log("NÂO achou repetida");

		//exibir o espaço onde entrarão os spans
		divWithSpansInterest.classList.remove("hide");

		//guardar a skill no array que será enviado ao backend
		idsInterestArray.push(interest.idInterest); // aqui algo tipo skillFound.id

		console.log("idsIntsArray ", idsInterestArray);

		//console.log(skillFound);
		const sectionSpan = document.getElementById("div-interests-privacy");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = interest.title; // aqui algo tipo skillFound.title

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			inputInterest.value = "";
			console.log(e.target.parentElement);

			for (let i = 0; i < idsInterestArray.length; i++) {
				// aqui seria para comparar por ids
				if (idsInterestArray[i] == interest.idInterest) {
					//preciso a posição do elemento no array
					idsInterestArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}
			console.log("idsintsArray REMOVEEE  ", idsInterestArray);

			if (idsInterestArray.length === 0) {
				//esconder de volta a div onde entram os spans
				divWithSpansInterest.classList.add("hide");
			}
		});

		spanCreated.appendChild(icon);
		//adicionar a skill na sectionSpan
		sectionSpan.appendChild(spanCreated);
	}

	//limpar tudo
	inputInterest.value = "";
	if (document.querySelector(".ul-interests")) {
		suggestionsInterest.removeChild(document.querySelector(".ul-interests"));
	}
}

//QUANDO CLICAR NO BOTÃO PARA ADICIONAR O GRUPO DE UTILIZADORES QUE TENHAM AQUELAS CARACTERÍSTICAS
document.querySelector(".add-group").addEventListener("click", async () => {
	console.log("interesses", idsInterestArray);
	console.log("skills", idsSkillsArray);
	console.log("work", inputWorkplace.value);
	let workplaceAux = inputWorkplace.value;
	if (inputWorkplace.value === "") {
		workplaceAux = "empty";
	}

	//Verificar se tem algums skill ou algum interesse ou workplace != "empty", pelo menos
	if (
		idsSkillsArray.length > 0 ||
		idsInterestArray.length > 0 ||
		workplaceAux != "empty"
	) {
		const body = {
			idsSkills: idsSkillsArray,
			idsInterest: idsInterestArray,
		};

		//cria os dados que irão ser enviados pelo fetch
		const fetchOptions = {
			method: "POST",
			body: JSON.stringify(body),
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				email: emailPersonalPage,
			},
		};

		//user controller linha 670
		const status = await doFetchNoResponse(
			urlDefault + "users/add/viewerList/group/" + workplaceAux,
			fetchOptions,
		);
		console.log(status);

		if (status === 200) {
			document
				.getElementById("notify-user")
				.classList.remove("visibily-hidden");
			document.querySelector(".span-skills-privacy").innerHTML = "";
			document.querySelector(".span-skills-privacy").classList.add("hide");
			document.querySelector(".span-skills-interests").innerHTML = "";
			document.querySelector(".span-skills-interests").classList.add("hide");
			idsInterestArray = [];
			idsSkillsArray = [];
			inputWorkplace.value = "";

			setTimeout(() => {
				document.getElementById("notify-user").classList.add("visibily-hidden");
			}, 3000);
		}
		if (status === 403) {
			window.location.href = "generalError.html";
		} else if (status === 401) {
			document.getElementById("empty-warning").innerText =
				"Pedimos desculpa, mas ocorreu um erro a adicionar os utilizadores com estes critérios à lista";
			document.getElementById("empty-warning").classList.remove("hide");

			setTimeout(() => {
				document.getElementById("empty-warning").classList.add("hide");
				document.getElementById("empty-warning").innerText =
					"Não selecionaste nenhum critério para o grupo de pessoas que queres adicionar";
			}, 3000);
		}
	} else {
		document.getElementById("empty-warning").classList.remove("hide");
		setTimeout(() => {
			document.getElementById("empty-warning").classList.add("hide");
		}, 3000);
	}
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PARTE DE SEGURANÇA
document
	.querySelector(".save-changes")
	.addEventListener("click", handleSavePassword);

async function handleSavePassword() {
	const password = document.getElementById("first-password");
	const passwordTrim = password.value.trim();
	const confirm = document.getElementById("second-password");
	const confirmTrim = confirm.value.trim();

	console.log(password);

	if (
		password.value === "" &&
		passwordTrim.length === 0 &&
		confirm.value === "" &&
		confirmTrim.length === 0
	) {
		document.querySelector(".error-changing").innerText =
			"Preenche as caixas de texto!";
		document.querySelector(".error-changing").classList.remove("hide");

		setTimeout(() => {
			document.querySelector(".error-changing").classList.add("hide");
			document.querySelector(".error-changing").innerText = "";
		}, 3000);
	} else {
		if (password.value === confirm.value) {
			//user controller linha 306
			const status = await doFetchNoResponse(
				urlDefault + "users/change/password",
				{
					method: "POST",
					headers: {
						Accept: "*/*",
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						password: password.value,
					}),
				},
			);

			password.value = "";
			confirm.value = "";
			if (status === 200) {
				document.querySelector(".error-changing").innerText =
					"Password alterada com sucesso!";
				document.querySelector(".error-changing").classList.remove("hide");

				setTimeout(() => {
					document.querySelector(".error-changing").classList.add("hide");
					document.querySelector(".error-changing").innerText = "";
				}, 4000);
				//
			} else {
				if (status === 403) {
					window.location.href = "generalError.html";
				}
				document.querySelector(".error-changing").innerText =
					"Ocorreu um erro a alterar a password!";
				document.querySelector(".error-changing").classList.remove("hide");

				setTimeout(() => {
					document.querySelector(".error-changing").classList.add("hide");
					document.querySelector(".error-changing").innerText = "";
				}, 4000);
			}
		} else {
			document.querySelector(".error-changing").innerText =
				"As palavras-passe são diferentes!";
			password.value = "";
			confirm.value = "";
			document.querySelector(".error-changing").classList.remove("hide");

			setTimeout(() => {
				document.querySelector(".error-changing").classList.add("hide");
				document.querySelector(".error-changing").innerText = "";
			}, 4000);
		}
	}
}

//////////////////////////////////
// botao VER LISTA
document.getElementById("see-specific-list").addEventListener("click", () => {
	dataUrl.delete("t");
	dataUrl.append("t", "view");

	window.location.href = "specific-list.html?" + dataUrl;
});

//////////////////////////////////
// botao EXCLUIR
document
	.getElementById("delete-users-privacy")
	.addEventListener("click", () => {
		dataUrl.delete("t");
		dataUrl.append("t", "delete");
		window.location.href = "specific-list.html?" + dataUrl;
	});
