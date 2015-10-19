function getXY(e){ var xy=[]; if( e.touches && e.touches.length ){ if( e.touches.length>1 ){ xy[0] = (e.touches[0].pageX+e.touches[0].pageX)/2; xy[1] = (e.touches[0].pageY+e.touches[0].pageY)/2;}else{ xy[0] = e.touches[0].pageX; xy[1] = e.touches[0].pageY; } }else{ xy[0] = e.pageX; xy[1] = e.pageY; } return xy; }

jQuery(document).ready(function() {

    var slider = {
        el: null, xy0: null, xyT: null, value: null, 
        size: function(el){
            $e = $(el).children().length? $(el).find(':last') : $(el);
            el.wh = [$e.outerWidth(), $e.outerHeight()];
            el.whP = [$(el.P).outerWidth(), $(el.P).outerHeight()];
        },
        init: function(el, opt){
            if( typeof el==='string' ){ el = document.getElementById(el); } if( !el ){ return; }
            el.P = el.parentNode;
            slider.size(el);
            el.xy = [$(el).position().left, $(el).position().top];
            var h = el.whP[0]>el.whP[1]?1:0;
            if( opt.val ){ if( h ){ el.xy[0] = opt.val*el.whP[0]-el.wh[0]/2; el.style.left = el.xy[0]+'px'; }else{ el.xy[1] = opt.val*el.whP[1]-el.wh[1]/2; el.style.top = el.xy[1]+'px'; } } 
            el.min = !!opt.min? opt.min : 0; 
            el.max = !!opt.max? opt.max : 1;
            if( typeof(opt.slide)==='function' ){ el.slide = opt.slide; }
            if( typeof(opt.stop)==='function' ){ el.stop = opt.stop; }
            if( !el.move ){
                el.onmousedown = slider.touch;
                el.ontouchstart = slider.touch;
                el.move = function(xy){
                    var x=xy[0], y=xy[1], r;
                    if( h ){
                        if( x<=0-el.wh[0]/2 ){ x=0-el.wh[0]/2; r=[-1,0]; }
                        else if( x>=this.whP[0]-this.wh[0]/2 ){ x=this.whP[0]-this.wh[0]/2; r=[1,0]; }
                        this.style.left = x+'px';
                        slider.value = this.min+((x+this.wh[0]/2)/this.whP[0]*(this.max-this.min));
                    }else{
                        if( y<=0-el.wh[1]/2 ){ y=0-el.wh[1]/2; r=[0,-1]; }
                        else if( y>=this.whP[1]-this.wh[1]/2 ){ y=this.whP[1]-this.wh[1]/2; r=[0,1]; }
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
        var $site = $(xml).find('site'),
            header = $site.find('home').find('name').text(),
            $links = $site.find('home').find('link'),
            imgs = $site.find('menuimage').length;
        $('#menu').append('<h1>'+header+'</h1>');
        $links.each(function(){
            var t_id = $(this).text(),
                $xml = $site.find(t_id),
                title = $xml.find('menuname').text(),
                img = $xml.find('menuimage').text(),
                media = $xml.find('video').length > 0 ? 'video':'audio',
                file = $xml.find(media).text(),
                transcript = $xml.find('transcript').text(),
                t_title = $xml.find('name').text();
            img = img?img:'css/img/blank.gif';
            $('#menu').append($('<p/>').append('<a class="menu button" id="'+t_id+'" data-file="'+file+'" data-media="'+media+'" href="javascript:void(0)"><img alt="" src="'+img+'"'+(imgs?'':' class="none"')+'/><span>'+title+'</span></a>'));
            $('#transcript').append('<div class="'+t_id+'"><h2>'+t_title+'</h2></div>');
            if( !!transcript ){
                $.get(transcript, function(t_xml){
                    var $t_parts = $(t_xml).find('p'), 
                        t_html = '',
                        t_t = [];
                    $t_parts.each(function(){
                        var t = $(this).attr('begin').split(':').reverse(), s = 0;
                        for(var i=0; i<t.length; ++i){ s += i==0? parseInt(t[i]):parseInt(t[i]*60*i); }
                        t_t.push(s);
                        t_html += '<p class="'+s+'">'+$(this).text()+'</p>';
                    });
                    $('#transcript').find('.'+t_id).data('times',t_t.join()).append(t_html);
                },'html');
            }
        });
        $('#menu').on('click', '.menu.button', function(){
            var file = $(this).data('file'),
                media = $(this).data('media'),
                t_id = this.id,
                vid = (file.indexOf('.mp4')===file.length-4);
            $('.menu.button').removeClass('playing');
            $(this).addClass('playing');
            $('audio, video').removeAttr('src').hide().find('source').remove();
            $(vid?'video':'audio').show();
            if( file.indexOf('http')===0 ){
                $(media).attr("src", file);
            }else if( vid ){
                $(media).append('<source src="'+file+'" type="video/mp4"></source>');
            }else{
                $(media).append('<source src="'+file+'.mp3" type="audio/mpeg"></source><source src="'+file+'.ogg" type="audio/ogg"></source>');
            }
            try {
                $(media)[0].load();
            } catch(e){
                console.log('NO MEDIA SOURCE! '+e);
            }
            $('#menu').hide();
            $('#transcript>div').hide().filter('.'+t_id).show();
            $('#track').show();
            $('#play').trigger('click');
        });
        $('#menu').append($('<a class="start button right" id="start" href="javascript:void(0)">Start</a>')
            .on('click', function(){ $('a.menu.button').first().trigger('click'); })
        );
        if( $links.length>1 ){
            $('#ctrls').prepend($('<a class="button" id="list" href="javascript:void(0)">Track list</a>')
                .on('click', function(){ $($('.menu.playing').data('media'))[0].pause(); $('#track').hide(); $('#menu').show(); })
            );
        }
        $('#ctrls').append($('<a class="button start" id="'+ ($links.length>1?'next':'replay') +'" href="javascript:void(0)">Next</a>')
            .on('click', function(){ 
                if( $('a.menu.button').last().hasClass('playing') ){
                    $('a.menu.button').first().trigger('click'); 
                }else{ $('a.menu.button.playing').parent().next().find('.menu.button').trigger('click'); }
            })
        );
        if( $links.length===1 ){
            $('a.menu.button').first().trigger('click');
        }
    });

    $('#player').each(function(){
        if( !!document.createElement('video').canPlayType ){
            var manualSeek = 0,
                vol = 0.7;
            this.reset = function(){
                media = $('audio, video')[0];
                if( !!media ){
                    media.pause();
                    media.volume = vol;
                }
                $('#track').hide(); 
                $('#menu').show();
                slider.init($('#volknob')[0], { min:0.4, max:1, val:vol, 
                    slide:function(){ $($('.menu.playing').data('media'))[0].volume = slider.value; }
                });
            };
            this.reset();
            $('audio, video')
                .on('loadeddata', function(){
                    var t = parseInt(this.duration,10),
                        m = Math.floor(t/60,10),
                        s = t-m*60;
                    $('#time').text((m<10?'0'+m:m)+':'+(s<10?'0'+s:s));
                    $('#timeout')[0].d = t+15;
                    $('#timeout')[0].init();
                })
                .on('durationchange', function(){
                    var media = this;
                    slider.init($('#progknob')[0], { max:media.duration,
                        slide:function(){ manualSeek = 1; },
                        stop:function(){ media.currentTime = slider.value; manualSeek = 0; }
                    });
                })
                .on('timeupdate', function(){
                    var media = this,
                        t = media.currentTime;
                    if( !manualSeek ){ $('#progknob').css({left:t*100/media.duration+'%'}); }
                    var t_t = $('div.'+$('.menu.playing').attr('id')).data('times');
                    if( !!t_t ){
                        var t_t = t_t.split(',');
                        for(var s=0; s<t_t.length; ++s){
                            if( t >= t_t[s] ){
                                $('#transcript p').hide();
                                $('p.'+t_t[s]).show();
                            }
                        }
                    }
                })
                .on('play', function(){ $('#play').addClass('playing'); })
                .on('pause ended', function(){ $('#play').removeClass('playing'); })
            $('#play').on('click', function(){ 
                var media = $($('.menu.playing').data('media'))[0]; 
                if( media.paused ){ media.play(); }else{ media.pause(); } 
            });
        }else{
            $('video').attr('controls','controls');
            $('#dash').hide();
        }
    });
    
    /* timeout screen */
    $.get('./timeout/index.xml', function(xml){
        var $img = $(xml).find('timeout').find('image');
        if( $img.length>0 ){
            $img.each(function(){
                $('#timeout').append($('<img src="./timeout/'+$(this).text()+'" title="Click to begin" alt=""/>').on('error', function(){ $(this).remove(); }));
            });
            $('#timeout').each(function(){
                var to = this, t, 
                    e = 4; // e = slide exposure in secs
                this.d = 120; // d = default seconds of inactivity before screen times out - this automatically changes to selected audio/video length + 15 secs
                this.init = function(){
                    clearTimeout(this.t);
                    if( $('#play.playing').length ){
                        this.reset();
                    }else{
                        $(this).show();
                        $('#player')[0].reset();
                        if( $(this).children('img').length>1 ){ this.t = setTimeout(function(){ to.flick(); }, e*1000); }
                    }
                };
                this.flick = function(){
                    $(this).append($(this).find(':first-child').css({'opacity':0}).animate({'opacity':1}, 1000));
                    this.t = setTimeout(function(){ to.flick(); }, e*1000);
                };
                this.reset = function(){
                    clearTimeout(this.t);
                    $(this).hide();
                    this.t = setTimeout(function(){ to.init(); }, this.d*1000);
                };
                $(window).on('mousedown', function(e){ to.reset(); e.preventDefault(); if( e.target.parentNode.id==='timeout' && $('a.menu.button').length===1 ){ $('a.menu.button').first().trigger('click') } });
                if( !!('ontouchstart' in window) ){ $('html, a').css({'cursor':'none'}); }
                this.init();
            });
        }
    });
    
});

