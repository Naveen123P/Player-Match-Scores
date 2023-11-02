const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost/:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initilizeDBAndServer();

// API 1

app.get("/players/", async (request, response) => {
  const getPlayersDetailsQuary = `
    SELECT * FROM player_details ;
    `;
  const playersDetails = await db.all(getPlayersDetailsQuary);
  response.send(playersDetails);
});

// API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuary = `
    SELECT * FROM player_details WHERE player_id = ${playerId};
    `;
  const playerDetails = await db.get(getPlayerDetailsQuary);
  response.send(playerDetails);
});

// API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerDetails = `
   UPDATE 
        player_details
    SET 
        player_name = '${playerName}'
    WHERE
        player_id = ${playerId};
   `;
  const updatedPayersTable = await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetailsQuary = `
    SELECT * FROM match_details WHERE player_id = ${matchId};
    `;
  const matchDetails = await db.get(getMatchDetailsQuary);
  response.send(matchDetails);
});

// API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatches = `
    SELECT  
        match_id AS matchId,
        match,
        year
    FROM player_match_score
        NATURAL JOIN player_details
    WHERE
         player_id = ${playerId}
    `;
  const playerMatches = await db.all(getPlayerMatches);
  response.send(playerMatches);
});

// API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayers = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM player_details
            NATURAL JOIN player_match_score
        WHERE 
            match_id = ${matchId}
    `;
  const MatchPlayers = await db.all(getMatchPlayers);
  response.send(MatchPlayers);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuary = `
    SELECT 
        player_id AS playerId,
        player_name AS playerName,
        SUM(score) AS totalScore,
        COUNT(fours) AS totalFours,
        COUNT(sixes) AS totalSixes
    FROM player_details
            NATURAL JOIN player_match_score
    WHERE 
        player_id = ${playerId};
    `;
  const PlayerScore = await db.all(getPlayerScoreQuary);
  response.send(PlayerScore);
});
