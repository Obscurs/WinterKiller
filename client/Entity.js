
//var entityImg = new Image();
//entityImg.src = "images/plImage.png";

function Entity(id, blc, sizex,sizey,dx,dy){
	this.id=id;
	this.bloqueja = blc;
	this.edge=CELL_EDGE;
	this.entityImg = new Image ();
	this.sizex = sizex;
	this.sizey = sizey;
	this.dx = dx;
	this.dy = dy;
}

Entity.prototype = {

}
Entity.prototype.render = function(ctx, pos){
	ctx.drawImage(this.entityImg, this.edge*pos.x-this.edge*this.dx, this.edge*pos.y-this.edge*this.dy, this.edge*this.sizex, this.edge*this.sizey);
	//ctx.drawImage(this.entityImg, this.edge*pos.x-this.edge*this.dx, this.edge*pos.y-this.edge*this.dy, this.edge*this.sizex, this.edge*this.sizey);
}