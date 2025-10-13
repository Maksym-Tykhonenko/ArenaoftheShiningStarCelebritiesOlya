import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WebView } from 'react-native-webview';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"/>
<style>
  html,body{height:100%}
  body{
    margin:0;overflow:hidden;
    background:#ffffff; /* стартовый белый фон вместо золотого */
  }
  #canvas{display:block;width:100%;height:100%}
</style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    (function(){
      const c = document.getElementById('canvas');
      const ctx = c.getContext('2d');
      let W,H,PR = Math.min(window.devicePixelRatio || 1, 2);
      function resize(){
        W = c.clientWidth; H = c.clientHeight;
        c.width = W*PR; c.height = H*PR; ctx.setTransform(PR,0,0,PR,0,0);
      }
      window.addEventListener('resize', resize); resize();

      const stars = [];
      const STAR_COUNT = 220;
      for(let i=0;i<STAR_COUNT;i++){
        stars.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.2, v: Math.random()*0.15+0.02, a: Math.random()*1 });
      }

      let shoot = null;
      let mouse = {x: W*0.5, y: H*0.35};
      function triggerShoot(x, y, speed=16){
        const angle = Math.atan2(H - y, (Math.random()<.5? -W : W) - x) + (Math.random()*0.3 - 0.15);
        shoot = { x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 0, maxLife: 90 };
      }

      const tail = [];
      function addTail(x,y){ tail.push({x,y,alpha:1}); if(tail.length>60) tail.shift(); }

      function drawBackground(){
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(0,0,W,H);
      }

      function drawStars(){
        for(const s of stars){
          s.a += 0.02;
          const tw = (Math.sin(s.a)*0.5+0.5)*0.8+0.2;
          const alpha = 0.35+0.65*tw;
          ctx.fillStyle = 'rgba(255,233,150,'+alpha+')';
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r*(0.6+tw*0.8), 0, Math.PI*2); ctx.fill();
          s.x += s.v; if(s.x>W+5){ s.x=-5; s.y=Math.random()*H; }
        }
      }

      function drawShoot(){
        if(!shoot) return;
        shoot.life++;
        shoot.x += shoot.vx; shoot.y += shoot.vy;
        addTail(shoot.x, shoot.y);

        const grd = ctx.createRadialGradient(shoot.x, shoot.y, 0, shoot.x, shoot.y, 26);
        grd.addColorStop(0,'rgba(255,240,180,1)');
        grd.addColorStop(1,'rgba(255,200,90,0)');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(shoot.x, shoot.y, 26, 0, Math.PI*2); ctx.fill();

        for(let i=tail.length-1;i>=0;i--){
          const t = tail[i]; t.alpha *= 0.95;
          ctx.strokeStyle = 'rgba(255,210,120,'+(t.alpha*0.9)+')';
          ctx.lineWidth = Math.max(1, 8*t.alpha);
          if(i>0){
            const p = tail[i-1];
            ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(p.x, p.y); ctx.stroke();
          }
        }
        if(shoot.life > shoot.maxLife || shoot.x<-100 || shoot.x>W+100 || shoot.y<-100 || shoot.y>H+100){
          shoot = null; tail.length = 0;
          setTimeout(()=>triggerShoot(Math.random()*W, Math.random()*H*0.4+H*0.1, 14), 400);
        }
      }

      function loop(){
        drawBackground();
        drawStars();
        drawShoot();
        requestAnimationFrame(loop);
      }

      window.addEventListener('mousemove', e=> { mouse.x=e.clientX; mouse.y=e.clientY; triggerShoot(mouse.x, mouse.y); });
      window.addEventListener('touchmove', e=> { const t=e.touches[0]; mouse.x=t.clientX; mouse.y=t.clientY; triggerShoot(mouse.x, mouse.y); }, {passive:true});
      window.addEventListener('touchstart', e=> { const t=e.touches[0]; mouse.x=t.clientX; mouse.y=t.clientY; triggerShoot(mouse.x, mouse.y); }, {passive:true});

      // мгновенно заливаем тёмным (чёрный) перед анимацией
      ctx.fillStyle = '#000000';
      ctx.fillRect(0,0,W,H);

      setTimeout(()=>{ if(!shoot) triggerShoot(mouse.x, mouse.y, 20); }, 200);
      loop();
    })();
  </script>
</body>
</html>`;

export default function LoaderScreen({ navigation }: Props) {
  //useEffect(() => {
  //  const t = setTimeout(() => navigation.replace('Onboarding'), 3000);
  //  return () => clearTimeout(t);
  //}, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <WebView
        originWhitelist={['*']}
        source={{ html: HTML }}
        style={styles.web}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mixedContentMode="always"
        automaticallyAdjustContentInsets={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' }, 
  web: { flex: 1, backgroundColor: 'transparent' },
});
