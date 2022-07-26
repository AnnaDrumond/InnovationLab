let url = "http://localhost:8080/adrumond-jvalente-backend/rest/users";

document.getElementById("register-btn").addEventListener("click", register);
const info = document.createElement("p");

async function register() {
	const firstName = document.getElementById("firstName");
	const firstNameTrim = firstName.value.trim();
	const lastName = document.getElementById("lastName");
	const lastNameTrim = lastName.value.trim();
	const workplace = document.getElementById("workplace");
	const workplaceTrim = workplace.value.trim();
	const email = document.getElementById("email");
	const emailTrim = email.value.trim();
	const password = document.getElementById("password");
	const passwordTrim = password.value.trim();
	const passwordConfirmation = document.getElementById("confirmPass").value;

	if (password.value === passwordConfirmation) {
		if (
			firstName.value != "" &&
			firstNameTrim.length > 0 &&
			lastName.value != "" &&
			lastNameTrim.length > 0 &&
			workplace.value != "" &&
			workplaceTrim.length > 0 &&
			password.value != "" &&
			passwordTrim.length > 0 &&
			email.value != "" &&
			emailTrim.length > 0
		) {
			document.querySelector(".loading").classList.remove("hide");
			document.querySelector(".input-container-register").classList.add("hide");
			//cria o json que será enviado ao backend com os dados do novo user
			let userToRegister = {
				firstName: firstName.value,
				lastName: lastName.value,
				password: password.value,
				workplace: workplace.value,
				email: email.value,
			};

			console.log(userToRegister);
			console.log(userToRegister);
			//cria os dados que irão ser enviados pelo fetch
			const fetchOptions = {
				method: "POST",
				body: JSON.stringify(userToRegister),
				headers: {
					Accept: "*/*",
					"Content-Type": "application/json",
				},
			};
			console.log(fetchOptions);

			//user controller linha 42
			const status = await doFetchNoResponse(url + "/register", fetchOptions);

			if (status === 200) {
				console.log(status);
				document.querySelector(".loading").classList.add("hide");

				info.className = "information-after-register";
				info.textContent =
					"Enviamos um email para " +
					email.value +
					"! Acede ao teu email e confirma a tua conta Innovation Lab!";

				// 
			} else if(status ===421){
				document.querySelector(".loading").classList.add("hide");
				info.className = "information-after-register";
				info.textContent =
					"Já existe uma conta registada com este email!";
			
			} else {

				document.querySelector(".loading").classList.add("hide");
				info.className = "information-after-register";
				info.textContent =
					"Pedimos desculpa, mas houve um erro ao realizar teu registo, pedimos que envie um e-mail para innovationlab.aor@gmail.com para que o possamos ajudar";
			}

			const button = document.createElement("button");
			button.className = "button-return";
			button.innerText = "VOLTAR";
			button.addEventListener("click", () => {
				window.location.href = "index.html";
			});
			document.querySelector(".container").appendChild(info);
			document.querySelector(".container").appendChild(button);
			//
		} else {
			console.log("caixas vaziasssss");
			document.querySelector(".div-warning-forgotpwd").innerHTML = `
			<p class = "error-text">Não preencheste todos os campos!</p>`;

			setTimeout(function () {
				document.querySelector(".div-warning-forgotpwd").innerHTML = "";
			}, 3000);
		}
	} else {
		console.log("password different");
		document.querySelector(".div-warning-forgotpwd").innerHTML = `
			<p class = "error-text">As palavras-passe são diferentes!</p>`;

		setTimeout(function () {
			document.querySelector(".div-warning-forgotpwd").innerHTML = "";
		}, 3000);
	}
}
