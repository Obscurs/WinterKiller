var io = require('socket.io').listen(4242);
io.set('log level', 1);




// Pos.js

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
	color : undefined

}




function Map () {
	this.cells = {};
}
Map.prototype.getCellAt = function (pos) {

	var index = pos.getIndex();
	var cell = this.cells[index];

	if (cell === undefined) {
		cell = new Cell (index);
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
}


Player.prototype = {
	range:6,
	PColors : ["#7AFF05", "#2E38FF", "#D60068", "#50231B", "#7A2947", "#A7C44F", "#AC3993"]
}



var players = {};
var mapa = new Map();
var cellColors = ["#67AC39", "#246B34", "#4D862D"];

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


io.sockets.on('connection', function (socket) {
	// Envía la lista de players al nou player


	socket.on('userConnected', function (username) {
		var posini = new Pos(0,0);
		var player = new Player (username, socket.id, posini);
		players[socket.id] = player;
		mapa.getCellAt(player.pos);
		mapa.cells[player.pos.getIndex()].playerId = socket.id;
		donaMapaIni(player.pos, player.range, socket);
		var cell = mapa.cells[player.pos.getIndex()].playerId;
		//socket.broadcast.emit('donaCell', cell);
		//socket.broadcast.emit('updateCells');
		UpCells2();


	});

	socket.on('playerUpdate', function (char){
		pl=players[socket.id];
		var cx= pl.pos.x;
		var cy= pl.pos.y;
		if(char=='A' && mapa.cells[(cx-1) + "x" + (cy)].playerId === undefined) {
			mapa.cells[pl.pos.getIndex()].playerId = undefined;
			--pl.pos.x;
		}
		if(char=='D' && mapa.cells[(cx+1) + "x" + (cy)].playerId === undefined) {
			mapa.cells[pl.pos.getIndex()].playerId = undefined;
			++pl.pos.x;
		}
		if(char=='W' && mapa.cells[(cx) + "x" + (cy-1)].playerId === undefined) {
			mapa.cells[pl.pos.getIndex()].playerId = undefined;
			--pl.pos.y;
		}
		if(char=='S' &&mapa.cells[(cx) + "x" + (cy+1)].playerId === undefined) {
			mapa.cells[pl.pos.getIndex()].playerId = undefined;
			++pl.pos.y;
		}
		mapa.cells[pl.pos.getIndex()].playerId = socket.id;
		donaMapaIni(pl.pos, pl.range, socket);
		//socket.broadcast.emit('updateCells');
		UpCells2();
	});
	socket.on('upCells', function(){
		var player= players[socket.id];
		donaMapaIni(player.pos, player.range, socket);
	});

	socket.on('disconnect', function () {
		mapa.cells[players[socket.id].pos.getIndex()].playerId = undefined;
		//socket.broadcast.emit('updateCells');
		UpCells2();
		delete players[socket.id];
		socket.broadcast.emit('elimina', socket.id);
	});

});