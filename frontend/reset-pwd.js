let url = "http://localhost:8080/adrumond-jvalente-backend/rest/users";
let param = new URLSearchParams(window.location.search);
let token = param.get("t");

if (token === null) {
	console.log("pagina para quando ocorre erroooooooo geral...");
	document.querySelector(".reset-pwd-container").remove();
	const info = document.createElement("p");
	info.className = "info-error-reset-pwd";
	info.textContent ="Pedimos desculpa, mas ocorreu um erro a validar o teu registo, pedimos que envie um e-mail para innovationlab.aor@gmail.com para que o possamos ajudar";
	
	//ACABAR CSS
	/*float: left
	margin-top:5%
	width:74%*/ 
	const button = document.createElement("button");
			button.className = "button-return";
			button.innerText = "VOLTAR";
			button.addEventListener("click", () => {
				window.location.href = "index.html";
			});
			document.querySelector(".div-warning-forgotpwd").appendChild(info);
			document.querySelector(".div-warning-forgotpwd").appendChild(button);
} else {

document.getElementById("reset-pwd").addEventListener("click", async () => {
	//
	console.log("click em botão de redefinir password...");

	const password = document.getElementById("password").value;
	const passwordTrim = password.trim();
	const passwordConfirmation =
		document.getElementById("confirm-password").value;

	if (password === passwordConfirmation) {
		if (password != "" && passwordTrim.length > 0) {
			//cria o json que será enviado ao backend com os dados do novo user
			let userPwd = {
				password: password,
			};

			const fetchOptions = {
				method: "POST",
				body: JSON.stringify(userPwd),
				headers: {
					Accept: "*/*",
					"Content-Type": "application/json",
				},
			};

			//user controller linha 162
			const status = await doFetchNoResponse(
				url + "/reset/" + token + "/password",
				fetchOptions,
			);

			if (status === 200) {
				passwordConfirmation.value = "";
				password.value = "";
				//FALTA - msg de password alterada com sucesso
				setTimeout(function () {
					//FALTA apagar mensagem msg de password alterada com sucesso
					//reencaminhar
					window.location.href = "index.html";
				}, 4000);
			} else {
				console.log("não deu 200");
			}
		} else {
			console.log("password vazia");
		}
	} else {
		document.querySelector(".div-warning-forgotpwd").innerHTML = `
			<p class = "error-text">As palavras-passe são diferentes!</p>`;

			setTimeout(function () {
				document.querySelector(".div-warning-forgotpwd").innerHTML = "";
			}, 3000);
	}
});

document.getElementById("return-btn").addEventListener("click", () => {
	window.location.href = "index.html";
});

}