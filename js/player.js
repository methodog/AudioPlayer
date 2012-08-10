$(function() {
        initAudio();
    });

    function initAudio(){
        
        var supportsAudio = !!document.createElement('audio').canPlayType,
            audio,
            loading,
            progress,
            time,
            loaded = false,
            manualSeek = false;

        if(supportsAudio){
            
            var player = '\
                    <p id="player">\
                        <span id="playtoggle" />\
                        <span id="progress">\
                            <span id="loading" />\
                            <span class="knob ui-slider-handle" />\
                        </span>\
                        <span id="volume">\
                            <span class="knob ui-slider-handle" />\
                        </span>\
                        <span id="time" />\
                        <audio preload="metadata">\
                            <source src="test.wav" type="audio/wav"></source>\
                            <source src="test.ogg" type="audio/ogg"></source>\
                        </audio>\
                    </p>';
            
            $('body').append(player);
            
            audio = $('audio').get(0);
            loading = $('#loading');
            progKnob = $('#progress>.knob');
            time = $('#time');
            
            if ((audio.buffered !== undefined) && (audio.buffered.length !== 0)) {
                $(audio).bind('progress', function(){
                    var loaded = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10);
                    loading.css({width: loaded + '%'});
                });
            }
            else {
                loading.remove();
            }
            
            $(audio).bind('timeupdate', function(){
                
                var rem = parseInt(audio.duration - audio.currentTime, 10),
                        pos = (audio.currentTime / audio.duration) * 100,
                        mins = Math.floor(rem/60,10),
                        secs = rem - mins*60;
                
                time.text('-' + mins + ':' + (secs < 10 ? '0' + secs : secs));
                if (!manualSeek) { progKnob.css({left: pos + '%'}); }
                if (!loaded) {
                    loaded = true;
                    
                    $('#progress').slider({
                            value: 0,
                            step: 0.01,
                            orientation: "horizontal",
                            range: "min",
                            max: audio.duration,
                            animate: true,					
                            slide: function(){							
                                manualSeek = true;
                            },
                            stop:function(e,ui){
                                manualSeek = false;					
                                audio.currentTime = ui.value;
                            }
                        });
                }
                
            }).bind('play',function(){
                $("#playtoggle").addClass('playing');		
            }).bind('pause ended', function() {
                $("#playtoggle").removeClass('playing');		
            });		
            
            $("#playtoggle").click(function() {			
                if (audio.paused) {	audio.play();	} 
                else { audio.pause(); }			
            });

        }
        
        
    }