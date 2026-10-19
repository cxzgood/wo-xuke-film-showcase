"use strict";
(() => {
  const video = document.getElementById("film-video");
  const play = document.getElementById("play-toggle");
  const mute = document.getElementById("mute-toggle");
  const seek = document.getElementById("seek");
  const volume = document.getElementById("volume");
  const rate = document.getElementById("rate");
  const clock = document.getElementById("clock");
  const status = document.getElementById("player-status");
  const chapters = [...document.querySelectorAll(".chapters button")];
  const placeholderIntervals = [[27,35],[123,140],[195,215],[258,275],[328,350],[387,405]];
  const time = n => `${Math.floor(n / 60).toString().padStart(2,"0")}:${Math.floor(n % 60).toString().padStart(2,"0")}`;
  let pendingSeek = null;
  video.volume = 0.75;

  const showError = message => { status.textContent = message; };
  const start = async () => {
    try { await video.play(); }
    catch (error) { showError("播放未启动，请点击视频原生播放按钮，或下载MP4用本地播放器打开。"); }
  };
  const update = () => {
    const duration = Number.isFinite(video.duration) ? video.duration : 480;
    const position = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    seek.max = duration;
    if (document.activeElement !== seek) seek.value = position;
    seek.setAttribute("aria-valuetext",`${time(position)}，共${time(duration)}`);
    clock.textContent = `${time(position)} / ${time(duration)}`;
    play.textContent = video.paused ? "播放" : "暂停";
    mute.textContent = video.muted || video.volume === 0 ? "取消静音" : "静音";
    mute.setAttribute("aria-pressed",String(video.muted || video.volume === 0));
    volume.value = video.muted ? 0 : Math.round(video.volume * 100);
    let active = chapters[0];
    for (const button of chapters) {
      const current = position >= Number(button.dataset.time) && position < Number(button.dataset.end);
      button.setAttribute("aria-current",String(current));
      if(current) active = button;
    }
    if (!video.error && video.readyState >= 1) {
      const slot = placeholderIntervals.some(([a,b])=>position>=a&&position<b);
      const chapter = active.querySelector(".chapter-name").childNodes[0].textContent;
      status.textContent = `${video.paused ? "已暂停" : "正在播放"} · ${chapter}${slot ? " · 当前为素材占位画面" : " · 原创分析图示"}`;
    }
  };
  const jump = seconds => {
    if (video.readyState < 1) { pendingSeek = seconds; video.load(); return; }
    video.currentTime = Math.max(0,Math.min(seconds,video.duration || 480));
    update();
  };

  document.getElementById("start-watch").addEventListener("click",()=> {
    document.getElementById("watch").scrollIntoView({behavior:"smooth",block:"start"});
    start();
  });
  play.addEventListener("click",()=>video.paused ? start() : video.pause());
  mute.addEventListener("click",()=>{ video.muted = !video.muted; if(!video.muted && video.volume===0) video.volume=.75; update(); });
  volume.addEventListener("input",()=>{video.volume=Number(volume.value)/100;video.muted=false;update();});
  seek.addEventListener("input",()=>{video.currentTime=Number(seek.value);clock.textContent=`${time(video.currentTime)} / ${time(video.duration||480)}`;update();});
  rate.addEventListener("change",()=>{video.playbackRate=Number(rate.value);});
  for(const button of chapters) button.addEventListener("click",()=>{
    jump(Number(button.dataset.time));
    if(!document.body.classList.contains("presentation")) document.getElementById("watch").scrollIntoView({behavior:"smooth",block:"start"});
  });
  document.getElementById("fullscreen").addEventListener("click",async()=>{
    try {
      if(document.fullscreenElement) await document.exitFullscreen();
      else if(video.requestFullscreen) await video.requestFullscreen();
      else if(video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else showError("请使用视频原生控制条右下角的全屏按钮。");
    } catch(error) {showError("全屏请求未完成，请使用视频原生控制条的全屏按钮。");}
  });
  document.getElementById("classroom").addEventListener("click",event=>{
    const active=document.body.classList.toggle("presentation");
    event.currentTarget.setAttribute("aria-pressed",String(active));
    event.currentTarget.textContent=active ? "退出课堂模式 ↙" : "进入课堂模式 ⤢";
    document.getElementById("watch").scrollIntoView({behavior:"instant",block:"start"});
  });
  video.addEventListener("loadedmetadata",()=>{if(pendingSeek!==null){video.currentTime=pendingSeek;pendingSeek=null;}update();});
  ["timeupdate","play","pause","volumechange","seeked","ended","durationchange"].forEach(name=>video.addEventListener(name,update));
  video.addEventListener("error",()=>showError("视频加载失败。请确认media/preview.mp4与网页一起完整解压；也可直接用本地播放器打开MP4。"));
  update();
})();
