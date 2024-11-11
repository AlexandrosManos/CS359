const colors = ["Red", "White"];
const dice = ["one", "two", "three", "four", "five", "six"];
var PawCount = new Array(91).fill(0);

const player1 = {
	postition: 0,
	color: "",
	name: "player1",
	id: 1,
};

const player2 = {
	postition: 0,
	color: "",
	name: "player2",
	id: 2,

};

const game = {
	round: 1,
	started: false,
	diceNum: -1,
	playing: player1,
	winner: 0,
};

function setRandomColor() {
	let val = Math.floor(Math.random() * 2);
	player1.color = colors[val];
	val == 0 ? player2.color = colors[1] : player2.color = colors[0];
}
function initGame() {
	game.diceNum = -1;
	game.round = 1;
	game.started = false;
	game.playing = player1;
	game.winner = 0;

}
function initPlayers() {
	player1.postition = 0;
	player2.postition = 0;
	setRandomColor();
}
function getNext() {
	if (game.playing == player1)
		return player2;
	return player1;
}
// change Player turn
function setNext() {
	if (document.getElementById("dice").disabled)
		document.getElementById("dice").disabled = false;
	if (game.diceNum == 6) {
		return;
	}
	game.playing = getNext();
	if (game.playing == player1)
		game.round += 1;
}
function getTurn() {
	return game.playing;
}

function initBoard() {
	var table = document.getElementById('mainTable');
	var tr = document.createElement('tr');

	for (var i = 9; i >= 1; i--) {
		var tr = document.createElement('tr');
		for (var j = 9; j >= 0; j--) {
			var td1 = document.createElement('td');
			var num = i * 10 - j;
			td1.innerHTML = "<div id='position" + num + "'><img  src='images/" + num + ".png'  height=70 width=80></div>";

			tr.appendChild(td1);

		}
		table.appendChild(tr);
	}
	initGame();
	setPositions();
	initPlayers();
}


// Cheat Section
function EnableCheat() {
	const CheatBt = document.getElementById("Cheat");
	const TpOption = document.getElementById("TpCheat");
	const DiceOption = document.getElementById("DiceCheat");

	if (CheatBt.textContent == "Cheats off") {
		TpOption.style.display = "block";
		DiceOption.style.display = "block";
		CheatBt.textContent = "Cheats on";
		CheatBt.style.backgroundColor = "green";

	} else {
		TpOption.style.display = "none";
		DiceOption.style.display = "none";
		CheatBt.textContent = "Cheats off";
		CheatBt.style.backgroundColor = "red";
	}
}


function Cheat() {
	if (document.getElementById("dice").disabled)
		document.getElementById("dice").disabled = false;
	if (game.started) {
		if (document.getElementById("SpanWarn")) {
			document.getElementById("SpanWarn").remove();
		}
		let cheatDice = Number(document.getElementById("ChDice").value);
		if (cheatDice > 6) {
			game.diceNum = 6;
			document.getElementById("ChDice").value = 6;
		} else if (cheatDice < 1) {
			document.getElementById("ChDice").value = 1;
			game.diceNum = 1;
		} else {
			game.diceNum = cheatDice;

		}
		// console.log("Cheat value: " + cheatDice + " game.diceNum: " + cheatDice);
		document.getElementById("dice").innerHTML = "<img  src='imagesDice/" + dice[game.diceNum - 1] + ".png'  height=50 width=50></div>";
		document.getElementById("DiceNumber").innerHTML = "<h3 id='DiiceMess'>Dice Number: " + dice[game.diceNum - 1] + " </h3>";
	} else {
		document.getElementById("WarningMess").innerHTML = "<span id='SpanWarn' style= 'font-size: 20px; color: red;'>Start the game first </span>";
	}
}

async function Tp() {
	if (game.started) {
		if (document.getElementById("SpanWarn")) {
			document.getElementById("SpanWarn").remove();
		}
		await RemovePawn();
		var TpPos = Number(document.getElementById("TpButton").value);
		await move(TpPos);
		await TileCheck(); // optional
		await updateGUI();
	} else {
		document.getElementById("WarningMess").innerHTML = "<span id='SpanWarn' style= 'font-size: 20px; color: red;'>Start the game first </span>";
	}
}

