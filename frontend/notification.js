let wsocket;
const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/";
let myNotifications = [];
let dataUrl = new URLSearchParams();
let mark = true;
let numNotifications = 0;

document.addEventListener("DOMContentLoaded", async () => {
  //user controller linha 425
  const userWithSession = await doFetchWithResponse(urlDefault + "users/get", {
    method: "GET",

    "Content-Type": "application/json",
  });

  if (userWithSession === 401 || userWithSession === 403) {
    window.location.href = "generalError.html";
  } else {
    if (userWithSession.type === UserType.VISITOR) {
      window.location.href = "feedForum.html";
    } else {
      getNotificationsAndMessagesNumber();
      // só carrega o número de notificações e de mensagens se não for visitante
      setInterval(getNotificationsAndMessagesNumber, 5000);
      //getNotifications(userWithSession.email);
    }
  }
});

async function getNotificationsAndMessagesNumber(){
  //notification controller linha 122
  const info = await doFetchWithResponse("http://localhost:8080/adrumond-jvalente-backend/rest/notifications/get",
	{
		method: "GET",
		"Content-Type": "text/plain",
	});
	console.log(info);

	if(info === 403){
		window.location.href = "generalError.html";

	} else if(info === 401){
    while (
      document.querySelector(".container-notifications").children.length > 0
    ) {
      document.querySelector(".container-notifications").children[0].remove();
    }
    const warning = document.createElement("p");
    warning.className = "warning-no-notfications";
    warning.innerText = "Ocorreu um erro!";
    document.querySelector(".container-notifications").appendChild(warning);

	} else if(info instanceof Object){
    console.log(numNotifications," entrei no else ", info.numNotifications);
    if(info.numNotifications === 0){
      while (
        document.querySelector(".container-notifications").children.length > 0
      ) {
        document.querySelector(".container-notifications").children[0].remove();
      }
      const warning = document.createElement("p");
      warning.className = "warning-no-notfications";
      warning.innerText = "Não tens notificações!";
      document.querySelector(".container-notifications").appendChild(warning);
    }
		if(numNotifications !== info.numNotifications){

      console.log("entrei no if ", numNotifications);
			numNotifications = info.numNotifications;
			loadMyNotifications();
		}
		loadNotificationInMenu(info);
	}
}

async function loadMyNotifications() {
  //notification controller linha 70
  const myList = await doFetchWithResponse(urlDefault + "notifications/list");

  if (myList === 403) {
    window.location.href = "generalError.html";
  } else if (myList === 401) {
    document
      .querySelector(".alterations-feedback")
      .classList.remove("visibily-hidden");
    setTimeout(() => {
      document
        .querySelector(".alterations-feedback")
        .classList.add("visibily-hidden");
    }, 3000);
  } else if(myList instanceof Object){

  

  console.log("passei    ", myList);
  while (
    document.querySelector(".container-notifications").children.length > 0
  ) {
    document.querySelector(".container-notifications").children[0].remove();
  }

  if (myList.length === 0) {
    const warning = document.createElement("p");
    warning.className = "warning-no-notfications";
    warning.innerText = "Não tens notificações!";
    document.querySelector(".container-notifications").appendChild(warning);
  }

  myList.forEach((notif) => {
    //<div class="notification">
    const divNot = document.createElement("div");
    divNot.className = "notification";
    divNot.setAttribute("id", notif.id);
    
    if (notif.seen) {
      divNot.classList.add("opacity-message");
    } else {
      divNot.classList.remove("opacity-message");
    }

    //<p class="notification-text">
    const p = document.createElement("p");
    p.className = "notification-text";
    p.innerText = notif.text;
    p.addEventListener("click", async () => {
      markAsSeen(notif.id, divNot);
    });

    divNot.appendChild(p);

    //<div class="notification-btn-container">
    const divBtn = document.createElement("div");
    divBtn.className = "notification-btn-container";

    //<button class="see-relevant-information">
    const seeRelevantInfo = document.createElement("button");
    seeRelevantInfo.className = "see-relevant-information visibily-hidden";

    let AcceptNotif = false;

    if (notif.typeNotification === "ACCEPTED") {
      AcceptNotif = true;
      seeRelevantInfo.innerHTML = `<i class="fa-solid fa-square-arrow-up-right not-icon"></i>`;
      seeRelevantInfo.setAttribute("data-tooltip", "Ver projeto");
      seeRelevantInfo.addEventListener("click", () => {
        markAsSeen(notif.id, divNot);
        window.location.href = "seeProject.html?p=" + notif.idProject;
      });
    } else if (notif.typeNotification === "INVITE") {
      seeRelevantInfo.innerHTML = `<i class="fa-solid fa-square-arrow-up-right not-icon"></i>`;
      seeRelevantInfo.setAttribute("data-tooltip", "Ver projeto");
      seeRelevantInfo.addEventListener("click", () => {
        markAsSeen(notif.id, divNot);
        window.location.href = "seeProject.html?p=" + notif.idProject;
      });
    } else if (notif.typeNotification === "REQUEST") {
      seeRelevantInfo.innerHTML = `<i class="fa-solid fa-user not-icon"></i>`;
      seeRelevantInfo.setAttribute("data-tooltip", "Ver perfil");
      seeRelevantInfo.addEventListener("click", () => {
        markAsSeen(notif.id, divNot);
        dataUrl.delete("e");
        dataUrl.append("e", btoa(forumsList[i].userOwner.email));
        window.location.href = "personal-page.html?" + dataUrl;
      });
    }

    divBtn.appendChild(seeRelevantInfo);

    //<button class="accept-notification visibily-hidden">
    if (AcceptNotif === false) {
      const buttonAccept = document.createElement("button");
      buttonAccept.className = "accept-notification visibily-hidden not-icon";
      buttonAccept.innerHTML = `<i class="fa-solid fa-circle-check not-icon"></i>`;
      buttonAccept.setAttribute("data-tooltip", "Aceitar");
      buttonAccept.addEventListener("click", async () => {
        mark = true;
        console.log("ACEITAR");
        //markAsSeen(notif.id, divNot);
        if (notif.typeNotification === "INVITE") {
          console.log("INVITE");
          //project controller linha 894
          const status = await doFetchNoResponse(
            urlDefault +
              "projects/accept/invitation/" +
              notif.idProject +
              "/project",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );
          console.log(status);

          if (status === 200) {
            document.querySelector(".alterations-feedback").innerText =
              "Faz agora parte do projeto!";
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
              document.querySelector(".alterations-feedback").innerText =
                "Pedimos desculpa, mas ocorreu um erro! Tenta novamente mais tarde!";
            }, 3000);
          } else if (status === 401) {
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
            }, 3000);
          } else if (status === 403) {
            window.location.href = "generalError.html";
          } else if (status === 494 || status === 493 || status === 490 || status === 457) {
            deleteNotification(notif.id);
          }
        } else if (notif.typeNotification === "REQUEST") {
          console.log("REQUEST");
          //project controller linha 722
          const status = await doFetchNoResponse(
            urlDefault +
              "projects/promote/participant/" +
              notif.idProject +
              "/project",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                email: notif.userReferenced,
              },
            }
          );
          if (status === 200) {
            document.querySelector(".alterations-feedback").innerText =
              "Pedido aceite com sucesso!";
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
              document.querySelector(".alterations-feedback").innerText =
                "Pedimos desculpa, mas ocorreu um erro! Tenta novamente mais tarde!";
            }, 3000);
          } else if (status === 401) {
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
            }, 3000);
          } else if (status === 403) {
            window.location.href = "generalError.html";
          } else if (
            status === 494 ||
            status === 493 ||
            status === 490 ||
            status === 489
          ) {
            deleteNotification(notif.id);
          }
        }
      });

      divBtn.appendChild(buttonAccept);

      //<button class="reject-notification visibily-hidden">
      const buttonReject = document.createElement("button");
      buttonReject.className = "reject-notification visibily-hidden not-icon";
      buttonReject.innerHTML = `<i class="fa-solid fa-circle-xmark not-icon"></i>`;
      buttonReject.setAttribute("data-tooltip", "Rejeitar");
      buttonReject.addEventListener("click", async () => {
        //markAsSeen(notif.id, divNot);
        mark = true;
        console.log("REJEITAR");
        if (notif.typeNotification === "INVITE") {
          console.log("INVITE");
          //project controller linha 987
          const status = await doFetchNoResponse(
            urlDefault +
              "projects/refuse/invitation/" +
              notif.idProject +
              "/project",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            }
          );
          console.log(status);

          if (status === 200) {
            document.querySelector(".alterations-feedback").innerText =
              "Convite rejeitado com sucesso!";
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
              document.querySelector(".alterations-feedback").innerText =
                "Pedimos desculpa, mas ocorreu um erro! Tenta novamente mais tarde!";
            }, 3000);

          } else if (status === 401) {
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
            }, 3000);
          } else if (status === 403) {
            window.location.href = "generalError.html";
          } else if (status === 494 || status === 493 || status === 490) {
            deleteNotification(notif.id);
          }
        } else if (notif.typeNotification === "REQUEST") {
          console.log("REQUEST");
          //project controller linha 1031
          const status = await doFetchNoResponse(
            urlDefault +
              "projects/refuse/solicitation/" +
              notif.idProject +
              "/project",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                email: notif.userReferenced,
              },
            }
          );
          console.log(status);
          if (status === 200) {
			document.querySelector(".alterations-feedback").innerText =
              "Pedido rejeitado com sucesso!";
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
              document.querySelector(".alterations-feedback").innerText =
                "Pedimos desculpa, mas ocorreu um erro! Tenta novamente mais tarde!";
            }, 3000);

          } else if (status === 401) {
            document
              .querySelector(".alterations-feedback")
              .classList.remove("visibily-hidden");
            setTimeout(() => {
              document
                .querySelector(".alterations-feedback")
                .classList.add("visibily-hidden");
            }, 3000);
          } else if (status === 403) {
            window.location.href = "generalError.html";
          } else if (status === 494 || status === 493 || status === 490) {
            deleteNotification(notif.id);
          }
        }
      });

      divBtn.appendChild(buttonReject);
    }

    divNot.appendChild(divBtn);

    divNot.onmouseover = () => {
      for (let i = 0; i < divNot.children[1].children.length; i++) {
        divNot.children[1].children[i].classList.remove("visibily-hidden");
      }
    };

    divNot.onmouseout = () => {
      for (let i = 0; i < divNot.children[1].children.length; i++) {
        divNot.children[1].children[i].classList.add("visibily-hidden");
      }
    };

    document.querySelector(".container-notifications").appendChild(divNot);
  });
  }
}

//marcar notificação como lida
async function markAsSeen(id, divNot) {
  if (mark === true) {
    //notification controller linha 41
    const status = await doFetchNoResponse(
      urlDefault + "notifications/seen/" + id,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (status === 200) {
      if (divNot.classList.contains("opacity-message")) {
        divNot.classList.remove("opacity-message");
      } else {
        divNot.classList.add("opacity-message");
      }
    } else if (status === 403) {
      window.location.href = "generalError.html";
    } else if (status === 401) {
      document
        .querySelector(".alterations-feedback")
        .classList.remove("visibily-hidden");
      setTimeout(() => {
        document
          .querySelector(".alterations-feedback")
          .classList.add("visibily-hidden");
      }, 3000);
    }
  }
}

async function deleteNotification(id) {
  //notification controller linha 95
  const status = await doFetchNoResponse(
    urlDefault + "notifications/delete/" + id,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (status === 200) {
    const notList = document.querySelectorAll(".notification");
    notList.forEach((not) => {
      if (not.id == id) {
        //not.removeEventListener("click", markAsSeen);
        mark = false;
        not.remove();
      }
    });
  } else if (status === 403) {
    window.location.href = "generalError.html";
  } else if (status === 401 || status === 420) {
    document
      .querySelector(".alterations-feedback")
      .classList.remove("visibily-hidden");
    setTimeout(() => {
      document
        .querySelector(".alterations-feedback")
        .classList.add("visibily-hidden");
    }, 3000);
  }
}
