window.onload = async function loadPage() {

	try{
		//user controller linha 185
		const status = await doFetchNoResponse(
			"http://localhost:8080/adrumond-jvalente-backend/rest/users/logout",
			{
				method: "POST",
				"Content-Type": "application/json",
			},
		);
		document.querySelector(".enter").addEventListener("click", () => {
			window.location.href = "index.html";
		});
	} catch(err){
		document.querySelector(".enter").addEventListener("click", () => {
			window.location.href = "index.html";
		});
	}
};
