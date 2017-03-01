/**
 * Created by Y-Star on 2017/2/24.
 */
function Player(){
    this.audio = document.createElement('audio');
    Player.prototype = {
        playList:[],
        $playSongIndex:undefined,
        get playSong(){
            return this.$playSongIndex;
        },
        set playSong(newval){
            this.$playSongIndex = newval;
            this.toplay(newval);
        },
        toplay:function (index) {
            if('songID' in playList[index]){
                console.log('play ID');
            }else{
                this.audio.src = song.songSrc;
            }
            this.audio.play();
        }
    }
}