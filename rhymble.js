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
    
    // iScroll dummies
    R.slots_scroll = {
	'1':	{refresh: function(){}},	
	'2':	{refresh: function(){}},	
	'3':	{refresh: function(){}}	
    };

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

    R.draw_slots = function(n_syllables, rhymes){
	var slots_ul = $('#slots'+n_syllables+' UL');
	$.each(rhymes, function(k, v){
	    slots_ul.append('<li class="slot" word="'+v+'" syllables="'+n_syllables+'" index="'+k+'"><span class="hidden_slot">'+v+'</span></li>');
	});
	R.slots_scroll[n_syllables] = new iScroll('slots'+n_syllables);
    }

    R.draw_round = function(){
	$('#prompt').html(R.round.prompt);
	if(R.round.rhymes[1]){R.draw_slots(1,R.round.rhymes[1]);}
	if(R.round.rhymes[2]){R.draw_slots(2,R.round.rhymes[2]);}
	if(R.round.rhymes[3]){R.draw_slots(3,R.round.rhymes[3]);}
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

    R.resize = function(){
	// Round area
	var round_height = $(window).height() - 200; 
	$('#round').height(round_height);
	
	// Slots and Scrolling
	var slots_height = round_height - $('#text_area').height();
	$('#slots').height(slots_height);
	R.slots_scroll[1].refresh();
	R.slots_scroll[2].refresh();
        R.slots_scroll[3].refresh();
    };

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
    G.this_round = null; // current Round object.
    G.n_rounds = 10;
    G.time = 5;  //seconds 
    G.current_guess = new Array();

    G.resize = function(){
	// Keyboard Buttons
	var w = ($(window).width() / 10) - 5;
	$('.key').css({width: w+'px'});
	$('#row2, #row3').css({paddingLeft: w/2});

    	// Let the round resize itself.
	if (G.this_round){G.this_round.resize();}
    }

    G.submit_guess = function(guess){
	alert(guess);
    };

    G.draw_keyboard = function(){
	var keyboard = $('#keyboard');
	function make_row_of_buttons(n_row, row){
	    var div = $('#row'+n_row);
	    if (n_row==3){div.append('<div class="key" letter="go"><img id="go_button" src="images/go.png" />');}
            $.each(row, function(k,v){
		div.append('<div class="key" letter="'+v+'"><span>'+v+'</span></div>');    
	    });
	    if (n_row==3){div.append('<div class="key" letter="del"><img id="del_button" src="images/del.png" />');}
	    keyboard.append(div);
	}
	make_row_of_buttons(1, 'qwertyuiop');
	make_row_of_buttons(2, 'asdfghjkl');
	make_row_of_buttons(3, 'zxcvbnm');
	
	$('.key').bind('tap', function(e){
	    e.stopPropagation();
	    e.stopImmediatePropagation();
    
	    // Typing in #text_area
	    var letter = $(this).attr('letter');
	    if (letter=='del'){
		G.current_guess.pop();
		$('#text_area').html(G.current_guess.join(''));
	    } else if (letter=='go'){
		var word = $();
		G.submit_guess(G.current_guess.join(''));
		G.current_guess = new Array();
		$('#text_area').html(G.current_guess.join(''));
	    } else {
	    	G.current_guess.push(letter);
		$('#text_area').html(G.current_guess.join(''));
	    }

	    // Animate tap
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
	    G.this_round = new Round();
            G.rounds.push(G.this_round);
        }
    };
    
    G.gameOver = function(){
        clearInterval(G.intervalID);
        $('body').append('<div id="round-over-mask"></div>');
        $('body').append('<h1 id="round-over">score: <span id="final-score">'+score+'</span></h1>');
        $('#round-over-mask').show(600);        
    };

    G.timer = function(){
        G.intervalID = setInterval('decrementTimer()', 1000);
	$('#clock').show();
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
    G.timer();	
    
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
