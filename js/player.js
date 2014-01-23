function getXY(e){ var xy=[]; if( e.touches && e.touches.length ){ if( e.touches.length>1 ){ xy[0] = (e.touches[0].pageX+e.touches[0].pageX)/2; xy[1] = (e.touches[0].pageY+e.touches[0].pageY)/2;}else{ xy[0] = e.touches[0].pageX; xy[1] = e.touches[0].pageY; } }else{ xy[0] = e.pageX; xy[1] = e.pageY; } return xy; }

jQuery(document).ready(function() {

    var slider = {
        el: null, xy0: null, xyT: null, value: null, 
        size: function(el){
            el.wh = [$(el).outerWidth(), $(el).outerHeight()];
            el.whP = [$(el.P).outerWidth(), $(el.P).outerHeight()];
        },
        init: function(el, opt){
            if( typeof el==='string' ){ el = document.getElementById(el); } if( !el ){ return; }
            el.P = el.parentNode;
            slider.size(el);
            var h = el.whP[0]>el.whP[1]?1:0;
            if( opt.val ){ if( h ){ el.style.left = (opt.val*el.whP[0]-el.wh[0]/2)+'px'; }else{ el.style.top = (opt.val*el.whP[1]-el.wh[1]/2)+'px'; } } 
            el.min = !!opt.min? opt.min : 0; 
            el.max = !!opt.max? opt.max : 1;
            if( typeof(opt.slide)==='function' ){ el.slide = opt.slide; }
            if( typeof(opt.stop)==='function' ){ el.stop = opt.stop; }
            if( !el.move ){
                el.onmousedown = slider.touch;
                el.ontouchstart = slider.touch;
                el.xyO = [0,0];
                el.move = function(xy){
                    var x=xy[0], y=xy[1], r;
                    if( h ){
                        if( x<=0-el.xyO[0]-el.wh[0]/2 ){ x=0-el.xyO[0]-el.wh[0]/2; r=[-1,0]; }
                        else if( x>=this.whP[0]-this.wh[0]/2-el.xyO[0] ){ x=this.whP[0]-this.wh[0]/2-el.xyO[0]; r=[1,0]; }
                        this.style.left = x+'px';
                        slider.value = this.min+((x+this.wh[0]/2)/this.whP[0]*(this.max-this.min));
                    }else{
                        if( y<=0-el.xyO[1]-el.wh[1]/2 ){ y=0-el.xyO[1]-el.wh[1]/2; r=[0,-1]; }
                        else if( y>=this.whP[1]-this.wh[1]/2-el.xyO[1] ){ y=this.whP[1]-this.wh[1]/2-el.xyO[1]; r=[0,1]; }
                        this.style.top = y+'px';
                        slider.value = this.min+((y+this.wh[1]/2)/this.whP[1]*(this.max-this.min));
                    }
                    this.xy = [x,y];
                    return r;
                };
            }
        },
        touch: function(e){
            e = e || window.event;
            slider.el = this;
            this.xy = [$(this).position().left, $(this).position().top];
            slider.xy0 = this.xy;
            slider.xyT = getXY(e);
            this.className += ' dragged';
            if( e.type==='touchstart' ){
                this.ontouchmove = slider.drag;
                this.onmousedown = null;
                this.ontouchend = function(){
                    this.ontouchmove = null;
                    this.ontouchend = null;
                    slider.release();
                };
            }else{
                document.onmousemove = slider.drag;
                document.onmouseup = function(){
                    document.onmousemove = null;
                    document.onmouseup = null;
                    slider.release();
                };
            }
            return false;
        },
        drag: function(e){
            e = e || window.event;
            if( e.preventDefault ){ e.preventDefault(); }else{ e.returnValue=false; }
            var xyE = getXY(e), 
                xy = [slider.xy0[0]+xyE[0]-slider.xyT[0], slider.xy0[1]+xyE[1]-slider.xyT[1]];
            slider.el.move(xy);
            if( !!slider.el.slide ){ slider.el.slide.call(this); }
            return false;
        },
        release: function(){
            slider.el.className = slider.el.className.replace(/ dragged/,'');
            if( !!slider.el.stop ){ slider.el.stop.call(this); }
            slider.el = null;
        }
    };

    $.get('./site.xml', function(xml){
        var $site = $(xml).children('site'),
            header = $site.children('home').children('name').text(),
            $link = $site.children('home').children('link'),
            imgs = $site.find('menuimage').length,
            audio = $('audio')[0];
        $('#menu').append('<h1>'+header+'</h1>');
        $link.each(function(){
            var t_id = $(this).text(),
                $xml = $site.children(t_id),
                title = $xml.children('menuname').text(),
                img = $xml.children('menuimage').text(),
                file = $xml.children('video').text(),
                t_title = $xml.children('name').text();
            img = img?img:'css/img/blank.gif';
            $('#menu').append($('<p/>').append('<a class="menu button" id="'+t_id+'" data-file="'+file+'" href="javascript:void(0)"><img alt="" src="'+img+'"'+(imgs?'':' class="none"')+'/><span>'+title+'</span></a>'));
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
            //~ $(audio).append('<source src="'+file+'.mp3" type="audio/mpeg"></source><source src="'+file+'.ogg" type="audio/ogg"></source>');
            $(audio).attr("src", 'http://api.soundcloud.com/tracks/129642061/stream?client_id=3b7e5fdb483fa306f91111e992c6443f');
            audio.load();
            $('#menu').hide();
            $('#transcript>div').hide().filter('.'+t_id).show();
            $('#track').show();
            $('#play').trigger('click');
        });
        $('#menu')
            .append($('<a class="button right" id="start" href="javascript:void(0)">Start</a>')
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
                    }else{ $('a.menu.button.playing').parent().next().children('.menu.button').trigger('click'); }
                })
            );
    });

    $('#player').each(function(){
        if( !!document.createElement('audio').canPlayType ){
            var audio = $('audio')[0],
                manualSeek = 0,
                vol = 0.7;
            this.reset = function(){
                audio.pause(); 
                audio.volume = vol;
                $('#track').hide(); 
                $('#menu').show();
                slider.init($('#volknob')[0], { min:0.4, max:1, val:vol, 
                    slide:function(){ audio.volume = slider.value; }
                });
            };
            this.reset();
            slider.init($('#progknob')[0], { max:audio.duration, 
                slide:function(){ manualSeek = 1; },
                stop:function(){ audio.currentTime = slider.value; manualSeek = 0; }
            });
            $(audio)
                .on('loadeddata', function(){
                    var t = parseInt(audio.duration,10),
                        m = Math.floor(t/60,10),
                        s = t-m*60;
                    $('#time').text((m<10?'0'+m:m)+':'+(s<10?'0'+s:s));
                })
                .on('durationchange', function(){
                    slider.init($('#progknob')[0], { max:audio.duration });
                })
                .on('timeupdate', function(){
                    var t = audio.currentTime,
                        t_t = $('div.'+$('a.menu.button.playing').attr('id')).data('times').split(',');
                    if( !manualSeek ){ $('#progknob').css({left:t*100/audio.duration+'%'}); }
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
    
    /* timeout screen */
    $.get('./timeout/index.xml', function(xml){
        var $img = $(xml).children('timeout').children('image');
        if( $img.length>0 ){
            $img.each(function(){
                $('#timeout').append($('<img src="./timeout/'+$(this).text()+'" title="Click to begin" alt=""/>').on('error', function(){ $(this).remove(); }));
            });
            $('#timeout').each(function(){
                var to = this, t, 
                    e = 4, d = 120; /* e = slide exposure in secs; d = seconds of inactivity before screen times out */
                this.init = function(){
                    if( $('audio')[0].paused ){
                        $(this).show();
                        $('#player')[0].reset();
                        if( $(this).children('img').length>1 ){ t = setTimeout(function(){ to.flick(); }, e); }
                    }else{
                        this.reset();
                    }
                };
                this.flick = function(){
                    $(this).append($(this).find(':first-child').css({'opacity':0}).animate({'opacity':1}, 1000));
                    t = setTimeout(function(){ to.flick(); }, e*1000);
                };
                this.reset = function(){
                    clearTimeout(t);
                    $(this).hide();
                    t = setTimeout(function(){ to.init(); }, d*1000);
                };
                $(window).on('mousedown', function(e){ to.reset(); e.preventDefault(); });
                if( !!('ontouchstart' in window) ){ $('html, a').css({'cursor':'none'}); }
                this.init();
            });
        }
    });
    
});

