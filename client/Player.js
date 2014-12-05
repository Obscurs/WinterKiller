


var playerImage = new Image();
playerImage.src = "images/plImage.png";


function Player(id, edge, username){
	this.id = id;
	this.edge = edge;
	this.user = username;
	this.range = 6;
	this.life = 1;
	this.wood = 0;
	this.iron = 0;
	this.gold = 0;
	this.vpos = new Pos(0,0)
}


Player.prototype = {
	color : '#FFFFFF',
	pos : new Pos(0,0),
	

}
var apretat = false;

Player.prototype.render = function (ctx){
	//ctx.fillStyle = this.color;
	//ctx.fillRect(this.edge*this.pos.x, this.edge*this.pos.y, this.edge, this.edge);
	//ctx.drawImage(playerImage, this.edge*this.pos.x, this.edge*this.pos.y, this.edge, this.edge); //quadrat
	//ctx.drawImage(playerImage, this.edge*this.pos.x, this.edge*this.pos.y-this.edge/2, this.edge, this.edge*1.5); //rectangular
	//ctx.drawImage(playerImage, this.edge*this.pos.x+this.edge/3.5, this.edge*this.pos.y-this.edge/4, this.edge/2, this.edge*1); //standard
	ctx.drawImage(playerImage, this.vpos.x+this.edge/3.5, this.vpos.y-this.edge/4, this.edge/2, this.edge*1); //new
	if(this.life>=70)ctx.fillStyle = 'green';
	else if(this.life>=30)ctx.fillStyle = 'yellow';
	else ctx.fillStyle = 'red';
	ctx.fillRect(this.vpos.x, this.vpos.y-this.edge/1.25, this.edge*this.life/100, this.edge/3);
	context.fillStyle = '#000000';
	context.font="20px Georgia";
	context.fillText(this.user, this.vpos.x,this.vpos.y-this.edge/2);
}
Player.prototype.render2 = function (ctx){
	ctx.fillStyle = 'white'
	ctx.font= "30px Georgia";
	ctx.fillText("Wood: "+ this.wood,20,20);
	ctx.fillText("Iron: "+ this.iron,20,50);
	ctx.fillText("Gold: "+ this.gold,20,80);
	ctx.fillText("Health: " + this.life, canvas.width-200, 20);
}


Player.prototype.logic = function (dt) {
	if (kb.char('A') && !apretat) {
		apretat = true;
		socket.emit('playerUpdate', 'A');
		--this.pos.x;
	}
	else if (kb.char('D') && !apretat) {
		apretat = true;
		socket.emit('playerUpdate', 'D');
		++this.pos.x;
	}
	if (kb.char('W') && !apretat) {
		apretat = true;
		socket.emit('playerUpdate', 'W');
		--this.pos.y;
	}
	else if (kb.char('S') && !apretat) {
		apretat = true;
		socket.emit('playerUpdate', 'S');
		++this.pos.y;
	}
	if (kb.keys['32'] && !apretat) {
		apretat = true;
		socket.emit('playerUpdate', 'SPACE');
	}
	if (kb.char('9') && !apretat) {
		apretat = true;
		socket.emit('playerUpdate', '9');
	}
	this.vpos.x += (this.pos.x*this.edge-this.vpos.x)/(dt);
	this.vpos.y += (this.pos.y*this.edge-this.vpos.y)/(dt);
}
Player.prototype.logicNotMe = function(dt) {
	this.vpos.x += (this.pos.x*this.edge-this.vpos.x)/(dt);
	this.vpos.y += (this.pos.y*this.edge-this.vpos.y)/(dt);
}


document.addEventListener("keyup", function(e) {
	if(apretat) if(e.keyCode == 87 || e.keyCode == 83 ||
		e.keyCode == 65 ||e.keyCode == 68 ||e.keyCode == 32 ||e.keyCode == 57) apretat = false;
});


Player.prototype.updateWithPlayerData = function (data) {


	if (data.user !== undefined) this.user = data.user;
	if (data.pos !== undefined) this.pos = new Pos(data.pos.x, data.pos.y);
	if (data.edge !== undefined) this.edge = data.edge;
	if (data.id !== undefined) this.id = data.id;
	if (data.color !== undefined) this.color = data.color;
	if (data.range !== undefined) this.range = data.range;
	if (data.life !== undefined) this.life = data.life;
	if (data.wood !== undefined) this.wood = data.wood;
	if (data.iron !== undefined) this.iron = data.iron;
	if (data.gold !== undefined) this.gold = data.gold;

}

