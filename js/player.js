jQuery(document).ready(function() {

    $('#player').append('<audio preload="metadata"><source src="test.wav" type="audio/wav"></source><source src="test.ogg" type="audio/ogg"></source></audio>');
    
    var supportsAudio = !!document.createElement('audio').canPlayType,
        audio, loaded = 0, manualSeek = 0, vol = 0.7;

    if( supportsAudio ){
        audio = $('audio').get(0);
                
        audio.volume = vol;
        
        $('#vol').slider({
            min:0.4,
            max:1,
            step:0.01,
            value:vol,
            animate:true,
            slide:function(e,ui){
                audio.volume = ui.value;
            }
        });
        
        if( (audio.buffered !== undefined) && (audio.buffered.length !== 0) ){
            $(audio).on('progress', function(){
                var loaded = parseInt(((audio.buffered.end(0)/audio.duration)*100),10);
                $('#loading').css({'width':loaded+'%'});
            });
        }else{
            $('#loading').remove();
        }
        
        $(audio)
        .on('timeupdate', function(){
            var rem = parseInt(audio.duration-audio.currentTime,10),
                    pos = (audio.currentTime/audio.duration)*100,
                    mins = Math.floor(rem/60,10),
                    secs = rem-mins*60;
            
            $('#time').text('-'+mins+':'+ (secs<10 ? '0'+secs : secs));
            if( !manualSeek ){ $('#prog>.knob').css({left:pos+'%'}); }
            if( !loaded ){
                loaded = true;
                $('#prog').slider({
                    step:0.01,
                    max:audio.duration,
                    animate:true,
                    slide:function(){
                        manualSeek = true;
                    },
                    stop:function(e,ui){
                        manualSeek = false;
                        audio.currentTime = ui.value;
                    }
                });
            }
        }).on('play',function(){
            $('#play').addClass('playing');
        }).on('pause ended', function(){
            $('#play').removeClass('playing');
        });		
        
        $('#play').click(function(){
            if( audio.paused ){ audio.play(); } 
            else{ audio.pause(); }			
        });
    }
    
});