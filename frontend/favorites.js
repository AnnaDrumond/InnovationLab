const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let dataUrl = new URLSearchParams(window.location.search);
const parameters = new URLSearchParams(window.location.search);
let typeFavAux = "ALL";
let statusProject = "";
let favorites = [];
let favProjects = [];
let favForum = [];
let resultSortVotes = true;
let resultSortLastUpDate = true;
let resultSortCreationDate = true;

document.querySelector(".go-back-btn").addEventListener("click", () => {
	window.location.href = "personal-page.html";
});

document
	.querySelector(".category-btns")
	.addEventListener("click", selectCategory);
document
	.getElementById("clear-filter-favorites")
	.addEventListener("click", clearFilter);
document
	.getElementById("apply-filter-favorites")
	.addEventListener("click", applyFilter);

document.addEventListener("DOMContentLoaded", async () => {
	//user controller linha 425
	let userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		headers: { "Content-Type": "application/json" },
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

	//obter a lista de projetos que o user colocou favoritou
	favProjects = await getFavoritesList(urlDefault + "projects/favorites");
	favProjects.forEach((project) => {
		favorites.push(project);
	});


		loadFavorites(favProjects);

		//obter a lista de ideias e necessidades que o user colocou favoritou
		favForum = await getFavoritesList(urlDefault + "forum/favorites");
		favForum.forEach((forum) => {
			favorites.push(forum);
		});
		if (favForum.length) {
			loadFavorites(favForum);
		}
	
});

async function getFavoritesList(url) {
	//chama project controller na linha 377 e forum controller na linha 389
	const favorites = await doFetchWithResponse(url, {
		method: "GET",
		"Content-Type": "application/json",
	});
	if (favorites === 403) {
		window.location.href = "generalError.html";

	} else if (favorites === 401) {
		document.getElementById("favorites-filter-title").classList.add("hide");
		document.querySelector(".favorites-container").classList.add("hide");

		const div = document.createElement("div");
		div.className = "warning-container";
		const error = document.createElement("p");
		error.className = "warning-text";
		error.innerText = "Ocorreu um erro! Tenta novamente mais tarde!";
		div.appendChild(error);
		document.querySelector(".body").appendChild(div);
		return 0;
	} else {
		return favorites;
	}
}

function loadFavorites(list) {
	list.forEach((item) => {
		let type;
		statusProject = "";

		switch (item.type) {
			case ForumType.IDEA:
				type = "IDEIA";
				break;
			case ForumType.NECESSITY:
				type = "NECESSIDADE";
				break;
			default:
				if (item.active == false) {
					statusProject = "(TERMINADO)";
				} 
				type = "PROJETO " + statusProject;
				break;
		}

		console.log(type);
		//<div class="forum-simple">
		const bigDiv = document.createElement("div");
		bigDiv.className = "forum-simple";

		//<h6 class="forum-type">NECESSIDADE</h6>
		const h6Type = document.createElement("h6");
		h6Type.className = "forum-type";
		h6Type.innerText = type;

		bigDiv.appendChild(h6Type);

		//<span class="forum-votes"> 25 <i class="fa-solid fa-thumbs-up"></i></span>
		const votes = document.createElement("span");
		votes.className = "forum-votes";
		votes.innerHTML = `${
			item.type === ForumType.IDEA || item.type === ForumType.NECESSITY
				? item.totalVotes
				: item.votes
		} <i class="fa-solid fa-thumbs-up"></i>`;

		bigDiv.appendChild(votes);

		//<h6 class="forum-title">bla bla bla bla bla bla</h6>
		const h6Title = document.createElement("h6");
		h6Title.className = "forum-title";
		h6Title.innerText = item.title;
		h6Title.addEventListener("click", () => {
			if (type === ForumType.IDEA || type === ForumType.NECESSITY) {
				window.location.href = "seeForum.html?id=" + item.id;
			} else {
				window.location.href = "seeProject.html?p=" + item.id;
			}
		});

		bigDiv.appendChild(h6Title);

		//<hr />
		const hr = document.createElement("hr");

		bigDiv.appendChild(hr);

		//<div class="user-info">
		const userDiv = document.createElement("div");
		userDiv.className = "user-info";

		//USER OWNER
		let owner;
		if (item.type === ForumType.IDEA || item.type === ForumType.NECESSITY) {
			owner = item.userOwner;
		} else {
			owner = item.ownerProj;
		}

		//<img id="forum-owner-image" src="https://randomuser.me/api/portraits/women/32.jpg" />
		const img = document.createElement("img");
		img.setAttribute("id", "forum-owner-image");
		let imgAux = owner.photo;
		if (owner.photo === null || owner.photo === "") {
			imgAux = "photoDefault.jpeg";
		}
		img.src = imgAux;
		img.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(owner.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		userDiv.appendChild(img);

		//<p class="forum-owner-name">Madalena Coimbra</p>
		const ownerName = document.createElement("p");
		ownerName.className = "forum-owner-name";
		ownerName.innerText = owner.fullName;
		ownerName.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(owner.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});

		userDiv.appendChild(ownerName);

		//<p class="forum-owner-nickname">(madu)</p>
		const nickname = document.createElement("p");
		nickname.className = "forum-owner-nickname";
		let nickAux = "(" + owner.nickname + ")";
		if (owner.nickname === null || owner.nickname === "") {
			nickAux = "";
		}
		nickname.innerText = nickAux;
		nickname.addEventListener("click", () => {
			dataUrl.delete("e");
			dataUrl.append("e", btoa(owner.email));
			window.location.href = "personal-page.html?" + dataUrl;
		});
		userDiv.appendChild(nickname);

		bigDiv.appendChild(userDiv);

		//<div class="forum-dates">
		const divDates = document.createElement("div");
		divDates.className = "forum-dates";

		//<p class="forum-creation-date-label"> Data de criação:
		const labelCreation = document.createElement("p");
		labelCreation.className = "forum-creation-date-label";
		labelCreation.innerText = "Data de criação: ";

		let formattedDate = supportFormattedDate(item.creationDate);
		//<span id="forum-creation-date">
		const creationDate = document.createElement("span");
		creationDate.setAttribute("id", "forum-creation-date");
		creationDate.innerText = formattedDate;

		labelCreation.appendChild(creationDate);

		divDates.appendChild(labelCreation);

		//<p class="forum-last-updated-label">Última atualização:
		const labelLast = document.createElement("p");
		labelLast.className = "forum-last-updated-label";
		labelLast.innerText = "Última atualização: ";

		//<span id="forum-last-updated">
		formattedDate = item.type === ForumType.IDEA || item.type === ForumType.NECESSITY
		? supportFormattedDate(item.lastUpDate)
		: supportFormattedDate(item.lastUpdate);
		const lastUpDate = document.createElement("span");
		lastUpDate.setAttribute("id", "forum-last-updated");
		lastUpDate.innerText =formattedDate;
			

		labelLast.appendChild(lastUpDate);

		divDates.appendChild(labelLast);

		bigDiv.appendChild(divDates);

		document.querySelector(".favorites-container").appendChild(bigDiv);
	});
}

async function clearFilter() {
	const selected = document.querySelectorAll(".clicked");
	selected.forEach((item) => {
		item.classList.remove("clicked");
	});
	loadFavorites(favorites);
}

function selectCategory(e) {

	if (e.target.id === "category-ideia") {
		console.log("ideia");
		typeFavAux = ForumType.IDEA;
		document.getElementById("category-ideia").classList.add("clicked");
		document.getElementById("category-necessity").classList.remove("clicked");
		document.getElementById("category-project").classList.remove("clicked");
	} else if (e.target.id === "category-necessity") {
		console.log("nec");
		typeFavAux = ForumType.NECESSITY;
		document.getElementById("category-ideia").classList.remove("clicked");
		document.getElementById("category-necessity").classList.add("clicked");
		document.getElementById("category-project").classList.remove("clicked");
	} else if (e.target.id === "category-project") {
		console.log("proj");
		typeFavAux = "PROJECT";
		document.getElementById("category-ideia").classList.remove("clicked");
		document.getElementById("category-necessity").classList.remove("clicked");
		document.getElementById("category-project").classList.add("clicked");
	}
}

async function applyFilter() {
	const selected = document.querySelectorAll(".clicked");
	document.querySelector(".favorites-container").innerHTML = "";
	let finalList = [];
	selected.forEach(async (item) => {
		if (item.id === "category-ideia") {
			favForum = await getFavoritesList(urlDefault + "forum/favorites");
			console.log(favForum);
			for (let i = 0; i < favForum.length; i++) {
				if (favForum[i].type === ForumType.IDEA) {
					finalList.push(favForum[i]);
				}
			}
			console.log(finalList);
		} else if (item.id === "category-necessity") {
			favForum = await getFavoritesList(urlDefault + "forum/favorites");
			for (let i = 0; i < favForum.length; i++) {
				if (favForum[i].type === ForumType.NECESSITY) {
					finalList.push(favForum[i]);
				}
			}
			console.log(finalList);
		} else if (item.id === "category-project") {
			favProjects = await getFavoritesList(
				urlDefault + "projects/favorites",
			);
			console.log(favProjects);
			finalList = favProjects;
		}
		loadFavorites(finalList);
	});

	document.querySelector(".details").removeAttribute("open");
	
}

function updateData(list){
	while(document.querySelector(".favorites-container").children.length > 0) {
		document.querySelector(".favorites-container").children[0].remove();
	}

	loadFavorites(list);
}

//ORDENAR POR DATA DE CRIAÇÃO
document.getElementById("order-by-creation").addEventListener("click", () => {
	
	let auxList = [];
	if(typeFavAux === "ALL"){
		auxList = favorites;
	} else if(typeFavAux === "PROJECT"){
		auxList = favProjects;
	} else if(typeFavAux === ForumType.IDEA){
		for (let i = 0; i < favForum.length; i++) {
			if (favForum[i].type === ForumType.IDEA) {
				auxList.push(favForum[i]);
			}
		}
	} else if(typeFavAux === ForumType.NECESSITY){
		for (let i = 0; i < favForum.length; i++) {
			if (favForum[i].type === ForumType.NECESSITY) {
				auxList.push(favForum[i]);
			}
		}
	}

	resultSortCreationDate = !resultSortCreationDate;
	if(resultSortCreationDate){
		document.getElementById("order-by-creation").children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`
	} else {
		document.getElementById("order-by-creation").children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`
	}

	auxList.sort(function (a, b) {
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
	updateData(auxList);
});

//ORDENAR POR DATA DE ÚLTIMA ATUALIZAÇÃO
document.getElementById("order-by-last-updated").addEventListener("click", () => {
	let auxList = [];
	if(typeFavAux === "ALL"){
		auxList = favorites;
	} else if(typeFavAux === "PROJECT"){
		auxList = favProjects;
	} else if(typeFavAux === ForumType.IDEA){
		for (let i = 0; i < favForum.length; i++) {
			if (favForum[i].type === ForumType.IDEA) {
				auxList.push(favForum[i]);
			}
		}
	} else if(typeFavAux === ForumType.NECESSITY){
		for (let i = 0; i < favForum.length; i++) {
			if (favForum[i].type === ForumType.NECESSITY) {
				auxList.push(favForum[i]);
			}
		}
	}

	resultSortLastUpDate = !resultSortLastUpDate;
	if (resultSortLastUpDate) {
		document.getElementById(
			"order-by-last-updated",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`;
	} else {
		document.getElementById(
			"order-by-last-updated",
		).children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`;
	}

	auxList.sort(function (a, b) {
		//
		let keyA = a.lastUpDate?new Date(a.lastUpDate):new Date(a.lastUpdate); //seria o nosso creationDate
		let keyB = b.lastUpDate?new Date(b.lastUpDate):new Date(b.lastUpdate);

		if (resultSortLastUpDate) {
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
	updateData(auxList);
});

//ORDENAR POR NÚMERO DE VOTOS
document
.getElementById("order-by-votes")
.addEventListener("click", () => {
	//
	console.log(typeFavAux);
	let auxList = [];
	if(typeFavAux === "ALL"){
		auxList = favorites;
	} else if(typeFavAux === "PROJECT"){
		auxList = favProjects;
	} else if(typeFavAux === ForumType.IDEA){
		for (let i = 0; i < favForum.length; i++) {
			if (favForum[i].type === ForumType.IDEA) {
				auxList.push(favForum[i]);
			}
		}
	} else if(typeFavAux === ForumType.NECESSITY){
		for (let i = 0; i < favForum.length; i++) {
			if (favForum[i].type === ForumType.NECESSITY) {
				auxList.push(favForum[i]);
			}
		}
	}


	console.log(auxList);
	resultSortVotes = !resultSortVotes;
	// listOrder = forumsList;
	if(resultSortVotes){
		document.getElementById("order-by-votes").children[1].innerHTML = `<i class="fa-solid fa-caret-up sorted"></i>`
	} else {
		document.getElementById("order-by-votes").children[1].innerHTML = `<i class="fa-solid fa-caret-down sorted"></i>`
	}
	auxList.sort(function (a, b) {
		//
		let keyA = "";
		let keyB = "";
		if(a.totalVotes){
			keyA = a.totalVotes;
		} else {
			keyA = a.votes;
		}

		if(b.totalVotes){
			keyB = b.totalVotes;
		} else {
			keyB = b.votes;
		}

		if (resultSortVotes) {
			//DO MENOS NÚMERO DE VOTOS PARA O MAIOR
			// Essa função deve retornar um número negativo se o primeiro objeto é menor que o segundo
			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			//e zero se ambos são iguais.
			return 0;
			//
		} else {
			//DO MAIOR NÚMERO DE VOTOS PARA O MENOR
			//um número positivo se o segundo é menor que o primeiro
			if (keyA < keyB) return 1;
			if (keyA > keyB) return -1;
			//e zero se ambos são iguais.
			return 0;
			//
		}
	});
	updateData(auxList);
});

//MÉTODO PARA CONVERTER A DATA QUE SE ENCONTRA EM FORMATO AMERICANO PARA O FORMATO EUROPEU (PORTUGUÊS)
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