jQuery(document).ready(function() {

    $('audio').append('<source src="test.wav" type="audio/wav"></source><source src="test.ogg" type="audio/ogg"></source>');
    
    $('#player').each(function(){
        if( !!document.createElement('audio').canPlayType ){
            var audio = $('audio').get(0), 
                manualSeek = 0, 
                vol = 0.7;
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
            $(audio).on('loadeddata', function(){
                var t = parseInt(audio.duration,10),
                    m = Math.floor(t/60,10),
                    s = t-m*60;
                $('#time').text((m<10?'0'+m:m)+':'+(s<10?'0'+s:s));
            }).on('timeupdate', function(){
                var pos = (audio.currentTime/audio.duration)*100;
                if( !manualSeek ){
                    $('#progknob').css({left:pos+'%'});
                }
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
            }).on('play',function(){
                $('#play').addClass('playing');
            }).on('pause ended', function(){
                $('#play').removeClass('playing');
            });		
            $('#play').click(function(){
                if( audio.paused ){ audio.play(); } 
                else{ audio.pause(); }			
            });
        }else{
            $('audio').attr('controls','controls');
            $('#dash').hide();
        }
    });
    
});
