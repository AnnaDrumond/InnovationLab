const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let dataUrl = new URLSearchParams();
const parameters = new URLSearchParams(window.location.search);

document.addEventListener("DOMContentLoaded", async () => {
	//user controller 425
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
				window.location.href = "feedForum.html"; //FALTA ver como ficará
			}
		}

		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
		//se não foi enviado por query string um email, então quer dizer que o utilizador está a tentar aceder ao seu próprio perfil
		if (parameters.get("e") == null) {
			const headersObj = new Headers();
			headersObj.append("email", userWithSession.email);

			//user controller linha 333
			const user = await doFetchWithResponse(
				urlDefault + "users/search/by/email",
				{
					method: "GET",
					"Content-Type": "application/json",
					headers: headersObj,
				},
			);


			if(user === 401){
				document.querySelector(".user-profile-page").classList.add("hide");
				document.querySelector(".user-envolved").classList.add("hide");
				

				const h4 = document.createElement("h4");
				h4.className = "information-about-privacy";
				h4.innerText = "Ocorreu um erro a carregar a página pessoal!";
				document.querySelector(".body").appendChild(h4);

			} else if(user === 403){
				window.location.href = "generalError.html";

			} else if (user instanceof Object){

				document.getElementById("edit-profile-btn").classList.remove("hide");
				document
					.getElementById("see-favorites-list-btn")
					.classList.remove("hide");
				document
					.getElementById("see-favorites-list-btn")
					.addEventListener("click", () => {
						window.location.href = "favorites.html";
					});
				document
					.getElementById("edit-profile-btn")
					.addEventListener("click", () => {
						editProfile(user.email);
					});
				loadProfile(user, true);
			}
		} else {
			console.log("não ta null");

			let emailPersonalPage = atob(parameters.get("e"));
			console.log(emailPersonalPage);
			const manage = parameters.get("man");
			if(manage !== null){
				if(manage === "y"){
					const button = document.getElementById("go-back-to-edit");
					button.classList.remove("hide");
					button.addEventListener("click", () => {
						console.log(dataUrl.toString());
						console.log(parameters.toString());
						dataUrl.delete("e");
						dataUrl.append("e",btoa(emailPersonalPage));
						let projectId = parameters.get("id");
						dataUrl.append("id", projectId);
						//m=inv&id=11
						window.location.href = "manage-members.html?m=inv&" + dataUrl;
					});
				}
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

			if(user === 401){
				document.querySelector(".user-profile-page").classList.add("hide");
				document.querySelector(".user-envolved").classList.add("hide");
				

				const h4 = document.createElement("h4");
				h4.className = "information-about-privacy";
				h4.innerText = "Ocorreu um erro a carregar a página pessoal!";
				document.querySelector(".body").appendChild(h4);

			} else if(user === 403){
				window.location.href = "generalError.html";

			} else if (user instanceof Object){

				//CASO O UTILIZADOR ESTEJA A ACEDER À PROPRIA PÁGINA
				if (userWithSession.email === emailPersonalPage) {
					document.getElementById("edit-profile-btn").classList.remove("hide");
					document
						.getElementById("see-favorites-list-btn")
						.classList.remove("hide");
					document
						.getElementById("see-favorites-list-btn")
						.addEventListener("click", () => {
							window.location.href = "favorites.html";
						});
					document
						.getElementById("edit-profile-btn")
						.addEventListener("click", () => {
							editProfile(user.email);
						});
					loadProfile(user, true);

					//CASO SEJA OUTRO UTILIZADOR A ACEDER À SUA PÁGINA É PRECISO
					//VERIFICAR SE TEM AUTORIZAÇÃO PARA VISUALIZAR OS SEUS CONTEÚDOS
				} else {
					let verification = false;

					if (userWithSession.type === UserType.ADMINISTRATOR) {
						document.getElementById("edit-profile-btn").classList.remove("hide");

						document
							.getElementById("edit-profile-btn")
							.addEventListener("click", () => {
								editProfile(emailPersonalPage);
							});
						verification = true;
					} else if (user.visibility === Visibility.PUBLIC) {
						verification = true;
					} else if (user.visibility === Visibility.ESPECIFIC) {
						//users controller linha 398
						const listWhoCanView = await doFetchWithResponse(
							urlDefault + "users/users/who/can/view/" + user.email,
							{
								method: "GET",
								"Content-Type": "application/json",
							},
						);

						if(listWhoCanView === 401){

							verification=false;
						} else if(listWhoCanView === 403){
							window.location.href = "generalError.html";

						} else if(listWhoCanView instanceof Object){
							listWhoCanView.forEach((userAuth) => {
								if (userAuth.email === userWithSession.email) {
									console.log("entrei na condição");
									verification = true;
								}
							});
						}
						
					}

					loadProfile(user, verification);
				}
			}
		}
	}
});

async function loadProfile(user, verification) {
	console.log(user);

	//FOTO DE PERFIL
	let auxPic = user.photo;
	if (user.photo === null || user.photo === "") {
		auxPic = "photoDefault.jpeg";
	}

	document.getElementById("profile-image-picture").src = auxPic;

	//NOME
	document.querySelector(".user-full-name").innerText =
		user.firstName + " " + user.lastName;

	//ALCUNHA
	if (user.nickname === null || user.nickname === "") {
		document.querySelector(".user-nickname").classList.add("visibily-hidden");
	} else {
		document.querySelector(".user-nickname").innerText =
			"(" + user.nickname + ")";
	}

	//LOCAL DE TRABALHO
	document.querySelector(".user-workplace").innerText = user.workplace;

	//SE O PERFIL DESTE UTILIZADOR PODE SER VISTO AO PORMENOR OU NÃO
	if (verification === true) {
		//BIOGRAFIA
		if (user.biography === "" || user.biography === null) {
			document.querySelector(".user-biography-label").classList.add("hide");
			document.querySelector(".user-biography").classList.add("hide");
		} else {
			document.querySelector(".user-biography").innerText = user.biography;
		}

		//DISPONIBILIDADE
		if (user.availability === null || user.availability === "") {
			document.querySelector(".user-availability-label").classList.add("hide");
			document.getElementById("user-availability").classList.add("hide");
		} else {
			document.getElementById("user-availability").innerText =
				user.availability;
		}

		//skill controller linha 336
		//CARREGAR AS SKILLS QUE O USER ASSOCIOU A SI
		//skill controller linha 336
		const skillsList = await doFetchWithResponse(
			urlDefault + "skills/associated/user/" + user.email,
			{
				method: "GET",
				"Content-Type": "application/json",
			},
		);

		if(skillsList === 401){
			document.getElementById("user-name-span-skill").innerText =
				user.firstName + ":";
			document.querySelector(".user-skill-container").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as skills!</p>`;
		} else if(skillsList instanceof Object){
			console.log(skillsList);

			if (skillsList.length > 0) {
				document.getElementById("user-name-span-skill").innerText =
					user.firstName + ":";
				skillsList.forEach((skill) => {
					//<span class="user-skill" id="1">Teste</span>
					const span = document.createElement("span");
					span.innerText = skill.title;
					span.className = "user-skill";
					span.setAttribute("id", skill.idSkill);

					document.querySelector(".user-skill-container").appendChild(span);
				});
			} else {
				document.querySelector(".user-skill-list").classList.add("hide");
				document.querySelector(".user-skill-container").classList.add("hide");
			}
		}

		//interest controller linha 263
		//CARREGAR OS INTERESSES QUE O USER ASSOCIOU A SI
		//interest controller linha 263
		const interestsList = await doFetchWithResponse(
			urlDefault + "interests/associated/user/" + user.email,
			{
				method: "GET",
				"Content-Type": "application/json",
			},
		);

		if(interestsList === 401){
			document.getElementById("user-name-span-interest").innerText =
				user.firstName + ":";
				document.querySelector(".user-interest-container").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar os interesses!</p>`;
		
		} else if(interestsList instanceof Object){
			console.log(interestsList);

			if (interestsList.length > 0) {
				document.getElementById("user-name-span-interest").innerText =
					user.firstName + ":";
	
				interestsList.forEach((interest) => {
					//<span class="user-interest" id="1">Teste</span>
					const span = document.createElement("span");
					span.innerText = interest.title;
					span.className = "user-interest";
					span.setAttribute("id", interest.idInterest);
	
					document.querySelector(".user-interest-container").appendChild(span);
				});
			} else {
				document.querySelector(".user-interest-list").classList.add("hide");
				document.querySelector(".user-interest-container").classList.add("hide");
			}
		}

		document.getElementById("user-name-envolved").innerText = user.firstName;
		document.querySelectorAll(".registered-btn").forEach((button) => {
			button.addEventListener("click", (e) => {
				console.log(e.target);
				dataUrl.delete("tp");
				dataUrl.delete("e");
				dataUrl.append("e", btoa(user.email));
				if (e.target.id === "registered-ideas") {
					console.log("ideia");
					dataUrl.append("tp", "id");
					window.location.href = "user-registered.html?" + dataUrl;
				} else if (e.target.id === "registered-necessities") {
					console.log("necessity");
					dataUrl.append("tp", "ncy");
					window.location.href = "user-registered.html?" + dataUrl;
				} else if (e.target.id === "registered-projects") {
					console.log("projects");
					dataUrl.append("tp", "pjt");
					window.location.href = "user-registered.html?" + dataUrl;
				}
			});
		});

		//SE O USER AO QUAL ESTOU A TENTAR VER O PERFIL NÃO DEU AUTORIZAÇÃO PARA TAL,
		//ESCONDE TODA ESTA INFORMAÇÃO E MOSTRA MENSAGEM EXPLICATIVA
	} else {
		document.querySelector(".user-biography-label").classList.add("hide");
		document.querySelector(".user-biography").classList.add("hide");
		document.querySelector(".user-availability-label").classList.add("hide");
		document.getElementById("user-availability").classList.add("hide");
		document.querySelector(".user-skill-list").classList.add("hide");
		document.querySelector(".user-skill-container").classList.add("hide");
		document.querySelector(".user-interest-list").classList.add("hide");
		document.querySelector(".user-interest-container").classList.add("hide");
		document.querySelector(".user-envolved").classList.add("hide");

		const h4 = document.createElement("h4");
		h4.className = "information-about-privacy";
		h4.innerHTML = `<i class="fa-solid fa-lock"></i> perfil privado`;
		document.querySelector(".user-caracteristics").appendChild(h4);
	}
}

function editProfile(email) {
	dataUrl.delete("e");
	dataUrl.append("e", btoa(email));
	window.location.href = "edit-profile.html?" + dataUrl;
}
