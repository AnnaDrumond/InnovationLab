const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
//receber por path o type de mensagens que estamos a ver, se são as recebidas (inbox - ibx), ou as enviadas (sent - snt)
let paramMessages = new URLSearchParams(window.location.search);
const type = paramMessages.get("tp");
let dataUrl = new URLSearchParams();
let messages = [];
let numMessages = 0;

// NOTA: Quando o user vem pelo MENU entra primeiro na caixa de recebidos
//////////////////////////////////////////////////////////////////
document.addEventListener("DOMContentLoaded", async () => {
	//confirmar se o user logado não é um visitante
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

	getNotificationsAndMessagesNumber();
	setInterval(getNotificationsAndMessagesNumber, 5000);

	if (type === "ibx") {
		document.getElementById("inbox-btn").classList.add("selected-box-msg");
		messages = await doFetchWithResponse(
			urlDefault + "messages/all/received",
			{
				method: "GET",
				headers: { "Content-Type": "application/json" },
			},
		);
		if(messages === 401){
			document.querySelector(".message-container").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as mensagens revebidas!</p>`;
		} else if(messages instanceof Object){
			console.log(messages);
			//carrregar msgs
			loadMessages(messages);
		}
	}
	//enviados
	if (type === "snt") {
		document.getElementById("sent-btn").classList.add("selected-box-msg");

		//messages controller linha 150
		messages = await doFetchWithResponse(urlDefault + "messages/all/sent", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
		console.log("voltei da bd com a lista de ENVIADAS: ");
		if(messages === 401){
			document.querySelector(".message-container").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as mensagens enviadas!</p>`;
		} else if(messages instanceof Object){
			console.log(messages);
			//carrregar msgs
			loadMessages(messages);
		}
		
	}
});

async function getNotificationsAndMessagesNumber() {
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
	} else if (info === 401) {
		document.querySelector(".message-container").innerHTML = "";
		const pError = document.createElement("p");
		pError.className = "error-edit-forum";
		pError.innerText = "Ocorreu um erro!";
		document.querySelector(".message-container").appendChild(pError);
	} else if (info instanceof Object) {
		if (numMessages !== info.numberOfMessages) {
			numMessages = info.numberOfMessages;
			//
			if (type === "ibx") {
				document.getElementById("inbox-btn").classList.add("selected-box-msg");
				//messages controller linha 126
				messages = await doFetchWithResponse(
					urlDefault + "messages/all/received",
					{
						method: "GET",
						headers: { "Content-Type": "application/json" },
					},
				);
				if(messages === 401){
					document.querySelector(".message-container").innerHTML = `<p class = "error-text">Ocorreu um erro a carregar as mensagens revebidas!</p>`;
				} else if(messages instanceof Object){
					console.log(messages);
					//carrregar msgs
					loadMessages(messages);
				}
			}
		}
		loadNotificationInMenu(info);
	}
}

//carrregar msgs
function loadMessages(messages) {
	// div onde ficam todas as mensagens
	const sectionMessages = document.querySelector(".message-container");
	sectionMessages.innerHTML = "";

	if(messages.length > 0){

	for (let i = 0; i < messages.length; i++) {
		//<div class="message">
		const divMessage = document.createElement("div");
		divMessage.className = "message";
		divMessage.id = messages[i].id;

		//<div class="message-user">
		const divMessageUser = document.createElement("div");
		divMessageUser.className = "message-user";

		//	<img id="message-user-image"
		let userImage = document.createElement("img");
		userImage.id = "message-user-image";

		//guardar o email da pessoa com quem user "trocou"" mensagen, caso o user vá para messagesExchanged
		let emailToConsult = "";

		//<span class="message-user-name" id="message-user-name">
		const nameUser = document.createElement("span");
		nameUser.className = "message-user-name";
		nameUser.id = "message-user-name";
		//
		//Nas enviadas o sender vem null, pois é o user logado
		//tenho o receiver, que é de quem eu recebi msgs
		if (messages[i].receiver != null) {
			//
			if (messages[i].receiver.photo) {
				userImage.src = messages[i].receiver.photo;
			} else {
				userImage.src = "photoDefault.jpeg";
			}
			//
			nameUser.textContent = messages[i].receiver.fullName;
			emailToConsult = messages[i].receiver.email;
			//
			//Nas recebidas o receiver vem null, pois é o user logado
			//tenho o sender que é para quem enviei msgs
		} else if (messages[i].sender != null) {
			//
			if (messages[i].sender.photo) {
				userImage.src = messages[i].sender.photo;
			} else {
				userImage.src = "photoDefault.jpeg";
			}
			//
			nameUser.textContent = messages[i].sender.fullName;
			emailToConsult = messages[i].sender.email;
		}

		divMessageUser.appendChild(userImage);
		divMessageUser.appendChild(nameUser);

		//Ação de clicar em qualquer parte da div de uma determinada mensagem
		divMessageUser.addEventListener("click", function (e) {
			listener(messages[i].id, emailToConsult);
		});

		//dados do user na div da mensagem
		divMessage.appendChild(divMessageUser);
		//	<p class="message-content">
		const pContent = document.createElement("p");
		pContent.className = "message-content";
		pContent.textContent = messages[i].content;
		pContent.addEventListener("click", function (e) {
			listener(messages[i].id, emailToConsult);
		});

		let span = "";
		if (type === "ibx") {
			//
			span = document.createElement("span");
			span.id = "message-icon";
			//readed
			if (messages[i].readed == false) {
				//<i class="fa-solid fa-envelope"></i>
				span.className = "fa-solid fa-envelope";
			} else if (messages[i].readed == true) {
				//<i class="fa-solid fa-envelope-open"></i>
				span.className = "fa-solid fa-envelope-open";
				divMessage.classList.add("opacity-message");
			}

			span.addEventListener("click", async () => {
				//messages controller 177
				const responseStatus = await doFetchNoResponse(
					urlDefault + "messages/" + messages[i].id + "/read",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
					},
				);

				console.log("voltei do fetch marcar lida/não lida");
				console.log(responseStatus);

				if (responseStatus == 200) {
					//verificar qual envelope está sendo exibido no momento
					if (span.classList.contains("fa-envelope")) {
						//não lida
						console.log("tenho envelope");
						//esconder envelope
						span.classList.remove("fa-envelope");
						span.classList.add("fa-envelope-open");
						divMessage.classList.add("opacity-message");
						//adicionar envelope open
					} else if (span.classList.contains("fa-envelope-open")) {
						console.log("tenho envelope open");
						span.classList.remove("fa-envelope-open");
						span.classList.add("fa-envelope");
						divMessage.classList.remove("opacity-message");
					}
				}
			});
		}

		// span.innerHTML = `<i class="fa-solid fa-envelope envelope"></i>`;

		//<p class="message-date">
		const pDate = document.createElement("p");
		pDate.className = "message-date";
		pDate.textContent = messages[i].sendDate;

		divMessage.appendChild(pContent);
		if (type === "ibx") {
			divMessage.appendChild(span);
		}

		divMessage.appendChild(pDate);
		sectionMessages.appendChild(divMessage);
	}
	} else {
		document.querySelector(".message-container").innerHTML = `<p class = "error-text">Caixa de Mensagens vazia</p>`;
	}
}

function listener(idParameter, emailToConsult) {
	dataUrl.delete("tp");
	dataUrl.delete("id");
	dataUrl.delete("e");
	dataUrl.append("tp", type);
	dataUrl.append("id", idParameter);
	dataUrl.append("e", btoa(emailToConsult));
	// vai para a pagina de mensagens trocadas com um scrollTo para a mensagem deste id
	window.location.href = "messagesExchanged.html?" + dataUrl.toString();
}

//////////////////////////////////////////////////////////////////
//Ações dos botões
//////////////////////////////////////////////////////////////////
document.getElementById("inbox-btn").addEventListener("click", () => {
	window.location.href = "messages.html?tp=ibx";
});

document.getElementById("sent-btn").addEventListener("click", () => {
	window.location.href = "messages.html?tp=snt";
});

document.getElementById("new-message-btn").addEventListener("click", () => {
	window.location.href = "new-message.html";
});
