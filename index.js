var game = {
  generation: 0,
  board: [],
  preset: {
    name: 'Criss Cross',
    image: 'seed-000.png'
  },
  height: undefined,
  width: undefined,
  element: undefined,
  context: undefined,
  keepPlaying: false,
  makeBoard: function() {
    var outcome = [];
    for (var x = 0 ; x < this.width ; x++) {
      outcome[x] = [];
      for (var y = 0 ; y < this.height ; y++) {
        outcome[x][y] = false;
      }
    }
    return outcome;
  },
  setSize: function(height, width) {
    this.height = height;
    this.width = width;
    $("#board").attr("width", width).attr("height", height);
  },
  initialize: function() {
    //setup the board
    this.setSize(512, 512);
    this.board = this.makeBoard();
    this.positionBoard();
    
    //get canvas stuff
    this.element = $("#board").get(0);
    this.context = this.element.getContext("2d");
    
    //bind mouse events
    this.element.onmousemove = function(e) {
      event.preventDefault();
      //find x/y of mouse
      var rect = game.element.getBoundingClientRect();
      var x = Math.ceil(e.clientX - rect.left);
      var y = Math.ceil(e.clientY - rect.top);
      
      //update mouse location
      $('.position-x').text(x);
      $('.position-y').text(y);
      
      //should we draw?
      if (!game.element.isDrawing) {
        return;
      }
      game.fillPoint(x, y);
    };
    this.element.onmousedown = function(e) {
      event.preventDefault();
      game.element.isDrawing = true;
      
      //find x/y of mouse
      var rect = game.element.getBoundingClientRect();
      var x = Math.ceil(e.clientX - rect.left);
      var y = Math.ceil(e.clientY - rect.top);
      
      game.fillPoint(x, y);
    };
    this.element.onmouseup = function(e) {
      event.preventDefault();
      game.element.isDrawing = false;
    };
    this.element.mouseout = function(e) {
      event.preventDefault();
    };
    
    //load the seed image
    var imageObj = new Image();
    imageObj.onload = function() {
      game.context.drawImage(imageObj, 0, 0);
      
      var imgData = game.context.getImageData(0, 0, game.width, game.height).data;
      for (var x = 0 ; x < imageObj.width ; x++) {
        for (var y = 0 ; y < imageObj.height ; y++) {
          var red = imgData[((game.width * y) + x) * 4];
          var green = imgData[((game.width * y) + x) * 4 + 1];
          var blue = imgData[((game.width * y) + x) * 4 + 2];
          //var alpha = imgData[((game.width * y) + x) * 4 + 3];
          
          var alive = (red == 0 && green == 0 && blue == 0);
          game.board[x][y] = alive;
        }
      }
      
      game.drawBoard();
    };
    imageObj.src = this.preset.image;
    $('.preset-selected').text(this.preset.name);
  },
  drawBoard: function() {
    var newImage = this.context.getImageData(0, 0, this.width, this.height);
    for (var x = 0 ; x < this.width ; x++) {
      for (var y = 0 ; y < this.height ; y++) {
          newImage.data[((this.width * y) + x) * 4]     = this.board[x][y] ? 0 : 255; //red
          newImage.data[((this.width * y) + x) * 4 + 1] = this.board[x][y] ? 0 : 255; //green
          newImage.data[((this.width * y) + x) * 4 + 2] = this.board[x][y] ? 0 : 255; //blue
          newImage.data[((this.width * y) + x) * 4 + 3] = 255; //alpha
      }
    }
    this.context.putImageData(newImage, 0, 0);
    
    $(".generation").text(this.generation);
  },
  fillPoint: function(x, y) {
    game.context.fillRect(x, y, 1, 1);
    game.board[x][y] = true;
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
    if (x < 0) x = this.width - 1;
    if (x >= this.width) x = 0;
    if (y < 0) y = this.height - 1;
    if (y >= this.height) y = 0;
    
    return this.board[x][y];
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
  },
  positionBoard: function() {
    console.log($(window).height());
    $('.right').css({
      height: $(window).height()
    });
    $('.board-container').css({
      position:'relative',
      left: ($('.right').width() - $('.board-container').outerWidth())/2,
      top: ($('.right').height() - $('.board-container').outerHeight())/2
    });
  },
  controls: {
    restart: function(e) {
      game.keepPlaying = false;
      game.generation = 0;
      game.initialize();
    },
    next: function(e) {
      game.nextGeneration();
    },
    play: function(e) {
      game.keepPlaying = true;
      game.nextGeneration();
    },
    stop: function(e) {
      game.keepPlaying = false;
    },
    clear: function(e) {
      game.keepPlaying = false;
      game.generation = 0;
      game.board = game.makeBoard();
      game.drawBoard();
    }
  }
};


//controls
$('.btn-restart').click(game.controls.restart);
$('.btn-next').click(game.controls.next);
$('.btn-play').click(game.controls.play);
$('.btn-stop').click(game.controls.stop);
$('.btn-trash').click(game.controls.clear);

//preset conrols
$('[data-preset]').click(function(e) {
  game.controls.stop();
  game.preset.name = $(this).data('name');
  game.preset.image = $(this).data('preset');
  game.initialize();
});

//start the game of life
game.initialize();

$(window).resize(function(){
  game.positionBoard();
});
