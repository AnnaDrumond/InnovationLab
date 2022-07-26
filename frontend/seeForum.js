const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
const errorSpan = document.querySelector(".error-see-forum");
const forumDiv = document.querySelector(".forum");
const commentDetails = document.querySelector(".comment-details");
let id = "";
let votes = "";
let dataUrl = new URLSearchParams(window.location.search);
let userWithSession;
let forumToLoad;
//
const fetchOptions = {
	method: "GET",
	headers: { "Content-Type": "application/json" },
};

const commentBtn = document.getElementById("comment-forum");

commentBtn.addEventListener("click", () => {
	document
		.querySelector(".add-comment")
		.scrollIntoView({ behavior: "instant", block: "end" });
});

const BtnFavorite = document.getElementById("favorite-forum");
const BtnTakeFavorite = document.getElementById("favorited-forum");
const BtnVote = document.getElementById("vote-forum");
const BtnTakeVote = document.getElementById("voted-forum");

document.addEventListener("DOMContentLoaded", async () => {
	//user controller 425
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
	const paramNewForum = new URLSearchParams(window.location.search);
	id = paramNewForum.get("id");

	//primeira coisa que vou fazer é buscar o forum

	console.log(id);
	//forum controller linha 554
	forumToLoad = await doFetchWithResponse(
		urlDefault + "forum/with/" + id,
		fetchOptions,
	);

	if (forumToLoad === 496) {
		forumDiv.classList.add("hide");
		commentDetails.classList.add("hide");
		document.querySelector(".add-comment").classList.add("hide");
		errorSpan.innerText = "O conteúdo foi eliminado!";
		errorSpan.classList.remove("hide");
		setTimeout(() => {
			errorSpan.classList.add("hide");
			errorSpan.innerText = "";
			window.location.href = "feedForum.html";
		}, 3000);

	} else if (forumToLoad === 401) {
		forumDiv.classList.add("hide");
		commentDetails.classList.add("hide");
		document.querySelector(".add-comment").classList.add("hide");
		errorSpan.innerText = "Pedimos desculpa, mas ocorreu um erro a carregar o conteúdo!";
		errorSpan.classList.remove("hide");
		setTimeout(() => {
			errorSpan.classList.add("hide");
			errorSpan.innerText = "";
			window.location.href = "feedForum.html";
		}, 3000);
	} else if(forumToLoad === 403){
		window.location.href = "generalError.html";
	} else if(forumToLoad instanceof Object){
		console.log(forumToLoad);

	document.title = forumToLoad.title;
	let photoAux = forumToLoad.userOwner.photo;
	if (
		forumToLoad.userOwner.photo === null ||
		forumToLoad.userOwner.photo === ""
	) {
		photoAux = "photoDefault.jpeg";
	}

	document.getElementById("owner-image").src = photoAux;
	document.getElementById("owner-image").addEventListener("click", () => {
		console.log("bota ao perfil", forumToLoad.userOwner.email);

		dataUrl.delete("e");
		dataUrl.append("e", btoa(forumToLoad.userOwner.email));
		window.location.href = "personal-page.html?" + dataUrl;

	});

	document.getElementById("forum-owner-name").innerText =
		forumToLoad.userOwner.fullName;
	document.getElementById("forum-owner-name").addEventListener("click", () => {
		dataUrl.delete("e");
		dataUrl.append("e", btoa(forumToLoad.userOwner.email));
		window.location.href = "personal-page.html?" + dataUrl;
	});

	if (forumToLoad.type === ForumType.IDEA) {
		document.querySelector(".type-forum").innerText = "ideia:";
		document.querySelector(".interested-users-label").innerHTML =
			"Utilizadores com disponibilidade para trabalhar nesta ideia:";
	}

	if (forumToLoad.type === ForumType.NECESSITY) {
		document.querySelector(".interested-users-label").innerHTML =
			"Utilizadores com disponibilidade para trabalhar na análise desta necessidade:";
	}

	document.querySelector(".see-forum-title").innerText = forumToLoad.title;
	document.querySelector(".see-forum-description").innerHTML =
		forumToLoad.description;
	let formattedDate = supportFormattedDate(forumToLoad.creationDate);
	document.getElementById("last-update-see-forum").innerText = formattedDate;
	document.getElementById("forum-votes").innerText =
		forumToLoad.totalVotes + " ";

	//botões
	//botão editar ideia ou necessidade
	if (
		userWithSession.type === UserType.ADMINISTRATOR ||
		userWithSession.email === forumToLoad.userOwner.email
	) {
		document.getElementById("edit").classList.remove("hide");
		document.getElementById("edit").addEventListener("click", () => {
			let aux = "";
			if (forumToLoad.type === ForumType.IDEA) {
				aux = "id";
			} else if (forumToLoad.type === ForumType.NECESSITY) {
				aux = "nec";
			}
			window.location.href =
				"edit-forum.html?id=" + forumToLoad.id + "&tp=" + aux;
		});
	}

	dealWithWishesToWorkInForum();

	//skill controller linha 400
	const skillList = await doFetchWithResponse(
		urlDefault + "forum/skills/associated/" + id,
		fetchOptions,
	);
	if(skillList === 401){
		document.querySelector(".associated-skills").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as skills!</p>`
	} else if(skillList instanceof Object){
		loadSkills(skillList);
	}

	//interest controller linha 293
	const interestList = await doFetchWithResponse(
		urlDefault + "forum/interests/associated/" + id,
		fetchOptions,
	);
	console.log(interestList);

	if(interestList === 401){
		document.querySelector(".associated-interests").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar os interesses!</p>`
	} else if(interestList instanceof Object){
		loadInterests(interestList);
	}

	//forum controller linha 443
	const associationList = await doFetchWithResponse(
		urlDefault + "forum/" + id + "/get/Association",
		fetchOptions,
	);

	if(associationList === 401){
		document.querySelector(".associated-ideas").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as ideias!</p>`
		document.querySelector(".associated-necessities").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as necessidades!</p>`
	} else if(associationList instanceof Object){
		console.log(associationList);
		loadAssociation(associationList);
	}

	//se o forum não tiver comentários, esconder o expansível
	if (forumToLoad.totalComments === 0) {
		document.querySelector(".comment-details").classList.add("hide");
	} else {
		document.getElementById("open-comment-section").innerText =
			"Ver " + forumToLoad.totalComments + " comentários";
			//comment controller linha 100
		const comments = await doFetchWithResponse(
			urlDefault + "comments/by/forum/" + id,
			fetchOptions,
		);
		
		if(comments === 401){
			document.getElementById("open-comment-section").innerText = "Ocorreu um erro a carregar os comentários!";
			document.getElementById("open-comment-section").style.color = "#a21920";
		} else if(comments instanceof Object){
			console.log(comments);
			loadComments(comments);
		}
		
	}

	//BOTÕES DE VOTO E FAVORITO
	console.log("fav", forumToLoad.favorited);
	console.log("vote", forumToLoad.voted);

	votes = forumToLoad.totalVotes;

	if (forumToLoad.favorited === true) {
		//escondo o btn votar
		BtnFavorite.classList.add("hide");
		//exibo o btn tirar voto
		BtnTakeFavorite.classList.remove("hide");
	}

	if (forumToLoad.voted === true) {
		//escondo o btn votar
		BtnVote.classList.add("hide");
		//exibo o btn tirar voto
		BtnTakeVote.classList.remove("hide");
	}
	}
});

async function dealWithWishesToWorkInForum() {
	//forum controller linha 590
	const usersWithInterest = await doFetchWithResponse(
		urlDefault + "forum/users/available/" + id,
		fetchOptions,
	);

	if(usersWithInterest === 401){
		document.querySelector(".error-see-forum").innerText =
						"Ocorreu um erro!";
					document.querySelector(".error-see-forum").classList.remove("hide");

					setTimeout(() => {
						document.querySelector(".error-see-forum").classList.add("hide");
						document.querySelector(".error-see-forum").innerText = "";
					}, 3000);

	} else if(usersWithInterest instanceof Object){

	let wishToWork = false;
	usersWithInterest.forEach((user) => {
		if (user.email === userWithSession.email) {
			wishToWork = true;
		}
	});

	console.log(wishToWork, "ah pois é");
	console.log("lol manooooooooooo", usersWithInterest);

	if (!wishToWork && forumToLoad.userOwner.email !== userWithSession.email) {
		console.log(
			"primeira condição",
			!wishToWork,
			" e mais cenas ",
			forumToLoad.userOwner.email !== userWithSession.email,
		);

		document.getElementById("wanna-work").innerText = "MOSTRAR DISPONIBILIDADE";
		document.getElementById("wanna-work").classList.remove("hide");

		document
			.getElementById("wanna-work")
			.addEventListener("click", async function showWishToWorkInForum() {
				//forum controller linha 194
				const status = await doFetchNoResponse(
					urlDefault + "forum/wishesToWork/" + forumToLoad.id,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
					},
				);

				if (status === 200) {
					document.querySelector(".interrested-users").innerHTML = "";

					//foi preciso fazer o remove do event listener porque caso contrário estava a chamar o método abaixo n^2
					document
						.getElementById("wanna-work")
						.removeEventListener("click", showWishToWorkInForum);
					dealWithWishesToWorkInForum();
				} else {

					if(status === 403){
						window.location.href = "generalError.html";
					}
					document.querySelector(".error-see-forum").innerText =
						"Pedimos desculpa mas não foi possível adicionar a tua disponibilidade! Por favor tenta novamente mais tarde!";
					document.querySelector(".error-see-forum").classList.remove("hide");

					setTimeout(() => {
						document.querySelector(".error-see-forum").classList.add("hide");
						document.querySelector(".error-see-forum").innerText = "";
					}, 3000);
				}
			});
	} else if (wishToWork === true) {
		console.log("segunda condição!!");
		document.getElementById("wanna-work").classList.remove("hide");

		document.getElementById("wanna-work").innerText = "REMOVER DISPONIBILIDADE";
		document
			.getElementById("wanna-work")
			.addEventListener("click", async function removeWishToWork() {
				//forum controller linha 223
				const status = await doFetchNoResponse(
					urlDefault + "forum/removeWish/" + forumToLoad.id,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
					},
				);

				if (status === 200) {
					//foi preciso fazer o remove do event listener porque caso contrário estava a chamar o método abaixo n^2
					document
						.getElementById("wanna-work")
						.removeEventListener("click", removeWishToWork);
					document.querySelector(".interrested-users").innerHTML = "";
					dealWithWishesToWorkInForum();
				} else {
					if(status === 403){
						window.location.href = "generalError.html";
					}
					document.querySelector(".error-see-forum").innerText =
						"Pedimos desculpa mas não foi possível remover a tua disponibilidade! Por favor tenta novamente mais tarde!";
					document.querySelector(".error-see-forum").classList.remove("hide");

					setTimeout(() => {
						document.querySelector(".error-see-forum").classList.add("hide");
						document.querySelector(".error-see-forum").innerText = "";
					}, 3000);
				}
			});
	}

	console.log("ANTES DE CHAMAR O MÉTODO", usersWithInterest);
	loadUsersWithInterest(usersWithInterest);
	}
}

function loadUsersWithInterest(users) {
	//caso não existam users com interesse em trabalhar nesta ideia ou necessidade, esta secção é ocultada
	if (users.length === 0) {
		document.querySelector(".interrested-users").classList.add("hide");
		document.querySelector(".interested-users-label").classList.add("hide");
	} else {
		document.querySelector(".interrested-users").classList.remove("hide");
		document.querySelector(".interested-users-label").classList.remove("hide");
	}

	users.forEach((user) => {
		//<div class="user-interested">
		const div = document.createElement("div");
		div.className = "user-interested";

		//<img id="forum-interested-image" src="https://randomuser.me/api/portraits/women/34.jpg" />
		const img = document.createElement("img");
		img.className = "forum-interested-image";
		let photoAux = user.photo;
		if (user.photo === null || user.photo === "") {
			photoAux = "photoDefault.jpeg";
		}

		img.src = photoAux;
		img.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(user.email));
			window.location.href = "personal-page.html?" + dataUrl;

			//window.location.href = "personal-page.html?e=" + user.email;
		});

		//<span class="forum-interested-name" id="1@mail.pt"> Susana Castro	</span>
		const span = document.createElement("span");
		span.className = "forum-interested-name";
		span.innerText = " " + user.fullName;
		span.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(user.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		div.appendChild(img);
		div.appendChild(span);

		document.querySelector(".interrested-users").appendChild(div);
	});
}

function loadSkills(skills) {
	//caso a ideia ou necessidade não tenha skills associadas é removida a label e a div
	if (skills.length === 0) {
		document.querySelector(".associated-skills-label").classList.add("hide");
		document.querySelector(".associated-skills").classList.add("hide");
	}
	skills.forEach((skill) => {
		const span = document.createElement("span");
		span.className = "skill";
		span.innerText = skill.title;
		document.querySelector(".associated-skills").appendChild(span);
	});
}

function loadInterests(interests) {
	//caso não existam interesses associadas a etsa ideia ou necessidade, esta secção é ocultada
	if (interests.length === 0) {
		document.querySelector(".associated-interests-label").classList.add("hide");
		document.querySelector(".associated-interests").classList.add("hide");
	}

	interests.forEach((interest) => {
		const span = document.createElement("span");
		span.className = "interest";
		span.innerText = interest.title;
		document.querySelector(".associated-interests").appendChild(span);
	});
}

function loadAssociation(associations) {
	if (associations.length === 0) {
		document
			.querySelector(".associated-necessities-label")
			.classList.add("hide");
		document.querySelector(".associated-necessities").classList.add("hide");

		document.querySelector(".associated-ideas-label").classList.add("hide");
		document.querySelector(".associated-ideas").classList.add("hide");
	}

	let countIdeas = 0;
	let countNecessities = 0;

	associations.forEach((association) => {
		console.log(association.associatedForum.type);

		//<div class="associated-forum" id="1">
		const div = document.createElement("div");
		div.className = "associated-forum";

		//<p class="associated-forum-title">
		const assocTitle = document.createElement("p");
		assocTitle.className = "associated-forum-title";
		assocTitle.innerText = association.associatedForum.title;
		assocTitle.addEventListener("click", () => {
			window.location.href =
				"seeForum.html?id=" + association.associatedForum.id;
		});

		//<p class="associated-forum-description">
		const assocDescrip = document.createElement("p");
		assocDescrip.className = "associated-forum-description";
		assocDescrip.innerText = association.description;

		div.appendChild(assocTitle);
		div.appendChild(assocDescrip);

		if (association.associatedForum.type === ForumType.IDEA) {
			document.querySelector(".associated-ideas").appendChild(div);
			countIdeas++;
		} else if (association.associatedForum.type === ForumType.NECESSITY) {
			document.querySelector(".associated-necessities").appendChild(div);
			countNecessities++;
		}
	});

	if (countIdeas === 0) {
		document.querySelector(".associated-ideas-label").classList.add("hide");
		document.querySelector(".associated-ideas").classList.add("hide");
	}

	if (countNecessities === 0) {
		document
			.querySelector(".associated-necessities-label")
			.classList.add("hide");
		document.querySelector(".associated-necessities").classList.add("hide");
	}
}

async function loadComments(comments) {
	if (comments.length > 0) {
		document.querySelector(".comment-details").classList.remove("hide");
		let count = 0;

		for (let i = 0; i < comments.length; i++) {
			count++;
			console.log(count);
			count = count + comments[i].totalReplies;
			console.log(count);
		}
		document.getElementById("open-comment-section").innerText =
			"Ver " + count + " comentários";
	}
	comments.forEach((comment) => {
		//<div class="comment-forum">
		const divCommentForum = document.createElement("div");
		divCommentForum.className = "comment-forum";

		//<div class="comment">
		const divComment = document.createElement("div");
		divComment.className = "comment";
		divComment.setAttribute("id", comment.idOriginalComment);

		//<div class="user-commentor">
		const divUser = document.createElement("div");
		divUser.className = "user-commentor";

		//<img id="forum-commentor-image" 	src="https://randomuser.me/api/portraits/women/37.jpg" />
		const userImage = document.createElement("img");
		userImage.setAttribute("id", "forum-commentor-image");

		let ownerPic = comment.owner.photo;

		if (comment.owner.photo === null || comment.owner.photo === "") {
			ownerPic = "photoDefault.jpeg";
		}
		userImage.src = ownerPic;
		userImage.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(comment.owner.email));
			window.location.href = "personal-page.html?" + dataUrl;
			//window.location.href = "personal-page.html?e=" + comment.owner.email;
		});

		divUser.appendChild(userImage);

		//<span class="forum-commentor-name" id="2@mail.pt">
		const userName = document.createElement("span");
		userName.className = "forum-commentor-name";

		let ownerNameAux = "";

		if (comment.owner.nickname === null || comment.owner.nickname === "") {
			ownerNameAux = comment.owner.fullName;
		} else {
			ownerNameAux =
				comment.owner.fullName + " (" + comment.owner.nickname + ")";
		}
		userName.innerText = ownerNameAux;
		userName.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(comment.owner.email));
			window.location.href = "personal-page.html?" + dataUrl;
			//window.location.href = "personal-page.html?e=" + comment.owner.email;
		});

		divUser.appendChild(userName);

		//<div class="comment-options">
		const divOptions = document.createElement("div");
		divOptions.className = "comment-options";

		// <span data-tooltip="responder" class="reply-comment-btn"><i class="fa-solid fa-reply btns-comment"></i></span>
		const spanReplyComment = document.createElement("span");
		spanReplyComment.setAttribute("data-tooltip", "responder");
		spanReplyComment.className = "reply-comment-btn";

		const replyIcon = document.createElement("i");
		replyIcon.className = "fa-solid fa-reply btns-comment";

		spanReplyComment.appendChild(replyIcon);
		spanReplyComment.addEventListener("click", () => {
			console.log(
				spanReplyComment.parentElement.parentElement.children[1].innerText,
			);
			spanReplyComment.parentElement.parentElement.parentElement.parentElement.children[2].classList.remove(
				"hide",
			);
			spanReplyComment.parentElement.parentElement.parentElement.parentElement.children[2].scrollIntoView(
				{ behavior: "instant", block: "end" },
			);
			spanReplyComment.parentElement.parentElement.parentElement.parentElement.children[2].children[0].children[1].innerText =
				"Em resposta a " +
				spanReplyComment.parentElement.parentElement.children[1].innerText;
			console.log(
				spanReplyComment.parentElement.parentElement.parentElement.parentElement
					.children[2].children[0].children[1],
			);
		});

		divOptions.appendChild(spanReplyComment);

		// <span data-tooltip="editar" class="edit-comment-btn"><i class="fa-solid fa-pen-to-square btns-comment"></i></span>
		//SÓ PODE EDITAR O COMENTÁRIO O OWNER DO COMENTÁRIO
		const spanEditComment = document.createElement("span");

		const editIcon = document.createElement("i");
		editIcon.className = "fa-solid fa-pen-to-square btns-comment";

		//console.log(userWithSession.email, " HEHEHEHEHEHEHEH", editIcon)

		if (userWithSession.email === comment.owner.email) {
			console.log("entrei na condição");

			spanEditComment.setAttribute("data-tooltip", "editar");
			spanEditComment.className = "edit-comment-btn";

			//spanEditComment.appendChild(editIcon);
			spanEditComment.innerHTML = `<i class="fa-solid fa-pen-to-square btns-comment"></i>`;
			console.log(spanEditComment);

			spanEditComment.addEventListener("click", () => {
				//<textarea type="text" class="write-reply" placeholder="Comentar"></textarea>
				console.log(
					"haha",
					spanEditComment.parentElement.parentElement.parentElement.children[1],
				);

				const commentText =
					spanEditComment.parentElement.parentElement.parentElement.children[1]
						.innerText;
				spanEditComment.parentElement.parentElement.parentElement.children[1].classList.add(
					"hide",
				);
				const editCommentTextArea = document.createElement("textarea");
				editCommentTextArea.setAttribute("id", "editComment");
				editCommentTextArea.type = "text";
				editCommentTextArea.className = "write-reply";
				editCommentTextArea.value = commentText;

				//<button class="send-comment">COMENTAR</button>
				const buttonSave = document.createElement("button");
				buttonSave.className = "send-comment save-comment-alterations";
				buttonSave.innerText = "GUARDAR ALTERAÇÕES";
				buttonSave.addEventListener("click", async () => {
					console.log(editCommentTextArea.value);

					//comment controller linha 132
					const status = await doFetchNoResponse(
						urlDefault + "comments/edit/" + comment.idOriginalComment,
						{
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({
								contentDto: editCommentTextArea.value,
							}),
						},
					);

					if (status === 200) {
						spanEditComment.parentElement.parentElement.parentElement.children[1].innerText =
							editCommentTextArea.value;
						editCommentTextArea.remove();
						buttonSave.remove(),
							spanEditComment.parentElement.parentElement.parentElement.children[1].classList.remove(
								"hide",
							);
					} else {
						if(status === 403) {
							window.location.href = "generalError.html";
						}
						const editTextAux = editCommentTextArea.value;
						editCommentTextArea.value =
							"Pedimos desculpa, mas não foi possível guardar as alterações ao comentário! Tenta novamente mais tarde!";
						editCommentTextArea.style.color = "#a21920";

						setTimeout(() => {
							editCommentTextArea.value = editTextAux;
							editCommentTextArea.style.color = "black";
						}, 3000);
					}
				});

				spanEditComment.parentElement.parentElement.parentElement.insertBefore(
					editCommentTextArea,
					spanEditComment.parentElement.parentElement.parentElement.children[2],
				);
				spanEditComment.parentElement.parentElement.parentElement.insertBefore(
					buttonSave,
					spanEditComment.parentElement.parentElement.parentElement.children[3],
				);
				console.log(
					"hahaaaaa",
					spanEditComment.parentElement.parentElement.parentElement.children[2],
				);
			});

			divOptions.appendChild(spanEditComment);
		}

		// <span data-tooltip="eliminar" class="delete-comment-btn"><i class="fa-solid fa-trash-can btns-comment"></i></span>
		//O OWNER DO COMENTÁRIO E DO FÓRUM PODEM ELIMINAR O COMENTÁRIO
		const spanDeleteComment = document.createElement("span");

		const deleteIcon = document.createElement("i");
		deleteIcon.className = "fa-solid fa-trash-can btns-comment";
		if (
			userWithSession.email === comment.owner.email ||
			userWithSession.email === forumToLoad.userOwner.email ||
			userWithSession.type === UserType.ADMINISTRATOR
		) {
			spanDeleteComment.setAttribute("data-tooltip", "eliminar");
			spanDeleteComment.className = "delete-comment-btn";

			//spanDeleteComment.appendChild(deleteIcon);
			spanDeleteComment.innerHTML = `<i class="fa-solid fa-trash-can btns-comment"></i>`;
			spanDeleteComment.addEventListener("click", async () => {
				//comment controller linha 164
				const  status = await doFetchNoResponse(
					urlDefault + "comments/delete/" + comment.idOriginalComment,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
					},
				);
				
				if (status === 200) {
					//comment controller linha 100
					const comments = await doFetchWithResponse(
						urlDefault + "comments/by/forum/" + id,
						fetchOptions,
					);

					if(comments === 401){
						document.getElementById("open-comment-section").innerText = "Ocorreu um erro a carregar os comentários!";
						document.getElementById("open-comment-section").style.color = "#a21920";
					} else if(comments instanceof Object){
						console.log(comments);
						
						let count = 0;

						for (let i = 0; i < comments.length; i++) {
							count++;
							console.log(count);
							count = count + comments[i].totalReplies;
							console.log(count);
						}
						document.getElementById("open-comment-section").innerText =
							"Ver " + count + " comentários";

						console.log(comments);
						document.querySelector(".comment-section").innerHTML = "";
						loadComments(comments);
					}
				} else if(status === 403){
					window.location.href = "generalError.html";
				} else if(status === 401){
					divCommentForum.style.borderWidth = "3px";

					setTimeout(() => {
						divCommentForum.style.borderWidth = "1px";
					}, 3000);
				}
			});

			divOptions.appendChild(spanDeleteComment);
		}

		divUser.appendChild(divOptions);
		divComment.appendChild(divUser);

		//<p class="comment-content">
		const commentContent = document.createElement("p");
		commentContent.className = "comment-content";
		commentContent.innerText = comment.contentDto;

		divComment.appendChild(commentContent);

		// <span class="comment-date" id="comment-date">11/11/2011 11:11:11</span>
		const commentDate = document.createElement("span");
		commentDate.className = "comment-date";
		commentDate.innerText = comment.creationDate;

		divComment.appendChild(commentDate);

		//<span class="see-replies-to-comment">

		const spanSeeReplies = document.createElement("span");
		spanSeeReplies.setAttribute("num-replies", comment.totalReplies);
		spanSeeReplies.className = "see-replies-to-comment";
		spanSeeReplies.innerText = "Ver " + comment.totalReplies + " respostas";
		spanSeeReplies.addEventListener("click", () => {
			spanSeeReplies.parentElement.parentElement.children[1].classList.remove(
				"hide",
			);
			spanSeeReplies.classList.add("hide");
		});

		if (comment.totalReplies === 0) {
			spanSeeReplies.classList.add("hide");
		}

		divComment.appendChild(spanSeeReplies);

		divCommentForum.appendChild(divComment);

		//RESPOSTAS AO COMENTÁRIO
		//<ul class="replies-to-comment hide">
		const ul = document.createElement("ul");
		ul.className = "replies-to-comment hide";

		if (comment.totalReplies > 0) {
			comment.repliesDto.forEach((reply) => {
				//<li class="reply-to-comment">
				const li = document.createElement("li");
				li.className = "reply-to-comment";

				//<div class="reply" id="1">
				const replyDiv = document.createElement("div");
				replyDiv.setAttribute("id", reply.id);
				replyDiv.className = "reply";

				//<div class="user-commentor">
				const replyOwner = document.createElement("div");
				replyOwner.className = "user-commentor";

				//<img id="forum-commentor-image" src="https://randomuser.me/api/portraits/women/37.jpg" />
				const imageReply = document.createElement("img");
				imageReply.setAttribute("id", "forum-commentor-image");

				let replyImageAux = reply.userReply.photo;

				console.log(reply.userReply);
				if (reply.userReply.photo === null || reply.userReply.photo === "") {
					replyImageAux = "photoDefault.jpeg";
				}

				imageReply.src = replyImageAux;
				imageReply.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(reply.userReply.email));
					window.location.href = "personal-page.html?" + dataUrl;
				});

				replyOwner.appendChild(imageReply);

				//<span class="forum-commentor-name" id="2@mail.pt">
				const spanReply = document.createElement("span");
				spanReply.className = "forum-commentor-name";

				ownerNameAux = "";

				if (
					reply.userReply.nickname === null ||
					reply.userReply.nickname === ""
				) {
					ownerNameAux = reply.userReply.fullName;
				} else {
					ownerNameAux =
						reply.userReply.fullName + " (" + reply.userReply.nickname + ")";
				}

				spanReply.innerText = ownerNameAux;
				spanReply.addEventListener("click", () => {
					dataUrl.delete("e");
					dataUrl.append("e", btoa(reply.userReply.email));
					window.location.href = "personal-page.html?" + dataUrl;
				});

				replyOwner.appendChild(spanReply);

				//<div class="comment-options">
				const divReplyOptions = document.createElement("div");
				divReplyOptions.className = "comment-options";

				//<span data-tooltip="editar" class="edit-comment-btn"><i class="fa-solid fa-pen-to-square btns-comment"></i></span>
				const spanEditReply = document.createElement("span");
				if (userWithSession.email === reply.userReply.email) {
					console.log("entrei na condição");

					spanEditReply.setAttribute("data-tooltip", "editar");
					spanEditReply.className = "edit-comment-btn";

					//spanEditReply.appendChild(editIcon);
					spanEditReply.innerHTML = `<i class="fa-solid fa-pen-to-square btns-comment"></i>`;
					spanEditReply.addEventListener("click", () => {
						console.log(
							"haha",
							spanEditReply.parentElement.parentElement.parentElement
								.children[1],
						);

						const commentText =
							spanEditReply.parentElement.parentElement.parentElement
								.children[1].innerText;
						spanEditReply.parentElement.parentElement.parentElement.children[1].classList.add(
							"hide",
						);
						const editCommentTextArea = document.createElement("textarea");
						editCommentTextArea.setAttribute("id", "editComment");
						editCommentTextArea.type = "text";
						editCommentTextArea.className = "write-reply";
						editCommentTextArea.value = commentText;

						//<button class="send-comment">COMENTAR</button>
						const buttonSave = document.createElement("button");
						buttonSave.className = "send-comment save-comment-alterations";
						buttonSave.innerText = "GUARDAR ALTERAÇÕES";
						buttonSave.addEventListener("click", async () => {
							console.log(editCommentTextArea.value);

							//comment controller linha 132
							const status = await doFetchNoResponse(
								urlDefault + "comments/edit/" + reply.id,
								{
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										contentDto: editCommentTextArea.value,
									}),
								},
							);

							if (status === 200) {
								spanEditReply.parentElement.parentElement.parentElement.children[1].innerText =
									editCommentTextArea.value;
								editCommentTextArea.remove();
								buttonSave.remove(),
									spanEditReply.parentElement.parentElement.parentElement.children[1].classList.remove(
										"hide",
									);
							} else {
								if(status === 403){
									window.location.href = "generalError.html";
								}
								const editTextAux = editCommentTextArea.value;
								editCommentTextArea.value =
									"Pedimos desculpa, mas não foi possível guardar as alterações ao comentário! Tenta novamente mais tarde!";
								editCommentTextArea.style.color = "#a21920";

								setTimeout(() => {
									editCommentTextArea.value = editTextAux;
									editCommentTextArea.style.color = "black";
								}, 3000);
							}
						});

						spanEditReply.parentElement.parentElement.parentElement.insertBefore(
							editCommentTextArea,
							spanEditReply.parentElement.parentElement.parentElement
								.children[2],
						);
						spanEditReply.parentElement.parentElement.parentElement.insertBefore(
							buttonSave,
							spanEditReply.parentElement.parentElement.parentElement
								.children[3],
						);
						console.log(
							"hahaaaaa",
							spanEditReply.parentElement.parentElement.parentElement
								.children[2],
						);
					});

					divReplyOptions.appendChild(spanEditReply);
				}

				//<span data-tooltip="eliminar" class="delete-comment-btn"><i class="fa-solid fa-trash-can btns-comment"></i></span>~
				const spanDeleteReply = document.createElement("span");
				if (
					/*userWithSession.email === comment.owner.email ||*/
					userWithSession.email === forumToLoad.userOwner.email ||
					userWithSession.email === reply.userReply.email ||
					userWithSession.type === UserType.ADMINISTRATOR
				) {
					spanDeleteReply.setAttribute("data-tooltip", "eliminar");
					spanDeleteReply.className = "delete-comment-btn";

					//spanDeleteReply.appendChild(deleteIcon);
					spanDeleteReply.innerHTML = `<i class="fa-solid fa-trash-can btns-comment"></i>`;
					spanDeleteReply.addEventListener("click", async () => {
						const idComment =
							spanDeleteReply.parentElement.parentElement.parentElement.id;

						console.log(
							"i can tell",
							spanDeleteReply.parentElement.parentElement.parentElement
								.parentElement.parentElement.parentElement.children[0],
						);

						//comment controller linha 164
						const status = await doFetchNoResponse(
							urlDefault + "comments/delete/" + idComment,
							{
								method: "POST",
								headers: { "Content-Type": "application/json" },
							},
						);

						if (status === 200) {
							//comment controller linha 100
							const comments = await doFetchWithResponse(
								urlDefault + "comments/by/forum/" + id,
								fetchOptions,
							);
							if(comments === 401){
								document.getElementById("open-comment-section").innerText = "Ocorreu um erro a carregar os comentários!";
								document.getElementById("open-comment-section").style.color = "#a21920";
							} else if(comments instanceof Object){
								let count = 0;

								for (let i = 0; i < comments.length; i++) {
									count++;
									count = count + comments[i].totalReplies;
								}
								document.getElementById("open-comment-section").innerText =
									"Ver " + count + " comentários";

								spanDeleteReply.parentElement.parentElement.parentElement.remove();
							}
						} else if(status === 403){
							window.location.href = "generalError.html";
						} else if(status === 401){
							spanDeleteReply.parentElement.parentElement.parentElement.style.border = "3px #a21920 solid";
		
							setTimeout(() => {
								spanDeleteReply.parentElement.parentElement.parentElement.style.border = "none";
							}, 3000);
						}
					});

					divReplyOptions.appendChild(spanDeleteReply);
				}

				replyOwner.appendChild(divReplyOptions);
				replyDiv.appendChild(replyOwner);

				//<p class="comment-content">
				const replyContent = document.createElement("p");
				replyContent.className = "comment-content";
				replyContent.innerText = reply.contentDto;

				replyDiv.appendChild(replyContent);

				//<span class="comment-date" id="comment-date">11/11/2011 11:11:11</span>
				const spanReplyDate = document.createElement("span");
				spanReplyDate.className = "comment-date";
				spanReplyDate.innerText = reply.creationDate;

				replyDiv.appendChild(spanReplyDate);

				li.appendChild(replyDiv);
				ul.appendChild(li);
			});
		}

		divCommentForum.appendChild(ul);

		//local para responder ao comentário
		//<div class="add-reply hide">
		const divAddReply = document.createElement("div");
		divAddReply.className = "add-reply hide";

		//<div class="case-reply">
		const divCaseReply = document.createElement("div");
		divCaseReply.className = "case-reply";

		//<span class="span-reply"><i class="fa-solid fa-share"></i></span>
		const spanReplyToIcon = document.createElement("span");

		const iconReply = document.createElement("i");
		iconReply.className = "fa-solid fa-share";

		spanReplyToIcon.innerHTML = `<i class="fa-solid fa-share"></i>`;
		//spanReplyToIcon.appendChild(iconReply);

		divCaseReply.appendChild(spanReplyToIcon);

		//<span class="reply-to">Em resposta a Madalena Coimbra</span>
		const spanUserReplying = document.createElement("span");
		spanUserReplying.className = "reply-to";
		spanUserReplying.innerText = "";

		divCaseReply.appendChild(spanUserReplying);
		divAddReply.appendChild(divCaseReply);

		//<textarea type="text" class="write-reply" rows></textarea>
		const textArea = document.createElement("textarea");
		textArea.type = "text";
		textArea.className = "write-reply";
		textArea.placeholder = "Responder ao comentário";

		divAddReply.appendChild(textArea);

		//<button class="send-comment">RESPONDER</button>
		const buttonReply = document.createElement("button");
		buttonReply.className = "send-comment";
		buttonReply.innerText = "RESPONDER";
		buttonReply.addEventListener("click", async () => {
			console.log(buttonReply.parentElement.children[1]);

			const newReply = buttonReply.parentElement.children[1].value;
			const newReplyTrim = newReply.trim();

			console.log(newReplyTrim);
			console.log(newReply);

			if (newReply === "" || newReplyTrim.length === 0) {
				buttonReply.parentElement.children[1].value =
					"Deixaste a caixa de texto vazia! Escreve um comentário!";
				buttonReply.parentElement.children[1].style.color = "#a21920";

				setTimeout(() => {
					buttonReply.parentElement.children[1].value = "";
					buttonReply.parentElement.children[1].style.color = "black";
				}, 4000);
			} else {
				const idOgComment =
					buttonReply.parentElement.parentElement.children[0].id;

				const fetchInfo = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contentDto: newReply,
					}),
				};

				//comment controller linha 70
				const status = await doFetchNoResponse(
					urlDefault + "comments/reply/" + idOgComment,
					fetchInfo,
				);

				if (status === 200) {
					//comnment controller linha 100
					const comments = await doFetchWithResponse(
						urlDefault + "comments/by/forum/" + id,
						fetchOptions,
					);

					if(comments === 401){
						
						document.getElementById("open-comment-section").innerText = "Ocorreu um erro a carregar os comentários!";
						document.getElementById("open-comment-section").style.color = "#a21920";
						

					} else if(comments === 403){
						window.location.href = "generalError.html";
					} else if(comments instanceof Object){
						let count = 0;

					for (let i = 0; i < comments.length; i++) {
						count++;
						//console.log(count);
						count = count + comments[i].totalReplies;
						//console.log(count);
					}

					document.getElementById("open-comment-section").innerText =
						"Ver " + count + " comentários";
					document.querySelector(".comment-section").innerHTML = "";
					console.log(comments);
					await loadComments(comments);

					const commentsLoaded = document.querySelectorAll(".comment-forum");

					console.log(commentsLoaded, "como estamos??");

					commentsLoaded.forEach((commentloaded) => {
						//console.log(commentloaded, "estou aqui");

						if (commentloaded.children[0].id == idOgComment) {
							console.log("entreei");
							commentloaded.children[1].classList.remove("hide");
							commentloaded.children[0].children[3].classList.add("hide");
							const lis = commentloaded.children[1].children;

							console.log(lis[lis.length - 1]);
							lis[lis.length - 1].children[0].scrollIntoView({
								behavior: "instant",
								block: "end",
							});
						}
					});
					}
					

					//CASO NÃO CONSIGA ADICIONAR A RESPOSTA AO COMENTÁRIO
				} else {

					if(status === 403){
						window.location.href = "generalError.html";
					}
					const textAreaValueAux = buttonReply.parentElement.children[1].value;

					buttonReply.parentElement.children[1].value =
						"Pedimos desculpa mas não foi possível adicionar o teu comentário! Por favor tenta novamente mais tarde!";
					buttonReply.parentElement.children[1].style.color = "#a21920";

					setTimeout(() => {
						buttonReply.parentElement.children[1].value = textAreaValueAux;
						buttonReply.parentElement.children[1].style.color = "black";
					}, 3000);
				}
			}
		});

		divAddReply.appendChild(buttonReply);
		divCommentForum.appendChild(divAddReply);

		//COLOCAR O COMENTÁRIO E TUDO O QUE O CONSTITUI NA SECÇÃO DE COMENTÁRIOS
		document.querySelector(".comment-section").appendChild(divCommentForum);
	});
}

document
	.getElementById("create-new-comment-btn")
	.addEventListener("click", async () => {
		console.log(document.getElementById("create-comment").value);
		const commentContent = document.getElementById("create-comment");
		const commentContentTrim = commentContent.value.trim();

		if (commentContent.value === "" || commentContentTrim.length === 0) {
			commentContent.value =
				"Deixaste a caixa de texto vazia! Escreve um comentário!";
			commentContent.style.color = "#a21920";

			setTimeout(() => {
				commentContent.value = "";
				commentContent.style.color = "black";
			}, 4000);
		} else {
			//comment controller linha 39
			const status = await doFetchNoResponse(urlDefault + "comments/new", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contentDto: commentContent.value,
					forumId: id,
				}),
			});

			console.log(status);

			if (status === 200) {
				document.getElementById("create-comment").value = "";

				//comment controller linha 100
				const comments = await doFetchWithResponse(
					urlDefault + "comments/by/forum/" + id,
					fetchOptions,
				);

				if(comments === 401){
					document.getElementById("open-comment-section").innerText = "Ocorreu um erro a carregar os comentários!";
					document.getElementById("open-comment-section").style.color = "#a21920";
				} else if(comments instanceof Object){
				let count = 0;

				for (let i = 0; i < comments.length; i++) {
					count++;
					console.log(count);
					count = count + comments[i].totalReplies;
					console.log(count);
				}

				document.getElementById("open-comment-section").innerText =
					"Ver " + count + " comentários";
				document.querySelector(".comment-section").innerHTML = "";
				console.log(comments);
				await loadComments(comments);

				//se a secção com os comentários não estiver aberta, abrir quando é adicionado um novo comentário e fazer scroll até ao novo comentário
				if (!document.querySelector(".details".open)) {
					document.querySelector(".details").open = true;

					const allComments = document.querySelectorAll(".comment-forum");
					allComments[allComments.length - 1].children[0].scrollIntoView({
						behavior: "instant",
						block: "end",
					});
				}
				}

			}else if(status === 403){
				window.location.href = "generalError.html";

			} else if(status === 401){
				const textAreaValueAux = document.getElementById("create-comment").value;

				document.getElementById("create-comment").value =
					"Pedimos desculpa mas não foi possível adicionar o teu comentário! Por favor tenta novamente mais tarde!";
				document.getElementById("create-comment").style.color = "#a21920";

				setTimeout(() => {
					document.getElementById("create-comment").value = textAreaValueAux;
					document.getElementById("create-comment").style.color = "black";
				}, 3000);
			}
		}
	});

//BOTÕES DE FAVORITAR E VOTAR - EVENT LISTENERS
//botão FAVORITAR
BtnFavorite.addEventListener("click", async () => {
	//
	document.getElementById("heartBtn").classList.add("pulse");

	// Depois de 5 segundos tira animacao
	// setTimeout(function () {
	// 	iconFavorite.classList.remove("pulse");
	// }, 300);
//forum controller linha 79
	//fazer fetch
	const responseStatus = await doFetchNoResponse(
		urlDefault + "forum/likes/" + id,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus == 200) {
		setTimeout(function () {
			//esconde BtnFavorite
			BtnFavorite.classList.add("hide");
			//exibe BtnTakeFavorite
			BtnTakeFavorite.classList.remove("hide");
		}, 310);
		//
	} else {
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		}
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText = "Pedimos desculpa, mas ocorreu um erro a favoritar!";
			document.querySelector(".forum").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		
	}
});

///////////////////////////////////////
//botão DESFAVORITAR

BtnTakeFavorite.addEventListener("click", async () => {
	//
	document.getElementById("heartdBtn").classList.add("pulse");

	// Depois de 5 segundos tira animacao
	// setTimeout(function () {
	// 	iconTakeFavorite.classList.remove("pulse");
	// }, 300);

	//fazer fetch
	//forum controller 108
	const responseStatus = await doFetchNoResponse(
		urlDefault + "forum/removeLikes/" + id,
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
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} 
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText =
				"Pedimos desculpa, mas ocorreu um erro a retirar o favorito!";
			document.querySelector(".forum").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
	}
});

///////////////////////////////////////
//botão VOTAR

BtnVote.addEventListener("click", async () => {
	//
	document.getElementById("likeBtn").classList.add("pulse");

	// // Depois de 5 segundos tira animacao
	// setTimeout(function () {
	document.getElementById("likeBtn").classList.remove("pulse");
	// }, 300);

	//fazer fetch
	//forum controller linha 136
	const responseStatus = await doFetchNoResponse(
		urlDefault + "forum/voted/" + id,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus === 200) {
		// segurar uns segundos para a animação surtir efeito
		// setTimeout(function () {
		//esconde BtnVote
		BtnVote.classList.add("hide");
		//exibe BtnTakeVote
		BtnTakeVote.classList.remove("hide");
		// }, 200);
		//
		votes = votes + 1;
		document.getElementById("forum-votes").innerHTML = votes;
	} else {
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} 
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText = "Pedimos desculpa, mas ocorreu um erro a votar!";
			document.querySelector(".forum").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		
	}
});

///////////////////////////////////////
//botão RETIRAR VOTO

BtnTakeVote.addEventListener("click", async () => {
	//
	document.getElementById("likedBtn").classList.add("pulse");

	// Depois de 5 segundos tira animacao
	// setTimeout(function () {
	document.getElementById("likedBtn").classList.remove("pulse");
	// }, 300);

	//fazer fetch
	//forum controller linha 165
	const responseStatus = await doFetchNoResponse(
		urlDefault + "forum/RemoveVote/" + id,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (responseStatus == 200) {
		// segurar uns segundos para a animação surtir efeito
		// setTimeout(function () {
		//esconde BtnTakeVote
		BtnTakeVote.classList.add("hide");
		//exibe BtnVote
		BtnVote.classList.remove("hide");
		// }, 200);

		//
		votes = votes - 1;
		document.getElementById("forum-votes").innerHTML = votes;
	} else {
		if (responseStatus === 403) {
			window.location.href = "generalError.html";
		} 
			const span = document.createElement("span");
			span.className = "action-feedback";
			//alterations-feedback
			span.innerText =
				"Pedimos desculpa, mas ocorreu um erro a retirar o voto!";
			document.querySelector(".forum").appendChild(span);

			setTimeout(() => {
				span.remove();
			}, 3000);
		
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

