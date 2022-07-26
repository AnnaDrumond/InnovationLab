const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let dataUrl = new URLSearchParams(window.location.search);
const reader = new FileReader();
const parameters = new URLSearchParams(window.location.search);
let emailPersonalPage = atob(parameters.get("e"));
const inputNewSkill = document.getElementById("input-new-skill");
const input = document.getElementById("input-new-interests");

document.addEventListener("DOMContentLoaded", async () => {
	//user controller linha 425
	const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});

	if (userWithSession === 403 || userWithSession === 401) {
		window.location.href = "generalError.html";
	} else {
		if (userWithSession.type === UserType.VISITOR) {
			window.location.href = "feedForum.html"; //FALTA ver como ficará
		}
		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);

		//user controller linha 278
		const auth = await doFetchWithResponse(
			urlDefault + "users/has/auth/" + userWithSession.email,
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
			dataUrl.delete("e");
			dataUrl.append("e", btoa(emailPersonalPage));
			window.location.href = "personal-page.html?" + dataUrl;
		}

		document.querySelector(".go-back-btn").addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(emailPersonalPage));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		const headersObj = new Headers();
		headersObj.append("email", emailPersonalPage);

		if (userWithSession.email === emailPersonalPage) {
			document.getElementById("manage-my-password").classList.remove("hide");

			document
				.getElementById("manage-my-password")
				.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(emailPersonalPage));
					window.location.href = "privacy-security.html?t=pw&" + dataUrl;
				});
		}

		document
			.getElementById("manage-my-visibility")
			.addEventListener("click", () => {
				dataUrl.delete("e");
				dataUrl.append("e", btoa(emailPersonalPage));
				window.location.href = "privacy-security.html?t=vi&" + dataUrl;
			});

			//user controller linha 338
		const user = await doFetchWithResponse(
			urlDefault + "users/search/by/email",
			{
				method: "GET",
				"Content-Type": "application/json",
				headers: headersObj,
			},
		);

		console.log(user);

		loadUserInformation(user);
	}
});

//preciso para poder abrir o dropdown do tipo de skill
const optionsContainer = document.querySelector(".options-container");
const optionsList = document.querySelectorAll(".option");
optionsList.forEach((o) => {
	//event listener para todos os itens da combo box
	o.addEventListener("click", () => {
		selected.innerHTML = o.querySelector("label").innerHTML; //guarda o inner html da label dentro da caixa selected
		optionsContainer.classList.remove("active"); //depois remove a classe active para fechar a combo box
	});
});

const selected = document.querySelector(".selected");
selected.addEventListener("click", () => {
	//quando alguém clica naquela div, o container fica com a classe active
	optionsContainer.classList.toggle("active"); //se estiver active, mostra as opções, senão, não mostra nada, está 'fechado'
});
////////

//necessário para poder abrir a secção para criar uma nova skill
document
	.querySelector(".question-click-skill")
	.addEventListener("click", () => {
		//document.getElementById("associate-skill").classList.add("hide");
		document.querySelector(".create-new-skill").classList.remove("hide");
	});

//necessário para poder abrir a secção para criar um novo interesse
document.querySelector(".question-click-int").addEventListener("click", () => {
	//document.getElementById("associate-interest").classList.add("hide");
	document.querySelector(".create-new-interests").classList.remove("hide");
});

//CRIAR UMA NOVA SKILL
document
	.getElementById("create-new-skill")
	.addEventListener("click", async () => {
		let titleNewSkill = inputNewSkill.value;
		const inputNewSkillTrim = titleNewSkill.trim();

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
			const newSkill = {
				title: inputNewSkillTrim,
				skillType: typeOfSkill,
			};

			const fetchOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newSkill),
			};

			//skill controller linha 45
			const idNewSkill = await doFetchWithIdResponse(
				urlDefault + "skills/new",
				fetchOptions,
			);

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
			}, 4000);
		}
	});

//CRIAR UM NOVO INTERESSE
document
	.getElementById("create-new-interest")
	.addEventListener("click", async () => {
		const inputTrim = input.value.trim();

		if (input.value !== "" || inputTrim.length > 0) {
			let newInterest = {
				title: input.value,
			};

			const fetchOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newInterest),
			};

			//interest controller linha 44
			let idNewInterest = await doFetchWithIdResponse(
				urlDefault + "interests/new",
				fetchOptions,
			);

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
				loadSpanInterest({
					title: input.value,
					idInterest: idNewInterest,
				});

				//LIMPAR
				document.getElementById("input-new-interests").value = "";
				document.querySelector(".create-new-interests").classList.add("hide");
			}
		} else {
			document.querySelector(".empty-interest").innerText =
				"Certifica-te primeiro que preencheste a caixa antes de criar um novo interesse!";
			document.querySelector(".empty-interest").classList.remove("hide");

			setTimeout(() => {
				document.querySelector(".empty-interest").classList.add("hide");
				document.querySelector(".empty-interest").innerText = "";
			}, 4000);
		}
	});

function loadUserInformation(user) {
	loadUsersSkills(user.email);
	loadUsersInterests(user.email);
	document.getElementById("first-name").value = user.firstName;
	document.getElementById("last-name").value = user.lastName;
	document.getElementById("workplace-profile").value = user.workplace;
	document.getElementById("nickname").value =
		user.nickname === null || user.nickname === "" ? "" : user.nickname;
	document.getElementById("my-profile-picture").src =
		user.photo === null || user.photo === "" ? "photoDefault.jpeg" : user.photo;
	document.getElementById("user-availability").value =
		user.availability === null || user.availability === ""
			? ""
			: user.availability;
	document.getElementById("user-bio").value =
		user.biography === null || user.biography === "" ? "" : user.biography;
}

//CARREGAR AS SKILLS DO USER
const inputSkill = document.getElementById("input-add-skill");
const suggestions = document.querySelector(".results-skills");
const divWithSpans = document.getElementById("ids-skills");
const boxSearchSkills = document.querySelector(".box-search-skills");
let idsSkillsArray = [];
let idsSkillsArrayToRemove = [];

//CADA VEZ QUE O USER ESCREVER ALGUMA COISA VAI PEGAR NISSO E PESQUISAR NA BASE DE DADOS PELAS SKILLS QUE TÊM ESTE TÍTULO
inputSkill.addEventListener("keyup", () => {

	if (suggestions.children.length > 0) {
		suggestions.innerHTML = "";
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
	if (suggestions.children.length > 0) {
		suggestions.innerHTML = "";
	}

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

async function loadUsersSkills(email) {
	//skill controller linha 336
	const skills = await doFetchWithResponse(
		urlDefault + "skills/associated/user/" + email,
		{
			method: "GET",
			"Content-Type": "application/json",
		},
	);
	console.log(skills);

	if (skills === 403) {
		window.location.href = "generalError.html";
	} else if (skills === 401) {
		document.querySelector(
			".no-result-skills",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as skills!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-skills").innerHTML = "";
		}, 3000);
	} else if (skills instanceof Object) {
		if (skills.length > 0) {
			divWithSpans.classList.remove("hide");
			skills.forEach((skill) => {
				loadSpanSkill(skill);
			});
		}
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
		console.log("Não achou repetida");

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

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			inputSkill.value = "";

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

//CARREGAR OS INTERESSES DO USER
const inputInterest = document.getElementById("input-add-interest");
const suggestionsInterest = document.querySelector(".results-interests");
const divWithSpansInterest = document.getElementById("ids-interests");
const boxSearchInterest = document.querySelector(".box-search-interests");
let idsInterestArray = [];
let idsInterestArrayToRemove = [];

//CADA VEZ QUE O USER ESCREVER ALGUMA COISA VAI PEGAR NISSO E PESQUISAR NA BASE DE DADOS PELAS SKILLS QUE TÊM ESTE TÍTULO
inputInterest.addEventListener("keyup", () => {

	if (suggestionsInterest.children.length > 0) {
		suggestionsInterest.innerHTML = "";
	}

	if (inputInterest.value.length > 0) {
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
		//RETIRA REPETIDOS
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

//MÉTODO PARA RENDERIZAR AS SUGESTÕES
function renderInterestsResults(interestsFound) {
	if (suggestionsInterest.children.length > 0) {
		suggestionsInterest.innerHTML = "";
	}

	if (interestsFound.length) {
		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-interests";

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

				if (repeated === false) {
					loadSpanInterest(interest); // aqui seria a skill toda, com id e titulo
				} else {
					//carregar warning:
					document.querySelector(
						".no-result-interest",
					).innerHTML = `<p class = "error-text">Skill já selecionada!</p>`;
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

async function loadUsersInterests(email) {
	//interest controller linha 263
	const interests = await doFetchWithResponse(
		urlDefault + "interests/associated/user/" + email,
		{
			method: "GET",
			"Content-Type": "application/json",
		},
	);

	if (interests === 403) {
		window.location.href = "generalError.html";
	} else if (interests === 401) {
		document.querySelector(
			".no-result-interest",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a carregar os interesses!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-interest").innerHTML = "";
		}, 3000);
	} else if (interests instanceof Object) {
		console.log(interests);

		if (interests.length > 0) {
			divWithSpansInterest.classList.remove("hide");
			interests.forEach((interest) => {
				loadSpanInterest(interest);
			});
		}
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
		for (let a = 0; a < idsInterestArrayToRemove.length; a++) {
			if (idsInterestArrayToRemove[a] === interest.idInterest) {
				idsInterestArrayToRemove.splice(a, 1);
			}
		}

		//console.log(skillFound);
		const sectionSpan = document.getElementById("ids-interests");
		let spanCreated = document.createElement("span"); // criar a span
		spanCreated.className = "span-to-search";
		spanCreated.innerText = interest.title; // aqui algo tipo skillFound.title
		// spanCreated.setAttribute("id", skillFound.idSkill); // aqui algo tipo skillFound.id

		//icone de excluir
		let icon = document.createElement("i"); //icone
		icon.className = "fa-solid fa-xmark delete-icon";

		// evento do botão excluir de cada span
		icon.addEventListener("click", function (e) {
			// excluir do array que vai ao back
			inputInterest.value = "";
			console.log(e.target.parentElement);

			idsInterestArrayToRemove.push(interest.idInterest);
			for (let i = 0; i < idsInterestArray.length; i++) {
				// aqui seria para comparar por ids
				//idsSkills[i].id === skillFound.id
				if (idsInterestArray[i] == interest.idInterest) {
					//preciso a posição do elemento no array
					idsInterestArray.splice(i, 1);
					//remover o span que o user excluiu
					sectionSpan.removeChild(e.target.parentElement);
				}
			}

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

//GUARDAR AS ALTERAÇÕES
document.querySelector(".save-profile").addEventListener("click", async () => {
	console.log("click em guardar alterações/editar perfil");
	const firstName = document.getElementById("first-name").value;
	const firstNameTrim = firstName.trim();

	const lastName = document.getElementById("last-name").value;
	const lastNameTrim = lastName.trim();

	const workplace = document.getElementById("workplace-profile").value;
	const workplaceTrim = workplace.trim();

	const nickname = document.getElementById("nickname").value;
	const nicknameTrim = nickname.trim();

	const profilePic = document.getElementById("my-profile-picture").src;
	const profilePicTrim = profilePic.trim();

	const availability = document.getElementById("user-availability").value;
	const availabilityTrim = availability.trim();

	const bio = document.getElementById("user-bio").value;
	const bioTrim = bio.trim();

	if (
		firstName !== "" &&
		firstNameTrim.length > 0 &&
		lastName !== "" &&
		lastNameTrim.length > 0 &&
		workplace !== "" &&
		workplaceTrim.length > 0
	) {
		//cria os dados que irão ser enviados pelo fetch

		let userEdited = {
			firstName: firstNameTrim,
			lastName: lastNameTrim,
			workplace: workplaceTrim,
			nickname: nicknameTrim,
			photo: profilePicTrim,
			biography: bioTrim,
			availability: availabilityTrim,
			// password
		};

		//OS IDS ESTÃO DIREITOS E A CHEGAR AQUI CORRETAMENTE
		//o problema é o seguinte: basicamente ele dá erro 415 quando chamamos o fetch
		//o objetivo seria que depois de dar 200, fazer a desassociação das skills, a associação das skills,
		//a desassociação interesses e a associação de interesses
		console.log("vou para o fetch");
		//user controler linha 250
		let status = await doFetchNoResponse(
			urlDefault + "users/edit/profile/" + emailPersonalPage,
			{
				method: "POST",
				body: JSON.stringify(userEdited),
				headers: {
					Accept: "*/*",
					"Content-Type": "application/json",
				},
			},
		);
		console.log("status do fetch " + status);

		if (status === 200) {
			//DESASSOCIAR SKILLS DO USER
			body = {
				idsSkills: idsSkillsArrayToRemove,
			};

			let fetchOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			};

			//skill controller linha 108
			status = await doFetchNoResponse(
				urlDefault + "skills/desassociate/with/" + emailPersonalPage,
				fetchOptions,
			);

			//SE TIVER CONSEGUIDO DESASSOCIAR
			if (status === 200) {
				//ASSOCIAR SKILLS DO USER
				body = {
					idsSkills: idsSkillsArray,
				};

				let fetchOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				};

				//skill controller linha 74
				let status = await doFetchNoResponse(
					urlDefault + "skills/associate/with/" + emailPersonalPage,
					fetchOptions,
				);

				//SE TIVER TIDO SUCESSO A ASSOCIAR AS SKILLS
				if (status === 200) {
					//DESASSOCIAR INTERESSES DO USER
					body = {
						idsInterest: idsInterestArrayToRemove,
					};

					let fetchOptions = {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(body),
					};

					//interest controller linha 104
					let status = await doFetchNoResponse(
						urlDefault + "interests/desassociate/with/" + emailPersonalPage,
						fetchOptions,
					);

					//SE TIVER CONSEGUIDO DESASSOCIAR OS INTERESSES
					if (status === 200) {
						//ASSOCIAR INTERESSES DO USER
						body = {
							idsInterest: idsInterestArray,
						};

						let fetchOptions = {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify(body),
						};

						//interest controller linha 73
						let status = await doFetchNoResponse(
							urlDefault + "interests/associate/with/" + emailPersonalPage,
							fetchOptions,
						);

						//SE TIVER CONSEGUIDO ASSOCIAR OS INTERESSES
						if (status === 200) {
							dataUrl.delete("e");
							dataUrl.append("e", btoa(emailPersonalPage));
							window.location.href = "personal-page.html?" + dataUrl;

							//SE NÃO CONSEGUIU ASSOCIAR OS INTERESSES
						} else {
							if (status === 466) {
								dataUrl.delete("e");
								dataUrl.append("e", btoa(emailPersonalPage));
								window.location.href = "personal-page.html?" + dataUrl;
							} else {
								document.querySelector(".error-interest").innerText =
									"Pedimos desculpa, mas ocorreu um erro a associar os interesses que selecionaste ao teu perfil!";
								document
									.querySelector(".error-interest")
									.classList.remove("hide");
							}
						}

						//SE NÃO TIVER CONSEGUIDO DESASSOCIAR OS INTERESSES
					} else {
						if (status === 466) {
							dataUrl.delete("e");
							dataUrl.append("e", btoa(emailPersonalPage));
							window.location.href = "personal-page.html?" + dataUrl;
						} else {
							document.querySelector(".error-interest").innerText =
								"Pedimos desculpa, mas ocorreu um erro a desassociar os interesses que selecionaste ao teu perfil!";
							document
								.querySelector(".error-interest")
								.classList.remove("hide");
						}
					}

					//SE NÃO TIVER CONSEGUIDO ASSOCIAR AS SKILLS
				} else {
					if (status === 466) {
						dataUrl.delete("e");
						dataUrl.append("e", btoa(emailPersonalPage));
						window.location.href = "personal-page.html?" + dataUrl;
					} else {
						document.querySelector(".error-skill").innerText =
							"Pedimos desculpa, mas ocorreu um erro a desassociar as skills que selecionaste ao teu perfil!";
						document.querySelector(".error-skill").classList.remove("hide");
					}
				}

				//SE NÃO TIVER CONEGUIDO DESASSOCIAR AS SKILLS
			} else {
				if (status === 466) {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(emailPersonalPage));
					window.location.href = "personal-page.html?" + dataUrl;
				} else {
					document.querySelector(".error-skill").innerText =
						"Pedimos desculpa, mas ocorreu um erro a associar as skills que selecionaste ao teu perfil!";
					document.querySelector(".error-skill").classList.remove("hide");
				}
			}

			//SE NÃO CONSEGUIU EDITAR O UTILIZADOR MOSTRAR MENSAGEM DE ERRO
		} else {
			if (status === 403) {
				window.location.href = "generalError.html";
			}
			window.scrollTo(0, 0);
			document.querySelector(".error-basic-info").innerText =
				"Pedimos desculpa, mas ocorreu um erro a guardar as alterações realizadas no perfil! Tenta novamente mais tarde!";
			document.querySelector(".error-basic-info").classList.remove("hide");
		}
	} else {
		window.scrollTo(0, 0);

		if (firstName === "" && firstNameTrim.length === 0) {
			document.getElementById("first-name-label").innerText =
				"Primeiro nome (*OBRIGATÓRIO):";
			document.getElementById("first-name-label").style.color = "#a21920";
			document.getElementById("first-name-label").style.fontWeight = "bold";
		}

		if (lastName === "" && lastNameTrim.length === 0) {
			document.getElementById("last-name-label").innerText =
				"Último nome (*OBRIGATÓRIO):";
			document.getElementById("last-name-label").style.color = "#a21920";
			document.getElementById("last-name-label").style.fontWeight = "bold";
		}

		if (workplace === "" && workplaceTrim.length === 0) {
			document.getElementById("workplace-label").innerText =
				"Local de trabalho (*OBRIGATÓRIO):";
			document.getElementById("workplace-label").style.color = "#a21920";
			document.getElementById("workplace-label").style.fontWeight = "bold";
		}
	}
});

//QUANDO CARREGO NUM DOS TITANS
document.querySelector(".titan-container").addEventListener("click", (e) => {
	if (e.target.src) {
		console.log(e.target.parentElement, "hihi");
		document.getElementById("my-profile-picture").src = e.target.src;
	}
});

//QUANDO CARREGO NO BOTÃO DE RETIRAR A FOTOGRAFIA
document.querySelector(".no-photo").addEventListener("click", () => {
	document.getElementById("my-profile-picture").src = "photoDefault.jpeg";
});

//QUANDO SELECIONO UMA FOTO DO COMPUTADOR
document.getElementById("image-input").addEventListener("change", () => {
	//https://www.educative.io/answers/how-to-build-an-image-preview-using-javascript-filereader

	reader.readAsDataURL(document.getElementById("image-input").files[0]);
	reader.addEventListener("load", () => {
		document.getElementById("my-profile-picture").src = reader.result;
	});
});

//QUANDO A PESSOA COLOCA UM LINK DA IMAGEM
document.querySelector(".end-link-profile").addEventListener("click", () => {
	const link = document.getElementById("link-profile-pic").value;

	//https://codepen.io/kallil-belmonte/pen/KKKRoyx
	const img = new Image();
	img.src = link;

	if (img.complete) {
		document.getElementById("my-profile-picture").src = link;
		document.getElementById("link-profile-pic").value = "";
	} else {
		img.onload = () => {
			document.getElementById("my-profile-picture").src = link;
			document.getElementById("link-profile-pic").value = "";
		};

		img.onerror = () => {
			document.getElementById("link-profile-pic").value =
				"link da imagem inválido!";
			setTimeout(() => {
				document.getElementById("link-profile-pic").value = "";
			}, 3000);
		};
	}
});

document.getElementById("cancel-new-interest").addEventListener("click", () => {
	input.value = "";
	document.querySelector(".create-new-interests").classList.add("hide");
});

document.getElementById("cancel-new-skill").addEventListener("click", () => {
	inputNewSkill.value = "";
	selected.innerText = "Tipo de Skill";
	document.querySelector(".create-new-skill").classList.add("hide");
});
