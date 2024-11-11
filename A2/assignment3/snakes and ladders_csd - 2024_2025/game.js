
function setPositions() {
	var positions = [];
	var snakePositions = [13, 38, 46, 73, 81, 87]
	var snakeNewPositions = [2, 17, 26, 43, 51, 67]

	var ladderPositions = [3, 9, 32, 48, 56, 78]
	var ladderNewPositions = [4, 28, 72, 59, 86, 89]

	var snakes_or_ladders_Positions = [25, 65, 70]
	var snakes_or_ladders_NewPositions = ["5 or 45", "44 or 74", "49 or 90"]

	for (var i = 1; i <= 90; i++) {
		positions[i] = new Object();
		positions[i].from = i;


		if (snakePositions.indexOf(i) != -1) {
			positions[i].to = snakeNewPositions[snakePositions.indexOf(i)];
			positions[i].type = "Snake";
		}
		else if (ladderPositions.indexOf(i) != -1) {
			positions[i].to = ladderNewPositions[ladderPositions.indexOf(i)];
			positions[i].type = "Ladders";
		}
		else if (snakes_or_ladders_Positions.indexOf(i) != -1) {
			positions[i].to = snakes_or_ladders_NewPositions[snakes_or_ladders_Positions.indexOf(i)];
			positions[i].type = "Snake or Ladders";
		}
		else if (i === 16 || i === 47 || i === 68 || i === 84) {
			positions[i].to = "Other Player position";
			positions[i].type = "Sheep";
		}
		else if (i === 21 || i === 40 || i === 57 || i === 75) {
			positions[i].to = "1 with " + (100 - i) + "% possibility or 90 with " + i + "% possibility";
			positions[i].type = "ALL IN";
		}
		else {
			positions[i].to = i;
			positions[i].type = "Normal";

		}
	}
	return positions;
}

var cells = setPositions();
// for (var i = 1; i <= 90; i++) {
// 	console.log("Cell: " + i + " type: " + cells[i].type + " From: " + cells[i].from + " To: " + cells[i].to)
// }

function NewGame() {
	location.reload();
	game.started = false;
	game.round = 1;
	initBoard();
	document.getElementById("Start").style.display = 'inline-block';
}

function StartGame() {
	InfoBox();
	game.started = true;
	document.getElementById("Start").style.display = 'none';
	document.getElementById("dice").style.display = 'inline-block';
	document.getElementById("move").style.display = 'inline-block';

}

async function hasPlayerWon() {
	return new Promise((resolve) => {
		setTimeout(function () {
			if (player1.postition == 90) {
				playSound("End.mp3");
				game.winner = 1;
				resolve(true);
			} else if (player2.postition == 90) {
				playSound("End.mp3");
				game.winner = 2;
				resolve(true);
			} else {
				resolve(false);
			}
		}, 150);
	});
}

async function changePosition() {
	document.getElementById("move").disabled = true;
	if (game.diceNum == -1) {
		document.getElementById("WarningMess").innerHTML = "<span id='SpanWarn' style= 'font-size: 20px; color: red;'>Roll the dice first </span>";
		return;
	}
	let newP = game.playing.postition + game.diceNum;
	await AnimationMovement(game.playing.postition, newP);
	await TileCheck();
	setNext();
	await updateGUI();
	document.getElementById("move").disabled = false;

}

async function TileCheck() {
	var player = game.playing;
	var NewTile = player.postition;
	var Effect;
	async function Check() {
		return new Promise(async (resolve, reject) => {
			let effect = "None";
			let pos = cells[player.postition];
			switch (pos.type) {
				case "Snake or Ladders":
					let val = Math.floor(Math.random() * 11);
					if (val > 4) {
						effect = "ladder.mp3";
						NewTile = Number(pos.to.split(" or ")[1]);
					} else {
						// effect = "snake.mp3";
						effect = "Drop.mp3";
						NewTile = Number(pos.to.split(" or ")[0]);
					}
					document.getElementById("SpecialEvent").innerHTML = "<h3 id='SpecialMess'>Grade: " + val + " </h3>";
					break;
				case "Ladders":
					effect = "ladder.mp3";
					NewTile = pos.to;
					break;
				case "Snake":
					// effect = "snake.mp3";
					effect = "Drop.mp3";
					NewTile = pos.to;
					break;
				case "Sheep":
					effect = "sheep.mp3";
					NewTile = getNext().postition;
					break;
				case "ALL IN":
					playSound("Chips.mp3");
					NewTile = await showModal();
					if (NewTile == 1) {
						effect = "Lost.mp3";
					} else if (NewTile == 90) {
						effect = "win.mp3";
					}
					break;
				default:
					break;
			}
			resolve(effect);
		});
	}
	Effect = await Check();
	if (NewTile == player.postition) {
		return;
	}
	await RemovePawn();
	await move(NewTile, Effect);

}

async function updateGUI() {
	await hasPlayerWon();
	game.diceNum = -1;
	InfoBox();
}

// Movement Section
async function AnimationMovement(prevP, newP) {
	try {
		if (newP <= 90) {
			while (prevP < newP) {
				prevP += 1;
				await RemovePawn();
				await move(prevP);
			}
		} else {
			while (prevP < 90) {
				prevP += 1;
				await RemovePawn();
				await move(prevP);
			}
			while (newP > 90) {
				newP -= 1;
				prevP -= 1;
				await RemovePawn();
				await move(prevP);
			}
		}
	} catch (error) {
		console.error(error);
	}
}

function move(pos, effect = 'Move.mp3') {
	return new Promise((resolve, reject) => {
		if (pos <= 90) {
			setTimeout(function () {
				if (pos != 0) {
					if (PawCount[pos] == 0) {
						document.getElementById("position" + pos).innerHTML = "<img  src='images" + game.playing.color + "/" + pos + ".png'  height=70 width=80></div>";
					} else {
						document.getElementById("position" + pos).innerHTML = "<img  src='imagesBoth/" + pos + ".png'  height=70 width=80></div>";
					}
				}
				playSound(effect);
				game.playing.postition = pos;
				PawCount[pos] += game.playing.id;
				resolve(true);
			}, 150);
		} else {
			resolve(true);
		}
	});
}
// Remove Pawn from the previous position
function RemovePawn() {
	return new Promise((resolve, reject) => {
		let pos = game.playing.postition;
		if (pos > 0) {
			setTimeout(function () {
				if (PawCount[pos] == 3) {
					let player = getNext();
					document.getElementById("position" + pos).innerHTML = "<img  src='images" + player.color + "/" + pos + ".png'  height=70 width=80></div>";
				} else {
					document.getElementById("position" + pos).innerHTML = "<img  src='images/" + pos + ".png'  height=70 width=80></div>";
				}
				PawCount[pos] -= game.playing.id;
				resolve(true);
			}, 200);
		} else {
			resolve(true);
		}
	});
}

// Update Info Box
function InfoBox() {
	if (document.getElementById("DiiceMess") && game.diceNum <= 0)
		document.getElementById("DiiceMess").remove();
	if (game.winner == 0) {
		document.getElementById("dice").innerHTML = "<img  src='ImagesDice/dice.png'  height=50 width=50></div>";
		document.getElementById("Playing").innerHTML = "<h2>Playing: " + game.playing.name + " </h2>";
		document.getElementById("Color").innerHTML = "<h3>With color: " + game.playing.color + " </h3>";
		document.getElementById("round").innerHTML = "<h3>Round Number: " + game.round + " </h3>";
	} else {
		if (document.getElementById("Playing"))
			document.getElementById("Playing").remove();
		if (document.getElementById("Color"))
			document.getElementById("Color").remove();
		endGame(game.winner);
	}


}


// Dice Roll
function DiceAnimation() {
	return new Promise((resolve, reject) => {
		setTimeout(function () {
			let val = Math.floor(Math.random() * 6);
			val = Math.floor(Math.random() * 6);
			document.getElementById("dice").innerHTML = "<img  src='imagesDice/" + dice[val] + ".png'  height=50 width=50></div>";
			resolve(val);
		}, 150);
	});
}

async function RollDice() {
	document.getElementById("dice").disabled = true;
	document.getElementById("move").disabled = true;
	if (document.getElementById("SpanWarn")) {
		document.getElementById("SpanWarn").remove();
	}
	if (document.getElementById("SpecialMess")) {
		document.getElementById("SpecialMess").remove();
	}
	let val;
	var firstCall = Date.now();
	//  add 1.9 seconds
	playSound('DiceRoll.mp3');
	var lastCall = firstCall + 1700;
	try {
		// while loop with timer
		while (firstCall < lastCall) {
			val = await DiceAnimation();
			firstCall = Date.now();
		}
		game.diceNum = val + 1;
		document.getElementById("DiceNumber").innerHTML = "<h3 id='DiiceMess'>Dice Number: " + dice[val] + " </h3>";
		document.getElementById("move").disabled = false;

	} catch (error) {
		console.error(error);
	}

}

function endGame(winner) {
	// the game has ended
	game.started = false;
	document.getElementById("move").style.display = 'none';
	document.getElementById("dice").style.display = 'none';
	document.getElementById("winner").innerHTML = "<h3>Player" + winner + " won the game </h3>";
	if (document.getElementById("Cheat").textContent == "Cheats on") {
		EnableCheat();
	}
	alert("Player" + winner + " Won!!!!");

}

// Sound effects
async function playSound(fileName) {
	return new Promise((resolve, reject) => {
		const audio = new Audio("audio/" + fileName);
		audio.play();
		audio.onended = () => {
			resolve();
		};
		audio.onerror = (error) => {
			reject(error);
		};
	});
}

// All in :)
async function showModal() {
	playSound("Chips.mp3");
	setTimeout(function () {
		document.getElementById("Odds").innerHTML = "<h3 id='SpecialMess'>You got " + (100 - Chance()) + "% chance to win</h3>";
		document.getElementById("myModal").style.display = "block";
	}, 500);
	return new Promise((resolve) => {
		let result;
		const AllInButton = document.getElementById("PushBt");
		const CancelButton = document.getElementById("cancelBt");

		AllInButton.addEventListener("click", async () => {
			result = await AllIn();
			document.getElementById("myModal").style.display = "none";
			AllInButton.removeEventListener("click", arguments.callee);
			resolve(result);
		}, { once: true }); // remove the listener after that

		CancelButton.addEventListener("click", async () => {
			await Stay();
			document.getElementById("myModal").style.display = "none";
			playSound("boo.mp3");
			CancelButton.removeEventListener("click", arguments.callee);
			resolve(game.playing.postition);
		}, { once: true }); // remove the listener after that

	});
}
async function AllIn() {
	return new Promise((resolve) => {
		let Possibility = Chance();
		let value = Math.floor(Math.random() * 100) + 1;
		let res;
		let mess;
		if (value > Possibility) {
			mess = " (won)"
			res = 90;
		} else {
			mess = " (Lost)"
			res = 1;
		}
		document.getElementById("SpecialEvent").innerHTML = "<h3 id='SpecialMess'>All in: " + value + mess + " </h3>";
		resolve(res);

	});

}

async function Stay() {
	return new Promise((resolve) => {
		alert("Pussy");
		resolve();
	});
}

function Chance() {
	let pos = game.playing.postition;
	let tileStr = cells[pos].to.split(" ")[2];
	return Number(tileStr.split("%")[0]);
}
