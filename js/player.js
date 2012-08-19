jQuery(document).ready(function() {

    $.get('./timeout/index.xml', function(xml){
        var $img = $(xml).children('timeout').children('image');
        if( $img.length>0 ){
            $img.each(function(){
                $('#timeout').append('<img src="./timeout/'+$(this).text()+'" title="Click to begin" alt=""/>');
            });
            $('#timeout').each(function(){
                var to = this, t;
                this.init = function(){
                    $(this).show();
                    if( $(this).children('img').length>1 ){ t = setTimeout(function(){to.flick();}, 4000); }
                };
                this.flick = function(){
                    $(this).append($(this).children(':first-child').css({'opacity':0}).animate({'opacity':1}, 1000));
                    t = setTimeout(function(){ to.flick(); }, 4000);
                };
                this.reset = function(){
                    clearTimeout(t);
                    $(this).hide();
                    t = setTimeout(function(){ to.init(); }, 80000);
                };
                $(window).on('mousedown', function(e){ to.reset(); e.preventDefault(); });
                $('html').css({'cursor':'none'});
                this.init();
            });
        }
    });
    
    $.get('./site.xml', function(xml){
        var $menu = $(xml).children('site'),
            header = $menu.children('home').children('name').text(),
            $link = $menu.children('home').children('link');
        $('#menu').append('<h1>'+header+'</h1>');
        $link.each(function(){
            var $track = $menu.children($(this).text()),
                title = $track.children('menuname').text(),
                file = $track.children('video').text();
            $('#menu').append('<div class="button" data-file="'+file+'">'+title+'</div>');
        });
    });
    
    $('#menu').on('click', '.button', function(){
        var file = $(this).data('file');
        $('audio').children('source').remove();
        $('audio').append('<source src="'+file+'.mp3" type="audio/mpeg"></source><source src="'+file+'.ogg" type="audio/ogg"></source>');
        $('#menu').hide();
        $('#player').show()
    });
    
    $('#player').hide().each(function(){
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
