const urlDefault = "http://localhost:8080/adrumond-jvalente-backend/rest/users";

let param = new URLSearchParams(window.location.search);
let token = param.get("t");

//email para testes:
//testeprojfinalAor@gmail.com
// password: julho%22

//email innovation Lab
//innovationlab.aor@gmail.com
//password:
const h4InformationText = document.getElementById("validate_register-info");

document.addEventListener("DOMContentLoaded", async () => {
	const fetchOptions = {
		method: "POST",
		headers: {
			Accept: "*/*",
			"Content-Type": "application/json",
		},
	};

	//user controller linha 72
	const status = await doFetchNoResponse(
		urlDefault + "/promote/" + token + "/standard",
		fetchOptions,
	);

	if (status === 200) {
		//
		setTimeout(function () {
			window.location.href = "index.html";
		}, 3000);
		//401 erro ao promover para standard ou 406 - token nulo
	} else {
		h4InformationText.innerHTML =
			"Pedimos desculpa, mas houve um erro ao realizar teu registo, pedimos que envie um e-mail para innovationlab.aor@gmail.com para que o possamos ajudar";
	}
});
