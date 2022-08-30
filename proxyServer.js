const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const { response } = require('express');

const app = express();

app.use(cors());

app.use(express.json());

dotenv.config();

const API_KEY = process.env.API_KEY;

function getPlayerPUUID(playerName) {
	return axios
		.get(
			'https://euw1.api.riotgames.com' +
				'/lol/summoner/v4/summoners/by-name/' +
				playerName +
				'?api_key=' +
				API_KEY
		)
		.then((response) => {
			return response.data.puuid;
		})
		.catch((err) => err);
}

// GET past5Games
app.post('/past5Games', async (req, res) => {
	const playerName = req.body.Username;
	// become PUUID through an API CALL
	const PUUID = await getPlayerPUUID(playerName);
	const API_CALL =
		'https://europe.api.riotgames.com' +
		'/lol/match/v5/matches/by-puuid/' +
		PUUID +
		'/ids' +
		'?api_key=' +
		API_KEY;

	// get API_CALL
	// its going to give us a list of 20 game IDs
	const gameIDs = await axios
		.get(API_CALL)
		.then((response) => response.data)
		.catch((err) => err);

	// loop trough game IDs
	// at each loop, get the indormation based off ID (API CALL)
	var matchDataArray = [];
	for (var i = 0; i < gameIDs.length - 15; i++) {
		const matchID = gameIDs[i];
		const matchData = await axios
			.get(
				'https://europe.api.riotgames.com' +
					'/lol/match/v5/matches/' +
					matchID +
					'?api_key=' +
					API_KEY
			)
			.then((response) => response.data)
			.catch((err) => err);
		matchDataArray.push(matchData);
	}

	// save information above in a array, give array as JSON reponse to user
	// [Game1Object, Game2Object, ...]
	res.json(matchDataArray);
});

app.listen(4000, function () {
	console.log('Server started on port 4000');
});
