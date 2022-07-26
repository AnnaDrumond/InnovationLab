async function doFetchNoResponse(url, fetchInfo) {
	console.log("doFetchNoResponse from " + url + "...");
	//console.log(fetchInfo);
	const response = await fetch(url, fetchInfo);
	return response.status;
}

async function doFetchWithResponse(url, fetchInfo) {

	const response = await fetch(url, fetchInfo);

	if (response.status === 200) {
		const data = await response.json();
		return data;
	} else {
		return response.status;
	}
}

//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
async function doFetchWithIdResponse(url, fetchInfo) {
	console.log("doFetchWithResponse");
	console.log(fetchInfo);

	const response = await fetch(url, fetchInfo);

	if (response.status === 200) {
		const data = await response.json();
		return data;
	} else {
		const json = {error: response.status};
		return json;
	}
}
