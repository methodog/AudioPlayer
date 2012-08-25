jQuery(document).ready(function() {

    $.get('./site.xml', function(xml){
        var $menu = $(xml).children('site'),
            header = $menu.children('home').children('name').text(),
            $link = $menu.children('home').children('link'),
            audio = $('audio').get(0);
        $('#menu').append('<h1>'+header+'</h1>');
        $link.each(function(){
            var t_id = $(this).text(),
                $xml = $menu.children(t_id),
                title = $xml.children('menuname').text(),
                file = $xml.children('video').text(),
                t_title = $xml.children('name').text();
            $('#menu').append('<a class="menu button" id="'+t_id+'" data-file="'+file+'" href="javascript:void(0)">'+title+'</a>');
            $.get(file+'.xml', function(t_xml){
                var $t_parts = $(t_xml).find('p'), 
                    t_html = '',
                    t_t = [];
                $t_parts.each(function(){
                    var t = $(this).attr('begin').split(':').reverse(), s = 0;
                    for(var i=0; i<t.length; ++i){ s += i==0? parseInt(t[i]):parseInt(t[i]*60*i); }
                    t_t.push(s);
                    t_html += '<p class="'+s+'">'+$(this).text()+'</p>';
                });
                $('#transcript').append('<div class="'+t_id+'" data-times="'+t_t.join()+'"><h2>'+t_title+'</h2>'+t_html+'</div>');
            },'html');
        });
        $('#menu').on('click', '.menu.button', function(){
            var file = $(this).data('file'),
                t_id = this.id;
            $('a.menu.button').removeClass('playing');
            $(this).addClass('playing');
            $(audio).children('source').remove();
            $(audio).append('<source src="'+file+'.mp3" type="audio/mpeg"></source><source src="'+file+'.ogg" type="audio/ogg"></source>');
            audio.load();
            $('#menu').hide();
            $('#transcript>div').hide().filter('.'+t_id).show();
            $('#track').show();
            $('#play').trigger('click');
        });
        $('#menu')
            .append($('<a class="button right" href="javascript:void(0)">Start</a>')
                .on('click', function(){ $('a.menu.button').first().trigger('click'); })
            );
        $('#ctrls')
            .prepend($('<a class="button" id="list" href="javascript:void(0)">Track list</a>')
                .on('click', function(){ audio.pause(); $('#track').hide(); $('#menu').show(); })
            )
            .append($('<a class="button" id="next" href="javascript:void(0)">Next</a>')
                .on('click', function(){ 
                    if( $('a.menu.button').last().hasClass('playing') ){
                        $('a.menu.button').first().trigger('click'); 
                    }else{ $('a.menu.button.playing').next('.menu.button').trigger('click'); }
                })
            );
    });
        
    $('#player').each(function(){
        if( !!document.createElement('audio').canPlayType ){
            var audio = $('audio').get(0),
                manualSeek = 0,
                vol = 0.7;
            this.reset = function(){
                audio.pause(); 
                audio.volume = vol;
                $('#track').hide(); 
                $('#menu').show();
                $('#vol').slider({ min:0.4, max:1, step:0.01, value:vol, animate:true, 
                    slide:function(e,ui){ audio.volume = ui.value; }
                });
            };
            this.reset();
            $('#prog').slider({ step:0.01, max:audio.duration, animate:true, 
                slide:function(){ manualSeek = true; },
                stop:function(e,ui){ manualSeek = false; audio.currentTime = ui.value; }
            });
            $(audio)
                .on('loadeddata', function(){
                    var t = parseInt(audio.duration,10),
                        m = Math.floor(t/60,10),
                        s = t-m*60;
                    $('#time').text((m<10?'0'+m:m)+':'+(s<10?'0'+s:s));
                })
                .on('durationchange', function(){
                    $('#prog').slider({ max:audio.duration });
                })
                .on('timeupdate', function(){
                    var t = audio.currentTime,
                        pos = (t/audio.duration)*100,
                        t_t = $('div.'+$('a.menu.button.playing').attr('id')).data('times').split(',');
                    if( !manualSeek ){ $('#progknob').css({left:pos+'%'}); }
                    for(var s=0; s<t_t.length; ++s){
                        if( t >= t_t[s] ){
                            $('#transcript p').hide();
                            $('p.'+t_t[s]).show();
                        }
                    }
                })
                .on('play', function(){ $('#play').addClass('playing'); })
                .on('pause ended', function(){ $('#play').removeClass('playing'); })
            ;		
            $('#play').click(function(){ if( audio.paused ){ audio.play(); }else{ audio.pause(); } });
        }else{
            $('audio').attr('controls','controls');
            $('#dash').hide();
        }
    });
    
    $.get('./timeout/index.xml', function(xml){
        var $img = $(xml).children('timeout').children('image');
        if( $img.length>0 ){
            $img.each(function(){
                $('#timeout').append($('<img src="./timeout/'+$(this).text()+'" title="Click to begin" alt=""/>').on('error', function(){ $(this).remove(); }));
            });
            $('#timeout').each(function(){
                var to = this, t, 
                    e = 4000, d = 80000;
                this.init = function(){
                    if( $('audio').get(0).paused ){
                        $(this).show();
                        $('#player').get(0).reset();
                        if( $(this).children('img').length>1 ){ t = setTimeout(function(){ to.flick(); }, e); }
                    }else{
                        this.reset();
                    }
                };
                this.flick = function(){
                    $(this).append($(this).children(':first-child').css({'opacity':0}).animate({'opacity':1}, 1000));
                    t = setTimeout(function(){ to.flick(); }, e);
                };
                this.reset = function(){
                    clearTimeout(t);
                    $(this).hide();
                    t = setTimeout(function(){ to.init(); }, d);
                };
                $(window).on('mousedown', function(e){ to.reset(); e.preventDefault(); });
                $('html, a').css({'cursor':'none'});
                this.init();
            });
        }
    });
    
});
