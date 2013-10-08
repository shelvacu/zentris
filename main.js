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

		game.getBlock = function(x,y){ return game.screen[y][x].occupied }
		
		function occupied(type, x, y, dir) {
				var result = false
				eachblock(type, x, y, dir, function(x, y) {
						if ((x < 0) || (x >= game.width) || (y < 0) || (y >= game.height) || game.getBlock(x,y)){
								result = true;
								//console.log("collision",x,y);
						}
				});
				return result;
		};

		function unoccupied(type, x, y, dir) {
				return !occupied(type, x, y, dir);
		};
		
		function random(min, max){ 
				return (min + (Math.random() * (max - min)));
		}
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
				 ROTLEFT:5,
				 ROTRIGHT:6,
				 SPEEDUP:7,
				 SPEEDDOWN:8};
		game.paused = false;
		game.pause = function(){game.paused = !game.paused};
		game.rot  =  0;
		game.locX = -1;
		game.locY = -1;
		game.speed = 1;
		game.piece = randomPiece();
		game.next  = randomPiece();
		
		function nextPiece(){
				game.piece = game.next;
				game.next  = randomPiece();
		}

		function set(piece,x,y,rot,yes){ //yes is a variable I don't feel like explaining figure it out
				eachblock(piece,x,y,rot,function(x,y){
						var spot = game.screen[y][x];
						spot.occupied = yes;
						spot.update(yes ? piece.color : 'inherit');
				})
		}
		function erase(a,b,c,d){set(a,b,c,d,false)}
		function write(a,b,c,d){set(a,b,c,d,true)}
		
		function move(x,y,rotChange){
				erase(game.piece,game.locX,game.locY,game.rot);
				game.locX += x;
				game.locY += y;
				game.rot  += rotChange;
				game.rot = game.rot%4;
				write(game.piece,game.locX,game.locY,game.rot);
		}
		
		function testMove(x,y,rotc){
				if(!occupied(game.piece,game.locX+x,game.locY+y,game.rot+rotc)){
						move(x,y,rotc);
						return true;
				}
				return false;
		}
		
		game.testMove = testMove
				
		function mainLoop(){ //main loop, drop pieces etc
				var event
				while(event = events.pop()){
						e = EventTypes;
						switch(event){
						case e.UP:
								testmove(0,-1,0);
								break;
						case e.LEFT:
								testmove(-1,0,0);
								break;
						case e.RIGHT:
								testmove(1,0,0);
								break;
						case e.DOWN:
								testmove(0,1,0);
								break;
						case e.ROTRIGHT:
								testmove(0,0,1);
								break;
						case e.ROTLEFT:
								testmove(0,0,-1);
								break;
						case e.PAUSE:
								game.paused = !game.paused;
						case e.SPEEDUP:
								game.speed += 0.5;
								break;
						case e.SPEEDDOWN:
								game.speed -= 0.5;
								if(game.speed <= 0){game.speed = 0.5}
								break;
						default:
								//uhhh
						}
				}
				if(!game.paused){
						if(game.locX == -1 && game.locY == -1){
								//starting, place random piece at the top
								game.locY = 0;
								game.locX = 3;
								game.rot  = 2;
								nextPiece();
						}
						/*if(occupied(game.piece,game.locX,game.locY+1,rot)){
								game.locY = 0;
								game.locX = 3;
								rot  = 2;
								nextPiece();
						}else{
								move(0,1,0);
						}*/
						if(!testMove(0,1,0)){
								game.locY = 0;
								game.locX = 3;
								game.rot = 2;
								nextPiece();
						}
				}
				setTimeout(mainLoop,(1.0/game.speed)*1000)
		}
		mainLoop();
		//game.paused = true;
		
})
