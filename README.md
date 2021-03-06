# AudioPoint Content

Content is defined and contained in different areas, as defined by the legacy Flash system, in order to maintain backwards compatibility. 
Though this newer application will still work with all of the pre-existing XML content files, a more lightweight version of each file can be used going forward, as detailed below.

Whether modifying or creating a new AudioPoint, please start with an existing version of each XML content file, as supplied. 

## site.xml
    The file site.xml sets the title of the audio point and defines the menu of options.
    Within the <menu> section, the main title of the AudioPoint is defined in <name>, followed by an index listing of the tracks for that AudioPoint each named as a <link>.
    The name you chose to identify each track can be arbitrary, but must correspond to a tag defined by the same name, below the <menu> section, e.g. <link>track_01</link> has a corresponding <track_01> tag below.
    Within each of these track tags, e.g. <track_01>, 
    * <menuname> defines the label of the menu button for that track; 
    * <name> defines the heading for that track as displayed above its transcript; 
    * <video> defines the path and identifier for the track's corresponding family of audio and transcript files, e.g. "./video/track_01" points to all files named track_01.* in the video folder;
    * <menuimage> defines the path and filename for an image (e.g. of the curator) to be displayed at the left end of the menu button for each track.
    
## videos/
    Keeping its name from the legacy system, the videos folder contains all of the audio files, together with a corresponding textual transcript file for each track, e.g. track_01.xml (see below).
    In order to cater for all browsers, both MP3 & OGG versions of each audio track must be supplied. Currently, all modern browsers support either MP3 or OGG. Opera browser requires OGG. (Producing an OGG file from an MP3 is easy, and can be done using any simple audio converter app, which should be freely available for your platform on the web)
    For each audio track, there should be corresponding audio and transcript files, all in the same place (videos/), and all named after the track's identifier, as described above, e.g track_01.mp3 + track_01.ogg + track_01.xml 

## track_01.xml (within videos/)
    The transcript file for each track contains all of the text, split up into paragraphs, in chunks of less than 80 words, preferably around 50 words, so as to fit reasonably into the display area.
    Each paragraph tag will be in the form: <p begin="0:00:00">, where the begin time should correspond to the time elapsed in the audio track, at which the paragraph needs to be displayed.

## timeout/
    The timeout folder contains any images to be displayed after the AudioPoint has been left inactive for a period of time. If there are more than one image supplied, they will cycle through.

## index.xml (within timeout/)
    Within the timeout folder, index.xml defines which of the available timeout images should be used.


N.B. When inserting any basic HTML formatting tags into textual fields within the XML, such as <i>, <br>, etc., it is important to replace the angle brackets with their character codes, i.e. 
< = &lt;
> = &gt;
so that <i>something in italics</i> becomes &lt;i&gt;something in italics&lt;/i&gt;
e.g. to add a curator credit as a line of smaller text to a menu button, you could add the following HTML to the start of the <menuname> field in site.xml:
&lt;sup&gt;Curator credit&lt;/sup&gt;&lt;br&gt; 
which becomes <sup>Curator credit</sup><br>


# AudioPoint Styles

Each of the different colours used for the AudioPoint can be found, and changed within css/player.css
Colours in the CSS file are defined in the usual way by their hex code, and can be easily spotted by their leading # symbol.
Simply swap out any existing colour code for a new one, and observe the changes. For any colour you might change, you should check for any other instances of the same colour within the CSS, and change them too, accordingly.