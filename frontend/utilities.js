const param = new URLSearchParams(window.location.search);
const auxDataUrl = new URLSearchParams(window.location.search);
let loggedUser = "";
let menuPhoto = "";
let websocket;
let notifications = [];

// get do user com aquela sessão(user logado) - linha 389 backend
// define a foto e busca o email a ser enviado como append nas urls do menu
//define se o menu dropdown tem a opção do admin
document.addEventListener("DOMContentLoaded", async () => {
	//
	console.log("response do get user de utilities: ");
	//user controller linha 425
	loggedUser = await doFetchWithResponse(
		"http://localhost:8080/adrumond-jvalente-backend/rest/users/get",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);

	if (loggedUser instanceof Object) {
		if (loggedUser.photo === null || loggedUser.photo === "") {
			menuPhoto = "photoDefault.jpeg";
			//
		} else if (loggedUser.photo) {
			menuPhoto = loggedUser.photo;
		}
	} else if (loggedUser == 401 || loggedUser == 403) {
		window.location.href = "generalError.html";
	}

	//
	document.getElementById("profile-image").src = menuPhoto;

	////////////////////////////////////////////////
	// opção admin do MEnu
	//		<div class="dropdown" id="user-dropdown-container">
	const divDropdown = document.getElementById("user-dropdown-container");
	//	<div class="dropdown-content" id="box-photo-dropdown" >
	const divDropdownContent = document.getElementById("box-photo-dropdown");

	//user controller linha 483
	const timeout = await doFetchWithResponse(
		"http://localhost:8080/adrumond-jvalente-backend/rest/users/get/current/timeout",
		{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		},
	);
	console.log(timeout, typeof timeout);

	if (timeout === 401 || timeout === 403) {
		window.location.href = "generalError.html";
	} else if (timeout instanceof Object) {
		let time;

		//reset timer
		window.onload = resetTimer;
		document.onmousemove = resetTimer;
		document.onmousedown = resetTimer; // touchscreen presses
		document.ontouchstart = resetTimer;
		document.onclick = resetTimer; // touchpad clicks
		document.onkeydown = resetTimer; // onkeypress is deprectaed
		document.addEventListener("scroll", resetTimer, true); // improved; see comments

		function endOfTimeout() {
			// do something when user is inactive
			logoutInUtilities();
		}
		function resetTimer() {
			clearTimeout(time);
			time = setTimeout(endOfTimeout, timeout.timeout * 60000);
		}
	}

	if (loggedUser.type == UserType.ADMINISTRATOR) {
		console.log("utilities - loggedUser.type == UserType.ADMINISTRATOR");
		//
		let optionMenu = document.createElement("a");
		optionMenu.innerHTML = "Administração";
		optionMenu.setAttribute("id", "menu-admin");

		optionMenu.addEventListener("click", () => {
			window.location.href = "admin-page.html";
		});
		//
		const privacyItem = document.getElementById("privacy");
		privacyItem.parentNode.insertBefore(optionMenu, privacyItem);
		divDropdown.appendChild(divDropdownContent);
	}
});

///////////////////////////////////////////////////////////////////////////////////////////
// botões do MEnu
///////////////////////////////////////////////////////////////////////////////////////////

document.getElementById("add-idea").addEventListener("click", () => {
	window.location.href = "new-forum.html?tp=id";
});

document.getElementById("add-necessity").addEventListener("click", () => {
	window.location.href = "new-forum.html?tp=nec";
});

document.getElementById("add-project").addEventListener("click", () => {
	window.location.href = "new-project.html";
});

document.getElementById("feed-forum").addEventListener("click", () => {
	window.location.href = "feedForum.html";
});

document.getElementById("feed-projects").addEventListener("click", () => {
	window.location.href = "feedProjects.html";
});

document.getElementById("feed-notifications").addEventListener("click", () => {
	window.location.href = "notifications.html";
});

document.getElementById("my-messages").addEventListener("click", () => {
	window.location.href = "messages.html?tp=ibx";
});

document.getElementById("my-profile").addEventListener("click", () => {
	window.location.href = "personal-page.html";
});

document.getElementById("edit-my-profile").addEventListener("click", () => {
	auxDataUrl.delete("e");
	auxDataUrl.append("e", btoa(loggedUser.email));
	window.location.href = "edit-profile.html?" + auxDataUrl;
});

document.getElementById("privacy").addEventListener("click", () => {
	auxDataUrl.delete("e");
	auxDataUrl.append("e", btoa(loggedUser.email));
	window.location.href = "privacy-security.html?" + auxDataUrl;
});

document.getElementById("my-favorites").addEventListener("click", () => {
	window.location.href = "favorites.html";
});

document.getElementById("logout").addEventListener("click", logoutInUtilities);

async function logoutInUtilities() {
	//user controller linha 195
	const status = await doFetchNoResponse(
		"http://localhost:8080/adrumond-jvalente-backend/rest/users/logout",
		{
			method: "POST",
			"Content-Type": "application/json",
		},
	);

	if (status === 200) {
		window.location.href = "index.html";
	} else {
		window.location.href = "generalError.html";
	}
}

document.querySelector(".footer-content").addEventListener("click", () => {
	window.location.href = "about.html";
});

document.querySelector(".brand").addEventListener("click", () => {
	window.location.href = "feedForum.html";
});

////////////////////////////////////////////////////////////////////////////////
//CARREGAR AS NOTIFICAÇÕES E AS MENSAGENS
////////////////////////////////////////////////////////////////////////////////
async function getNotificationsOnMenu() {
	//notification controller linha 122
	const info = await doFetchWithResponse(
		"http://localhost:8080/adrumond-jvalente-backend/rest/notifications/get",
		{
			method: "GET",
			"Content-Type": "text/plain",
		},
	);
	console.log(info);

	if (info === 403) {
		window.location.href = "generalError.html";
	} else if (info !== 401) {
		loadNotificationInMenu(info);
	}
}

//método para carregar a quantidade de notificações na barra do menu
function loadNotificationInMenu(list) {
	console.log(list.numNotifications);
	if (list.numNotifications > 0) {
		document.querySelector(".notification-number").innerText =
			list.numNotifications;
		document.querySelector(".notification-number").classList.remove("hide");
	} else {
		document.querySelector(".notification-number").innerText =
			list.numNotifications;
		document.querySelector(".notification-number").classList.add("hide");
	}

	if (list.numberOfMessages > 0) {
		document.querySelector(".message-number").innerText = list.numberOfMessages;
		document.querySelector(".message-number").classList.remove("hide");
	} else {
		document.querySelector(".message-number").innerText = list.numberOfMessages;
		document.querySelector(".message-number").classList.add("hide");
	}
}

///////////////////////////////////////////////////////////////////////////////////////////
// Objetos/Constantes - São enumerações no backend - ecitar erros de código, ao usar valores constantes
///////////////////////////////////////////////////////////////////////////////////////////

const SkillType = {
	KNOWLEDGE: "KNOWLEDGE",
	SOFTWARE: "SOFTWARE",
	HARDWARE: "HARDWARE",
	WORKINGTOOLS: "WORKINGTOOLS",
};

const ForumType = {
	NECESSITY: "NECESSITY",
	IDEA: "IDEA",
};

const MemberStatus = {
	SOLICITOR: "SOLICITOR",
	INVITED: "INVITED",
	ADMINISTRATOR: "ADMINISTRATOR",
	PARTICIPATOR: "PARTICIPATOR",
};

const UserType = {
	VISITOR: "VISITOR",
	ADMINISTRATOR: "ADMINISTRATOR",
	STANDARD: "STANDARD",
	UNNAUTHENTICATED: "UNNAUTHENTICATED",
};

const Visibility = {
	PUBLIC: "PUBLIC",
	PRIVATE: "PRIVATE",
	ESPECIFIC: "ESPECIFIC",
};
