var io = require('socket.io').listen(4242);
io.set('log level', 1);




// Pos.js
var randoment = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, "arbre", "arbre2", "arbre3"];
function Pos (x,y) {
	this.x = x;
	this.y = y;
}
Pos.prototype.getIndex = function () {
	return this.x+"x"+this.y;
}
Pos.prototype.toString = function () {
	return this.getIndex();
}
Pos.prototype.clone = function () {
	return new Pos (this.x,this.y);
}





var CELL_EDGE = 50;

function Cell (id) {
	this.id=id;
	this.color = this.cellColors[Math.floor(Math.random()*this.cellColors.length)];
}

Cell.prototype = {

	playerId : undefined,
	cellColors : ["#67AC39", "#246B34", "#4D862D"],
	color : undefined,
	entity : undefined,
}




function Map () {
	this.cells = {};
}
Map.prototype.getCellAt = function (pos) {

	var index = pos.getIndex();
	var cell = this.cells[index];

	if (cell === undefined) {
		cell = new Cell (index);
		cell.entity = randoment[Math.floor(Math.random()*randoment.length)];
		this.cells[index] = cell;

	}
	return cell;

}







function Player(user, id, pos){
	this.id = id;
	this.user = user;
	this.edge = CELL_EDGE;
	this.pos = pos;
	this.color = this.PColors[Math.floor(Math.random()*this.PColors.length)];
	this.range = 7;
	this.life = 100;
	this.wood = 0;
	this.iron = 0;
	this.gold = 0;
}


Player.prototype = {
	//range:10,
	PColors : ["#7AFF05", "#2E38FF", "#D60068", "#50231B", "#7A2947", "#A7C44F", "#AC3993"]
}

function Entity(id, blc, sizex, sizey, dx, dy){
	this.id=id;
	this.bloqueja = blc;
	this.edge=CELL_EDGE;
	this.sizex = sizex;
	this.sizey = sizey;
	this.dx = dx;
	this.dy = dy;

}


var players = {};
var entitys = {};
var mapa = new Map();
var cellColors = ["#67AC39", "#246B34", "#4D862D"];
entitys["arbre"] = new Entity("arbre", true, 1, 2.5,0,1.8);
entitys["arbre2"] = new Entity("arbre2", true, 1, 3,0,2.3);
entitys["arbre3"] = new Entity("arbre3", true, 1, 2,0,1.2);

function donaEntys(socket){
	socket.emit('donaEntys', entitys);
}

function dist(pos1,pos2){
	return Math.sqrt(Math.pow(pos1.x-pos2.x,2)+Math.pow(pos1.y-pos2.y,2));
}
function donaMapaIni2(pos, range, socket){
	var mapEnviat = new Map();
	for(var i=pos.x-range; i<pos.x+range+1; ++i){
		for(var j=pos.y-range; j<pos.y+range+1;++j){
			var coor = new Pos(i, j);
			var cell = mapa.getCellAt(coor);
			mapEnviat.cells[coor] = cell;
			if(cell.playerId !== undefined) socket.emit('playerUpdate', players[cell.playerId]);
		}
	}
	socket.emit('donaCell', mapEnviat);
}

function donaMapaIni(pos, range, socket){
	var mapEnviat = new Map();
	for(var i=pos.x-range; i<pos.x+range+1; ++i){
		for(var j=pos.y-range; j<pos.y+range+1;++j){
			var coor = new Pos(i, j);
			var d = dist(coor,pos);
				if(d<=range){
					var cell = mapa.getCellAt(coor);	
					mapEnviat.cells[coor] = cell;
					if(cell.playerId !== undefined) socket.emit('playerUpdate', players[cell.playerId]);
				}
		}
	}
	socket.emit('donaCell', mapEnviat);
}

function UpCells2(){
	for(var pl in players){
		var ppos = players[pl].pos;
		var prange = players[pl].range;
		var psocketId = players[pl].id;
		donaMapaIni(ppos, prange, io.sockets.sockets[psocketId]);
	}
	
}
function mataloh(id){
	io.sockets.sockets[id].disconnect();
}

function compMov(pl, pos2){
	var spos = (pos2.x) + "x" + (pos2.y);
	if(mapa.cells[spos].playerId === undefined){
		if(mapa.cells[spos].entity !== undefined){
			if(entitys[mapa.cells[spos].entity].bloqueja === true) return false;
			else return true;
		}
		else return true
	} 
	else return false;
}

function atacar(pos){
	if(mapa.cells[pos.getIndex()].playerId !== undefined){
		var enemy = players[mapa.cells[pos.getIndex()].playerId];
		enemy.life=enemy.life-10;
		if(enemy.life<0) mataloh(enemy.id);
	}
}

io.sockets.on('connection', function (socket) {
	// Envía la lista de players al nou player
	console.log("user connected");

	socket.on('userConnected', function (username) {
		var posini = new Pos(0,0);
		var player = new Player (username, socket.id, posini);
		donaEntys(socket);
		players[socket.id] = player;
		mapa.getCellAt(player.pos);
		mapa.cells[player.pos.getIndex()].playerId = socket.id;
		//mapa.cells[player.pos.getIndex()].entity = "arbre";
		donaMapaIni(player.pos, player.range, socket);
		//var cell = mapa.cells[player.pos.getIndex()].playerId;
		UpCells2();


	});

	socket.on('playerUpdate', function (char){
		pl=players[socket.id];
		var cx= pl.pos.x;
		var cy= pl.pos.y;
		if(char=='A') {
			var move = compMov(pl, new Pos(cx-1,cy));
			if(move===true){
				mapa.cells[pl.pos.getIndex()].playerId = undefined;
				--pl.pos.x;
			}
		}
		//else if(char=='A'){
		//	var enemy = players[mapa.cells[(cx-1) + "x" + (cy)].playerId];
		//	enemy.life=enemy.life-10;
		//}
		if(char=='D') {
			var move = compMov(pl, new Pos(cx+1,cy));
			if(move===true){
				mapa.cells[pl.pos.getIndex()].playerId = undefined;
				++pl.pos.x;
			}
		}

		if(char=='W') {
			var move = compMov(pl, new Pos(cx,cy-1));
			if(move===true){
				mapa.cells[pl.pos.getIndex()].playerId = undefined;
				--pl.pos.y;
			}
		}

		if(char=='S') {
			var move = compMov(pl, new Pos(cx,cy+1));
			if(move===true){
				mapa.cells[pl.pos.getIndex()].playerId = undefined;
				++pl.pos.y;
			}
		}
		if(char=='SPACE') {
			//cal fer animació
			atacar(new Pos(cx-1,cy));
			atacar(new Pos(cx+1,cy));
			atacar(new Pos(cx,cy-1));
			atacar(new Pos(cx,cy+1));
		}

		if(char=='9') {
			mapa.cells[pl.pos.getIndex()].entity = "arbre";

		}



		mapa.cells[pl.pos.getIndex()].playerId = socket.id;
		donaMapaIni(pl.pos, pl.range, socket);
		UpCells2();
	});

	socket.on('disconnect', function () {
		mapa.cells[players[socket.id].pos.getIndex()].playerId = undefined;
		UpCells2();
		delete players[socket.id];
		socket.broadcast.emit('elimina', socket.id);
	});

});