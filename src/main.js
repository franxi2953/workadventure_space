import { } from "https://unpkg.com/@workadventure/scripting-api-extra@^1";

// import { } from "../wa_bot/src/main.js";

WA.onInit().then(() => {

	// ADD/REMOVING BLOCKS

	//STATION FENCE
	var blocks_to_remove = []; //blocks to remove when entering the lab, add them when leaving the lab
	var blocks_to_add = []; //blocks to add when entering the lab, remove them when leaving the lab
	//loop from 26 to 32 (included)
	for (var i = 36; i <= 42; i++)
	{
		blocks_to_remove.push([i,18]);
		blocks_to_add.push([i,19]);
	}	
	blocks_to_remove.push([44,18]);
	blocks_to_remove.push([45,18]);
	blocks_to_add.push([44,19]);
	//attach the function to the area
	addRemoveBlocks(blocks_to_add, blocks_to_remove, "fence", "block", "Special/Block");
	//remove the fence from the layer "above_plater_1"
	addRemoveBlocks(blocks_to_remove, [], "fence", "fence_c", "above_player_1");
	addRemoveBlocks([[42,18],[45,18]], [], "fence", "fence_r", "above_player_1");
	addRemoveBlocks([[37,18],[39,18],[41,18]], [], "fence", "bench_u", "above_player_3");
	addRemoveBlocks([[38,18],[40,18],[42,18]], [], "fence", "flag_u", "above_player_3");

	entrance();
}
);

//entrance in the station
function entrance () {
	//diable player controls until the animation is finished
	WA.controls.disablePlayerControls();
	train_animation();
}

//train entrance
async function train_animation(iteration = 0) 
{
	var starting_cell = [69,26];
	var animation_length = (69 * 4) + 2; //69 tiles, 5 different frames
	var drop_tile = 34 + 3 ; //drop the player at tile 35 (the train is 3 tiles long)

	for (var j = 0; j < 6; j++)
	{
		for (var i = 0; i < 3; i++)
		{
			WA.room.setTiles([
				{ x: starting_cell[0] - parseInt(iteration/4) + j, y: starting_cell[1] + i, tile: 1 + j + 30*i + (iteration%4*6), layer: "train" },
			])
		}
	}

	if (iteration%4 == 0)
	{
		for (var i = 0; i < 3; i++)
		{
			WA.room.setTiles([
				{ x: starting_cell[0] - parseInt(iteration/4) + 6, y: starting_cell[1] + i, tile: null, layer: "train" },
			])
		}
	}
	
	// create a gaussian distribution, centered in 0 standard deviation of 4 and a maximun of 2000
	var time_out = 20 + gaussian(drop_tile - (iteration/4), 0, 2) * 100;

	if (iteration / 4 == drop_tile)
	{
		time_out = 2000;

		

		//log player coordinates
		var player_pos = await WA.player.getPosition();
		console.log(player_pos);
		await WA.player.moveTo(player_pos["x"], player_pos["y"] - 100, 10);
		

		//delay ultil the player is in the platform
		setTimeout(function() {
			//add the block to tile 35,27
			WA.room.setTiles([
				{ x: 35, y: 27, tile: "block", layer: "Special/Block" },
			])

			//enable player controls
			WA.controls.restorePlayerControls();
		}, 1000);
	}

	if (iteration < animation_length)
	{
		setTimeout(function() {train_animation(iteration+1)}, time_out);
	} 

}
				


function gaussian (x, mean, std) {
	return Math.exp(-Math.pow(x - mean, 2) / (2 * Math.pow(std, 2)));
}


// define a function that accept to arrays of blocks to add and remove and an area and create a exchange of blocks when entering and leaving the area
function addRemoveBlocks(blocks_to_add, blocks_to_remove, area, tile, layer) {
	//entering at area
	WA.room.area.onEnter(area).subscribe(() => {
		//for each block in blocks_to_add, add it to the area
		blocks_to_add.forEach(function(block) {
			WA.room.setTiles([
				{ x: block[0], y: block[1], tile: tile, layer: layer },
			])
		})

		//for each block in blocks_to_remove, remove it from the area
		blocks_to_remove.forEach(function(block) {
			WA.room.setTiles([
				{ x: block[0], y: block[1], tile: null, layer: layer },
			])
		})
	}
	);

	//leaving the area
	WA.room.area.onLeave(area).subscribe(() => {
		//for each in blocks_to_remove, add it to the area
		blocks_to_remove.forEach(function(block) {
			WA.room.setTiles([
				{ x: block[0], y: block[1], tile: tile, layer: layer },
			])
		})

		//for each in blocks_to_add, remove it from the area
		blocks_to_add.forEach(function(block) {
			WA.room.setTiles([
				{ x: block[0], y: block[1], tile: null, layer: layer },
			])
		})
	}
	);
}
