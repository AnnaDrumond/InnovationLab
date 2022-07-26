const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";

document.addEventListener("DOMContentLoaded", async () => {
	//user controller linha 425
    userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
		method: "GET",
		"Content-Type": "application/json",
	});
	//visitantes podem ver o feedForum
	if (userWithSession === 401 || userWithSession === 403) {
		//
		window.location.href = "generalError.html";
		//
	}
	//visitante pode ver esta página, mas só tem acesso ao seu conteúdo e ao logout
	if (userWithSession.type === UserType.VISITOR) {
		
		//div de adicionar conteúdos
		document.getElementById("add-dropdown-container").classList.add("hide");
		//icones
		document.getElementById("feed-forum").classList.add("hide");
		document.getElementById("feed-projects").classList.add("hide");
		document.getElementById("feed-notifications").classList.add("hide");
		document.getElementById("my-messages").classList.add("hide");
		//itens dropdown user
		const aMyProfile = document.getElementById("my-profile");
		aMyProfile.parentNode.removeChild(aMyProfile);
		const aEditMyProfile = document.getElementById("edit-my-profile");
		aEditMyProfile.parentNode.removeChild(aEditMyProfile);
		const aPrivacy = document.getElementById("privacy");
		aPrivacy.parentNode.removeChild(aPrivacy);
		const aMyFavorites = document.getElementById("my-favorites");
		aMyFavorites.parentNode.removeChild(aMyFavorites);
		//
		document.querySelector(".icon-menu").classList.add("width-aux");
		//
	} else {
		getNotificationsOnMenu();
		// só carrega o número de notificações e de mensagens se não for visitante
		setInterval(getNotificationsOnMenu, 5000);
	}
});

