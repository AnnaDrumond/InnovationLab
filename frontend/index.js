const url = "http://localhost:8080/adrumond-jvalente-backend/rest/users";

document.getElementById("login").addEventListener("click", login);
document.getElementById("password").addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		login();
	}
});
const divError = document.querySelector(".error-login-page");

async function login() {
	const email = document.getElementById("email").value;
	const emailTrim = email.trim();
	const password = document.getElementById("password").value;
	const passwordTrim = password.trim();

	if (
		password != "" &&
		passwordTrim.length > 0 &&
		email != "" &&
		emailTrim.length > 0
	) {
		const headersObj = new Headers();
		headersObj.append("email", email);
		headersObj.append("password", password);
		//cria os dados que irão ser enviados pelo fetch
		const fetchOptions = {
			method: "POST",
			"Content-Type": "application/json",
			headers: headersObj,
		};

		//user controller linha 129
		const status = await doFetchNoResponse(url + "/login", fetchOptions);

		console.log(status);
		
		if (status === 200) {
			// window.location.href="feedForum.html?id="+email;
			window.location.href = "feedForum.html";
		} else if(status === 403){
			//ERRO- DADOS INCORRETOS
			//temos uma div no html para receber o erro
			document.querySelector(
				".div-error-login",
			).innerHTML = `<p class = "error-text">Dados incorretos, por favor verifique o e-mail e palavra-passe digitados.</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".div-error-login").innerHTML = "";
			}, 3000);
			//limpar os inputs
			document.getElementById("email").value = "";
			document.getElementById("password").value = "";
		} else if(status === 401){
			document.querySelector(
				".div-error-login",
			).innerHTML = `<p class = "error-text">Ocorreu um erro! Tente novamente mais tarde</p>`;
			// Depois de 3 segundos tira a mensagem do ecrã
			setTimeout(function () {
				document.querySelector(".div-error-login").innerHTML = "";
			}, 3000);
		}
	} else {
		//ERRO - NÃO PODE HAVER CAMPOS VAZIOS
		//temos uma div no html para receber o erro
		document.querySelector(
			".div-error-login",
		).innerHTML = `<p class = "error-text">Não podes deixar campos vazios!</p>`;
		// Depois de 3 segundos tira a mensagem do ecrã
		setTimeout(function () {
			document.querySelector(".div-error-login").innerHTML = "";
		}, 2000);
		//limpar os inputs
		document.getElementById("email").value = "";
		document.getElementById("password").value = "";
	}
}
