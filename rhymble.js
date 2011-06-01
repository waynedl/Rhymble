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

    /**
     * from file
     */
    this.get_round = function(){
        $.ajax({
                url:  './rhymbes.json'
            ,   async: false
            ,   dataType: 'json'
            ,   success: function(data){
					n = get_random_in_range(0, data.length);
					R.round = data[n];
					R.round.rhyme_map = {};
					$.each(R.round.rhymes, function(k, v){
					    var len = v.length;
					    if (R.round.rhyme_map[len] == undefined){
					        R.round.rhyme_map[len] = new Array();
					    }                    
					    R.round.rhyme_map[len].push(v);
					});
					
					$('body').trigger('finishedLoadingRound');

				}
        })

    }


    R.draw_round = function(){
        $('#title').html(R.round.word);

        $('#board').html('');        
        $.each(R.round.rhyme_map, function(k, v){
            var n_letters = v[0].length;
            var width = n_letters * 15;
            var div = $('<div class="column" id="'+n_letters+'"></div>');
            div.css('width',width);
            for (var n in v){
                var word = v[n];
                var r_div = $('<div></div>');
                r_div.attr('title',word);
                r_div.attr('class','rhyme');
                r_div.attr('id',word);
                r_div.css('width',width);
                r_div.html('<span>'+word+'</span>');
                div.append(r_div);
            }
            $('#board').append(div);
            
            $('INPUT[name=input]').focus();
            $('INPUT[name=input]').val('');
        });
        
    }

    $('INPUT[name=input]').keyup(function(e){
        e.stopPropagation();
        e.preventDefault();
        
        // Enter key is pressed
        if (e.keyCode == 13) {
            var v = $('INPUT[name=input]').val().toUpperCase();
            R.to_buffer(v);
            if (v == ''){return null}
            var match = ($('#'+v).attr('id') != undefined);
            if (match) {
                message(v,true);
                $('#'+v+' SPAN').slideDown(800);
                $('INPUT[name=input]').val('');
                score += Math.round(v.length * (v.length / 2));
                // "Worse" -Kaz Laporte
                // score += v.length * v.length ;
                $('#score').html(score);
            } else {
                message(v, false);
                $('INPUT[name=input]').val('');
            }
            
        // Up arrow key is pressed
        } else if (e.keyCode == 38){
            $('INPUT[name=input]').val(R.buffer[R.buffer_index]);
            R.buffer_index += 1;
            if (R.buffer_index >= R.buffer_length){
                R.buffer_index = 0;
            }
        }
    });

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
    
    $(document).ready(function(){
        
        $('#score').html(score);
        
        $('INPUT[name=give-up]').click(function(e){
            e.stopPropagation();
            e.preventDefault();
            $('.rhyme SPAN').slideDown(800);
            $('INPUT[name=input]').focus();
        });
        
        $('INPUT[name=new]').click(function(e){
            e.stopPropagation();
            e.preventDefault();
            G.getNextRound();
            $('INPUT[name=input]').focus();
        });
        
        G.timer();

    });
    
    return true
};

function message(msg,match){
    $('#message').html('<span>'+msg+'</span>');
    $('#message').slideDown(200);
    if (match) {
        $('#message SPAN').addClass('match');
    } else {
        $('#message SPAN').addClass('not-match');
    }
    window.setTimeout(function(){
        $('#message').fadeOut(700);
    }, 400 );
};


$(document).ready(function(){
    g = new Game();
    g.getNextRound();
    
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

