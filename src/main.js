
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/utils/SkeletonUtils.js';
import { CyborgController } from './CyborgController.js';
import { GamepadController } from './GamepadController.js';

const CFG=await fetch(new URL('../config/cyborg.json',import.meta.url)).then(r=>{if(!r.ok)throw new Error('No se pudo leer config/cyborg.json');return r.json()});
const T=THREE,V3=T.Vector3,$=i=>document.getElementById(i),R=.35;
const scene=new T.Scene();scene.background=new T.Color(0x9db7c6);scene.fog=new T.Fog(0x9db7c6,60,200);
const cam=new T.PerspectiveCamera(60,1,.1,300);
const ren=new T.WebGLRenderer({canvas:$('c'),antialias:true});ren.shadowMap.enabled=true;let prMax=Math.min(devicePixelRatio,2),pr=Math.min(prMax,1.5),fa=0,fc=0,pc=0;ren.setPixelRatio(pr);
const rs=()=>{ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()};addEventListener('resize',rs);rs();
scene.add(new T.HemisphereLight(0xdfefff,0x556070,.95));
const sun=new T.DirectionalLight(0xffffff,1.1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
const sc=sun.shadow.camera;sc.left=sc.bottom=-28;sc.right=sc.top=28;sc.far=120;scene.add(sun,sun.target);
// ---------- mundo ----------
const c0=document.createElement('canvas');c0.width=c0.height=128;{const g=c0.getContext('2d');g.fillStyle='#8a9aa3';g.fillRect(0,0,128,128);g.fillStyle='#7b8b94';g.fillRect(0,0,64,64);g.fillRect(64,64,64,64);g.strokeStyle='#5d6d76';g.strokeRect(0,0,128,128)}
const chk=new T.CanvasTexture(c0);chk.wrapS=chk.wrapT=T.RepeatWrapping;chk.anisotropy=8;
const P={x0:12,x1:24,z0:-8,z1:8},inPool=(x,z,m=0)=>x>P.x0-m&&x<P.x1+m&&z>P.z0-m&&z<P.z1+m;
function slab(x0,x1,z0,z1,top,h){const w=x1-x0,d=z1-z0,t=chk.clone();t.needsUpdate=true;t.repeat.set(w/2,d/2);
 const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({map:t,roughness:.9}));m.position.set(x0+w/2,top-h/2,z0+d/2);m.receiveShadow=true;scene.add(m)}
slab(-45,12,-45,45,0,3.5);slab(24,45,-45,45,0,3.5);slab(12,24,8,45,0,3.5);slab(12,24,-45,-8,0,3.5);slab(12,24,-8,8,-3,1);
const water=new T.Mesh(new T.PlaneGeometry(12,16),new T.MeshStandardMaterial({color:0x2aa6d8,transparent:true,opacity:.55,roughness:.2}));
water.rotation.x=-Math.PI/2;water.position.set(18,-.35,0);scene.add(water);
const solids=[];
function box(cx,cz,w,d,h,col,o={}){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color:col,roughness:.75}));
 m.position.set(cx,h/2,cz);m.castShadow=m.receiveShadow=true;scene.add(m);const b={x0:cx-w/2,x1:cx+w/2,z0:cz-d/2,z1:cz+d/2,top:h,...o};b.m=m;solids.push(b);return b}
for(let i=0;i<5;i++)box(-6,4+i*1.5,4,1.5,.35*(i+1),0x6b7a86);
box(-14,-2,3,3,1.2,0x8a6bd0);box(-17,-2,3,3,2.4,0x8a6bd0);
box(-16,-14,7,7,5.5,0x4a5560,{climb:'wall'});box(-8,-12,.3,.3,4.2,0xd0a050,{climb:'rope'});
box(4,-8,5,.6,1.1,0x3f8f7a,{cover:1});box(0,-14,.6,5,1.1,0x3f8f7a,{cover:1});box(6,-18,4,.6,1.1,0x3f8f7a,{cover:1});
const dyn=[],pads=[],grass=[],E=[],CP=[[0,0],[-30,20],[-4,20],[28,18]],TP={KeyU:CP[0],KeyI:CP[1],KeyO:CP[2],KeyP:CP[3]};
function label(t,x,z,y){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.fillStyle='rgba(8,16,20,.85)';g.fillRect(0,0,512,96);g.fillStyle='#35e0c8';g.font='700 42px sans-serif';g.textAlign='center';g.fillText(t,256,63);
 const m=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c)}));m.scale.set(8,1.5,1);m.position.set(x,y,z);scene.add(m)}
function disc(x,z,r,col,y){const m=new T.Mesh(new T.CylinderGeometry(r,r,.1,24),new T.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.6}));m.position.set(x,(y||0)+.05,z);scene.add(m)}
CP.forEach(c=>disc(c[0],c[1],1.6,0x35e0c8));
label('ZONA 0 - MOVIMIENTO',0,-3,4);label('ZONA 1 - FISICAS',-30,18,5);label('ZONA 2 - SIGILO',-4,18,5);label('ZONA 3 - ARENA',28,16,6);
const wall=(x,z,w,d)=>box(x,z,w,d,3,0x56616b);
wall(-42,29,.6,24);wall(-30,41,24,.6);
const crate=(x,z)=>{const m=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({color:0xc58b4a}));m.castShadow=m.receiveShadow=true;scene.add(m);dyn.push({m,p:new V3(x,0,z),v:new V3(),r:.55,y:.5})};
[[-36,24],[-34,24],[-32,24],[-35,26],[-33,26],[-34,28]].forEach(c=>crate(...c));
{const m=new T.Mesh(new T.SphereGeometry(.5,20,14),new T.MeshStandardMaterial({color:0xe85a3a}));m.castShadow=true;scene.add(m);dyn.push({m,p:new V3(-28,0,24),v:new V3(),r:.5,y:.5,ball:1})}
[[-26,21],[-38,33]].forEach(c=>{pads.push({x:c[0],z:c[1]});disc(c[0],c[1],1,0xffd23a)});
box(-24,34,4,4,4.2,0x8a6bd0);const PF=box(-34,37,5,4,1.2,0xd07a3a);PF.cx=-34;
wall(-13,32,.6,26);wall(9,32,.6,26);box(-8.5,27,9,.6,3.2,0x4a5560);box(2,33,14,.6,3.2,0x4a5560);box(-8.5,39,9,.6,3.2,0x4a5560);
box(-2,24.5,3,.6,1.1,0x3f8f7a,{cover:1});box(1,30,3,.6,1.1,0x3f8f7a,{cover:1});box(2,34.5,3,.6,1.1,0x3f8f7a,{cover:1});
[[-12,-6,28,32],[2,7,35,38]].forEach(g=>{grass.push({x0:g[0],x1:g[1],z0:g[2],z1:g[3]});const m=new T.Mesh(new T.BoxGeometry(g[1]-g[0],1.1,g[3]-g[2]),new T.MeshStandardMaterial({color:0x3da64a,transparent:true,opacity:.55}));m.position.set((g[0]+g[1])/2,.55,(g[2]+g[3])/2);scene.add(m)});
disc(-4,43,1.6,0xffd23a);label('META',-4,43,3.5);
box(22,28,2,2,4,0x4a5560);box(34,28,2,2,4,0x4a5560);box(28,36,2,2,4,0x4a5560);box(28,24,4,.6,1.1,0x3f8f7a,{cover:1});box(18,32,.6,4,1.1,0x3f8f7a,{cover:1});
const SPAWNS=[[4,8,{dummy:1}],[-10,23,{path:[[-10,23],[5,23]],yaw:1.57}],[5,36,{path:[[5,36],[-10,36]],yaw:-1.57}],[-8,42,{path:[[-8,42],[0,42]],yaw:1.57}],
 [28,40,{fov360:1,range:10}],[20,38,{fov360:1,range:10}],[36,38,{fov360:1,range:10}]];
const WL=-.35,sm=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
const hh=(i,j)=>{let h=Math.imul(i,374761393)^Math.imul(j,668265263);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295};
const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=sm(x-i),v=sm(y-j),a=hh(i,j),b=hh(i+1,j),c=hh(i,j+1),d=hh(i+1,j+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v};
const FZ=[[95,-75,42],[75,50,16]],BUMPS=[[85,-60],[100,-88],[112,-66],[70,-90]];
function th(x,z){let m=sm((x-45)/25);for(const f of FZ)m*=sm((Math.hypot(x-f[0],z-f[1])-f[2])/22);
 let h=(vn(x*.02,z*.02)*8+vn(x*.05,z*.05)*3+vn(x*.13,z*.13)*.8)*m;const bl=sm(1-Math.hypot(x-175,z+10)/45);h=h*(1-bl)-bl*9;
 for(const b of BUMPS)h+=2.6*Math.exp(-((x-b[0])**2+(z-b[1])**2)/24);return h}
const base=(x,z)=>inPool(x,z)?-3:(x>45?(x<285&&Math.abs(z)<130?th(x,z):-999):(Math.abs(x)<=45&&Math.abs(z)<=45?0:-999));
const wet=(x,z)=>{const b=base(x,z);return b<-1.1&&b>-50};
const ground=(x,z,y)=>{let h=base(x,z);for(const b of solids)if(x>b.x0&&x<b.x1&&z>b.z0&&z<b.z1&&b.top<=y+.45)h=Math.max(h,b.top);
 for(const d of dyn)if(!d.ball&&Math.abs(x-d.p.x)<.55&&Math.abs(z-d.p.z)<.55&&1<=y+.45)h=Math.max(h,1);return h};
const trunks=[],cars=[];
{const geo=new T.PlaneGeometry(240,260,96,104);geo.rotateX(-Math.PI/2);geo.translate(165,0,0);const pa=geo.attributes.position,col=new Float32Array(pa.count*3),c=new T.Color();
 for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),y=th(x,z);pa.setY(i,y);c.setHex(y<-.6?0xb9a56a:y<.6?0xcdbb82:y<5?0x4f9a3c:y<8?0x6f7f55:0x8b8b86).offsetHSL(0,0,vn(x*.3,z*.3)*.15-.07);col.set([c.r,c.g,c.b],i*3)}
 geo.setAttribute('color',new T.BufferAttribute(col,3));geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1}));m.receiveShadow=true;scene.add(m)}
{const lk=new T.Mesh(new T.PlaneGeometry(110,110),new T.MeshStandardMaterial({color:0x2aa6d8,transparent:true,opacity:.6,roughness:.2}));lk.rotation.x=-Math.PI/2;lk.position.set(175,WL,-10);scene.add(lk)}
function rng(a){return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
const rnd=rng(11),MX=new T.Matrix4();
function inst(geo,mat,pts,fn,cs=1){const im=new T.InstancedMesh(geo,mat,pts.length);pts.forEach((p,i)=>{fn(p,MX);im.setMatrixAt(i,MX)});im.castShadow=!!cs;im.frustumCulled=false;scene.add(im)}
function pick(n,ok){const a=[];for(let t=0;t<n*30&&a.length<n;t++){const x=50+rnd()*230,z=-125+rnd()*250,y=th(x,z);if(ok(x,y,z))a.push([x,y,z,.8+rnd()*1.1,rnd()*6.28])}return a}
const free=(x,z)=>FZ.every(f=>Math.hypot(x-f[0],z-f[1])>f[2]+6),Q0=new T.Quaternion();
const trees=pick(170,(x,y,z)=>y>.6&&y<7.5&&free(x,z)&&vn(x*.03+40,z*.03)>.42);trees.forEach(t=>trunks.push([t[0],t[2],.4*t[3]]));
inst(new T.CylinderGeometry(.22,.3,2.6,6),new T.MeshStandardMaterial({color:0x6b4a2b}),trees,(t,m)=>m.compose(new V3(t[0],t[1]+1.3*t[3],t[2]),Q0,new V3(t[3],t[3],t[3])));
inst(new T.ConeGeometry(1.7,4.6,7),new T.MeshStandardMaterial({color:0x2f7a3a}),trees,(t,m)=>m.compose(new V3(t[0],t[1]+4.2*t[3],t[2]),Q0,new V3(t[3],t[3],t[3])));
const rocks=pick(80,(x,y,z)=>y>-.3&&free(x,z));rocks.forEach(t=>trunks.push([t[0],t[2],.9*t[3]]));
inst(new T.DodecahedronGeometry(1,0),new T.MeshStandardMaterial({color:0x8a8a84,flatShading:true}),rocks,(t,m)=>m.compose(new V3(t[0],t[1]+.3,t[2]),new T.Quaternion().setFromEuler(new T.Euler(t[4],t[4]*2,0)),new V3(t[3]*1.1,t[3]*.8,t[3]*1.1)));
inst(new T.ConeGeometry(.12,.7,4),new T.MeshStandardMaterial({color:0x58b043}),pick(2600,(x,y,z)=>y>.3&&y<6&&free(x,z)&&vn(x*.05,z*.05+90)>.4),(t,m)=>m.compose(new V3(t[0],t[1]+.3,t[2]),Q0,new V3(1,t[3]*.9,1)),0);
{const gp=[];pick(8,(x,y,z)=>y>.6&&y<4&&free(x,z)).forEach(c=>{grass.push({x0:c[0]-6,x1:c[0]+6,z0:c[2]-6,z1:c[2]+6});for(let i=0;i<230;i++){const x=c[0]+(rnd()-.5)*12,z=c[2]+(rnd()-.5)*12;gp.push([x,th(x,z),z,1+rnd()*.8])}});
 inst(new T.ConeGeometry(.14,1.3,4),new T.MeshStandardMaterial({color:0x3da64a}),gp,(t,m)=>m.compose(new V3(t[0],t[1]+.6,t[2]),Q0,new V3(1,t[3],1)),0)}
SPAWNS.push([80,20,{path:[[80,20],[96,20],[96,34],[80,34]],range:14}],[115,40,{path:[[115,40],[130,40],[130,55],[115,55]],range:14}],[130,-35,{path:[[130,-35],[110,-35],[110,-20],[130,-20]],range:14}],[60,-30,{path:[[60,-30],[60,-10]],range:14}],[100,-75,{fov360:1,range:12}],[120,-70,{fov360:1,range:12}]);
// parkour sobre vacio
{const r=rng(5);let zc=53,h=.3,x=0;box(0,49,8,8,.3,0x4a5560);label('ZONA 4 - PARKOUR',0,48,5);
 for(let i=0;i<24;i++){const beam=i%5==4,gap=2+r()*1.2,d=beam?4:2.4+r()*1.2,w=beam?.9:2.4+r()*1.6;zc+=gap+d/2;x=Math.sin(i*.9)*4;h=Math.max(.3,Math.min(9,h+(r()-.4)*2.6));
  box(x,zc,w,d,h,beam?0xd07a3a:0x6b7a99);if(i==7||i==15||i==22){CP.push([x,zc,h]);disc(x,zc,1.2,0x35e0c8,h)}zc+=d/2}
 box(0,zc+1.5,8,3,13,0x4a5560,{climb:'wall'});label('META PARKOUR',0,zc+1.5,16)}
label('ZONA 5 - BOSQUE',62,28,th(62,28)+7);label('ZONA 6 - LAGO (bucear)',135,-8,12);label('ZONA 7 - AUTOS',95,-45,8);label('ACANTILADOS',75,40,18);
box(70,50,10,2.5,9,0x6a6a60,{climb:'wall'});box(82,52,2.5,10,13,0x6a6a60,{climb:'wall'});box(76,44,.3,.3,6,0xd0a050,{climb:'rope'});
for(let i=0;i<8;i++)box(66+i*7,-75+(i%2?3.5:-3.5),.7,.7,1,0xff7a1a);
function mkCar(x,z,h,col){const g=new T.Group(),mt=new T.MeshStandardMaterial({color:col,roughness:.5,metalness:.3});g.rotation.order='YXZ';
 const b=new T.Mesh(new T.BoxGeometry(2,.7,4.2),mt),c=new T.Mesh(new T.BoxGeometry(1.7,.6,2),new T.MeshStandardMaterial({color:0x1b2630}));b.position.y=.65;c.position.set(0,1.25,-.2);g.add(b,c);
 [[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]].forEach(w=>{const m=new T.Mesh(new T.CylinderGeometry(.45,.45,.35,14),new T.MeshStandardMaterial({color:0x111111}));m.rotation.z=Math.PI/2;m.position.set(w[0],.45,w[1]);g.add(m)});
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);const y=ground(x,z,1);cars.push({g,p:new V3(x,y,z),h,v:new V3(),y,vy:0,pt:0,home:[x,z,h]});g.position.set(x,y,z);g.rotation.y=h}
mkCar(18,-20,0,0xd33a2f);mkCar(62,12,1.5,0x2a7fd8);mkCar(78,-62,0,0xe8b820);mkCar(112,-80,3,0x2fa84f);
TP.Digit6=[0,49];TP.Digit7=[62,25];TP.Digit8=[128,-8];TP.Digit9=[95,-70];
const ZN=['KeyU','KeyI','KeyO','KeyP','Digit6','Digit7','Digit8','Digit9'];let zi=0;
function enterCar(){for(const c of cars)if(Math.hypot(pl.pos.x-c.p.x,pl.pos.z-c.p.z)<3.3){pl.car=c;pl.st='drive';p.root.visible=false;pl.vel.set(0,0,0);pl.crouch=false;cd=Math.max(cd,9);return 1}}
function exitCar(){const c=pl.car,f=new V3(Math.sin(c.h),0,Math.cos(c.h));let bst=null;for(const sd of[1,-1]){const t=new V3(c.p.x+f.z*2.4*sd,c.y,c.p.z-f.x*2.4*sd),x0=t.x,z0=t.z;collide(t,.4);const m=Math.hypot(t.x-x0,t.z-z0);if(!bst||m<bst.m)bst={t,m}}
 pl.pos.set(bst.t.x,0,bst.t.z);pl.pos.y=ground(bst.t.x,bst.t.z,c.y+1);pl.jb=0;pl.st='ground';p.root.visible=true;pl.car=null;pl.vel.set(0,0,0);cd=Math.min(cd,6)}
function collideCar(c){const f=new V3(Math.sin(c.h),0,Math.cos(c.h));let sx=0,sz=0;for(const o of[1.3,-1.3,0]){const t=new V3(c.p.x+f.x*o,c.y,c.p.z+f.z*o),x0=t.x,z0=t.z;collide(t,1.05);const dx=t.x-x0,dz=t.z-z0;if(Math.abs(dx)>Math.abs(sx))sx=dx;if(Math.abs(dz)>Math.abs(sz))sz=dz}
 if(sx||sz){c.p.x+=sx;c.p.z+=sz;const l=Math.hypot(sx,sz);return[sx/l,sz/l]}return 0}
function drive(dt,ix,iz){const c=pl.car,q=pl.pos,boost=(keys.ShiftLeft||PAD.sprint)?1.5:1,hb=keys.Space||PAD.jump;c.st=(c.st||0)+(ix-(c.st||0))*Math.min(1,7*dt);
 let f=new V3(Math.sin(c.h),0,Math.cos(c.h)),sp=c.v.dot(f);const lat=c.v.clone().addScaledVector(f,-sp);
 if(iz>0)sp+=(sp<10?22:16)*boost*iz*dt;else if(iz<0)sp-=(sp>.5?34:10)*-iz*dt;
 sp*=Math.exp(-(iz?.12:.35)*dt);if(hb)sp*=Math.exp(-.9*dt);if(wet(c.p.x,c.p.z))sp*=Math.exp(-3*dt);sp=Math.max(-8,Math.min(26*boost,sp));
 c.h-=c.st*2.1*Math.min(1,Math.abs(sp)/5)*(sp<0?-1:1)*dt/(1+Math.abs(sp)/30);
 lat.multiplyScalar(Math.exp(-(hb?1.4:9)*dt));f=new V3(Math.sin(c.h),0,Math.cos(c.h));c.v.copy(f).multiplyScalar(sp).add(lat);
 c.p.x+=c.v.x*dt;c.p.z+=c.v.z*dt;c.p.y=c.y;const n=collideCar(c);if(n){const vn=c.v.x*n[0]+c.v.z*n[1];if(vn<0){if(-vn>6)sh=Math.max(sh,.25);c.v.x-=n[0]*vn*1.25;c.v.z-=n[1]*vn*1.25;c.v.multiplyScalar(.92)}}
 const g=ground(c.p.x,c.p.z,c.y+.3);if(c.vy>0||c.y>g+.35){c.vy-=24*dt;c.y+=c.vy*dt;if(c.y<=g){c.y=g;c.vy=0}}else{c.y=g;c.vy=0}
 const gF=ground(c.p.x+f.x*1.6,c.p.z+f.z*1.6,c.y+.5),gB=ground(c.p.x-f.x*1.6,c.p.z-f.z*1.6,c.y+.5);c.pt+=(Math.max(-.6,Math.min(.6,Math.atan2(gF-gB,3.2)))-c.pt)*Math.min(1,10*dt);
 if(c.y<-35){c.p.set(c.home[0],0,c.home[1]);c.y=ground(c.home[0],c.home[1],1);c.v.set(0,0,0);c.h=c.home[2];c.vy=0}
 c.g.position.set(c.p.x,c.y,c.p.z);c.g.rotation.set(-c.pt,c.h,0);q.set(c.p.x,c.y,c.p.z);pl.vel.copy(c.v);pl.yaw=c.h;
 const spd=c.v.length();if(spd>6)E.forEach(e=>{if(!alive(e)||e.st=='hurt')return;const d=e.pos.clone().sub(c.p);d.y=0;if(Math.abs(d.dot(f))<2.6&&d.lengthSq()<9)hurtEnemy(e,spd*1.8,d.lengthSq()>.01?d.normalize():f.clone())})}
const collide=(p,R=.35)=>{for(const b of solids){if(p.y>=b.top-.45)continue;const a=p.x-(b.x0-R),c=b.x1+R-p.x,d=p.z-(b.z0-R),e=b.z1+R-p.z;
 if(a>0&&c>0&&d>0&&e>0){const m=Math.min(a,c,d,e);if(m==a)p.x-=a;else if(m==c)p.x+=c;else if(m==d)p.z-=d;else p.z+=e}}for(const t of trunks){const dx=p.x-t[0],dz=p.z-t[1],r=R+t[2],d2=dx*dx+dz*dz;if(d2<r*r&&d2>1e-6){const d=Math.sqrt(d2);p.x=t[0]+dx/d*r;p.z=t[1]+dz/d*r}}};
const near=(b,p)=>new V3(Math.min(Math.max(p.x,b.x0),b.x1),0,Math.min(Math.max(p.z,b.z0),b.z1));
// ---------- entrada ----------
const keys={},pressed={};let cy=0,cp=.35,cd=5.5,locked=false;
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test(e.target.tagName)&&e.code!='Tab')return;if(e.ctrlKey||e.metaKey||/^F\d/.test(e.code))return;if(e.code=='Tab'){e.preventDefault();document.body.classList.toggle('noui');return}
 e.preventDefault();if(!e.repeat){pressed[e.code]=1;if(e.code=='Escape')pressed.Esc=1}keys[e.code]=1});
addEventListener('keyup',e=>keys[e.code]=0);
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement==$('c');if(locked)$('msg').style.display='none'});
$('c').addEventListener('click',()=>{if(!locked)$('c').requestPointerLock()});
addEventListener('mousemove',e=>{if(locked){cy-=e.movementX*CFG.sens;cp=Math.max(-.2,Math.min(1.25,cp+e.movementY*CFG.sens))}});
addEventListener('mousedown',e=>{if(locked&&e.button==0)pressed.Click=1});
addEventListener('wheel',e=>{cd=Math.max(2.5,Math.min(12,cd+e.deltaY*.004))});
const ang=(a,b,k)=>{const d=((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return a+d*k};
// ---------- personaje ----------
let gltf,clips={},pl,en,p,orbs=[];
function mk(m){return new CyborgController(m,{THREE:T,config:CFG,clips, onAnimation:(name,actor)=>{document.querySelectorAll('#list button').forEach(b=>b.classList.toggle('on',b.dataset.n==name&&actor===p))}})}
function prep(m){m.scale.setScalar(1.8);m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}})}
function start(g){gltf=g;g.animations.forEach(c=>{clips[c.name]=c;c.tracks.forEach(t=>{if(/Hips\.position$/.test(t.name)){const v=t.values;for(let i=3;i<v.length;i+=3){v[i]=v[0];v[i+1]=v[1]}}})});
 prep(g.scene);p=mk(g.scene);scene.add(p.root);
 pl={pos:p.root.position,vel:new V3(),yaw:Math.PI,st:'ground',crouch:false,combat:false,vy:0,air:0,peak:0,combo:0,comboT:0,hp:100,o2:100,car:null,jb:0,coy:0,vj:0,inv:0,deadT:0,spawn:new V3(),n:new V3(0,0,1),b:null,leap:0,hangT:1,lcd:0};
 SPAWNS.forEach(z=>mkEnemy(z[0],z[1],z[2]));
 Object.keys(clips).sort((a,b)=>a.toLowerCase()<b.toLowerCase()?-1:1).forEach(n=>{const b=document.createElement('button');b.textContent=n;b.dataset.n=n;
  b.onclick=()=>{b.blur();pl.st='manual';p.play(n,{restart:1})};$('list').appendChild(b)});
 $('msg').textContent='Haz clic en la escena para jugar (Esc suelta el mouse)';requestAnimationFrame(loop)}
// ---------- acciones ----------
function jump(){pl.crouch=false;pl.vy=CFG.jump;pl.vj=1;pl.st='air';pl.air=0;pl.peak=pl.pos.y;pl.jumped=true;pl.jb=0;pl.coy=0;p.play('jump',{once:1,restart:1,fade:.1})}
function act(n,cut,o={}){const ts=o.ts||1;pl.st='act';pl.actT=0;pl.actEnd=Math.min(cut,clips[n].duration)/ts;pl.actMove=o.move;pl.after=o.after;pl.canc=o.canc;pl.hitAt=o.hit!=null?o.hit/ts:null;pl.hitDone=0;pl.fired=0;pl.hitSet=new Set;pl.sweep=o.sweep;pl.onHit=o.onHit;p.play(n,{once:1,restart:1,fade:.1,ts})}
const fwd=()=>new V3(Math.sin(pl.yaw),0,Math.cos(pl.yaw));
const alive=e=>e.st!='dead'&&e.st!='rise';
function toast(t){const m=$('msg');m.textContent=t;m.style.display='';clearTimeout(toast.h);toast.h=setTimeout(()=>m.style.display='none',2200)}
function mkEnemy(x,z,o){const m=SkeletonUtils.clone(gltf.scene);prep(m);const mats=[];m.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.material.emissive=new T.Color(0x220606);mats.push(c.material)}});
 const a=mk(m);a.root.position.set(x,ground(x,z,1),z);scene.add(a.root);const e={a,pos:a.root.position,hp:o.dummy?100:60,st:o.dummy?'dummy':'patrol',t:0,vel:new V3(),fl:0,mats,yaw:o.yaw||0,o,wi:0,al:0,cd:0,last:new V3(),dummy:!!o.dummy,home:new V3(x,ground(x,z,1),z)};
 a.play(o.dummy?'Offensive Idle':'Idle');E.push(e)}
function resetEnemies(){E.forEach(e=>{e.hp=e.dummy?100:60;e.pos.copy(e.home);e.vel.set(0,0,0);e.al=0;e.wi=0;e.st=e.dummy?'dummy':'patrol';e.yaw=e.o.yaw||0;e.a.play(e.dummy?'Offensive Idle':'Idle',{restart:1})})}
function hurtPlayer(d,k){if(pl.inv>0||pl.st=='dead')return;pl.hp-=d;pl.inv=.7;sh=.35;rumble(180,.7,.5);
 if(pl.hp<=0){pl.hp=0;pl.st='dead';p.root.visible=true;pl.car=null;pl.deadT=0;pl.vel.set(0,0,0);p.play('Death',{once:1,restart:1});return}
 if(pl.st=='climb'||pl.st=='hang'){release();return}
 if(pl.st=='ground'||pl.st=='act'||pl.st=='cover'){pl.crouch=false;pl.vel.copy(k).multiplyScalar(3);act('Receive Uppercut To The Face',.6,{canc:.55,ts:1.2})}}
function hurtEnemy(e,d,k){if(!alive(e))return;hs=d>=20?.09:.05;sh=.12;if(e.st=='patrol'&&e.al<.5)d*=3;e.hp-=d;e.fl=.15;e.vel.copy(k).multiplyScalar(3.5+Math.min(d,40)*.18);e.t=0;
 if(e.hp<=0){e.st='dead';e.a.play('Death',{once:1,restart:1})}else{e.st='hurt';e.al=1;e.last.copy(pl.pos);e.a.play('Receive Uppercut To The Face',{once:1,restart:1,fade:.08})}}
function melee(d,reach){return()=>{const f=fwd();E.forEach(e=>{if(pl.hitSet.has(e)||!alive(e))return;const v=e.pos.clone().sub(pl.pos);if(Math.abs(v.y)>1.8)return;v.y=0;const l=v.length(),n=l>.01?v.divideScalar(l):f.clone();
 if(l<reach&&(l<.9||n.dot(f)>0)){pl.hitSet.add(e);hurtEnemy(e,d,n.lerp(f,.5).normalize())}});
 dyn.forEach(o=>{if(pl.hitSet.has(o))return;const v=o.p.clone().sub(pl.pos);v.y=0;const l=v.length();if(l<reach+.4&&(l<.9||v.normalize().dot(f)>0)){pl.hitSet.add(o);o.v.addScaledVector(f,o.ball?14:9)}})}}
function attack(n,cut,d,lunge,spell,ts){ts=(ts||1)*CFG.atk;let b=null,bd=5;E.forEach(e=>{const v=e.pos.clone().sub(pl.pos);v.y=0;if(alive(e)&&v.length()<bd){bd=v.length();b=v}});if(b)pl.yaw=Math.atan2(b.x,b.z);else if(pl.hasIn)pl.yaw=pl.inYaw;
 const o={hit:cut*.4,canc:.5,ts,sweep:!spell,move:lunge?1:0,onHit:spell?()=>{const m=new T.Mesh(new T.SphereGeometry(.22),new T.MeshBasicMaterial({color:0x66f0ff}));
  const f=fwd();m.position.copy(pl.pos).add(new V3(0,1.2,0)).addScaledVector(f,.7);scene.add(m);orbs.push({m,v:f.multiplyScalar(14),t:1.4})}:melee(d,2.4)};
 act(n,cut,o);if(lunge)pl.vel.copy(fwd()).multiplyScalar(b&&bd>1.5?Math.min(7,Math.max(lunge,(bd-1.1)*4.5)):(b?lunge*.4:lunge))}
const combo=[['Cross Punch',.9,10,1.25],['Elbow Punching',.65,10,1.15],['Quad Punch',1.5,22,1.2],['Knee Jabs To Uppercut',2.4,30,1.2]];
const SK={Digit1:['Roundhouse Kick',1.5,20,1.5,0,1.15],Digit2:['Flying Kick',1.3,25,5,0,1.1],Digit3:['patadada head badamme',1.2,18,1.5,0,1.1],Digit4:['Two Hand Spell Casting',2.2,0,0,1],Digit5:['Boxing',1.4,12,1.5,0,1.2]};
function grab(){for(const b of solids){if(!b.climb||pl.pos.y>b.top-1)continue;const q=near(b,pl.pos);if(q.distanceTo(new V3(pl.pos.x,0,pl.pos.z))<.9){pl.b=b;
 pl.n.set(pl.pos.x-q.x,0,pl.pos.z-q.z);if(pl.n.lengthSq()<.01)pl.n.set(0,0,1);pl.n.normalize();pl.st='climb';pl.vy=0;pl.vel.set(0,0,0);attach(.35);return 1}}}
function attach(off){const q=near(pl.b,pl.pos),d=new V3(pl.pos.x-q.x,0,pl.pos.z-q.z);if(d.length()>.01)pl.n.copy(d.normalize());pl.pos.x=q.x+pl.n.x*off;pl.pos.z=q.z+pl.n.z*off}
function release(){pl.st='air';pl.vel.copy(pl.n).multiplyScalar(1.5);pl.vy=0;pl.peak=pl.pos.y;pl.air=.3;pl.jumped=false}
// ---------- esquinas ----------
function ledge(){if(pl.lcd>0||pl.vy>3)return 0;const f=fwd();for(const b of solids){if(b.cover||b.top<1.6||b.climb=='rope')continue;const h=pl.pos.y+1.75-b.top;if(h<-.35||h>.4)continue;
 const n=near(b,pl.pos),dx=n.x-pl.pos.x,dz=n.z-pl.pos.z,l=Math.hypot(dx,dz);if(l>CFG.ledge||l<.01||(dx*f.x+dz*f.z)/l<.3)continue;
 pl.b=b;pl.n.set(-dx,0,-dz).normalize();pl.st='hang';pl.vy=0;pl.vel.set(0,0,0);pl.hangT=0;pl.pos.y=b.top-1.75;attach(.35);p.play('Braced Hang Shimmy',{ts:0,restart:1,fade:.08});rumble(70,.3,.3);return 1}return 0}
function mantle(){const b=pl.b,q=pl.pos,c=clips['cover to stand'];pl.st='mantle';pl.mT=0;pl.m0=q.clone();pl.m1=new V3(q.x-pl.n.x*1.05,b.top,q.z-pl.n.z*1.05);p.play('cover to stand',{once:1,restart:1,ts:Math.min(1.1,c.duration)/.65,fade:.1})}
// ---------- mando ----------
// ---------- bucle del jugador ----------
function step(dt){
 const k=keys,pm=Math.hypot(PAD.x,PAD.y),pu=pm>.18,ix=pu?PAD.x/Math.max(1,pm):(k.KeyD?1:0)-(k.KeyA?1:0),iz=pu?-PAD.y/Math.max(1,pm):(k.KeyW?1:0)-(k.KeyS?1:0),mag=pu?Math.min(1,pm):1,fx=-Math.sin(cy),fz=-Math.cos(cy);
 let mx=ix*-fz+iz*fx,mz=ix*fx+iz*fz;const has=!!(ix||iz);if(has){const l=Math.hypot(mx,mz);mx/=l;mz/=l}
 pl.hasIn=has;pl.inYaw=Math.atan2(mx,mz);const q=pl.pos,v=pl.vel;pl.comboT-=dt;pl.inv-=dt;pl.lcd-=dt;if(pressed.Space)pl.jb=CFG.buf;pl.jb-=dt;pl.coy-=dt;if(q.y<-35&&pl.st!='drive'&&pl.st!='dead'){q.copy(pl.spawn);v.set(0,0,0);pl.vy=0;pl.hp=Math.max(1,pl.hp-20);pl.st='ground';pl.crouch=false;toast('Caíste al vacío')}if(pl.st=='dead'&&(pl.deadT+=dt)>4){q.copy(pl.spawn);pl.hp=100;v.set(0,0,0);pl.crouch=false;resetEnemies();act('getting up',2.6,{});pl.inv=2}
 if(pressed.Next){zi=(zi+1)%ZN.length;pressed[ZN[zi]]=1}
 for(const c in TP)if(pressed[c]){pl.spawn.set(TP[c][0],ground(TP[c][0],TP[c][1],1),TP[c][1]);pressed.KeyT=1}if(pressed.KeyT){q.copy(pl.spawn);pl.hp=100;p.root.visible=true;pl.car=null;v.set(0,0,0);pl.st='ground';pl.crouch=false}
 if(pressed.KeyK){if(pl.st=='dead'){pl.hp=100;act('getting up',2.6,{})}else{pl.st='dead';pl.deadT=0;v.set(0,0,0);p.play('Death',{once:1,restart:1})}}
 if(pressed.KeyY)resetEnemies();if(pl.st=='manual'&&(has||pressed.Space||pressed.Esc))pl.st='ground';
 if(pressed.KeyR&&pl.st=='ground')pl.combat=!pl.combat;
 if(pressed.KeyC&&pl.st=='ground')pl.crouch=!pl.crouch;
 const fight=(pl.st=='ground'||(pl.st=='act'&&pl.hitDone&&pl.actT>pl.actEnd*.42))&&!pl.crouch;
 {const w=pressed.Click?'Click':Object.keys(SK).find(c=>pressed[c]);if(w&&!pl.crouch&&(pl.st=='ground'||pl.st=='act'))pl.buf=[w,.35];
  if(pl.buf){pl.buf[1]-=dt;if(pl.buf[1]<=0)pl.buf=null;else if(fight){const w2=pl.buf[0];pl.buf=null;
   if(w2=='Click'){const c=pl.comboT>0?pl.combo:0;pl.combo=(c+1)%combo.length;pl.comboT=1.3;const a=combo[c];attack(a[0],a[1],a[2],2.5,0,a[3])}else{const s=SK[w2];attack(s[0],s[1],s[2],s[3],s[4],s[5])}}}}
 if(pressed.KeyQ&&!pl.crouch&&(pl.st=='ground'||(pl.st=='act'&&pl.actT>pl.actEnd*.3))){const dx=has?mx:Math.sin(pl.yaw),dz=has?mz:Math.cos(pl.yaw);pl.yaw=Math.atan2(dx,dz);act('falling to roll',1.5,{move:1,canc:.55,ts:1.5});v.set(dx*CFG.roll,0,dz*CFG.roll);pl.inv=.55;pl.buf=null}
 switch(pl.st){
 case'ground':{let spd=0,clip='Idle',ts=1;const sp0=Math.hypot(v.x,v.z);pl.asp=Math.max(4.5,Math.min(7.5,sp0));
  if(pl.combat&&!pl.crouch){pl.yaw=ang(pl.yaw,Math.atan2(fx,fz),1-Math.exp(-14*dt));spd=CFG.combat;
   if(!has)clip='Offensive Idle';else if(Math.abs(iz)>=Math.abs(ix)){clip='walking';ts=iz>0?1:-1}else clip=ix>0?'right strafe walking':'left strafe walking'}
  else{if(has)pl.yaw=ang(pl.yaw,Math.atan2(mx,mz),1-Math.exp(-CFG.turn*dt));
   if(pl.crouch){spd=CFG.crouch;clip=has?'Crouched Walking':'Crouching Idle'}else if(!has){clip='Idle';if(sp0>3.6&&!pl.combat){act('run to stop',.7,{move:1,canc:.25});break}}
   else if(k.ShiftLeft||PAD.sprint){spd=CFG.sprint;clip='Fast Run'}else if(k.KeyZ||mag<.6){spd=CFG.walk;clip='walking'}else{spd=CFG.run*Math.max(.75,mag);clip='running'}}
  const kk=1-Math.exp(-(has?CFG.accel:CFG.decel)*dt);v.x+=((has?mx*spd:0)-v.x)*kk;v.z+=((has?mz*spd:0)-v.z)*kk;
  q.x+=v.x*dt;q.z+=v.z*dt;collide(q);const g=ground(q.x,q.z,q.y);
  if(q.y-g>.4){pl.st='air';pl.peak=q.y;pl.air=.2;pl.vy=0;pl.jumped=false;pl.coy=CFG.coy;pl.vj=0}else{const dy=g-q.y;if(Math.abs(dy)>.02)vo-=dy;q.y=g}
  if(pads.some(d=>Math.hypot(q.x-d.x,q.z-d.z)<1&&q.y<.3)){pl.vy=16;pl.vj=0;pl.st='air';pl.air=0;pl.peak=q.y;pl.jumped=true;p.play('jump',{once:1,restart:1,fade:.1});break}
  if(pl.jb>0){jump();break}
  if(pressed.KeyE&&(grab()||enterCar()))break;
  if(pressed.KeyF){for(const b of solids){if(!b.cover||b.top>2)continue;const n=near(b,q);if(n.distanceTo(new V3(q.x,0,q.z))<1.2){pl.b=b;pl.n.set(q.x-n.x,0,q.z-n.z).normalize();pl.crouch=true;attach(.5);v.set(0,0,0);act('stand to cover',1.1,{after:'cover'});break}}}
  if(pl.st=='ground'){const sv=Math.hypot(v.x,v.z);if(spd>0&&clip!='Idle'&&clip!='Offensive Idle'&&clip!='Crouching Idle')ts*=Math.max(.65,Math.min(1.35,sv/spd));p.play(clip,{ts})}break}
 case'air':{pl.air+=dt;pl.leap-=dt;if(pl.coy>0&&pl.jb>0&&!pl.jumped){jump();break}pl.vy-=(pl.vy>0&&pl.vj&&!(k.Space||PAD.jump)?CFG.cutG:CFG.grav)*dt;const as=pl.asp||4.5,kk=1-Math.exp(-(has?CFG.air:1.2)*dt);v.x+=((has?mx*as:0)-v.x)*kk;v.z+=((has?mz*as:0)-v.z)*kk;if(has)pl.yaw=ang(pl.yaw,Math.atan2(mx,mz),1-Math.exp(-9*dt));
  q.x+=v.x*dt;q.z+=v.z*dt;collide(q);q.y+=pl.vy*dt;pl.peak=Math.max(pl.peak,q.y);
  if(!(pl.jumped&&pl.air<.55))p.play('falling idle');
  if(pressed.KeyE&&grab())break;if(ledge())break;
  if(wet(q.x,q.z)&&q.y<-.45&&pl.leap<=0){pl.st='swim';pl.sy=Math.max(-5,pl.vy*.45);pl.vy=0;pl.crouch=false;break}
  const g=ground(q.x,q.z,q.y);
  if(pl.vy<=0&&q.y<=g){q.y=g;const d=pl.peak-g,sp=Math.hypot(v.x,v.z);pl.vy=0;
   if(d>6){v.set(0,0,0);if(d>8)hurtPlayer(Math.min(60,(d-8)*7),v);if(pl.st!='dead')act('hard landing',1.4,{canc:.55})}else if(d>2.8){if(sp>2.5){v.copy(fwd()).multiplyScalar(5.5);act('falling to roll',1.4,{move:1,canc:.4,ts:1.2})}else{v.set(0,0,0);act('Falling To Landing',.9,{canc:.3,ts:1.2})}}else{pl.st='ground';if(pl.jb>0)jump()}}
  break}
 case'swim':{const dash=k.ShiftLeft||PAD.sprint,sp=dash?CFG.swimV*1.5:CFG.swimV,fl=base(q.x,q.z),dn=k.KeyC||PAD.dive,up=k.Space||PAD.jump;pl.crouch=false;pl.asp=4.5;
  if(has)pl.yaw=ang(pl.yaw,Math.atan2(mx,mz),1-Math.exp(-10*dt));
  const kk=1-Math.exp(-(has?7:3.5)*dt);v.x+=((has?mx*sp:0)-v.x)*kk;v.z+=((has?mz*sp:0)-v.z)*kk;q.x+=v.x*dt;q.z+=v.z*dt;
  if(inPool(q.x,q.z,.5)){q.x=Math.min(Math.max(q.x,P.x0+.2),P.x1-.2);q.z=Math.min(Math.max(q.z,P.z0+.2),P.z1-.2)}
  if(pressed.KeyC&&q.y>-1.8)pl.sy=-4.5;const sub=q.y<-1.6,ty=dn?-3.2:up?3:sub?(has?Math.max(-3.2,Math.min(3,-iz*(cp-.35)*5))*(dash?1.3:1):-.25):1.2;pl.sy=(pl.sy||0)+(ty-(pl.sy||0))*(1-Math.exp(-6*dt));q.y+=pl.sy*dt;q.y=Math.min(-.95,Math.max(fl+.15,q.y));
  p.play(has?'Swimming':'Treading Water',{ts:has&&dash?1.35:1});
  if(q.y<-1.8){pl.o2-=dt*5;if(pl.o2<=0){pl.o2=0;hurtPlayer(8,v)}}else pl.o2=Math.min(100,pl.o2+dt*40);
  {const dx=has?mx:Math.sin(pl.yaw),dz=has?mz:Math.cos(pl.yaw),ax=q.x+dx*1.1,az=q.z+dz*1.1,ga=ground(ax,az,.6);
   if(q.y>-1.3&&ga-q.y>.35&&ga<=.7&&!wet(ax,az)&&(has||pressed.Space)){pl.st='air';pl.vj=0;pl.vy=8.4;pl.leap=.7;pl.air=0;pl.peak=q.y;pl.jumped=false;v.set(dx*3.2,0,dz*3.2);pl.sy=0;p.play('jump',{once:1,restart:1,fade:.1});break}}
  if(!wet(q.x,q.z)){pl.st='ground';pl.sy=0}break}
 case'drive':{if(pressed.KeyE){exitCar();break}drive(dt,ix,iz);break}
 case'act':{pl.actT+=dt;if(pl.canc!=null&&pl.actT>pl.actEnd*pl.canc&&(has||pl.jb>0)){pl.st=pl.after||'ground';pl.after=null;pl.hitDone=0;break}if(pl.hitAt!=null&&pl.actT>=pl.hitAt){pl.hitDone=1;if(pl.sweep){if(pl.actT<pl.hitAt+.2)pl.onHit&&pl.onHit()}else if(!pl.fired){pl.fired=1;pl.onHit&&pl.onHit()}}
  v.multiplyScalar(Math.exp(-(pl.actMove?2.5:12)*dt));q.x+=v.x*dt;q.z+=v.z*dt;collide(q);q.y=ground(q.x,q.z,q.y);
  if(pl.actT>=pl.actEnd){pl.st=pl.after||'ground';pl.after=null;if(pl.st=='ground')pl.hitDone=0}break}
 case'hang':{const b=pl.b;pl.hangT+=dt;pl.yaw=Math.atan2(-pl.n.x,-pl.n.z);
  if(pressed.KeyE||pressed.KeyC||(iz<-.6&&pl.hangT>.35)){release();pl.lcd=.6;break}
  if(pl.hangT>.15&&(iz>.6||pl.jb>0)){pl.jb=0;mantle();break}
  if(pressed.KeyH&&b.climb){pl.st='climb';break}
  {const s=has?Math.max(-1,Math.min(1,mx*pl.n.z-mz*pl.n.x)):0,sx=Math.abs(s)<.3?0:s;q.x+=pl.n.z*sx*dt;q.z-=pl.n.x*sx*dt;p.play(sx<0?'Left Shimmy':sx>0?'Right Shimmy':'Braced Hang Shimmy',{ts:sx||0})}
  attach(.35);break}
 case'mantle':{pl.mT+=dt;const t=Math.min(1,pl.mT/.65),a=pl.m0,c=pl.m1,u=sm((t-.35)/.65);q.y=a.y+(c.y-a.y)*sm(t/.7);q.x=a.x+(c.x-a.x)*u;q.z=a.z+(c.z-a.z)*u;pl.yaw=Math.atan2(-pl.n.x,-pl.n.z);
  if(t>=1){pl.st='ground';pl.hitDone=0;pl.n.set(0,0,0);v.set(0,0,0)}break}
 case'climb':case'hang':{const b=pl.b,rope=b.climb=='rope';pl.yaw=Math.atan2(-pl.n.x,-pl.n.z);
  if(pressed.KeyE){release();break}
  if(pl.st=='climb'){q.y+=iz*1.3*dt;p.play(rope?'Climbing A Rope':'Climbing Up Wall',{ts:iz});
   if(q.y<=ground(q.x,q.z,q.y)+.02&&iz<0){pl.st='ground';break}
   if(q.y>=b.top-1.75){if(rope){release();break}mantle();break}
   if(pressed.KeyH&&!rope)pl.st='hang'}
  else{q.x+=pl.n.z*ix*1.0*dt;q.z-=pl.n.x*ix*1*dt;p.play(ix<0?'Left Shimmy':ix>0?'Right Shimmy':'Braced Hang Shimmy',{ts:ix||0});if(pressed.KeyH)pl.st='climb'}
  attach(.35);break}
 case'cover':{pl.yaw=Math.atan2(pl.n.x,pl.n.z);if(pressed.KeyF){pl.crouch=false;act('cover to stand',1.1);break}
  q.x+=-pl.n.z*ix*1.6*dt;q.z+=pl.n.x*ix*1.6*dt;attach(.5);p.play(ix<0?'left cover sneak':ix>0?'right cover sneak':'Crouching Idle');break}
 }
 if(pl.st!='climb'&&pl.st!='hang'&&wet(q.x,q.z)&&q.y<-.45&&pl.st=='ground')pl.st='swim';
 p.root.rotation.order='YXZ';p.root.rotation.y=pl.yaw;p.root.rotation.x+=((pl.st=='swim'&&has&&q.y<-1.6?Math.max(-.5,Math.min(.6,-(pl.sy||0)*.13)):0)-p.root.rotation.x)*Math.min(1,8*dt);
}
// ---------- enemigo, proyectiles, camara ----------
function los(a,b){for(let i=1;i<10;i++){const x=a.x+(b.x-a.x)*i/10,z=a.z+(b.z-a.z)*i/10;for(const o of solids)if(o.top>1.5&&x>o.x0&&x<o.x1&&z>o.z0&&z<o.z1)return false}return true}
const hidden=()=>pl.st=='cover'||(pl.crouch&&grass.some(g=>pl.pos.x>g.x0&&pl.pos.x<g.x1&&pl.pos.z>g.z0&&pl.pos.z<g.z1));
function sees(e){if(pl.st=='dead')return 0;const v=pl.pos.clone().sub(e.pos);v.y=0;const d=v.length();if(hidden())return d<1.8?1:0;
 const sp=Math.hypot(pl.vel.x,pl.vel.z),hear=pl.st=='swim'?6:sp>5.5?9:sp>3?5:pl.crouch?1:2.5;
 if(d<hear)return 1;if(d>(e.o.range||12)||!los(e.pos,pl.pos))return 0;
 return e.o.fov360||v.normalize().dot(new V3(Math.sin(e.yaw),0,Math.cos(e.yaw)))>.5?1:0}
function go(e,tx,tz,sp,dt,clip){const dx=tx-e.pos.x,dz=tz-e.pos.z,l=Math.hypot(dx,dz);if(l<.05)return l;e.yaw=ang(e.yaw,Math.atan2(dx,dz),1-Math.exp(-10*dt));
 e.pos.x+=dx/l*sp*dt;e.pos.z+=dz/l*sp*dt;collide(e.pos,.4);e.a.play(clip);return l}
function stepEnemy(e,dt){e.t+=dt;e.fl-=dt;e.cd-=dt;e.vel.multiplyScalar(Math.exp(-6*dt));e.pos.addScaledVector(e.vel,dt);if(e.vel.lengthSq()>.04)collide(e.pos,.4);{const g=ground(e.pos.x,e.pos.z,e.pos.y);if(g>-50)e.pos.y+=(g-e.pos.y)*Math.min(1,15*dt)}const P=pl.pos;
 if(e.st=='dummy'){const v=P.clone().sub(e.pos);e.yaw=ang(e.yaw,Math.atan2(v.x,v.z),1-Math.exp(-6*dt));e.a.play('Offensive Idle')}
 else if(e.st=='hurt'){if(e.t>.65)e.st=e.dummy?'dummy':'chase'}
 else if(e.st=='dead'){if(e.dummy&&e.t>3){e.st='rise';e.t=0;e.a.play('getting up',{once:1,restart:1})}}
 else if(e.st=='rise'){if(e.t>3.2){e.st='dummy';e.hp=100}}
 else if(e.st=='attack'){if(!e.hit&&e.t>.45){e.hit=1;const v=P.clone().sub(e.pos);v.y=0;if(v.length()<2.3)hurtPlayer(12,v.normalize())}if(e.t>1.1)e.st='chase'}
 else{const s=sees(e),ch=e.st=='chase';e.al=s?Math.min(1,e.al+dt*(ch?3:1.3)):Math.max(0,e.al-dt*(ch?.25:.5));if(s)e.last.copy(P);
  if(!ch&&e.al>=1)e.st='chase';
  if(e.st=='chase'){if(e.al<=0)e.st='patrol';else{const d=Math.hypot(P.x-e.pos.x,P.z-e.pos.z);
   if(s&&d<1.7){const v=P.clone().sub(e.pos);e.yaw=Math.atan2(v.x,v.z);if(e.cd<=0){e.st='attack';e.t=0;e.hit=0;e.cd=1.5;e.a.play(Math.random()<.5?'Cross Punch':'Elbow Punching',{once:1,restart:1,fade:.1})}else e.a.play('Offensive Idle')}
   else if(go(e,e.last.x,e.last.z,4,dt,'running')<.8)e.a.play('Offensive Idle')}}
  else if(e.o.path){const w=e.o.path[e.wi%e.o.path.length];if(go(e,w[0],w[1],1.6,dt,'walking')<.4)e.wi++}
  else e.a.play('Idle')}
 const t=e.st=='chase'||e.st=='attack'?0x991111:e.al>0?0x777700:0x220606;e.mats.forEach(m=>m.emissive.setHex(e.fl>0?0xcc3333:t));e.a.root.rotation.y=e.yaw}
function stepOrbs(dt){for(let i=orbs.length-1;i>=0;i--){const o=orbs[i];o.t-=dt;o.m.position.addScaledVector(o.v,dt);let hit=0;
 E.forEach(e=>{if(alive(e)&&o.m.position.distanceTo(e.pos.clone().setY(1))<1&&!hit){hit=1;hurtEnemy(e,30,o.v.clone().normalize())}});
 if(hit||o.t<=0){scene.remove(o.m);orbs.splice(i,1)}}}
let tm=0,gl=0,hs=0,sh=0,vo=0;
function stepWorld(dt){tm+=dt;const q=pl.pos,sp=Math.hypot(pl.vel.x,pl.vel.z);
 E.forEach(e=>{if(!alive(e))return;const dx=q.x-e.pos.x,dz=q.z-e.pos.z,l=Math.hypot(dx,dz);if(l<.8&&l>.001&&q.y<1){const f=(.8-l)/2;q.x+=dx/l*f;q.z+=dz/l*f;e.pos.x-=dx/l*f;e.pos.z-=dz/l*f}});
 cars.forEach(c=>{if(pl.car===c)return;c.v.multiplyScalar(Math.exp(-2*dt));c.p.addScaledVector(c.v,dt);c.p.y=c.y;{const n=collideCar(c);if(n){const vn=c.v.x*n[0]+c.v.z*n[1];if(vn<0){c.v.x-=n[0]*vn*1.3;c.v.z-=n[1]*vn*1.3}}}c.y=Math.max(ground(c.p.x,c.p.z,c.y+.5),c.y-20*dt);cars.forEach(o=>{if(o===c)return;const ax=c.p.x-o.p.x,az=c.p.z-o.p.z,l=Math.hypot(ax,az);if(l<3&&l>.01){const s=(3-l)*(pl.car===o?1:.5);c.p.x+=ax/l*s;c.p.z+=az/l*s;if(pl.car!==o){o.p.x-=ax/l*s;o.p.z-=az/l*s}else c.v.addScaledVector(o.v,.5*dt*8)}});c.g.position.set(c.p.x,c.y,c.p.z);
  const dx=q.x-c.p.x,dz=q.z-c.p.z,l=Math.hypot(dx,dz);if(l<1.5&&l>.01&&q.y<c.y+1&&pl.st!='drive'){q.x=c.p.x+dx/l*1.5;q.z=c.p.z+dz/l*1.5}});
 for(let i=0;i<E.length;i++)for(let j=i+1;j<E.length;j++){const a=E[i],b=E[j];if(!alive(a)||!alive(b))continue;const dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z,l=Math.hypot(dx,dz);if(l<.9&&l>.001){const f=(.9-l)/2;a.pos.x-=dx/l*f;a.pos.z-=dz/l*f;b.pos.x+=dx/l*f;b.pos.z+=dz/l*f}}
 if(pl.st!='swim')pl.o2=Math.min(100,pl.o2+dt*60);
 const nx=PF.cx+5*Math.sin(tm*.7),dx=nx-(PF.x0+PF.x1)/2,on=pl.st!='air'&&Math.abs(q.y-PF.top)<.1&&q.x>PF.x0&&q.x<PF.x1&&q.z>PF.z0&&q.z<PF.z1;
 PF.x0+=dx;PF.x1+=dx;PF.m.position.x=nx;if(on)q.x+=dx;
 dyn.forEach((d,i)=>{const b=d.ball;d.v.multiplyScalar(Math.exp(-(b?.6:5)*dt));d.p.addScaledVector(d.v,dt);const ex=d.p.x,ez=d.p.z;collide(d.p,d.r);
  if(d.p.x!=ex)d.v.x*=b?-.8:0;if(d.p.z!=ez)d.v.z*=b?-.8:0;
  const ax=d.p.x-q.x,az=d.p.z-q.z,l=Math.hypot(ax,az);
  if(l<R+d.r&&l>.001&&q.y<(b?.8:.55)&&pl.st!='dead'){const ov=R+d.r-l,s=Math.max(1.5,sp*(b?1.3:.5));d.p.x+=ax/l*ov;d.p.z+=az/l*ov;d.v.x=ax/l*s;d.v.z=az/l*s}
  for(let j=i+1;j<dyn.length;j++){const o=dyn[j],bx=o.p.x-d.p.x,bz=o.p.z-d.p.z,m=Math.hypot(bx,bz),r=d.r+o.r;if(m<r&&m>.001){const f=(r-m)/2;d.p.x-=bx/m*f;d.p.z-=bz/m*f;o.p.x+=bx/m*f;o.p.z+=bz/m*f}}
  cars.forEach(c=>{const cx=d.p.x-c.p.x,cz=d.p.z-c.p.z,l2=cx*cx+cz*cz;if(l2<4.4){const l=Math.sqrt(l2)||.01;d.p.x+=cx/l*(2.1-l);d.p.z+=cz/l*(2.1-l);const cs=c.v.length();if(cs>1.5){d.v.x=cx/l*Math.max(2,cs*(b?1.2:.7));d.v.z=cz/l*Math.max(2,cs*(b?1.2:.7))}}});d.m.position.set(d.p.x,d.y,d.p.z);if(b){d.m.rotation.z-=d.v.x*dt/.5;d.m.rotation.x+=d.v.z*dt/.5}});
 CP.forEach(c=>{if(Math.hypot(q.x-c[0],q.z-c[1])<2&&Math.abs(q.y-(c[2]||0))<3&&(pl.spawn.x!=c[0]||pl.spawn.z!=c[1])&&pl.st!='dead'){pl.spawn.set(c[0],c[2]||0,c[1]);pl.hp=100;toast('Checkpoint guardado')}});
 const gd=Math.hypot(q.x+4,q.z-43);if(gd<1.8&&!gl){gl=1;toast('Sigilo superado')}else if(gd>5)gl=0;
 const ch=E.some(e=>e.st=='chase'||e.st=='attack'),su=E.some(e=>e.al>0);
 $('al').textContent=ch?'Te persiguen':su?'Te sospechan':hidden()?'Oculto':'Sin detectar';$('hpp').style.width=pl.hp+'%';$('o2w').style.display=pl.o2<99?'':'none';$('o2').style.width=pl.o2+'%'}
const tg=new V3();
const PAD={on:0,x:0,y:0,sprint:0,jump:0,dive:0};
const gamepad=new GamepadController({config:{...(CFG.gamepad||{}),deadzone:CFG.dz,cameraDeadzone:CFG.dz},
 onStatus:message=>{const el=$('pad');if(el)el.textContent=message},
 onConnect:message=>toast(message),onDisconnect:message=>toast(message),
 onActivity:()=>{$('msg').style.display='none'}});
function rumble(d,s,w){gamepad.rumble(d,s,w)}
function pollPad(dt){gamepad.config.deadzone=gamepad.config.cameraDeadzone=CFG.dz;
 gamepad.update(dt,{PAD,pressed,onCamera:(x,y)=>{cy-=x*dt*(CFG.gamepad?.cameraSpeed||3);cp=Math.max(-.2,Math.min(1.25,cp+y*dt*(CFG.gamepad?.cameraSpeedY||2)))}})}
let last=0;function loop(t){requestAnimationFrame(loop);const rdt=Math.min((t-last)/1000||0,.05);last=t;pollPad(rdt);fa+=rdt;if(++fc>=45){const av=fa/fc;pc--;if(av>.028&&pr>1){pr=Math.max(1,pr-.25);ren.setPixelRatio(pr);rs();pc=8}else if(av<.0175&&pr<prMax&&pc<=0){pr=Math.min(prMax,pr+.25);ren.setPixelRatio(pr);rs()}fa=fc=0}const dt=hs>0?rdt*.1:rdt;hs-=rdt;
 step(dt);for(const k in pressed)delete pressed[k];E.forEach(e=>{const far=Math.hypot(e.pos.x-pl.pos.x,e.pos.z-pl.pos.z)>75&&e.st!='chase';e.a.root.visible=!far;if(far)return;stepEnemy(e,dt);e.a.mx.update(dt)});stepOrbs(dt);stepWorld(dt);p.update(dt);
 tg.lerp(new V3(pl.pos.x,pl.pos.y+1.5,pl.pos.z),1-Math.exp(-CFG.cam*dt));
 cam.position.set(tg.x+Math.sin(cy)*Math.cos(cp)*cd,Math.max(tg.y+Math.sin(cp)*cd,(wet(tg.x,tg.z)?-60:.1)),tg.z+Math.cos(cy)*Math.cos(cp)*cd);if(pl.st=='drive')cy=ang(cy,pl.yaw+Math.PI,1-Math.exp(-2.2*rdt));{const gy=ground(cam.position.x,cam.position.z,cam.position.y);if(cam.position.y<gy+.4)cam.position.y=gy+.4}sh=Math.max(0,sh-rdt*1.2);cam.position.x+=(Math.random()-.5)*sh*.3;cam.position.y+=(Math.random()-.5)*sh*.3;const sv=Math.hypot(pl.vel.x,pl.vel.z),tf=pl.st=='drive'?60+Math.min(14,sv*.55):(pl.st=='ground'&&sv>5.5)?68:60;cam.fov+=(tf-cam.fov)*Math.min(1,5*rdt);cam.updateProjectionMatrix();cam.lookAt(tg);{const uw=cam.position.y<WL&&wet(cam.position.x,cam.position.z);scene.fog.color.setHex(uw?0x1d5f8a:0x9db7c6);scene.fog.near=uw?1:60;scene.fog.far=uw?24:200;scene.background.setHex(uw?0x1d5f8a:0x9db7c6)}vo*=Math.exp(-16*rdt);p.root.children[0].position.y=vo;
 sun.position.set(pl.pos.x+20,pl.pos.y+32,pl.pos.z+12);sun.target.position.copy(pl.pos);
 $('st').textContent={ground:'En suelo',air:'En el aire',swim:'Nadando',act:'Acción',climb:'Trepando',hang:'Colgado',cover:'Cubierto',dead:'Muerto',manual:'Prueba de animación',drive:'Conduciendo',mantle:'Subiendo al borde'}[pl.st]+(pl.combat?' (pelea)':'')+(pl.crouch?' (agachado)':'');
 $('cl').textContent=p.name;ren.render(scene,cam)}
try{const glbUrl=new URL('../assets/cyborg.glb',import.meta.url).href;
 new GLTFLoader().load(glbUrl,start,undefined,e=>{$('msg').textContent='No se pudo cargar el modelo ('+glbUrl+'): '+(e.message||e)})}catch(e){$('msg').textContent='Error: '+e.message}

// ---------- ajustes, UI minimizable y export de config ----------
(()=>{const D=JSON.parse(JSON.stringify(CFG)),SC=[['Movimiento'],['walk','Caminar',.5,4,.1],['run','Correr',2,8,.1],['sprint','Sprint',4,12,.1],['crouch','Agachado',.5,3,.1],['combat','Postura pelea',1,5,.1],['accel','Aceleración',4,40,1],['decel','Frenado',4,40,1],['turn','Giro del cuerpo',3,30,1],
['Salto y aire'],['jump','Fuerza de salto',5,14,.1],['grav','Gravedad',10,45,1],['cutG','Gravedad al soltar salto',20,100,1],['coy','Coyote time (s)',0,.3,.01],['buf','Buffer de salto (s)',0,.4,.01],['air','Control en el aire',1,15,.5],['roll','Velocidad de esquive',3,14,.5],
['Agarre, agua y mando'],['ledge','Alcance de agarre',.4,1.2,.05],['swimV','Velocidad al nadar',1,6,.1],['dz','Zona muerta del mando',.05,.35,.01],['Animación'],['fade','Mezcla entre anims (s)',.02,.4,.01],['anim','Velocidad global de anims',.5,1.8,.05],['atk','Velocidad de ataques',.6,1.8,.05],
['Cámara'],['sens','Sensibilidad mouse',.001,.006,.0002],['cam','Suavidad de seguimiento',6,40,1],['fov','FOV',40,100,1],['dist','Distancia cámara',2.5,12,.1]],
box=$('cl2'),ins={};
const ap=k=>{if(k=='fov'){cam.fov=CFG.fov;cam.updateProjectionMatrix()}if(k=='dist')cd=CFG.dist};
const save=()=>{try{localStorage.setItem('cyborgCFG',JSON.stringify(CFG))}catch(e){}};
CFG.dist=D.dist=cd;
SC.forEach(r=>{if(r.length==1){const h=document.createElement('div');h.textContent=r[0];h.style.cssText='margin-top:8px;font-weight:700;color:var(--ac)';box.appendChild(h);return}
 const[k,n,a,b,st]=r,l=document.createElement('label'),v=document.createElement('span'),i=document.createElement('input');i.type='range';i.min=a;i.max=b;i.step=st;
 l.append(n,v,i);box.appendChild(l);ins[k]=[i,v];i.oninput=()=>{CFG[k]=+i.value;v.textContent=CFG[k];ap(k);save()};i.onchange=i.onpointerup=()=>i.blur()});
const sync=()=>{for(const k in ins){ins[k][0].value=CFG[k];ins[k][1].textContent=CFG[k];ap(k)}};
try{Object.assign(CFG,JSON.parse(localStorage.getItem('cyborgCFG')||'{}'))}catch(e){}sync();
addEventListener('wheel',()=>{CFG.dist=+cd.toFixed(1);ins.dist[0].value=CFG.dist;ins.dist[1].textContent=CFG.dist});
const tg=(id,el,cls)=>{$(id).onclick=()=>{const h=$(el).classList.toggle('hid');$(id).classList.toggle('on',!h);$(id).blur()}};
tg('bH','hud');tg('bHe','help');tg('bA','panel');tg('bC','cfg');$('bUI').onclick=()=>{document.body.classList.toggle('noui');$('bUI').textContent=document.body.classList.contains('noui')?'Mostrar UI':'Ocultar UI';$('bUI').blur()};
$('cX').onclick=()=>{const t=$('cT');t.classList.remove('hid');t.value=JSON.stringify(CFG,null,1);t.select();try{navigator.clipboard.writeText(t.value)}catch(e){}};
$('cI').onclick=()=>{const t=$('cT');if(t.classList.contains('hid')){t.classList.remove('hid');t.value='';t.focus();return}try{Object.assign(CFG,JSON.parse(t.value));sync();save();t.classList.add('hid')}catch(e){t.value='JSON inválido'}};
$('cR').onclick=()=>{Object.assign(CFG,D);CFG.dist=cd=D.dist;sync();save()};
window.CYBORG={CFG,defaults:D,controller:()=>p,gamepad};})();
