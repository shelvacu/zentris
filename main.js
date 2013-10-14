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
						pieces = [i,i,j,j,l,l,o,o,s,s,t,t,z,z];
				var type = pieces.splice(random(0, pieces.length-1), 1)[0]; 
				// remove a single piece
				return type;
		};

		//something?
		
		game.events = [];
		var EventTypes = 
				{UP:0,
				 DOWN:1,
				 LEFT:2,
				 RIGHT:3,
				 PAUSE:4,
				 ROTLEFT:5,
				 ROTRIGHT:6,
				 SPEEDUP:7,
				 SPEEDDOWN:8,
				 CHANGE:9,
				 DROP:10
				};
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
				if(game.rot < 0)
						game.rot = 4 + game.rot;
				write(game.piece,game.locX,game.locY,game.rot);
		}
		game.move = move;
		
		function testMove(x,y,rotc){
				if(rotc < 0)
						rotc = 4+rotc%4;
				eachblock(game.piece,game.locX,game.locY,game.rot,function(x,y){
						if(game.screen[y] && game.screen[y][x])
								game.screen[y][x].occupied = false;
				})
				var ret = false;
				var toX = game.locX+x;
				var toY = game.locY+y;
				var toRot = game.rot+rotc%4;
				if(!occupied(game.piece,game.locX+x,game.locY+y,(game.rot+rotc)%4)){
						move(x,y,rotc);
						ret = true;
				}
				//console.log(toX,toY,toRot,ret);
				eachblock(game.piece,game.locX,game.locY,game.rot,function(x,y){
						game.screen[y][x].occupied = true;
				})
				return ret;
		}
		
		game.testMove = testMove
		
		function checkForLines(){
				var linescleared = [];
				for(var i=0;i<game.screen.length;i++){
						var row = game.screen[i];
						var all = true;
						for(var j=0;j<row.length;j++){
								if(!row[j].occupied){
										all = false;
										break;
								}
						}
						if(all){
								linescleared.push(i);
						}
						linescleared = linescleared.sort(function(a,b){return a-b;});
				}
				console.log(linescleared);
				for(var i=0;i<linescleared.length;i++){
						var lineNum = linescleared[i];
						console.log('clearing',lineNum,'i',i,'length',linescleared.length);
						//TODO: add a score
						for(var j=lineNum;j>0;j--){
								var row = game.screen[j];
								var prevRow = game.screen[j-1];
								//console.log('moving row',j-1,'to',j);
								for(var z=0;z<row.length;z++){
										row[z].update(prevRow[z].color);
										row[z].occupied = prevRow[z].occupied;
								}
						}
						var last = game.screen[0]
						for(var k=0;k<last.length;k++){
								last[k].update("inherit");
								last[k].occupied = false;
						}
				}
		}
		game.checkForLines = checkForLines;
		
		function newPiece(){
				game.locY = 0;
				game.locX = 3;
				game.rot  = 2;
				nextPiece();
				write(game.piece,game.locX,game.locY,game.rot);
		}
		game.newPiece = newPiece;
				
		function mainLoop(){ //main loop, drop pieces etc
				if(!game.paused){
						if(game.locX == -1 && game.locY == -1){
								//starting, place random piece at the top
								newPiece();
						}
						if(!testMove(0,1,0)){
								newPiece();
								checkForLines();
						}
				}
				setTimeout(mainLoop,(1.0/game.speed)*1000)
		}
		mainLoop();

		function inputLoop(){
				var event
				while((event = game.events.pop()) != undefined){
						//console.log(event);
						e = EventTypes;
						switch(event){
						case e.UP:
								game.testMove(0,-1,0);
								break;
						case e.LEFT:
								game.testMove(-1,0,0);
								break;
						case e.RIGHT:
								game.testMove(1,0,0);
								break;
						case e.DOWN:
								game.testMove(0,1,0);
								break;
						case e.ROTRIGHT:
								game.testMove(0,0,1);
								break;
						case e.ROTLEFT:
								game.testMove(0,0,-1);
								break;
						case e.PAUSE:
								game.paused = !game.paused;
								break;
						case e.SPEEDUP:
								game.speed += 0.5;
								break;
						case e.SPEEDDOWN:
								game.speed -= 0.5;
								if(game.speed <= 0){game.speed = 0.5}
								break;
						case e.CHANGE:
								erase(game.piece,game.locX,game.locY,game.rot);
								newPiece();
								break;
						case e.DROP:
								while(testMove(0,1,0)){};
								checkForLines();
								newPiece();
								break;
						default:
								//uhhh
								console.log('invalid event:',event)
						}
				}
				setTimeout(inputLoop,10);
		}
		inputLoop();
				
		$('html').keydown(function(e){
				var v = EventTypes;
				var events = game.events;
				switch(e.which){
				case 87: //W
						events.push(v.UP);
						break;
				case 37: //left
				case 65: //A
						events.push(v.LEFT);
						break;
				case 40: //down
				case 83: //S
						events.push(v.DOWN);
						break;
				case 39: //right
				case 68: //D
						events.push(v.RIGHT);
						break;
				case 38: //up arrow key
				case 81: //Q
						events.push(v.ROTLEFT);
						break;
				case 69: //E
						events.push(v.ROTRIGHT);
						break;
				case 32: //SPACE
						events.push(v.DROP);
						break;
				case 187: //+
						events.push(v.SPEEDUP);
						break;
				case 189: //-
						events.push(v.SPEEDDOWN);
						break;
				case 82: //R
						events.push(v.CHANGE);
						break;
				case 80: //P
						events.push(v.PAUSE);
						break;
				default:
						console.log('unused event:',e.which);
				}
		});
		
		//game.paused = true;
		
})
