		var CELL_EDGE = 50;

		function Cell (id) {
			this.genBuffer();
		}
		Cell.prototype = {

			playerId : undefined,
			cellColors : ["#67AC39", "#246B34", "#4D862D"],
			color : "#333333",
			entity : undefined

		}
		Cell.prototype.genBuffer = function (ctx) {

			var buffer = document.createElement('canvas');
			buffer.width = CELL_EDGE;
			buffer.height = CELL_EDGE;
			var bufferCtx = buffer.getContext('2d');
			bufferCtx.fillStyle = this.color;
			bufferCtx.fillRect(0,0,CELL_EDGE,CELL_EDGE);
			this.buff = buffer;

		}
		Cell.prototype.updateWithCellData = function (data) {

			if (data === undefined) return;
			this.playerId = data.playerId;
			if (data.color !== undefined) this.color = data.color;
			if (data.id !== undefined) this.id = data.id;
			this.entity = data.entity;
				
		}