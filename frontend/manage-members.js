const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let dataUrl = new URLSearchParams();
const paramNewForum = new URLSearchParams(window.location.search);
const tab = paramNewForum.get("m");
const projectId = paramNewForum.get("id");
let memberAux = {};

let projectMembers = [];
let solicitors = [];
let userWithSession;

//chamar o método para obter o número total de utilizadores que são membros do projeto
document.addEventListener("DOMContentLoaded", async () => {
	//serve para obter o user que está atualmente com sessão iniciada
	//user controller linha 425
	userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});

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
	console.log(userWithSession);

	//traz do back apenas os administradores
	//project controller linha 1211
	const admins = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			projectId +
			"/who/are/" +
			MemberStatus.ADMINISTRATOR,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(admins === 403 || admins === 401){
		window.location.href = "generalError.html";
	}

	let verification = false;

	//SERVE PARA VER SE O UTILIZADOR TEM AUTORIZAÇÃO PARA ESTAR A VER ESTA PÁGINA DE GERIR MEMBROS DO PROJETO
	admins.forEach((admin) => {
		console.log(admin);
		if (admin.email === userWithSession.email) {
			verification = true;
		}
	});

	console.log(verification);

	//se o user que está naquela página não for admin do projeto ou não for admin do sistema é redirecionado para fora daqui
	if (verification === false) {
		if (userWithSession.type !== UserType.ADMINISTRATOR) {
			window.location.href = "seeProject.html?p=" + projectId;
		}
		console.log("não sou admin do projeto");
	}

	//OBTEM A LISTA DE MEMBROS (PARTICIPANTES E ADMINISTRADORES) DO PROJETO PARA SABER SE POSSO CARREGAR
	//OU NÃO ALGUNS ELEMENTOS DAS CONDIÇÕES ABAIXO
	//project controller linha 1179
	projectMembers = await doFetchWithResponse(
		urlDefault + "projects/members/" + projectId + "/project",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	//MÉTODO PARA OBTER O NÚMERO DE PEDIDOS PARA SER MEMBRO DO PROJETO - é colocado no span do botão
	//project controller linha 1211
	solicitors = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			projectId +
			"/who/are/" +
			MemberStatus.SOLICITOR,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(solicitors === 401){
		document.querySelector(".number-solicitor").innerText = 0;
	} else if(solicitors === 403){
		window.location.href = "generalError.html";
	} else if(solicitors instanceof Object){
		document.querySelector(".number-solicitor").innerText = solicitors.length;
	}

	//VERIFICA QUE PÁGINA É QUE TENHO ABERTA, DE FORMA A CARREGAR O QUE NECESSITO
	if (tab === "adm") {
		document.getElementById("admin-btn").classList.add("btn-select");
		loadProjectsAdmins();
	} else if (tab === "prc") {
		document.getElementById("participator-btn").classList.add("btn-select");
		loadProjectParticipators();
	} else if (tab === "sol") {
		document.getElementById("solicitor-btn").classList.add("btn-select");
		loadProjectSolicitors();
	} else if (tab === "inv") {
		document.getElementById("invited-btn").classList.add("btn-select");

		if (projectMembers.length < 4) {
			document.querySelector(".search-user-to-invite").classList.remove("hide");
		}

		loadProjectInvitedUsers();
		const emailUserToAdd = paramNewForum.get("e");
		console.log(emailUserToAdd);
		if(emailUserToAdd !== null){
			paramNewForum.delete("e");
			loadUserToAdd(atob(emailUserToAdd));
		}
	}
});

document.getElementById("search-user-to-join").addEventListener("click", () => {
	dataUrl.delete("e");
	dataUrl.append("e", btoa(memberAux.email));
	dataUrl.delete("id");
	dataUrl.append("id", projectId);
	window.location.href = "personal-page.html?man=y&" + dataUrl;
});

document.getElementById("go-back-to-edit").addEventListener("click", () => {
	window.location.href = "seeProject.html?p=" + projectId;
});

document.getElementById("finished-editing").addEventListener("click", () => {
	window.location.href = "seeProject.html?p=" + projectId;
});

document.getElementById("admin-btn").addEventListener("click", () => {
	window.location.href = "manage-members.html?m=adm&id=" + projectId;
});

document.getElementById("participator-btn").addEventListener("click", () => {
	window.location.href = "manage-members.html?m=prc&id=" + projectId;
});

document.getElementById("solicitor-btn").addEventListener("click", () => {
	window.location.href = "manage-members.html?m=sol&id=" + projectId;
});

document.getElementById("invited-btn").addEventListener("click", () => {
	window.location.href = "manage-members.html?m=inv&id=" + projectId;
});


//LÓGICA DE BUSCA ATIVA DE UTILIZADORES A CONVIDAR PARA SE TORNAREM MEMBROS DO PROJETO
const inputMember = document.getElementById("input-member");
const suggestionsMember = document.querySelector(".results-member");
const memberDivWithSpans = document.getElementById("ids-member");
const boxSearchMember = document.querySelector(".box-search-member");

//SEMPRE QUE O USER ESCREVER ALGO NA CAIXA DE INPUT, VAI CHAMAR O MÉTODO PARA IR BUSCAR O USER COM AQUELAS LETRAS NO SEU NOME
inputMember.addEventListener("keyup", () => {

	if (suggestionsMember.children.length > 0) {
		suggestionsMember.innerHTML = "";
	}

	if (inputMember.value.length > 0) {
		getUserBySearchKey(inputMember.value);
	}
});

//MÉTODO QUE VAI NA BASE DE DADOS BUSCAR OS USERS - linha 567 controller backend
async function getUserBySearchKey(input) {
	//project controller linha 565
	let usersFound = await doFetchWithResponse(
		urlDefault + "projects/get/available/users/" + input,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(usersFound === 403){
		window.location.href = "generalError.html";
	} else if(usersFound === 401){
		document.querySelector(
			".no-result-member",
		).innerHTML = `<p class = "error-text">Ocorreu um erro a realizar a pesquisa!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-member").innerHTML = "";
		}, 3000);
	} else if(usersFound instanceof Object){
		console.log(usersFound);
		renderMembersResults(usersFound);
	}
	
}

//MÉTODO PARA RENDERIZAR AS SUGESTÕES
//suggestionsMember
function renderMembersResults(usersFound) {
	//
	if (suggestionsMember.children.length > 0) {
		suggestionsMember.innerHTML = "";
	}
	//
	if (usersFound.length > 0) {

		let ul = document.createElement("ul"); // criar a lista
		ul.className = "ul-member";

		document.querySelector(".manage-members-ul").classList.add("hide");
		document.querySelector(".alterations-feedback").classList.add("hide");

		usersFound.forEach((member) => {
			//
			document.querySelector(".manage-members-ul").classList.remove("hide");
			document.querySelector(".alterations-feedback").classList.remove("hide");

			let li = document.createElement("li");
			li.className = "li-member";

			if (member.nickname) {
				li.innerText = member.fullName + " (" + member.nickname + ")";
			} else {
				li.innerText = member.fullName;
			}

			let userImage = document.createElement("img");
			userImage.id = "userImage-active-search";

			if (member.photo) {
				userImage.src = member.photo;
			} else {
				userImage.src = "photoDefault.jpeg";
			}
		
			li.setAttribute("id", member.email); // aqui seria o id do user
			li.appendChild(userImage);

			//evento de adicionar a span com a skills escolhida
			li.addEventListener("click", function () {
				console.log("clique do botão escolher user");
				//loadMemberLi(member);
				let nameAux = "";
				if (member.nickname) {
					nameAux = member.fullName + " (" + member.nickname + ")";
				} else {
					nameAux = member.fullName;
				}
				inputMember.value = nameAux;
				memberAux = member;
				suggestionsMember.innerHTML = "";
			});

			ul.appendChild(li);
		});

		suggestionsMember.appendChild(ul);
		boxSearchMember.classList.add("show");
	} else {
		document.querySelector(
			".no-result-member",
		).innerHTML = `<p class = "error-text">Sem resultados para esta pesquisa. Tente novamente.</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".no-result-member").innerHTML = "";
		}, 3000);
		inputMember.value = "";
		return boxSearchMember.classList.remove("show");
	}
}

//QUANDO O USER CLICAR NA LISTA DE SUGESTÕES, VAI PARA A LISTA ABAIXO
async function loadMemberLi(member) {
	console.log(member);

	//chama o método que vai adicionar o user aos users convidados para o projeto
	const headersObj = new Headers();
	headersObj.append("email", member.email);
	//cria os dados que irão ser enviados pelo fetch
	const fetchOptions = {
		method: "POST",
		"Content-Type": "application/json",
		headers: headersObj,
	};

	//project controller linha 433
	const status = await doFetchNoResponse(
		urlDefault + "projects/add/member/" + projectId,
		fetchOptions,
	);
	if (status === 200) {
		document.querySelector(".members-div").classList.remove("hide");
		document.querySelector(".manage-members-ul").classList.remove("hide");
		document.querySelector(".alterations-feedback").classList.remove("hide");
		document.querySelector(".no-members-to-see-div").classList.add("hide");
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
		}, 3000);

		//<li class="manage-user-li">
		const li = document.createElement("li");
		li.className = "manage-user-li";
		li.setAttribute("id", member.email);

		//<div class="member-info">
		const userDiv = document.createElement("div");
		userDiv.className = "member-info";

		//<img src="https://randomuser.me/api/portraits/women/32.jpg" class="member-image" id="member-image1">
		const userImage = document.createElement("img");
		userImage.className = "member-image";
		let imgAux = member.photo;

		if (imgAux === null || imgAux === "") {
			imgAux = "photoDefault.jpeg";
		}
		userImage.src = imgAux;
		userImage.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(member.email));
			window.location.href = "personal-page.html?man=n&" + dataUrl;
		});

		userDiv.appendChild(userImage);

		//<p class="member-name">Laura Quintas</p>
		const userName = document.createElement("p");
		userName.className = "member-name";
		let nameAux = "";
		if (member.nickname === null || member.nickname === "") {
			nameAux = member.fullName;
		} else {
			nameAux = member.fullName + " " + member.nickname;
		}
		userName.innerText = nameAux;
		userName.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(member.email));
			window.location.href = "personal-page.html?man=n&" + dataUrl;
		});

		userDiv.appendChild(userName);

		li.appendChild(userDiv);

		//<div class="manage-user-btn-container visibily-hidden">
		const buttonDiv = document.createElement("div");
		buttonDiv.classList = "manage-user-btn-container visibily-hidden";

		//<button class="button-delete"><i class="fa-solid fa-trash-can member-icon"></i></button>
		const icon = document.createElement("i");
		icon.className = "fa-solid fa-trash-can member-icon";

		const buttonDelete = document.createElement("button");
		buttonDelete.className = "button-delete";
		buttonDelete.append(icon);
		buttonDelete.addEventListener("click", deleteUser);

		//buttonDiv.appendChild(buttonDispromote);
		buttonDiv.appendChild(buttonDelete);

		li.appendChild(buttonDiv);

		//LÓGICA NECESSÁRIA PARA PODER QUANDO O USER FAZ HOVER POR CIMA DA LI APARECEREM OS ICONES
		li.onmouseover = () => {
			li.children[1].classList.remove("visibily-hidden");
		};

		li.onmouseout = () => {
			li.children[1].classList.add("visibily-hidden");
		};

		document.querySelector(".manage-members-ul").appendChild(li);
	} else if(status === 401){
		document.querySelector(
			".no-result-member",
		).innerHTML = `<p class = "error-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;
		document.querySelector(".alterations-feedback").innerText =
			"Ocorreu um erro! Tenta novamente mais tarde!";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document.querySelector(
				".no-result-member",
			).innerHTML ="";
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);
	} else if(status === 403){
		window.location.href = "generalError.html";
	} else if(status === 477){
		//se o user já foi solicitante
		document.querySelector(
			".no-result-member",
		).innerHTML = `<p class = "error-text">O utilizador que selecionou já solicitou a participação no projeto!</p>`;
		document.querySelector(".alterations-feedback").innerText =
			"O utilizador que selecionou já solicitou a participação no projeto!";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document.querySelector(
				".no-result-member",
			).innerHTML = "";
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);

	} else if(status === 476){
		//se o user já estiver convidado
		document.querySelector(
			".no-result-member",
		).innerHTML = `<p class = "error-text">O utilizador que selecionou já foi convidado para o projeto!</p>`;
		document.querySelector(".alterations-feedback").innerText =
			"O utilizador que selecionou já foi convidado para o projeto";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document.querySelector(
				".no-result-member",
			).innerHTML = "";
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);
	} else if(status === 493){
		//soft delete
		window.location.href = "feedProject.html";
	} else if(status === 494){
		//não está ativo
		window.location.href = "seeProject.html?p=" + projectId;
	}

	//limpar tudo
	inputMember.value = "";
	if (suggestionsMember.children.length > 0) {
		suggestionsMember.removeChild(document.querySelector(".ul-member"));
	}
}

// *****************************************
//CARREGAR A LISTA DE ADMINISTRADORES DO PROJETO
async function loadProjectsAdmins() {
	//traz do back apenas os administradores
	//project controller linha 1211
	const admins = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			projectId +
			"/who/are/" +
			MemberStatus.ADMINISTRATOR,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);
	document.querySelector(".no-members-to-see-div").classList.add("hide");
	
	if(admins === 401){
		document.querySelector(".members-div").classList.add("hide");
		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "Ocorreu um erro!";
		document.querySelector(".body").appendChild(pError);
	} else if(admins === 403){
		window.location.href = "generalError.html";
	} else if(admins instanceof Object){
		document.querySelector(".members-div").classList.remove("hide");
			admins.forEach((admin) => {
			//<li class="manage-user-li">
			const li = document.createElement("li");
			li.className = "manage-user-li";
			li.setAttribute("id", admin.email);

			//<div class="member-info">
			const userDiv = document.createElement("div");
			userDiv.className = "member-info";

			//<img src="https://randomuser.me/api/portraits/women/32.jpg" class="member-image" id="member-image1">
			const userImage = document.createElement("img");
			userImage.className = "member-image";
			let imgAux = admin.photo;

			if (imgAux === null || imgAux === "") {
				imgAux = "photoDefault.jpeg";
			}
			userImage.src = imgAux;
			userImage.addEventListener("click", () => {
				dataUrl.delete("e");
				dataUrl.append("e", btoa(admin.email));
				window.location.href = "personal-page.html?man=n&" + dataUrl;
			});

			userDiv.appendChild(userImage);

			//<p class="member-name">Laura Quintas</p>
			const userName = document.createElement("p");
			userName.className = "member-name";
			let nameAux = "";
			if (admin.nickname === null || admin.nickname === "") {
				nameAux = admin.fullName;
			} else {
				nameAux = admin.fullName + " " + admin.nickname;
			}
			userName.innerText = nameAux;
			userName.addEventListener("click", () => {
				dataUrl.delete("e");
				dataUrl.append("e", btoa(admin.email));
				window.location.href = "personal-page.html?man=n&" + dataUrl;
			});

			userDiv.appendChild(userName);

			li.appendChild(userDiv);

			//<div class="manage-user-btn-container visibily-hidden">
			const buttonDiv = document.createElement("div");
			buttonDiv.classList = "manage-user-btn-container visibily-hidden";

			//<button class="button-member">TORNAR PARTICIPANTE</i></button>
			const buttonDispromote = document.createElement("button");
			buttonDispromote.className = "button-member";
			buttonDispromote.innerText = "TORNAR PARTICIPANTE";
			buttonDispromote.addEventListener("click", turnAdminInUser);

			//<button class="button-delete"><i class="fa-solid fa-trash-can member-icon"></i></button>
			const icon = document.createElement("i");
			icon.className = "fa-solid fa-trash-can member-icon";

			const buttonDelete = document.createElement("button");
			buttonDelete.className = "button-delete";
			buttonDelete.append(icon);
			buttonDelete.addEventListener("click", deleteUser);

			buttonDiv.appendChild(buttonDispromote);
			buttonDiv.appendChild(buttonDelete);

			li.appendChild(buttonDiv);

			//LÓGICA NECESSÁRIA PARA PODER QUANDO O USER FAZ HOVER POR CIMA DA LI APARECEREM OS ICONES
			li.onmouseover = () => {
				li.children[1].classList.remove("visibily-hidden");
			};

			li.onmouseout = () => {
				li.children[1].classList.add("visibily-hidden");
			};

			document.querySelector(".manage-members-ul").appendChild(li);
		});
	}
}

//método para tornar administrador do projeto em participante
async function turnAdminInUser(e) {
	console.log(document.querySelectorAll(".manage-user-li").length);

	//se estivermos na página de administradores do projeto e só existir um administrador não deixa mas se tivermos mais que um deixa
	if (
		tab === "adm" &&
		document.querySelectorAll(".manage-user-li").length > 1
	) {

		const headersObj = new Headers();
		headersObj.append("email", e.target.parentElement.parentElement.id);
		//cria os dados que irão ser enviados pelo fetch
		const fetchOptions = {
			method: "POST",
			"Content-Type": "application/json",
			headers: headersObj,
		};

		//project controller linha 788
		const status = await doFetchNoResponse(
			urlDefault + "projects/dispromote/participant/" + projectId + "/project",
			fetchOptions,
		);

		console.log(status);

		if (status === 200) {
			document
				.querySelector(".alterations-feedback")
				.classList.remove("visibily-hidden");
			setTimeout(() => {
				document
					.querySelector(".alterations-feedback")
					.classList.add("visibily-hidden");
			}, 3000);

			e.target.parentElement.parentElement.remove();

				document
					.querySelector(".alterations-feedback")
					.classList.remove("visibily-hidden");
				setTimeout(() => {
					document
						.querySelector(".alterations-feedback")
						.classList.add("visibily-hidden");
				}, 3000);
			//}

			//se me estou a remover a mim próprio e não sou admin do projeto
			if (
				userWithSession.type === "STANDARD" &&
				userWithSession.email === e.target.parentElement.parentElement.id
			) {
				//como passou a ser participante do projeto, deixou de ter autorização para gerir o projeto
				//e os seus membros, como tal é redirecionado para fora desta página
				window.location.href = "seeProject.html?p=" + projectId;
			}
		} else {
			document.querySelector(".alterations-feedback").innerText =
				"Ocorreu um erro! Tenta novamente mais tarde!";
			document
				.querySelector(".alterations-feedback")
				.classList.remove("visibily-hidden");
			setTimeout(() => {
				document
					.querySelector(".alterations-feedback")
					.classList.add("visibily-hidden");
				document.querySelector(".alterations-feedback").innerText =
					"Alterações guardadas!";
			}, 3000);
		}
	} else {
		document.querySelector(".alterations-feedback").innerText =
			"O projeto precisa de ter pelo menos um administrador!";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);
	}
}

// *****************************************
// MÉTODO PARA CARREGAR A LISTA DE PARTICIPANTES DO PROJETO
async function loadProjectParticipators() {
	//traz do back apenas os participantes
	//project controller linha 1211
	const participators = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			projectId +
			"/who/are/" +
			MemberStatus.PARTICIPATOR,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(participators === 401){
		document.querySelector(".members-div").classList.add("hide");
		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "Ocorreu um erro!";
		document.querySelector(".body").appendChild(pError);
	} else if(participators === 403){
		window.location.href = "generalError.html";
	} else if(participators instanceof Object){
		if (participators.length === 0) {
			document.querySelector(".manage-members-ul").classList.add("hide");
			document.querySelector(".alterations-feedback").classList.add("hide");
			document.querySelector(".no-invited-to-see-span").innerText = "Não existem membros participantes no projeto!"
			document.querySelector(".no-members-to-see-div").classList.remove("hide");
			document.querySelector(".members-div").classList.add("hide");
	
		} else {
			document.querySelector(".members-div").classList.remove("hide");
			document.querySelector(".no-members-to-see-div").classList.add("hide");
			document.querySelector(".manage-members-ul").classList.remove("hide");
			document.querySelector(".alterations-feedback").classList.remove("hide");
	
			participators.forEach((participator) => {
				//<li class="manage-user-li">
				const li = document.createElement("li");
				li.className = "manage-user-li";
				li.setAttribute("id", participator.email);
	
				//<div class="member-info">
				const userDiv = document.createElement("div");
				userDiv.className = "member-info";
	
				//<img src="https://randomuser.me/api/portraits/women/32.jpg" class="member-image" id="member-image1">
				const userImage = document.createElement("img");
				userImage.className = "member-image";
				let imgAux = participator.photo;
	
				if (imgAux === null || imgAux === "") {
					imgAux = "photoDefault.jpeg";
				}
				userImage.src = imgAux;
				userImage.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(participator.email));
					window.location.href = "personal-page.html?man=n&" + dataUrl;
				});
	
				userDiv.appendChild(userImage);
	
				//<p class="member-name">Laura Quintas</p>
				const userName = document.createElement("p");
				userName.className = "member-name";
				let nameAux = "";
				if (participator.nickname === null || participator.nickname === "") {
					nameAux = participator.fullName;
				} else {
					nameAux = participator.fullName + " (" + participator.nickname + ")";
				}
				userName.innerText = nameAux;
				userName.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(participator.email));
					window.location.href = "personal-page.html?man=n&" + dataUrl;
				});
	
				userDiv.appendChild(userName);
	
				li.appendChild(userDiv);
	
				//<div class="manage-user-btn-container visibily-hidden">
				const buttonDiv = document.createElement("div");
				buttonDiv.classList = "manage-user-btn-container visibily-hidden";
	
				//<button class="button-member">TORNAR PARTICIPANTE</i></button>
				const buttonDispromote = document.createElement("button");
				buttonDispromote.className = "button-member";
				buttonDispromote.innerText = "TORNAR ADMINISTRADOR";
				buttonDispromote.addEventListener("click", turnIntoProjectAdmin);
	
				//<button class="button-delete"><i class="fa-solid fa-trash-can member-icon"></i></button>
				const icon = document.createElement("i");
				icon.className = "fa-solid fa-trash-can member-icon";
	
				const buttonDelete = document.createElement("button");
				buttonDelete.className = "button-delete";
				buttonDelete.append(icon);
				buttonDelete.addEventListener("click", deleteUser);
	
				buttonDiv.appendChild(buttonDispromote);
				buttonDiv.appendChild(buttonDelete);
	
				li.appendChild(buttonDiv);
	
				//LÓGICA NECESSÁRIA PARA PODER QUANDO O USER FAZ HOVER POR CIMA DA LI APARECEREM OS ICONES
				li.onmouseover = () => {
					li.children[1].classList.remove("visibily-hidden");
				};
	
				li.onmouseout = () => {
					li.children[1].classList.add("visibily-hidden");
				};
	
				document.querySelector(".manage-members-ul").appendChild(li);
			});
		}
	}
}

//MÉTODO PARA TORNAR UTILIZADOR PARTICIPANTE NO PROJETO EM ADMINISTRADOR DO PROJETO
async function turnIntoProjectAdmin(e) {

	const headersObj = new Headers();
	headersObj.append("email", e.target.parentElement.parentElement.id);
	//cria os dados que irão ser enviados pelo fetch
	const fetchOptions = {
		method: "POST",
		"Content-Type": "application/json",
		headers: headersObj,
	};

	//project controller linha 669
	const status = await doFetchNoResponse(
		urlDefault + "projects/promote/in/" + projectId + "/project",
		fetchOptions,
	);

	console.log(status);

	if (status === 200) {
		e.target.parentElement.parentElement.remove();
		if (document.querySelector(".manage-members-ul").children.length === 0) {
			document.querySelector(".manage-members-ul").classList.add("hide");
			document.querySelector(".alterations-feedback").classList.add("hide");
			document.querySelector(".no-invited-to-see-span").innerText = "Não existem membros participantes no projeto!"
			document.querySelector(".no-members-to-see-div").classList.remove("hide");
		} else {
			document
				.querySelector(".alterations-feedback")
				.classList.remove("visibily-hidden");
			setTimeout(() => {
				document
					.querySelector(".alterations-feedback")
					.classList.add("visibily-hidden");
			}, 3000);
		}
	} else if(status === 401){
		document.querySelector(".alterations-feedback").innerText =
			"Ocorreu um erro! Tenta novamente mais tarde!";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);
	} else if(status === 403){
		window.location.href = "generalError.html";
	} else if(status === 490){
		window.location.reload();
	} else if(status === 494){
		window.location.href = "seeProject.html?p=" + projectId;
	} else if(status === 493){
		window.location.href = "feedProjects.html";
	}
}

// *******************************
//MÉTODO PARA CARREGAR OS UTILIZADORES QUE FORAM CONVIDADOS PARA SEREM MEMBROS DO PROJETO
async function loadProjectInvitedUsers() {
	//traz do back apenas os participantes
	//project controller linha 1211
	const invitedUsers = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			projectId +
			"/who/are/" +
			MemberStatus.INVITED,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(invitedUsers === 401){
		document.querySelector(".members-div").classList.add("hide");
		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "Ocorreu um erro!";
		document.querySelector(".body").appendChild(pError);
	} else if(invitedUsers === 403){
		window.location.href = "generalError.html";
	} else if(invitedUsers instanceof Object){

		console.log(invitedUsers);

		if (invitedUsers.length === 0) {
			document.querySelector(".members-div").classList.add("hide");
			document.querySelector(".manage-members-ul").classList.add("hide");
			document.querySelector(".alterations-feedback").classList.add("hide");
			document.querySelector(".no-members-to-see-div").classList.remove("hide");
			
		} else {
			document.querySelector(".members-div").classList.remove("hide");
			document.querySelector(".no-members-to-see-div").classList.add("hide");
			document.querySelector(".manage-members-ul").classList.remove("hide");
			document.querySelector(".alterations-feedback").classList.remove("hide");

			invitedUsers.forEach((user) => {
				console.log(invitedUsers.length);

				//<li class="manage-user-li">
				const li = document.createElement("li");
				li.className = "manage-user-li";
				li.setAttribute("id", user.email);

				//<div class="member-info">
				const userDiv = document.createElement("div");
				userDiv.className = "member-info";

				//<img src="https://randomuser.me/api/portraits/women/32.jpg" class="member-image" id="member-image1">
				const userImage = document.createElement("img");
				userImage.className = "member-image";
				let imgAux = user.photo;

				if (imgAux === null || imgAux === "") {
					imgAux = "photoDefault.jpeg";
				}
				userImage.src = imgAux;
				userImage.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(user.email));
					window.location.href = "personal-page.html?man=n&" + dataUrl;
				});

				userDiv.appendChild(userImage);

				//<p class="member-name">Laura Quintas</p>
				const userName = document.createElement("p");
				userName.className = "member-name";
				let nameAux = "";
				if (user.nickname === null || user.nickname === "") {
					nameAux = user.fullName;
				} else {
					nameAux = user.fullName + " (" + user.nickname + ")";
				}
				userName.innerText = nameAux;
				userName.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(user.email));
					window.location.href = "personal-page.html?man=n&" + dataUrl;
				});

				userDiv.appendChild(userName);

				li.appendChild(userDiv);

				//<div class="manage-user-btn-container visibily-hidden">
				const buttonDiv = document.createElement("div");
				buttonDiv.classList = "manage-user-btn-container visibily-hidden";

				//<button class="button-delete"><i class="fa-solid fa-trash-can member-icon"></i></button>
				const icon = document.createElement("i");
				icon.className = "fa-solid fa-trash-can member-icon";

				const buttonDelete = document.createElement("button");
				buttonDelete.className = "button-delete";
				buttonDelete.append(icon);
				buttonDelete.addEventListener("click", deleteUser);

				//buttonDiv.appendChild(buttonDispromote);
				buttonDiv.appendChild(buttonDelete);

				li.appendChild(buttonDiv);

				//LÓGICA NECESSÁRIA PARA PODER QUANDO O USER FAZ HOVER POR CIMA DA LI APARECEREM OS ICONES
				li.onmouseover = () => {
					li.children[1].classList.remove("visibily-hidden");
				};

				li.onmouseout = () => {
					li.children[1].classList.add("visibily-hidden");
				};

				document.querySelector(".manage-members-ul").appendChild(li);
			});
		}
	}
}

async function loadProjectSolicitors() {
	//traz do back apenas os solicitadores
	//project controller linha 1211
	solicitors = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			projectId +
			"/who/are/" +
			MemberStatus.SOLICITOR,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if(solicitors === 403){
		window.location.href = "generalError.html";
	} if(solicitors === 401){
		document.querySelector(".members-div").classList.add("hide");
		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "Ocorreu um erro!";
		document.querySelector(".body").appendChild(pError);
	} else if(solicitors instanceof Object){
		//project controller linha 1179
			projectMembers = await doFetchWithResponse(
			urlDefault + "projects/members/" + projectId + "/project",
			{
				method: "GET",
				headers: { "Content-Type": "application/json" },
			},
		);

		if (solicitors.length === 0) {
			document.querySelector(".manage-members-ul").classList.add("hide");
			document.querySelector(".alterations-feedback").classList.add("hide");
			document.querySelector(".no-invited-to-see-span").innerText = "Não existem membros a solicitar participação!"
			document.querySelector(".no-members-to-see-div").classList.remove("hide");
			
		} else {
			document.querySelector(".no-members-to-see-div").classList.add("hide");
			document.querySelector(".manage-members-ul").classList.remove("hide");
			document.querySelector(".alterations-feedback").classList.remove("hide");

			solicitors.forEach((user) => {
				//<li class="manage-user-li">
				const li = document.createElement("li");
				li.className = "manage-user-li";
				li.setAttribute("id", user.email);

				//<div class="member-info">
				const userDiv = document.createElement("div");
				userDiv.className = "member-info";

				//<img src="https://randomuser.me/api/portraits/women/32.jpg" class="member-image" id="member-image1">
				const userImage = document.createElement("img");
				userImage.className = "member-image";
				let imgAux = user.photo;

				if (imgAux === null || imgAux === "") {
					imgAux = "photoDefault.jpeg";
				}
				userImage.src = imgAux;
				userImage.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(user.email));
					window.location.href = "personal-page.html?man=n&" + dataUrl;
				});

				userDiv.appendChild(userImage);

				//<p class="member-name">Laura Quintas</p>
				const userName = document.createElement("p");
				userName.className = "member-name";
				let nameAux = "";
				if (user.nickname === null || user.nickname === "") {
					nameAux = user.fullName;
				} else {
					nameAux = user.fullName + " (" + user.nickname + ")";
				}
				userName.innerText = nameAux;
				userName.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(user.email));
					window.location.href = "personal-page.html?man=n&" + dataUrl;
				});

				userDiv.appendChild(userName);

				li.appendChild(userDiv);

				//<div class="manage-user-btn-container visibily-hidden">
				const buttonDiv = document.createElement("div");
				buttonDiv.classList = "manage-user-btn-container visibily-hidden";

				//<button class="button-member">TORNAR PARTICIPANTE</i></button>
				const buttonDispromote = document.createElement("button");
				buttonDispromote.className = "button-member";
				buttonDispromote.innerText = "TORNAR MEMBRO";
				buttonDispromote.addEventListener("click", turnIntoProjectParticipator);

				//<button class="button-delete"><i class="fa-solid fa-trash-can member-icon"></i></button>
				const icon = document.createElement("i");
				icon.className = "fa-solid fa-trash-can member-icon";

				const buttonDelete = document.createElement("button");
				buttonDelete.className = "button-delete";
				buttonDelete.append(icon);
				buttonDelete.addEventListener("click", deleteUser);

				if (projectMembers.length < 4) {
					buttonDiv.appendChild(buttonDispromote);
				}
				buttonDiv.appendChild(buttonDelete);

				li.appendChild(buttonDiv);

				//LÓGICA NECESSÁRIA PARA PODER QUANDO O USER FAZ HOVER POR CIMA DA LI APARECEREM OS ICONES
				li.onmouseover = () => {
					li.children[1].classList.remove("visibily-hidden");
				};

				li.onmouseout = () => {
					li.children[1].classList.add("visibily-hidden");
				};

				document.querySelector(".manage-members-ul").appendChild(li);
			});
		}
	}

	
}

//método para tornar o solicitador num participante do projeto
async function turnIntoProjectParticipator(e) {

	const headersObj = new Headers();
	headersObj.append("email", e.target.parentElement.parentElement.id);
	//cria os dados que irão ser enviados pelo fetch
	const fetchOptions = {
		method: "POST",
		"Content-Type": "application/json",
		headers: headersObj,
	};

	//project controller linha 722
	const status = await doFetchNoResponse(
		urlDefault + "projects/promote/participant/" + projectId + "/project",
		fetchOptions,
	);

	console.log(status);

	if (status === 200) {
		const lis = document.querySelectorAll(".manage-user-li");
		lis.forEach((li) => {
			li.remove();
		});

		(async () => {
			function call() {
				return loadProjectSolicitors();
			}
			await call();
		})();

	} else {
		document.querySelector(".alterations-feedback").innerText =
			"Ocorreu um erro! Tenta novamente mais tarde!";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);
	}
}

//método para eliminar o user das listas de membro de projeto: ou seja, para o retirar de administrador,
//participante, convidado ou solicitador do projeto
async function deleteUser(e) {
	//se estivermos na página de administradores do projeto e só existir um administrador não deixa, mas se existir mais que um deixa
	if (
		tab === "adm" &&
		document.querySelectorAll(".manage-user-li").length < 2
	) {
		document.querySelector(".alterations-feedback").innerText =
			"O projeto precisa de ter pelo menos um administrador!";
		document
			.querySelector(".alterations-feedback")
			.classList.remove("visibily-hidden");
		setTimeout(() => {
			document
				.querySelector(".alterations-feedback")
				.classList.add("visibily-hidden");
			document.querySelector(".alterations-feedback").innerText =
				"Alterações guardadas!";
		}, 3000);

		//chamar método para eliminar o user, se der sucesso, apagar todas as li e conforme a tab onde estivermos,
		//chamar o método para fazer load das li
	} else {

		let email = "";

			if (e.target.classList[0] === "button-delete") {
				email = e.target.parentElement.parentElement.id;
			} else if (e.target.classList[2] === "member-icon") {
				email = e.target.parentElement.parentElement.parentElement.id;
			}

		if(tab === "inv"){

			//project controller linha 937
			const status = await doFetchNoResponse(
				urlDefault + "projects/" + email + "/refuse/invitation/" + projectId + "/project",
				{
					method: "POST",
					"Content-Type": "application/json",
				},
			);

			if(status === 200){
				const lis = document.querySelectorAll(".manage-user-li");
				lis.forEach((li) => {
					li.remove();
				});
				loadProjectInvitedUsers();
			} else {
				if(status === 403){
					window.location.href = "generalError.html";
				}
				document.querySelector(".alterations-feedback").innerText =
					"Ocorreu um erro! Tenta novamente mais tarde!";
				document
					.querySelector(".alterations-feedback")
					.classList.remove("visibily-hidden");
				setTimeout(() => {
					document
						.querySelector(".alterations-feedback")
						.classList.add("visibily-hidden");
					document.querySelector(".alterations-feedback").innerText =
						"Alterações guardadas!";
				}, 3000);
			}

		} else {
		
			const headersObj = new Headers();

			headersObj.append("email", email);
			//cria os dados que irão ser enviados pelo fetch
			const fetchOptions = {
				method: "POST",
				"Content-Type": "application/json",
				headers: headersObj,
			};

			//project controller linha 503
			const status = await doFetchNoResponse(
				urlDefault + "projects/remove/member/" + projectId,
				fetchOptions,
			);

			if (status === 200) {
				//se me estou a remover a mim próprio e não sou admin do projeto
				if (
					userWithSession.type === "STANDARD" &&
					userWithSession.email === email
				) {
					//como passou a ser participante do projeto, deixou de ter autorização para gerir o projeto
					//e os seus membros, como tal é redirecionado para fora desta página
					window.location.href = "seeProject.html?p=" + projectId;
				}
				const lis = document.querySelectorAll(".manage-user-li");
				lis.forEach((li) => {
					li.remove();
				});

				(async () => {
					function call() {
						if (tab === "adm") {
							return loadProjectsAdmins();
						} else if (tab === "prc") {
							return loadProjectParticipators();
						} else if (tab === "inv") {
							return loadProjectInvitedUsers();
						} else if (tab === "sol") {
							return loadProjectSolicitors();
						}
					}
					await call();
				})();

			} else {
				if(status === 403){
					window.location.href = "generalError.html";
				}
				document.querySelector(".alterations-feedback").innerText =
					"Ocorreu um erro! Tenta novamente mais tarde!";
				document
					.querySelector(".alterations-feedback")
					.classList.remove("visibily-hidden");
				setTimeout(() => {
					document
						.querySelector(".alterations-feedback")
						.classList.add("visibily-hidden");
					document.querySelector(".alterations-feedback").innerText =
						"Alterações guardadas!";
				}, 3000);
			}
		}
	}
}

document.getElementById("select-user-to-invite").addEventListener("click", () => {
	if(memberAux !== null && inputMember !== ""){
		loadMemberLi(memberAux);
	}
});

async function loadUserToAdd(email){
	//user controller linha 369
	const user = await doFetchWithResponse(urlDefault + "users/search/simple/by/email", {
		method: "GET",
		headers: { 
			"Content-Type": "application/json",
			email:email},
	});

	console.log(user);

	if(user){
		memberAux = user;
		let nameAux = "";
				if (user.nickname) {
					nameAux = user.fullName +" (" + user.nickname + ")";
				} else {
					nameAux = user.fullName;
				}
				inputMember.value = nameAux;
	}
}