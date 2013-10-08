function ScreenBox(){
		this.div      = $("<div class='screen-block'>");
		this.color    = "#000"; //and valid css value is valid
		this.occupied = false;
		this.update   = function(color){
				//if color is provided, set first
				if(color){this.color = color}
				this.div.css({"background-color":this.color});
		};
		this.update();
}
$(document).ready(function(){
		window.game = {}; //Oh no! God object! The world's gonna end!
		game.screen = [];
		game.height = 20
		game.width  = 10
		for(var i=0;i<game.height;i++){
				game.screen[i] = [];
				var row = $("<div class='screen-row'>");
				$("#screen").append(row);
				for(var j=0;j<game.width;j++){
						var box = game.screen[i][j] = new ScreenBox();
						row.append(box.div);
				}
		}
		
		// A lot of code BORROWED from 
		// http://codeincomplete.com/posts/2011/10/10/javascript_tetris/ 
		// (the githup repo has an MIT licence, I'm fine. I think.)
		
		var DIR = {UP:0, RIGHT: 1, DOWN: 2, LEFT: 3, MIN: 0, MAX:3}
		
		var i = { blocks: [0x0F00, 0x2222, 0x00F0, 0x4444], color: 'cyan'   };
		var j = { blocks: [0x44C0, 0x8E00, 0x6440, 0x0E20], color: 'blue'   };
		var l = { blocks: [0x4460, 0x0E80, 0xC440, 0x2E00], color: 'orange' };
		var o = { blocks: [0xCC00, 0xCC00, 0xCC00, 0xCC00], color: 'yellow' };
		var s = { blocks: [0x06C0, 0x8C40, 0x6C00, 0x4620], color: 'green'  };
		var t = { blocks: [0x0E40, 0x4C40, 0x4E00, 0x4640], color: 'purple' };
		var z = { blocks: [0x0C60, 0x4C80, 0xC600, 0x2640], color: 'red'    };
		
		function eachblock(type, x, y, dir, fn) {
				var bit, result, row = 0, col = 0, blocks = type.blocks[dir];
				for(bit = 0x8000 ; bit > 0 ; bit = bit >> 1) {
						if (blocks & bit) {
								fn(x + col, y + row);
						}
						if (++col === 4) {
								col = 0;
								++row;
						}
				}
		};

		function getBlock(x,y){ game.screen[y][x].occupied }
		
		function occupied(type, x, y, dir) {
				var result = false
				eachblock(type, x, y, dir, function(x, y) {
						if ((x < 0) || (x >= nx) || (y < 0) || (y >= ny) || getBlock(x,y))
								result = true;
				});
				return result;
		};

		function unoccupied(type, x, y, dir) {
				return !occupied(type, x, y, dir);
		};
		
		var pieces = [];
		function randomPiece() {
				if (pieces.length == 0)
						pieces = [i,i,i,i,j,j,j,j,l,l,l,l,o,o,o,o,s,s,s,s,t,t,t,t,z,z,z,z];
				var type = pieces.splice(random(0, pieces.length-1), 1)[0]; // remove a single piece
				return type;
		};

		//something?
		
		var events = [];
		var EventTypes = 
				{UP:0,
				 DOWN:1,
				 LEFT:2,
				 RIGHT:3,
				 PAUSE:4,
				 I:5,
				 J:6,
				 L:7,
				 O:8,
				 S:9,
				 T:10,
				 Z:11};
		var paused = false;
		var rot  =  0;
		var locX = -1;
		var locY = -1;
		game.piece = randomPiece();
		game.next  = randomPiece();
		
		function nextPiece(){
				game.piece = game.next;
				game.next  = randomPiece();
		}
		function erase(piece,x,y,rot){
				eachblock(piece,x,y,rot,function(x,y){
						game.screen[y][x].
				})
		}
		function mainLoop(){ //main loop, drop pieces etc
				if(!paused){
						if(locX == -1 && loxY == -1){
								//starting, place random piece at the top
								locY = 0;
								locX = 3;
								rot  = 2;
								nextPiece();
						}
						if(occupied(game.piece,locX,locY+1,rot)){
								locY = 0;
								locX = 3;
								rot  = 2;
								nextPiece();
						}else{
								
		}
		mainLoop();
		
})