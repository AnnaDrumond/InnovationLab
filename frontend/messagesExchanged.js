const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
//receber por path o type de mensagens que estamos a ver, se são as recebidas (inbox - ibx), ou as enviadas (sent - snt)
let paramExchanged = new URLSearchParams(window.location.search);
const id = paramExchanged.get("id");
const type = paramExchanged.get("tp");
let emailToConsult = atob(paramExchanged.get("e"));
let dataUrl = new URLSearchParams();
let messages = [];
let userWithSession = "";

document.addEventListener("DOMContentLoaded", async () => {
	//Verificar se o user é visitante ou se não é o owner da message clicada
	//messages controller linha 213
	let hasAuth = await doFetchWithResponse(
		urlDefault + "messages/has/auth/" + id,
		{
			method: "POST",
			headers: { "Content-Type": "text/plain" },
		},
	);

	console.log(" has authorization " + hasAuth);

	if (hasAuth) {
		//marcar a mensagem clicada pelo user como lida/não lida no back
		//messgaes controller linha 177
		await doFetchNoResponse(
			urlDefault + "messages/" + id + "/read",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
			},
		);

		console.log("voltei do fetch marcar lida/não lida");

		////////////////////////////////////////////
		//preciso da pessoa que quero consultar
		//a troca de mensagens que quero ver é entre eu e quem?
		console.log("emailToConsult: " + emailToConsult);

		const headersObj = new Headers();
		headersObj.append("email", emailToConsult);

		//messages controller linha 94
		messages = await doFetchWithResponse(urlDefault + "messages/all/between", {
			method: "GET",
			"Content-Type": "application/json",
			headers: headersObj,
		});

		// console.log("mensagens trazidas da bd:");
		// console.log(messages);

		//user controller linha 425
		userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});

		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
		loadExchangedMessages(messages, userWithSession);
		//
	} else {
		//redirecionar FALTA - vai ficar assim?
		window.location.href = "feedForum.html";
	}
});

function loadExchangedMessages(messages) {
	// div onde ficam todas as mensagens
	const sectionMessages = document.querySelector(".message-container");

	for (let i = 0; i < messages.length; i++) {
		//<div class="message-exchanged">
		let divMessage = document.createElement("div");
		divMessage.className = "message-exchanged";
		divMessage.id = messages[i].id;

		if (messages[i].id == id) {
			divMessage.classList.add("message-between");
		}

		//<div class="message-exchanged-user">
		let divMessageUser = document.createElement("div");
		divMessageUser.className = "message-exchanged-user";

		//	<img id="message-exchanged-user-image"
		let userImage = document.createElement("img");
		userImage.id = "message-exchanged-user-image";

		//é sempre quem envia que será exibido
		if (messages[i].sender.photo) {
			userImage.src = messages[i].sender.photo;
		} else {
			userImage.src = "photoDefault.jpeg";
		}

		//user logado NÂO é o sender, ou seja, é uma mensagem recebida
		if (messages[i].sender.email != userWithSession.email) {
			console.log("mensagem recebida");
			// CAso não <div class="message-exchanged received">
			divMessage.classList.add("received");
		}

		//<span class="message-exchanged-user-name" id="message-user-name">
		let nameUser = document.createElement("span");
		nameUser.className = "message-exchanged-user-name";
		nameUser.id = "message-user-name";
		nameUser.textContent = messages[i].sender.fullName;

		//<span class="send-date" id="send-date-message"
		let spanDate = document.createElement("span");
		spanDate.className = "send-date";
		spanDate.id = "send-date-message";
		spanDate.textContent = messages[i].sendDate;
		//
		divMessageUser.appendChild(userImage);
		divMessageUser.appendChild(nameUser);
		divMessageUser.appendChild(spanDate);

		//<div class="message-exchanged-content">
		let divContent = document.createElement("div");
		divContent.className = "message-exchanged-content";
		divContent.textContent = messages[i].content;

		divMessage.appendChild(divMessageUser);
		divMessage.appendChild(divContent);
		sectionMessages.appendChild(divMessage);
	}

	document
		.getElementById(id)
		.scrollIntoView({ behavior: "instant", block: "center" });
}

//VOLTAR para o ecrã que estava antes de entrar neste ecrã
document.getElementById("inbox-btn").addEventListener("click", function (e) {
	if (type === "ibx") {
		window.location.href = "messages.html?tp=ibx";
	} else if (type === "snt") {
		window.location.href = "messages.html?tp=snt";
	}
});

//nova mensagem
document.getElementById("new-message-btn").addEventListener("click", () => {
	window.location.href = "new-message.html";
});
