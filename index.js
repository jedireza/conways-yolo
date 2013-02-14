var game = {
  generation: 0,
  board: [],
  height: 512,
  width: 512,
  element: undefined,
  context: undefined,
  keepPlaying: false,
  makeBoard: function() {
    var outcome = [];
    for (var x = 0 ; x < this.height ; x++) {
      outcome[x] = [];
      for (var y = 0 ; y < this.width ; y++) {
        outcome[x][y] = false;
      }
    }
    return outcome;
  },
  initialize: function() {
    this.board = this.makeBoard();
    
    this.element = $("#board").get(0);
    this.context = this.element.getContext("2d");
    
    var imageObj = new Image();
    imageObj.onload = function() {
      game.context.drawImage(imageObj, 0, 0);
      
      var imgData = game.context.getImageData(0, 0, game.height, game.width).data;
      
      for (var x = 0 ; x < game.height ; x++) {
        for (var y = 0 ; y < game.width ; y++) {
          var red = imgData[((game.width * y) + x) * 4];
          var green = imgData[((game.width * y) + x) * 4 + 1];
          var blue = imgData[((game.width * y) + x) * 4 + 2];
          
          var alive = (red == 255 && green == 255 && blue == 255);
          game.board[x][y] = !alive;
        }
      }
      
      game.drawBoard;
    };
    imageObj.src = 'lena.png';
  },
  drawBoard: function() {
    var newImage = this.context.getImageData(0, 0, this.height, this.width);
    for (var x = 0 ; x < this.board.length ; x++) {
      for (var y = 0 ; y < this.board[x].length ; y++) {
          newImage.data[((this.width * y) + x) * 4]     = this.board[x][y] ? 0 : 255; //red
          newImage.data[((this.width * y) + x) * 4 + 1] = this.board[x][y] ? 0 : 255; //green
          newImage.data[((this.width * y) + x) * 4 + 2] = this.board[x][y] ? 0 : 255; //blue
          newImage.data[((this.width * y) + x) * 4 + 3] = 255; //alpha
      }
    }
    this.context.putImageData(newImage, 0, 0);
    
    $(".generation").text(this.generation);
  },
  nextGeneration: function() {
    var keepItGoing = game.keepPlaying;
    var nextBoard = this.makeBoard();
    
    for (var x = 0 ; x < this.height ; x++) {
      for (var y = 0 ; y < this.width ; y++) {
        var neighborCount = this.neighbors(x, y);
        
        //R1: any live cell with fewer than two live neighbors dies 
        if (this.get(x, y) === true && neighborCount < 2) {
          nextBoard[x][y] = false;
        }
        //R2: Any live cell with two or three live neighbors lives on to the next generation 
        if ((this.get(x, y) === true && neighborCount === 2) || neighborCount === 3) {
          nextBoard[x][y] = true;
        }
        //R3: any live cell with more than three live neighbors dies 
        if (this.get(x, y) === true && neighborCount > 3) {
          nextBoard[x][y] = false;
        }
        //R4: any dead cell with exactly three live neighbors becomes a live cell 
        if (this.get(x, y) === false && neighborCount === 3) {
          nextBoard[x][y] = true;
        }
        
        //should we interupt
        if(keepItGoing != game.keepPlaying) {
          return false;
        }
      }
    }
    
    this.board = nextBoard;
    
    this.generation++;
    this.drawBoard();
    
    if (game.keepPlaying) setTimeout("game.nextGeneration()", 1);
  },
  get: function(x, y) {
    //x = x % this.width;
    //y = y % this.height;
    
    if (x < 0) x = this.width - 1;
    if (x >= this.width) x = 0;
    if (y < 0) y = this.height - 1;
    if (y >= this.height) y = 0;
    
    return this.board[x][y];
  },
  set: function(x, y, z) {
    x = x % this.width;
    y = y % this.height;
    this.board[x][y] = v;
  },
  neighbors: function(x, y) {
    var count = 0;
    if (this.get(x + 1, y + 1)) { count++; }
    if (this.get(x + 1, y)) { count++; }
    if (this.get(x + 1, y - 1)) { count++; }
    if (this.get(x, y - 1)) { count++; }
    if (this.get(x - 1, y - 1)) { count++; }
    if (this.get(x - 1, y)) { count++; }
    if (this.get(x - 1, y + 1)) { count++; }
    if (this.get(x, y + 1)) { count++; }
    return count;
  }
};


//controls
$('.ctrl-restart').click(function(e) {
  game.keepPlaying = false;
  game.generation = 0;
  game.initialize();
  game.drawBoard();
});
$('.ctrl-next').click(function(e) {
  game.nextGeneration();
});
$('.ctrl-play').click(function(e) {
  game.keepPlaying = true;
  game.nextGeneration();
});
$('.ctrl-stop').click(function(e) {
  game.keepPlaying = false;
});

//start the game of life
game.initialize();

