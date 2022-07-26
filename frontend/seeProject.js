const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const paramSeeProject = new URLSearchParams(window.location.search);
const idProject = paramSeeProject.get("p");
let dataUrl = new URLSearchParams();
let project = "";
let forums = [];
let skills = [];
let members = [];
let userWithSession = "";
let votes = "";
let notYetMember = false;

//
const BtnFavorite = document.getElementById("favorite-project");
const BtnTakeFavorite = document.getElementById("favorited-project");
const BtnVote = document.getElementById("vote-project");
const BtnTakeVote = document.getElementById("voted-project");
const BtnWannaWork = document.getElementById("wanna-work");
const editBtn = document.getElementById("edit");
const iconVote = document.getElementById("likeBtn");
const iconTakeVote = document.getElementById("likedBtn");
const iconFavorite = document.getElementById("heartBtn");
const iconTakeFavorite = document.getElementById("heartdBtn");
const pErrorText = document.querySelector(".already-have-project");
const spanWarning = document.querySelector(".project-status");
const sectionSpanIdeas = document.getElementById("section-span-ideas");
const sectionSpanNecessities = document.getElementById(
	"section-span-necessities",
);

//Aqui somente visitantes NÂO tem acesso
document.addEventListener("DOMContentLoaded", async () => {
	//verificar se loggedUser pode editar este forum
	//confirmar se o user logado não é um visitante
	//serve para obter o user que está atualmente com sessão iniciada
	userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});

	if (userWithSession == 401 || userWithSession == 403) {
		window.location.href = "generalError.html";
	} else {
		if (userWithSession.type) {
			if (userWithSession.type === UserType.VISITOR) {
				window.location.href = "feedForum.html";
			}
		}
	}

	getNotificationsOnMenu();
	// só carrega o número de notificações e de mensagens se não for visitante
	setInterval(getNotificationsOnMenu, 5000);
	//buscar projeto
	getAndLoadProject();
});

//buscar projeto
async function getAndLoadProject() {
	// console.log("getProject...");
	//ProjectController linha 1148
	project = await doFetchWithResponse(
		urlDefault + "projects/by/id/" + idProject,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (project instanceof Object) {
		// console.log("voltei do fetch...getProject:");
		// console.log(project);
		document.title = project.title;
		//carregar projeto
		document.getElementById("project-owner-name").innerHTML =
			project.ownerProj.fullName;
			document.getElementById("project-owner-name").addEventListener("click", () => {
				dataUrl.delete("e");
				dataUrl.append("e", btoa(project.ownerProj.email));
				window.location.href = "personal-page.html?" + dataUrl;
			});
		//
		if (project.ownerProj.photo) {
			document
				.getElementById("owner-image")
				.setAttribute("src", project.ownerProj.photo);
		} else {
			document
				.getElementById("owner-image")
				.setAttribute("src", "photoDefault.jpeg");
		}
		document.getElementById("owner-image").addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(project.ownerProj.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});
		// mostrar que projeto está terminado
		if (project.active === false) {
			spanWarning.classList.remove("visibily-hidden");
		}

		//mostrar dados do projeto
		document.querySelector(".see-project-title").innerHTML = project.title;
		document.querySelector(".see-project-description").innerHTML =
			project.description;
		
		if(project.necessaryResources){
			document.querySelector(".text-resources").innerHTML =
			project.necessaryResources;
		} else {
			document.querySelector(".text-resources").classList.add("hide");
			document.querySelector(".title-resources").classList.add("hide");
		}
		
		if(project.executionPlan){
			document.querySelector(".text-execution").innerHTML = project.executionPlan;
		} else {
			document.querySelector(".text-execution").classList.add("hide");
			document.querySelector(".title-execution").classList.add("hide");
		}
		
		//
		votes = project.votes;
		document.getElementById("project-votes").innerHTML = project.votes;
		//
		let formattedDate = supportFormattedDate(project.creationDate);
		document.getElementById("creation-see-project").innerHTML = formattedDate;

		//carregar botões
		loadButtons(project);
		//buscar membros do projeto
		getAndLoadMembersByProject();
		//buscar forums do projeto
		getForumsByProject();
		//buscar skills do projeto
		getAndLoadSkillsByProject();

		//softDelete
	} else if (project === 493) {
		console.log("493");
		removeTags();
		//exibir mensagem
		pErrorText.classList.remove("hide");
		pErrorText.innerHTML = "Este projeto foi eliminado!";
		// apos redirecionar ao feed de projetos
		setTimeout(function () {
			window.location.href = "feedProjects.html";
		}, 3000);
		// Erro ao buscar o projeto
	} else if (project === 401) {
		removeTags();
		pErrorText.classList.remove("hide");
		pErrorText.innerHTML =
			"Pedimos desculpa, mas não foi possível carregar este projeto!";
		// apos redirecionar ao feed de projetos
		setTimeout(function () {
			window.location.href = "feedProjects.html";
		}, 3000);
		//403 - sem autorização
	} else {
		window.location.href = "generalError.html";
	}
}

function removeTags() {
	document.querySelector(".top-info").classList.add("hide");
	document.querySelector(".creation-see-project").classList.add("hide");
	document.querySelector(".members-label").classList.add("hide");
	document.querySelector(".member-list").classList.add("hide");
	document.getElementById("p-associated-necessities").classList.add("hide");
	document.getElementById("p-associated-ideas").classList.add("hide");
	document.getElementById("p-associated-skills").classList.add("hide");
	document.getElementById("section-span-necessities").classList.add("hide");
	document.getElementById("section-span-ideas").classList.add("hide");
	document.getElementById("section-span-skills").classList.add("hide");
	document.querySelector(".title-resources").classList.add("hide");
	document.querySelector(".title-execution").classList.add("hide");
	document.querySelector(".see-project-votes").classList.add("hide");
	document.getElementById("project-votes").classList.add("hide");
	//Div dos botões votar/adicionar favorito:
	document.querySelector(".project-buttons").classList.add("hide");
}

async function loadButtons(project) {
	//verificar se já é um favorito
	if (project.favorited) {
		// console.log("já é um favorito");
		//escondo o btn votar
		BtnFavorite.classList.add("hide");
		//exibo o btn tirar voto
		BtnTakeFavorite.classList.remove("hide");
	}

	//verificar se já foi votado pelo loggedUser
	if (project.voted) {
		// console.log("já foi votado");
		//escondo o btn votar
		BtnVote.classList.add("hide");
		//exibo o btn tirar voto
		BtnTakeVote.classList.remove("hide");
	}
	///////////////////////////////////////////////////////////
	// Verificar se equipa do projeto ainda com vagas
	if (project.active === true) {
		console.log("projeto ativo");
		// VERIFICAR se o user já enviou pedido para participar do projeto - SOLICITOR
		//ProjectController linha 1244
		const applicants = await doFetchWithResponse(
			urlDefault +
				"projects/members/" +
				idProject +
				"/who/are/" +
				MemberStatus.SOLICITOR,
			{
				method: "GET",
				headers: { "Content-Type": "application/json" },
			},
		);
		console.log("applicants");
		console.log(applicants);
		//
		for (let i = 0; i < applicants.length; i++) {
			if (applicants[i].email === userWithSession.email) {
				// console.log("user já pediu para participar deste projeto");
				BtnWannaWork.innerText = "SOLICITEI PARTICIPAÇÃO";
				console.log("sou solicitante");
				notYetMember = true;
			}
		}

		//VERIFICAR SE O USER FOI CONVIDADO OU NÃO PARA O PROJETO
		//ProjectController linha 1244
		const invitedUsers = await doFetchWithResponse(
			urlDefault +
				"projects/members/" +
				idProject +
				"/who/are/" +
				MemberStatus.INVITED,
			{
				method: "GET",
				headers: { "Content-Type": "application/json" },
			},
		);
		console.log("invitedUsers");
		console.log(invitedUsers);
		//userWithSession
		for (let i = 0; i < invitedUsers.length; i++) {
			if (invitedUsers[i].email === userWithSession.email) {
				// console.log("user já pediu para participar deste projeto");
				BtnWannaWork.innerText = "JÁ FUI CONVIDADO";
				console.log("sou convidado");
				notYetMember = true;
			}
		}

		if (project.totalMembers > 3) {
			BtnWannaWork.innerText = "EQUIPA COMPLETA";
			//
		} else {
			///////////////////////////////////////
			//botão QUERO SER MEMBRO - pedir participação
			if (notYetMember === false) {
				BtnWannaWork.addEventListener("click", async () => {
					//ProjectControllerlinha 842
					let responseFetch = await doFetchNoResponse(
						urlDefault +
							"projects/solicit/participation/" +
							idProject +
							"/project",
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
						},
					);
					//
					if (responseFetch === 200) {
						BtnWannaWork.innerText = "SOLICITEI PARTICIPAÇÃO";
						//sem sessao, sem autorização:
					} else if (responseFetch === 403) {
						window.location.href = "generalError.html";
						//projeto softDelete:
					} else if (responseFetch === 493) {
						//
						removeTags();
						//exibir mensagem
						spanWarning.classList.remove("visibily-hidden");
						spanWarning.innerHTML = "Este projeto não existe mais!";
						// apos redirecionar ao feed de projetos
						setTimeout(function () {
							window.location.href = "feedProjects.html";
						}, 3000);
						//já envolvido em projeto ativo:
					} else if (responseFetch === 492) {
						spanWarning.classList.remove("visibily-hidden");
						spanWarning.innerHTML =
							"Não podes pedir participação.Já te encontras envolvido em um projeto ativo.";
						// apos redirecionar ao feed de projetos
						setTimeout(function () {
							spanWarning.classList.add("visibily-hidden");
						}, 3000);

						//projeto terminado:
					} else if (responseFetch === 494) {
						spanWarning.classList.remove("visibily-hidden");
						spanWarning.innerHTML =
							"Não podes pedir participação. Este projeto já está terminado.";
						// apos redirecionar ao feed de projetos
						setTimeout(function () {
							spanWarning.classList.add("visibily-hidden");
						}, 3000);

						//deu erro ao solicitar a participação:
					} else if (responseFetch === 401) {
						spanWarning.classList.remove("visibily-hidden");
						spanWarning.innerHTML =
							"Pedimos desculpas, não foi possível pedir participação neste projeto.Tente mais tarde.";
						// apos redirecionar ao feed de projetos
						setTimeout(function () {
							spanWarning.classList.add("visibily-hidden");
						}, 3000);
					}
				}); ///
			}

			//ProjectController linha 1302
			const envolved = await doFetchWithResponse(
				urlDefault + "projects/envolved/in/active",
				{
					method: "POST",
					headers: { "Content-Type": "text/plain" },
				},
			);

			//Se user já envolvido em projeto ativo, não permite ao user pedir participação
			if (envolved === true) {
				BtnWannaWork.classList.add("hide");
			}
		}

		//projeto terminado, não permite ao user pedir participação
	} else {
		BtnWannaWork.classList.add("hide");
	}
	///////////////////////////////////////////////////////////
	// Verificar se user tem permissão para editar o projeto
	///////////////////////////////////////

	//Somente exibir se o user for um admin do projeto ou admin do sistema
	if (project.active === true) {
		//ProjectController linha 1327
		const isAdmin = await doFetchWithResponse(
			urlDefault + "projects/has/auth/" + idProject,
			{
				method: "POST",
				headers: { "Content-Type": "text/plain" },
			},
		);

		if (isAdmin) {
			//mostrar botão de editar
			editBtn.classList.remove("hide");
			editBtn.addEventListener("click", () => {
				//FALTa - ver se falta algo para identificar que o user quer editar e não criar
				dataUrl.delete("id");
				dataUrl.append("id", idProject);
				window.location.href = "new-project.html?" + dataUrl.toString();
			});

			//mostrar botão de gerir membros
			document.getElementById("manage-users").classList.remove("hide");
			document.getElementById("manage-users").addEventListener("click", () => {
				window.location.href = "manage-members.html?m=inv&id=" + idProject;
			});

			//sem sessao - não autorizado
		} else if (isAdmin == 403) {
			window.location.href = "generalError.html";
			//
			//erro ao verificar autorização para exibir botão editar
		} else if (isAdmin == 401) {
			spanWarning.classList.remove("visibily-hidden");
			spanWarning.innerHTML =
				"Pedimos desculpas, não será possível editar este projeto.Tente mais tarde.";
			// apos redirecionar ao feed de projetos
			setTimeout(function () {
				spanWarning.classList.add("visibily-hidden");
			}, 3000);
		}
	}
} /////////////////////////////

//buscar forums do projeto
async function getForumsByProject() {
	//
	console.log("getForumsByProject...");
	//ProjectController linha 349
	forums = await doFetchWithResponse(
		urlDefault + "projects/list/forums/" + idProject,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (forums instanceof Object) {
		// console.log("voltei do fetch...getForumsByProject:");
		// console.log(forums);
		loadForums(forums);

		//sem sessao  - não autorizado
	} else if (forums === 403) {
		window.location.href = "generalError.html";
		// erro ao buscar dados
	} else if (forums === 401) {
		sectionSpanIdeas.innerHTML = `<p class = "error-text">Lamentamos não foi possível carregar as ideias associadas a este projeto!</p>`;
		sectionSpanNecessities.innerHTML = `<p class = "error-text">Lamentamos não foi possível carregar as necessidades associadas a este projeto!</p>`;
	}
}

//carregar forums
function loadForums(forums) {
	//

	for (let i = 0; i < forums.length; i++) {
		let spanCreated = document.createElement("span");
		spanCreated.className = "span-title";
		spanCreated.innerText = forums[i].title;
		spanCreated.setAttribute("id", forums[i].id);

		spanCreated.addEventListener("click", () => {
			// em seeForum está id = paramNewForum.get("id");
			dataUrl.delete("id");
			dataUrl.append("id", forums[i].id);
			window.location.href = "seeForum.html?" + dataUrl.toString();
		});

		//colocar na area dos spans de ideias
		//<span class="span-title" id="1">
		if (forums[i].type == ForumType.IDEA) {
			document.getElementById("p-associated-ideas").classList.remove("hide");
			sectionSpanIdeas.classList.remove("hide");
			sectionSpanIdeas.appendChild(spanCreated);
			//colocar na area dos spans de necessidades
		} else {
			document.getElementById("p-associated-necessities").classList.remove("hide");
			sectionSpanNecessities.classList.remove("hide");
			sectionSpanNecessities.appendChild(spanCreated);
		}
	}
}

//buscar skills do projeto
async function getAndLoadSkillsByProject() {
	//
	console.log("getSkillsByProject...");
	//fetch project controller linha 1471
	skills = await doFetchWithResponse(
		urlDefault + "projects/skills/associated/" + idProject,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	const sectionSpanSkills = document.getElementById("section-span-skills");

	if (skills instanceof Object) {
		// console.log("voltei do fetch...getSkillsByProject:");
		// console.log(skills);

		if(skills.length > 0) {
			for (let i = 0; i < skills.length; i++) {
				let spanCreated = document.createElement("span");
				spanCreated.className = "span-title-skill";
				spanCreated.innerText = skills[i].title;
				spanCreated.setAttribute("id", skills[i].idSkill);
				sectionSpanSkills.appendChild(spanCreated);
			}
		} else {
			document.getElementById("p-associated-skills").classList.add("hide");
			sectionSpanSkills.classList.add("hide");
		}

		//sem sessao  - não autorizado
	} else if (skills === 403) {
		window.location.href = "generalError.html";
		// erro ao buscar dados
	} else if (skills === 401) {
		sectionSpanSkills.innerHTML = `<p class = "error-text">Lamentamos não foi possível carregar as skills associadas a este projeto!</p>`;
	}
}

//buscar membros
async function getAndLoadMembersByProject() {
	//
	// console.log("getMembersByProject...");
	//buscar membros do projeto
	//project controller linha 1179
	members = await doFetchWithResponse(
		urlDefault + "projects/members/" + idProject + "/project",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	//buscar admins do projeto
	//ProjectController linha 1211
	const projectAdmins = await doFetchWithResponse(
		urlDefault +
			"projects/members/" +
			idProject +
			"/who/are/" +
			MemberStatus.ADMINISTRATOR,
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);
	const sectionMembers = document.getElementById("section-members-list");
	console.log("voltei do fetch...getAndLoadMembersByProject:");
	console.log(members);
	// console.log("admins do projeto...");
	// console.log(projectAdmins);

	if (members instanceof Object) {
		//
		for (let i = 0; i < members.length; i++) {
			if (members[i].email === userWithSession.email) {
				BtnWannaWork.classList.add("hide");
			}
			//	<div class="member">
			let divMember = document.createElement("div");
			divMember.className = "member";
			divMember.addEventListener("click", () => {
				dataUrl.delete("e");
				dataUrl.append("e", btoa(members[i].email));
				window.location.href = "personal-page.html?" + dataUrl;
			});

			//<img id="member-image"
			let photo = document.createElement("img");
			photo.setAttribute("id", "member-image");

			if (members[i].photo) {
				photo.src = members[i].photo;
			} else {
				photo.src = "photoDefault.jpeg";
			}

			//<span class="member-name" id="2@mail.pt"> Manuela Lima </span>
			let spanCreated = document.createElement("span");
			spanCreated.className = "member-name";

			let isProjectAdmin = false;

			if (projectAdmins instanceof Object) {
				for (let j = 0; j < projectAdmins.length; j++) {
					if (projectAdmins[j].email == members[i].email) {
						isProjectAdmin = true;
					}
				}
			}

			console.log("isProjectAdmin: " + isProjectAdmin);

			if (isProjectAdmin == true) {
				spanCreated.innerText = members[i].fullName + " (Admin)";
			} else {
				spanCreated.innerText = members[i].fullName;
			}

			spanCreated.setAttribute("id", members[i].email);

			divMember.appendChild(photo);
			divMember.appendChild(spanCreated);
			sectionMembers.appendChild(divMember);
		}

		//sem sessao  - não autorizado
	} else if (members === 403) {
		window.location.href = "generalError.html";
		// erro ao buscar dados
	} else if (members === 401) {
		sectionMembers.innerHTML = `<p class = "error-text">Lamentamos não foi possível carregar os membros associados a este projeto!</p>`;
	}
}

/*const iconVote = document.getElementById("likeBtn");
const iconTakeVote = document.getElementById("likedBtn");
const iconFavorite = document.getElementById("heartBtn");
const iconTakeFavorite = document.getElementById("heartdBtn");*/
///////////////////////////////////////
//botão FAVORITAR
BtnFavorite.addEventListener("click", async () => {
	//fazer fetch
	//project controller linha 89
	const responseStatus = await doFetchNoResponse(
		urlDefault + "projects/likes/" + idProject,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus == 200) {
		//
		setTimeout(function () {
			//esconde BtnFavorite
			BtnFavorite.classList.add("hide");
			//exibe BtnTakeFavorite
			BtnTakeFavorite.classList.remove("hide");
		}, 310);
		//
	} else {
		// sem sssao - não autorizado
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} else {
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText =
				"Pedimos desculpa, mas ocorreu um erro ao adicionar este conteúdo na tua lista de favoritos.";
			document.querySelector(".project").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		}
	}
});

///////////////////////////////////////
//botão DESFAVORITAR

BtnTakeFavorite.addEventListener("click", async () => {
	//fazer fetch
	//project controller linha 120
	const responseStatus = await doFetchNoResponse(
		urlDefault + "projects/removeLikes/" + idProject,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus == 200) {
		//
		setTimeout(function () {
			//esconde BtnTakeFavorite
			BtnTakeFavorite.classList.add("hide");
			//exibe BtnFavorite
			BtnFavorite.classList.remove("hide");
		}, 310);

		//
	} else {
		// sem sssao - não autorizado
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} else {
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText =
				"Pedimos desculpa, mas ocorreu um erro a retirar o favorito da tua lista!";
			document.querySelector(".project").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		}
	}
});

///////////////////////////////////////
//botão VOTAR

BtnVote.addEventListener("click", async () => {
	//fazer fetch
	//project controller linha 148
	const responseStatus = await doFetchNoResponse(
		urlDefault + "projects/voted/" + idProject,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus == 200) {
		//esconde BtnVote
		BtnVote.classList.add("hide");
		//exibe BtnTakeVote
		BtnTakeVote.classList.remove("hide");
		votes = votes + 1;
		document.getElementById("project-votes").innerHTML = votes;
	} else {
		// sem sssao - não autorizado
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} else {
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText = "Pedimos desculpa, mas ocorreu um erro a votar!";
			document.querySelector(".project").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		}
	}
});

///////////////////////////////////////
//botão RETIRAR VOTO

BtnTakeVote.addEventListener("click", async () => {
	//fazer fetch
	//project controller linha 180
	const responseStatus = await doFetchNoResponse(
		urlDefault + "projects/RemoveVote/" + idProject,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus == 200) {
		//esconde BtnTakeVote
		BtnTakeVote.classList.add("hide");
		//exibe BtnVote
		BtnVote.classList.remove("hide");
		//
		votes = votes - 1;
		document.getElementById("project-votes").innerHTML = votes;
	} else {
		// sem sssao - não autorizado
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} else {
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText =
				"Pedimos desculpa, mas ocorreu um erro a retirar o voto!";
			document.querySelector(".project").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		}
	}
});

//converter data do formato americano para o formato europeu (português)
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
