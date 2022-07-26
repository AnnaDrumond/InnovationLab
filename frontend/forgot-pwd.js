let url = "http://localhost:8080/adrumond-jvalente-backend/rest/users";

document
	.getElementById("send-btn")
	.addEventListener("click", sendEmailResetPassword);

async function sendEmailResetPassword() {

	const email = document.getElementById("email").value;
	const emailTrim = email.trim();

	if (email != "" && emailTrim.length > 0) {
		document.querySelector(".loading").classList.remove("hide");
		document.querySelector(".container-forgot-pwd").classList.add("hide");
		const fetchOptions = {
			method: "POST",
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
			},
		};

		//user controller linha 99
		const status = await doFetchNoResponse(
			url + "/email/" + email + "/resetpwd",
			fetchOptions,
		);
		if (status === 200) {
			document.querySelector(".loading").classList.add("hide");
			console.log("200 OK", status);
			document.querySelector(".div-warning-forgotpwd").innerHTML = `
			<p class = "sucess-text">Mensagem enviada com sucesso! Verifica o teu e-mail para resetar tua palavra-passe</p>`;
			setTimeout(function () {
				document.querySelector(".div-warning-forgotpwd").innerHTML = "";
				window.location.href = "index.html";
			}, 10000);
			//limpar os inputs
			document.getElementById("email").value = "";
		} else if(status === 401) {
			document.querySelector(".loading").classList.add("hide");
			document.querySelector(".div-warning-forgotpwd").innerHTML = `
		<p class = "error-text">Ocorreu um erro! Tenta novamente mais tarde!</p>`;

			setTimeout(function () {
				document.querySelector(".div-warning-forgotpwd").innerHTML = "";
				document.querySelector(".container-forgot-pwd").classList.remove("hide");
			}, 3000);
		} else if(status === 403){
			document.querySelector(".loading").classList.add("hide");
			document.querySelector(".div-warning-forgotpwd").innerHTML = `
		<p class = "error-text">E-mail não registado! Por favor introduz um email registado!</p>`;

			setTimeout(function () {
				document.querySelector(".div-warning-forgotpwd").innerHTML = "";
				document.querySelector(".container-forgot-pwd").classList.remove("hide");
			}, 3000);
		}
		
	} else {
		console.log("campos vazios");
		//ERRO - NÃO PODE HAVER CAMPOS VAZIOS
		//temos uma div no html para receber o erro
		document.querySelector(".loading").classList.add("hide");
		document.querySelector(".container-forgot-pwd").classList.remove("hide");
		document.querySelector(".div-warning-forgotpwd").innerHTML = `
				<p class = "error-text">Esqueceste-te de pôr teu email!</p>`;
		setTimeout(function () {
			document.querySelector(".div-warning-forgotpwd").innerHTML = "";
		}, 3000);
	}
}

//ação botão de voltar
document.getElementById("return-btn").addEventListener("click", () => {
	window.location.href = "index.html";
});
