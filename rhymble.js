/**
 * @field
 */

score = 0;

/**
 * Model a Rhymble round
 * @constructor
 */

function Round(){
    
    var R = this;
    R.buffer = new Array();  // R.buffer_length most recent guesses
    R.buffer_length = 5;
    R.buffer_index = 0;

    R.load_success = function(data){
	n = get_random_in_range(0, data.length);
	R.round = data[n];
	$('body').trigger('finishedLoadingRound');
    };

    R.get_round = function(){
        $.ajax({
                url:  './assets/rhymbes.json'
            ,   async: false
            ,   dataType: 'json'
            ,   success: R.load_success
	});
    };


    R.draw_round = function(){

    };

    R.to_buffer = function(v){
        if (R.buffer[0] != v){
            R.buffer.unshift(v);
        }
        if (R.buffer.length > R.buffer_length) {
            R.buffer.pop();
        }
        R.buffer_index = 0;
    };


    $('#input FORM').submit(function(){
        // Do not ever submit this form.  It's only form to get tabindex.
        return false
    });

    $('body').bind('finishedLoadingRound',R.draw_round);

    R.get_round()

    return true

};


/**
 * Model a Rhymble game
 * @constructor
 */

function Game(){
    var G = this;
    G.rounds = new Array();
    G.nextRound = 0;
    G.n_rounds = 10;
    G.time = 1 * 60;  // 1 minutes of seconds 

    G.resize = function(){
	// Keyboard Buttons
	var w = ($(window).width() / 10) - 5;
	$('.key').css({width: w+'px'});
	$('#row2, #row3').css({paddingLeft: w/2});

	// Round area
	var round_height = $(window).height() - 200; 
	$('#round').height(round_height);

    }

    G.draw_keyboard = function(){
	var keyboard = $('#keyboard');
	function make_row_of_buttons(n_row, row){
	    var div = $('#row'+n_row);
	    if (n_row==3){div.append('<img class="key" id="go_button" src="images/go.png" />');}
            $.each(row, function(k,v){
		div.append('<div class="key" letter="'+v+'"><span>'+v+'</span></div>');    
	    });
	    if (n_row==3){div.append('<img class="key" id="del_button" src="images/del.png" />');}
	    keyboard.append(div);
	}
	make_row_of_buttons(1, 'qwertyuiop');
	make_row_of_buttons(2, 'asdfghjkl');
	make_row_of_buttons(3, 'zxcvbnm');
	
	
	$('.key').bind('tap', function(e){
	    e.stopPropagation();
	    e.stopImmediatePropagation();
	    var letter = $(this).attr('letter');
	    $('#text_area').append('<span>'+letter+'</span>');
	    var tap_mask = $('<span class="mask">&nbsp;</span>'); 
	    $(this).append(tap_mask);
	    tap_mask.animate({opacity: 0}, function(){$(this).remove();})
	    return false;
	});
	
    };

    
    G.getNextRound = function (){
        if (G.rounds == G.n_rounds){
            G.gameOver();
        }
        else {
            G.rounds.push(new Round());
            G.nextRound += 1;
        }
    };
    
    G.gameOver = function(){
        clearInterval(G.intervalID);
        $('INPUT[name=give-up]').trigger('click');
        $('INPUT').unbind();
        $('INPUT').blur();
        $('body').append('<div id="cover"></div>');
        $('body').append('<h1 id="game-over">score: <span id="final-score">'+score+'</span></h1>');
        $('#cover').show(600);        
    };

    G.timer = function(){
        G.intervalID = setInterval('decrementTimer()', 1000);

        decrementTimer = function (){
            $('#minutes').html((G.time/60).toString().split('.')[0]);
            var seconds = (G.time % 60).toString();
            seconds = seconds.length==1?'0'+seconds:seconds;
            $('#seconds').html(seconds);
            if (G.time < 1) { G.gameOver(); }
            G.time -= 1;
        }

    };
    
    G.draw_keyboard();
    G.resize();
    G.getNextRound();
    
    return true
};

function msg(msg){
    $('#text_area').html(msg);
};


$(document).ready(function(){
    g = new Game();
})



if (!window.console || !console)
{
  var names = ["log", "debug", "info", "warn", "error", "assert", "dir", 
               "dirxml", "group", "groupEnd", "time", "timeEnd", "count", 
               "trace", "profile", "profileEnd"];
  window.console = {};
  for (var i = 0; i < names.length; ++i)
    window.console[names[i]] = function() {}
}

function get_random_in_range(M, N){
	return num = Math.floor(M + (1+N-M)*Math.random());
};

var fixgeometry = function() {
    /* Some orientation changes leave the scroll position at something
     * that isn't 0,0. This is annoying for user experience. */
    scroll(0, 0);

    /* Calculate the geometry that our content area should take */
    var header = $(".header:visible");
    var footer = $(".footer:visible");
    var content = $(".content:visible");
    var viewport_height = $(window).height();
    
    var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    
    /* Trim margin/border/padding height */
    content_height -= (content.outerHeight() - content.height());
    content.height(content_height);

    g.resize();    

}; /* fixgeometry */

$(document).ready(function() {
    $(window).bind("orientationchange resize pageshow", fixgeometry);
});
