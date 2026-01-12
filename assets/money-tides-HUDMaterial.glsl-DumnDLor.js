import{fD as kt,qE as Nt,nd as Wt,az as Yt,bD as wt,as as Xt,a6 as Kt,qF as Jt,qG as Qt,or as Zt,k9 as eo,a9 as bt,cf as to,qH as oo,qI as ao,qJ as io,qi as no,qj as so,qk as ro,g0 as lo,e2 as oe,a5 as F,bW as W,ax as q,aI as k,dH as G,bX as L,av as ae,bY as re,a8 as Ze,a7 as yt,at as We,ei as Ye,iD as co,hn as Xe,n9 as uo,bh as fo,ga as po,gR as et,ft as tt,g4 as Pt,aG as $t,h6 as Ve,iC as St,ab as zt,dF as be,e3 as Ot,dk as ho,b$ as go,d$ as ot,g5 as vo,gz as mo,aJ as xo}from"./money-tides-app-config-DspwKZVt.js";import{u as wo}from"./money-tides-meshVertexSpaceUtils-DwY2pKQO.js";import{t as Ke}from"./money-tides-projectVectorToVector-B33Hquh5.js";import{o as bo,x as yo}from"./money-tides-hydratedFeatures-CoHFg86b.js";import{r as H,t as at,n as Y}from"./money-tides-vec3f32-WCVSSNPR.js";import{aE as Po,n as X,m as K,aF as it,aG as Ct,D as $o,ax as So,aq as Je,r as Be,a6 as Me,aH as zo,af as Oo,aI as At,aJ as Mt,as as Co,K as Ao,ap as Dt,i as Mo,aK as Do,G as Vo,H as jo,M as To,al as nt,L as Fe,b as st,aL as Fo,a2 as te,ai as _o,a as Ro,j as Eo,k as Uo,W as Io,V as Ho,X as Vt,Y as Bo,x as E,A as Go,aM as _e,t as qo,aN as Lo,aO as ko,aP as No,aB as Wo,aQ as Yo,aR as Xo,aS as Ko,aT as rt,aU as Jo,aV as lt,aW as ct,aX as Qo,aD as Zo}from"./money-tides-OutputColorHighlightOID.glsl-D2MMnfwD.js";import{A as ea,U as jt}from"./money-tides-Indices-CXdhPbrm.js";import{j as ta,U as oa,K as aa}from"./money-tides-plane-Tod57e4L.js";import{k as ia}from"./money-tides-sphere-CFc5S-F8.js";import"./money-tides-config-BVnrMf5g.js";import{t as M}from"./money-tides-orientedBoundingBox-DoPGpNBg.js";import{s as Tt,g as na}from"./money-tides-BufferView-Dq5EF-uG.js";import{_ as sa}from"./index-BfHNWA4H.js";import{Q as Ft,t as ra}from"./money-tides-InterleavedLayout-B-8vloq8.js";import{T as la,d as ca,c as ua}from"./money-tides-renderState-CKc66y4x.js";import{t as fa}from"./money-tides-VertexAttributeLocations-BfZbt_DV.js";import{a as U}from"./money-tides-jsxFactory-uxllTQB8.js";import{t as $,n as I}from"./money-tides-glsl-B5bJgrnA.js";import{s as pa}from"./money-tides-ShaderBuilder-BVJXxNar.js";function wi(o,e){if(o.type==="point")return ee(o,e,!1);if(bo(o))switch(o.type){case"extent":return ee(o.center,e,!1);case"polygon":return ee(ft(o),e,!1);case"polyline":return ee(ut(o),e,!0);case"mesh":return ee(wo(o.vertexSpace,o.spatialReference)??o.extent.center,e,!1);case"multipoint":return}else switch(o.type){case"extent":return ee(da(o),e,!0);case"polygon":return ee(ft(o),e,!0);case"polyline":return ee(ut(o),e,!0);case"multipoint":return}}function ut(o){const e=o.paths[0];if(!e||e.length===0)return null;const a=Qt(e,Zt(e)/2);return Ke(a[0],a[1],a[2],o.spatialReference)}function da(o){return Ke(.5*(o.xmax+o.xmin),.5*(o.ymax+o.ymin),o.zmin!=null&&o.zmax!=null&&isFinite(o.zmin)&&isFinite(o.zmax)?.5*(o.zmax+o.zmin):void 0,o.spatialReference)}function ft(o){const e=o.rings[0];if(!e||e.length===0)return null;const a=eo(o.rings,!!o.hasZ);return Ke(a[0],a[1],a[2],o.spatialReference)}function ee(o,e,a){const t=a?o:yo(o);return e&&o?Jt(o,t,e)?t:null:t}function bi(o,e,a,t=0){if(o){e||(e=wt());const i=o;let s=.5*i.width*(a-1),n=.5*i.height*(a-1);return i.width<1e-7*i.height?s+=n/20:i.height<1e-7*i.width&&(n+=s/20),Xt(e,i.xmin-s-t,i.ymin-n-t,i.xmax+s+t,i.ymax+n+t),e}return null}function yi(o,e,a=null){const t=Nt(Wt);return o!=null&&(t[0]=o[0],t[1]=o[1],t[2]=o[2],o.length>3&&(t[3]=o[3])),e!=null&&(t[3]=e),a&&Yt(t,t,a),t}function Pi(o=kt,e,a,t=1){const i=new Array(3);if(e==null||a==null)i[0]=1,i[1]=1,i[2]=1;else{let s,n=0;for(let r=2;r>=0;r--){const l=o[r],c=l!=null,u=r===0&&!s&&!c,p=a[r];let h;l==="symbol-value"||u?h=p!==0?e[r]/p:1:c&&l!=="proportional"&&isFinite(l)&&(h=p!==0?l/p:1),h!=null&&(i[r]=h,s=h,n=Math.max(n,Math.abs(h)))}for(let r=2;r>=0;r--)i[r]==null?i[r]=s:i[r]===0&&(i[r]=.001*n)}for(let s=2;s>=0;s--)i[s]/=t;return Kt(i)}function ha(o){return o.isPrimitive!=null}function $i(o){return ga(ha(o)?[o.width,o.depth,o.height]:o)?null:"Symbol sizes may not be negative values"}function ga(o){const e=a=>a==null||a>=0;return Array.isArray(o)?o.every(e):e(o)}function Si(o,e,a,t=bt()){return o&&no(t,t,-o/180*Math.PI),e&&so(t,t,e/180*Math.PI),a&&ro(t,t,a/180*Math.PI),t}function zi(o,e,a){if(a.minDemResolution!=null)return a.minDemResolution;const t=to(e),i=oo(o)*t,s=ao(o)*t,n=io(o)*(e.isGeographic?1:t);return i===0&&s===0&&n===0?a.minDemResolutionForPoints:.01*Math.max(i,s,n)}function pt(o,e){const a=o[e],t=o[e+1],i=o[e+2];return Math.sqrt(a*a+t*t+i*i)}function va(o,e){const a=o[e],t=o[e+1],i=o[e+2],s=1/Math.sqrt(a*a+t*t+i*i);o[e]*=s,o[e+1]*=s,o[e+2]*=s}function dt(o,e,a){o[e]*=a,o[e+1]*=a,o[e+2]*=a}function ma(o,e,a,t,i,s=e){(i=i||o)[s]=o[e]+a[t],i[s+1]=o[e+1]+a[t+1],i[s+2]=o[e+2]+a[t+2]}function xa(){return ht??=wa(),ht}function wa(){const a=new M([0,0,0,255,255,0,255,255],[0,1,2,3],2,!0);return new Po([["uv0",a]])}let ht=null;const Re=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],ba=[0,0,1,-1,0,0,1,0,0,0,-1,0,0,1,0,0,0,-1],ya=[0,0,1,0,1,1,0,1],Pa=[0,1,2,2,3,0,4,0,3,3,7,4,1,5,6,6,2,1,1,0,4,4,5,1,3,2,6,6,7,3,5,4,7,7,6,5],_t=new Array(36);for(let o=0;o<6;o++)for(let e=0;e<6;e++)_t[6*o+e]=o;const ne=new Array(36);for(let o=0;o<6;o++)ne[6*o]=0,ne[6*o+1]=1,ne[6*o+2]=2,ne[6*o+3]=2,ne[6*o+4]=3,ne[6*o+5]=0;function Oi(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(24);for(let t=0;t<8;t++)a[3*t]=Re[t][0]*e[0],a[3*t+1]=Re[t][1]*e[1],a[3*t+2]=Re[t][2]*e[2];return new K(o,[["position",new M(a,Pa,3,!0)],["normal",new M(ba,_t,3)],["uv0",new M(ya,ne,2)]])}const Ee=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,-.5,0],[0,.5,0]],$a=[0,1,-1,1,1,0,0,1,1,-1,1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0],Sa=[5,1,0,5,2,1,5,3,2,5,0,3,4,0,1,4,1,2,4,2,3,4,3,0],za=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7];function Ci(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(18);for(let t=0;t<6;t++)a[3*t]=Ee[t][0]*e[0],a[3*t+1]=Ee[t][1]*e[1],a[3*t+2]=Ee[t][2]*e[2];return new K(o,[["position",new M(a,Sa,3,!0)],["normal",new M($a,za,3)]])}const $e=H(-.5,0,-.5),Se=H(.5,0,-.5),ze=H(0,0,.5),Oe=H(0,.5,0),ce=Y(),ue=Y(),pe=Y(),de=Y(),he=Y();W(ce,$e,Oe),W(ue,$e,Se),ae(pe,ce,ue),q(pe,pe),W(ce,Se,Oe),W(ue,Se,ze),ae(de,ce,ue),q(de,de),W(ce,ze,Oe),W(ue,ze,$e),ae(he,ce,ue),q(he,he);const Ue=[$e,Se,ze,Oe],Oa=[0,-1,0,pe[0],pe[1],pe[2],de[0],de[1],de[2],he[0],he[1],he[2]],Ca=[0,1,2,3,1,0,3,2,1,3,0,2],Aa=[0,0,0,1,1,1,2,2,2,3,3,3];function Ai(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(12);for(let t=0;t<4;t++)a[3*t]=Ue[t][0]*e[0],a[3*t+1]=Ue[t][1]*e[1],a[3*t+2]=Ue[t][2]*e[2];return new K(o,[["position",new M(a,Ca,3,!0)],["normal",new M(Oa,Aa,3)]])}function Mi(o,e,a,t,i={uv:!0}){const s=-Math.PI,n=2*Math.PI,r=-Math.PI/2,l=Math.PI,c=Math.max(3,Math.floor(a)),u=Math.max(2,Math.floor(t)),p=(c+1)*(u+1),h=X(3*p),b=X(3*p),y=X(2*p),m=[];let d=0;for(let x=0;x<=u;x++){const C=[],f=x/u,z=r+f*l,O=Math.cos(z);for(let P=0;P<=c;P++){const B=P/c,w=s+B*n,j=Math.cos(w)*O,V=Math.sin(z),J=-Math.sin(w)*O;h[3*d]=j*e,h[3*d+1]=V*e,h[3*d+2]=J*e,b[3*d]=j,b[3*d+1]=V,b[3*d+2]=J,y[2*d]=B,y[2*d+1]=f,C.push(d),++d}m.push(C)}const g=new Array;for(let x=0;x<u;x++)for(let C=0;C<c;C++){const f=m[x][C],z=m[x][C+1],O=m[x+1][C+1],P=m[x+1][C];x===0?(g.push(f),g.push(O),g.push(P)):x===u-1?(g.push(f),g.push(z),g.push(O)):(g.push(f),g.push(z),g.push(O),g.push(O),g.push(P),g.push(f))}const v=[["position",new M(h,g,3,!0)],["normal",new M(b,g,3,!0)]];return i.uv&&v.push(["uv0",new M(y,g,2,!0)]),i.offset&&(v[0][0]="offset",v.push(["position",new M(Float64Array.from(i.offset),jt(g.length),3,!0)])),new K(o,v)}function Di(o,e,a,t){const i=Ma(e,a);return new K(o,i)}function Ma(o,e,a){let t,i;t=[0,-1,0,1,0,0,0,0,1,-1,0,0,0,0,-1,0,1,0],i=[0,1,2,0,2,3,0,3,4,0,4,1,1,5,2,2,5,3,3,5,4,4,5,1];for(let l=0;l<t.length;l+=3)dt(t,l,o/pt(t,l));let s={};function n(l,c){l>c&&([l,c]=[c,l]);const u=l.toString()+"."+c.toString();if(s[u])return s[u];let p=t.length;return t.length+=3,ma(t,3*l,t,3*c,t,p),dt(t,p,o/pt(t,p)),p/=3,s[u]=p,p}for(let l=0;l<e;l++){const c=i.length,u=new Array(4*c);for(let p=0;p<c;p+=3){const h=i[p],b=i[p+1],y=i[p+2],m=n(h,b),d=n(b,y),g=n(y,h),v=4*p;u[v]=h,u[v+1]=m,u[v+2]=g,u[v+3]=b,u[v+4]=d,u[v+5]=m,u[v+6]=y,u[v+7]=g,u[v+8]=d,u[v+9]=m,u[v+10]=d,u[v+11]=g}i=u,s={}}const r=it(t);for(let l=0;l<r.length;l+=3)va(r,l);return[["position",new M(it(t),i,3,!0)],["normal",new M(r,i,3,!0)]]}function Vi(o,{normal:e,position:a,color:t,rotation:i,size:s,centerOffsetAndDistance:n,uvi:r,featureAttribute:l,olidColor:c=null}={}){const u=a?Ze(a):F(),p=e?Ze(e):yt(0,0,1),h=t?[t[0],t[1],t[2],t.length>3?t[3]:255]:[255,255,255,255],b=s!=null&&s.length===2?s:[1,1],y=i!=null?[i]:[0],m=jt(1),d=[["position",new M(u,m,3,!0)],["normal",new M(p,m,3,!0)],["color",new M(h,m,4,!0)],["size",new M(b,m,2)],["rotation",new M(y,m,1,!0)]];if(r&&d.push(["uvi",new M(r,m,r.length)]),n!=null){const g=[n[0],n[1],n[2],n[3]];d.push(["centerOffsetAndDistance",new M(g,m,4)])}if(l){const g=[l[0],l[1],l[2],l[3]];d.push(["featureAttribute",new M(g,m,4)])}return new K(o,d,null,1,c,void 0,xa())}function Da(o,e,a,t,i=!0,s=!0){let n=0;const r=e,l=o;let c=H(0,n,0),u=H(0,n+l,0),p=H(0,-1,0),h=H(0,1,0);t&&(n=l,u=H(0,0,0),c=H(0,n,0),p=H(0,1,0),h=H(0,-1,0));const b=[u,c],y=[p,h],m=a+2,d=Math.sqrt(l*l+r*r);if(t)for(let f=a-1;f>=0;f--){const z=f*(2*Math.PI/a),O=H(Math.cos(z)*r,n,Math.sin(z)*r);b.push(O);const P=H(l*Math.cos(z)/d,-r/d,l*Math.sin(z)/d);y.push(P)}else for(let f=0;f<a;f++){const z=f*(2*Math.PI/a),O=H(Math.cos(z)*r,n,Math.sin(z)*r);b.push(O);const P=H(l*Math.cos(z)/d,r/d,l*Math.sin(z)/d);y.push(P)}const g=new Array,v=new Array;if(i){for(let f=3;f<b.length;f++)g.push(1),g.push(f-1),g.push(f),v.push(0),v.push(0),v.push(0);g.push(b.length-1),g.push(2),g.push(1),v.push(0),v.push(0),v.push(0)}if(s){for(let f=3;f<b.length;f++)g.push(f),g.push(f-1),g.push(0),v.push(f),v.push(f-1),v.push(1);g.push(0),g.push(2),g.push(b.length-1),v.push(1),v.push(2),v.push(y.length-1)}const x=X(3*m);for(let f=0;f<m;f++)x[3*f]=b[f][0],x[3*f+1]=b[f][1],x[3*f+2]=b[f][2];const C=X(3*m);for(let f=0;f<m;f++)C[3*f]=y[f][0],C[3*f+1]=y[f][1],C[3*f+2]=y[f][2];return[["position",new M(x,g,3,!0)],["normal",new M(C,v,3,!0)]]}function ji(o,e,a,t,i,s=!0,n=!0){return new K(o,Da(e,a,t,i,s,n))}function Ti(o,e,a,t,i,s,n){const r=i?at(i):H(1,0,0),l=s?at(s):H(0,0,0);n??=!0;const c=Y();q(c,r);const u=Y();G(u,c,Math.abs(e));const p=Y();G(p,u,-.5),L(p,p,l);const h=H(0,1,0);Math.abs(1-We(c,h))<.2&&oe(h,0,0,1);const b=Y();ae(b,c,h),q(b,b),ae(h,b,c);const y=2*t+(n?2:0),m=t+(n?2:0),d=X(3*y),g=X(3*m),v=X(2*y),x=new Array(3*t*(n?4:2)),C=new Array(3*t*(n?4:2));n&&(d[3*(y-2)]=p[0],d[3*(y-2)+1]=p[1],d[3*(y-2)+2]=p[2],v[2*(y-2)]=0,v[2*(y-2)+1]=0,d[3*(y-1)]=d[3*(y-2)]+u[0],d[3*(y-1)+1]=d[3*(y-2)+1]+u[1],d[3*(y-1)+2]=d[3*(y-2)+2]+u[2],v[2*(y-1)]=1,v[2*(y-1)+1]=1,g[3*(m-2)]=-c[0],g[3*(m-2)+1]=-c[1],g[3*(m-2)+2]=-c[2],g[3*(m-1)]=c[0],g[3*(m-1)+1]=c[1],g[3*(m-1)+2]=c[2]);const f=(w,j,V)=>{x[w]=j,C[w]=V};let z=0;const O=Y(),P=Y();for(let w=0;w<t;w++){const j=w*(2*Math.PI/t);G(O,h,Math.sin(j)),G(P,b,Math.cos(j)),L(O,O,P),g[3*w]=O[0],g[3*w+1]=O[1],g[3*w+2]=O[2],G(O,O,a),L(O,O,p),d[3*w]=O[0],d[3*w+1]=O[1],d[3*w+2]=O[2],v[2*w]=w/t,v[2*w+1]=0,d[3*(w+t)]=d[3*w]+u[0],d[3*(w+t)+1]=d[3*w+1]+u[1],d[3*(w+t)+2]=d[3*w+2]+u[2],v[2*(w+t)]=w/t,v[2*w+1]=1;const V=(w+1)%t;f(z++,w,w),f(z++,w+t,w),f(z++,V,V),f(z++,V,V),f(z++,w+t,w),f(z++,V+t,V)}if(n){for(let w=0;w<t;w++){const j=(w+1)%t;f(z++,y-2,m-2),f(z++,w,m-2),f(z++,j,m-2)}for(let w=0;w<t;w++){const j=(w+1)%t;f(z++,w+t,m-1),f(z++,y-1,m-1),f(z++,j+t,m-1)}}const B=[["position",new M(d,x,3,!0)],["normal",new M(g,C,3,!0)],["uv0",new M(v,x,2,!0)]];return new K(o,B)}function Fi(o,e,a,t,i,s){t=t||10,i=i==null||i,Tt(e.length>1);const n=[[0,0,0]],r=[],l=[];for(let c=0;c<t;c++){r.push([0,-c-1,-(c+1)%t-1]);const u=c/t*2*Math.PI;l.push([Math.cos(u)*a,Math.sin(u)*a])}return Va(o,l,e,n,r,i,s)}function Va(o,e,a,t,i,s,n=H(0,0,0)){const r=e.length,l=X(a.length*r*3+(6*t.length||0)),c=X(a.length*r*3+(t?6:0)),u=new Array,p=new Array;let h=0,b=0;const y=F(),m=F(),d=F(),g=F(),v=F(),x=F(),C=F(),f=F(),z=F(),O=F(),P=F(),B=F(),w=F(),j=ta();oe(z,0,1,0),W(m,a[1],a[0]),q(m,m),s?(L(f,a[0],n),q(d,f)):oe(d,0,0,1),gt(m,d,z,z,v,d,vt),k(g,d),k(B,v);for(let S=0;S<t.length;S++)G(x,v,t[S][0]),G(f,d,t[S][2]),L(x,x,f),L(x,x,a[0]),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2];c[b++]=-m[0],c[b++]=-m[1],c[b++]=-m[2];for(let S=0;S<i.length;S++)u.push(i[S][0]>0?i[S][0]:-i[S][0]-1+t.length),u.push(i[S][1]>0?i[S][1]:-i[S][1]-1+t.length),u.push(i[S][2]>0?i[S][2]:-i[S][2]-1+t.length),p.push(0),p.push(0),p.push(0);let V=t.length;const J=t.length-1;for(let S=0;S<a.length;S++){let me=!1;S>0&&(k(y,m),S<a.length-1?(W(m,a[S+1],a[S]),q(m,m)):me=!0,L(O,y,m),q(O,O),L(P,a[S-1],g),oa(a[S],O,j),aa(j,ia(P,y),f)?(W(f,f,a[S]),q(d,f),ae(v,O,d),q(v,v)):gt(O,g,B,z,v,d,vt),k(g,d),k(B,v)),s&&(L(f,a[S],n),q(w,f));for(let Z=0;Z<r;Z++)if(G(x,v,e[Z][0]),G(f,d,e[Z][1]),L(x,x,f),q(C,x),c[b++]=C[0],c[b++]=C[1],c[b++]=C[2],L(x,x,a[S]),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2],!me){const je=(Z+1)%r;u.push(V+Z),u.push(V+r+Z),u.push(V+je),u.push(V+je),u.push(V+r+Z),u.push(V+r+je);for(let Te=0;Te<6;Te++){const Lt=u.length-6;p.push(u[Lt+Te]-J)}}V+=r}const le=a[a.length-1];for(let S=0;S<t.length;S++)G(x,v,t[S][0]),G(f,d,t[S][1]),L(x,x,f),L(x,x,le),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2];const Q=b/3;c[b++]=m[0],c[b++]=m[1],c[b++]=m[2];const N=V-r;for(let S=0;S<i.length;S++)u.push(i[S][0]>=0?V+i[S][0]:-i[S][0]-1+N),u.push(i[S][2]>=0?V+i[S][2]:-i[S][2]-1+N),u.push(i[S][1]>=0?V+i[S][1]:-i[S][1]-1+N),p.push(Q),p.push(Q),p.push(Q);const ie=[["position",new M(l,u,3,!0)],["normal",new M(c,p,3,!0)]];return new K(o,ie)}function _i(o,e,a,t,i){const s=lo(3*e.length),n=new Array(2*(e.length-1));let r=0,l=0;for(let u=0;u<e.length;u++){for(let p=0;p<3;p++)s[r++]=e[u][p];u>0&&(n[l++]=u-1,n[l++]=u)}const c=[["position",new M(s,n,3,!0)]];if(a&&a.length===e.length&&a[0].length===3){const u=X(3*a.length);let p=0;for(let h=0;h<e.length;h++)for(let b=0;b<3;b++)u[p++]=a[h][b];c.push(["normal",new M(u,n,3,!0)])}return t&&c.push(["color",new M(t,ea(t.length/4),4)]),new K(o,c,null,2)}function Ri(o,e,a,t,i,s=0){const n=new Array(18),r=[[-a,s,i/2],[t,s,i/2],[0,e+s,i/2],[-a,s,-i/2],[t,s,-i/2],[0,e+s,-i/2]],l=[0,1,2,3,0,2,2,5,3,1,4,5,5,2,1,1,0,3,3,4,1,4,3,5];for(let c=0;c<6;c++)n[3*c]=r[c][0],n[3*c+1]=r[c][1],n[3*c+2]=r[c][2];return new K(o,[["position",new M(n,l,3,!0)]])}function Ei(o,e){const a=o.getMutableAttribute("position").data;for(let t=0;t<a.length;t+=3){const i=a[t],s=a[t+1],n=a[t+2];oe(fe,i,s,n),re(fe,fe,e),a[t]=fe[0],a[t+1]=fe[1],a[t+2]=fe[2]}}function Ui(o,e=o){const a=o.attributes,t=a.get("position").data,i=a.get("normal").data;if(i){const s=e.getMutableAttribute("normal").data;for(let n=0;n<i.length;n+=3){const r=i[n+1];s[n+1]=-i[n+2],s[n+2]=r}}if(t){const s=e.getMutableAttribute("position").data;for(let n=0;n<t.length;n+=3){const r=t[n+1];s[n+1]=-t[n+2],s[n+2]=r}}}function Ie(o,e,a,t,i){return!(Math.abs(We(e,o))>i)&&(ae(a,o,e),q(a,a),ae(t,a,o),q(t,t),!0)}function gt(o,e,a,t,i,s,n){return Ie(o,e,i,s,n)||Ie(o,a,i,s,n)||Ie(o,t,i,s,n)}const vt=.99619469809,fe=F();function ja(o){return o instanceof Float32Array&&o.length>=16}function Ta(o){return Array.isArray(o)&&o.length>=16}function Fa(o){return ja(o)||Ta(o)}const Rt=.5;function _a(o,e){o.include(Ct),o.attributes.add("position","vec3"),o.attributes.add("normal","vec3"),o.attributes.add("centerOffsetAndDistance","vec4");const a=o.vertex;$o(a,e),So(a,e),a.uniforms.add(new Je("viewport",t=>t.camera.fullViewport),new Be("polygonOffset",t=>t.shaderPolygonOffset),new Me("cameraGroundRelative",t=>t.camera.aboveGround?1:-1)),e.hasVerticalOffset&&zo(a),a.code.add($`struct ProjectHUDAux {
vec3 posModel;
vec3 posView;
vec3 vnormal;
float distanceToCamera;
float absCosAngle;
};`),a.code.add($`
    float applyHUDViewDependentPolygonOffset(float pointGroundDistance, float absCosAngle, inout vec3 posView) {
      float pointGroundSign = ${e.terrainDepthTest?$.float(0):$`sign(pointGroundDistance)`};
      if (pointGroundSign == 0.0) {
        pointGroundSign = cameraGroundRelative;
      }

      // cameraGroundRelative is -1 if camera is below ground, 1 if above ground
      // groundRelative is 1 if both camera and symbol are on the same side of the ground, -1 otherwise
      float groundRelative = cameraGroundRelative * pointGroundSign;

      // view angle dependent part of polygon offset emulation: we take the absolute value because the sign that is
      // dropped is instead introduced using the ground-relative position of the symbol and the camera
      if (polygonOffset > .0) {
        float cosAlpha = clamp(absCosAngle, 0.01, 1.0);
        float tanAlpha = sqrt(1.0 - cosAlpha * cosAlpha) / cosAlpha;
        float factor = (1.0 - tanAlpha / viewport[2]);

        // same side of the terrain
        if (groundRelative > 0.0) {
          posView *= factor;
        }
        // opposite sides of the terrain
        else {
          posView /= factor;
        }
      }

      return groundRelative;
    }
  `),e.draped&&!e.hasVerticalOffset||Oo(a),e.draped||(a.uniforms.add(new Me("perDistancePixelRatio",t=>Math.tan(t.camera.fovY/2)/(t.camera.fullViewport[2]/2))),a.code.add($`
    void applyHUDVerticalGroundOffset(vec3 normalModel, inout vec3 posModel, inout vec3 posView) {
      float distanceToCamera = length(posView);

      // Compute offset in world units for a half pixel shift
      float pixelOffset = distanceToCamera * perDistancePixelRatio * ${$.float(Rt)};

      // Apply offset along normal in the direction away from the ground surface
      vec3 modelOffset = normalModel * cameraGroundRelative * pixelOffset;

      // Apply the same offset also on the view space position
      vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;

      posModel += modelOffset;
      posView += viewOffset;
    }
  `)),e.screenCenterOffsetUnitsEnabled&&At(a),e.hasScreenSizePerspective&&Mt(a),a.code.add($`
    vec4 projectPositionHUD(out ProjectHUDAux aux) {
      vec3 centerOffset = centerOffsetAndDistance.xyz;
      float pointGroundDistance = centerOffsetAndDistance.w;

      aux.posModel = position;
      aux.posView = (view * vec4(aux.posModel, 1.0)).xyz;
      aux.vnormal = normal;
      ${e.draped?"":"applyHUDVerticalGroundOffset(aux.vnormal, aux.posModel, aux.posView);"}

      // Screen sized offset in world space, used for example for line callouts
      // Note: keep this implementation in sync with the CPU implementation, see
      //   - MaterialUtil.verticalOffsetAtDistance
      //   - HUDMaterial.applyVerticalOffsetTransformation

      aux.distanceToCamera = length(aux.posView);

      vec3 viewDirObjSpace = normalize(cameraPosition - aux.posModel);
      float cosAngle = dot(aux.vnormal, viewDirObjSpace);

      aux.absCosAngle = abs(cosAngle);

      ${e.hasScreenSizePerspective&&(e.hasVerticalOffset||e.screenCenterOffsetUnitsEnabled)?"vec3 perspectiveFactor = screenSizePerspectiveScaleFactor(aux.absCosAngle, aux.distanceToCamera, screenSizePerspectiveAlignment);":""}

      ${e.hasVerticalOffset?e.hasScreenSizePerspective?"float verticalOffsetScreenHeight = applyScreenSizePerspectiveScaleFactorFloat(verticalOffset.x, perspectiveFactor);":"float verticalOffsetScreenHeight = verticalOffset.x;":""}

      ${e.hasVerticalOffset?$`
            float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * aux.distanceToCamera, verticalOffset.z, verticalOffset.w);
            vec3 modelOffset = aux.vnormal * worldOffset;
            aux.posModel += modelOffset;
            vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;
            aux.posView += viewOffset;
            // Since we elevate the object, we need to take that into account
            // in the distance to ground
            pointGroundDistance += worldOffset;`:""}

      float groundRelative = applyHUDViewDependentPolygonOffset(pointGroundDistance, aux.absCosAngle, aux.posView);

      ${e.screenCenterOffsetUnitsEnabled?"":$`
            // Apply x/y in view space, but z in screen space (i.e. along posView direction)
            aux.posView += vec3(centerOffset.x, centerOffset.y, 0.0);

            // Same material all have same z != 0.0 condition so should not lead to
            // branch fragmentation and will save a normalization if it's not needed
            if (centerOffset.z != 0.0) {
              aux.posView -= normalize(aux.posView) * centerOffset.z;
            }
          `}

      vec4 posProj = proj * vec4(aux.posView, 1.0);

      ${e.screenCenterOffsetUnitsEnabled?e.hasScreenSizePerspective?"float centerOffsetY = applyScreenSizePerspectiveScaleFactorFloat(centerOffset.y, perspectiveFactor);":"float centerOffsetY = centerOffset.y;":""}

      ${e.screenCenterOffsetUnitsEnabled?"posProj.xy += vec2(centerOffset.x, centerOffsetY) * pixelRatio * 2.0 / viewport.zw * posProj.w;":""}

      // constant part of polygon offset emulation
      posProj.z -= groundRelative * polygonOffset * posProj.w;
      return posProj;
    }
  `)}function Qe(o){o.uniforms.add(new Co("alignPixelEnabled",e=>e.alignPixelEnabled)),o.code.add($`vec4 alignToPixelCenter(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.500123) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = (floor(xy * widthHeight) + vec2(0.5)) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`),o.code.add($`vec4 alignToPixelOrigin(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.5) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = floor((xy + 0.5 * pixelSz) * widthHeight) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`)}function Ra(o,e){const{vertex:a,fragment:t}=o;o.include(Ao,e),a.include(Qe),a.main.add($`vec4 posProjCenter;
if (dot(position, position) > 0.0) {
ProjectHUDAux projectAux;
vec4 posProj = projectPositionHUD(projectAux);
posProjCenter = alignToPixelCenter(posProj, viewport.zw);
forwardViewPosDepth(projectAux.posView);
vec3 vpos = projectAux.posModel;
if (rejectBySlice(vpos)) {
posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
}
} else {
posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
}
gl_Position = posProjCenter;
gl_PointSize = 1.0;`),t.main.add($`fragColor = vec4(1);
if(discardByTerrainDepth()) {
fragColor.g = 0.5;
}`)}function Ea(o){o.vertex.uniforms.add(new Me("renderTransparentlyOccludedHUD",e=>e.hudRenderStyle===0?1:e.hudRenderStyle===1?0:.75),new Je("viewport",e=>e.camera.fullViewport),new Dt("hudVisibilityTexture",e=>e.hudVisibility?.getTexture())),o.vertex.include(Qe),o.vertex.code.add($`bool testHUDVisibility(vec4 posProj) {
vec4 posProjCenter = alignToPixelCenter(posProj, viewport.zw);
vec4 occlusionPixel = texture(hudVisibilityTexture, .5 + .5 * posProjCenter.xy / posProjCenter.w);
if (renderTransparentlyOccludedHUD > 0.5) {
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g * renderTransparentlyOccludedHUD < 1.0;
}
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g == 1.0;
}`)}class Ua extends Mo{constructor(e,a,t){super(e,"vec4",2,(i,s,n)=>i.setUniform4fv(e,a(s,n),t))}}function Et(o){const e=new pa,{signedDistanceFieldEnabled:a,occlusionTestEnabled:t,horizonCullingEnabled:i,pixelSnappingEnabled:s,hasScreenSizePerspective:n,debugDrawLabelBorder:r,hasVVSize:l,hasVVColor:c,hasRotation:u,occludedFragmentFade:p,sampleSignedDistanceFieldTexelCenter:h}=o;e.include(_a,o),e.vertex.include(Do,o);const{occlusionPass:b,output:y,oitPass:m}=o;if(b)return e.include(Ra,o),e;const{vertex:d,fragment:g}=e;e.include(Ct),e.include(Vo,o),e.include(jo,o),t&&e.include(Ea),g.include(To),e.varyings.add("vcolor","vec4"),e.varyings.add("vtc","vec2"),e.varyings.add("vsize","vec2");const v=y===9,x=v&&t;x&&e.varyings.add("voccluded","float"),d.uniforms.add(new Je("viewport",P=>P.camera.fullViewport),new nt("screenOffset",(P,B)=>Xe(Ce,2*P.screenOffset[0]*B.camera.pixelRatio,2*P.screenOffset[1]*B.camera.pixelRatio)),new nt("anchorPosition",P=>ve(P)),new Fe("materialColor",P=>P.color),new Be("materialRotation",P=>P.rotation),new st("tex",P=>P.texture)),At(d),a&&(d.uniforms.add(new Fe("outlineColor",P=>P.outlineColor)),g.uniforms.add(new Fe("outlineColor",P=>mt(P)?P.outlineColor:uo),new Be("outlineSize",P=>mt(P)?P.outlineSize:0))),i&&d.uniforms.add(new Ua("pointDistanceSphere",(P,B)=>{const w=B.camera.eye,j=P.origin;return fo(j[0]-w[0],j[1]-w[1],j[2]-w[2],po.radius)})),s&&d.include(Qe),n&&(Fo(d),Mt(d)),r&&e.varyings.add("debugBorderCoords","vec4"),e.attributes.add("uv0","vec2"),e.attributes.add("uvi","vec4"),e.attributes.add("color","vec4"),e.attributes.add("size","vec2"),e.attributes.add("rotation","float"),(l||c)&&e.attributes.add("featureAttribute","vec4"),d.code.add(i?$`bool behindHorizon(vec3 posModel) {
vec3 camToEarthCenter = pointDistanceSphere.xyz - localOrigin;
vec3 camToPos = pointDistanceSphere.xyz + posModel;
float earthRadius = pointDistanceSphere.w;
float a = dot(camToPos, camToPos);
float b = dot(camToPos, camToEarthCenter);
float c = dot(camToEarthCenter, camToEarthCenter) - earthRadius * earthRadius;
return b > 0.0 && b < a && b * b  > a * c;
}`:$`bool behindHorizon(vec3 posModel) { return false; }`),d.main.add($`
    ProjectHUDAux projectAux;
    vec4 posProj = projectPositionHUD(projectAux);
    forwardObjectAndLayerIdColor();

    if (rejectBySlice(projectAux.posModel)) {
      // Project outside of clip plane
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    if (behindHorizon(projectAux.posModel)) {
      // Project outside of clip plane
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    vec2 inputSize;
    ${I(n,$`
        inputSize = screenSizePerspectiveScaleVec2(size, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspective);
        vec2 screenOffsetScaled = screenSizePerspectiveScaleVec2(screenOffset, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);`,$`
        inputSize = size;
        vec2 screenOffsetScaled = screenOffset;`)}
    ${I(l,$`inputSize *= vvScale(featureAttribute).xx;`)}

    vec2 combinedSize = inputSize * pixelRatio;
    vec4 quadOffset = vec4(0.0);

    ${I(t,$`
    bool visible = testHUDVisibility(posProj);
    if (!visible) {
      vtc = vec2(0.0);
      ${I(r,"debugBorderCoords = vec4(0.5, 0.5, 1.5 / combinedSize);")}
      return;
    }`)}
    ${I(x,$`voccluded = visible ? 0.0 : 1.0;`)}
  `);const C=$`
      vec2 uv = mix(uvi.xy, uvi.zw, bvec2(uv0));
      vec2 texSize = vec2(textureSize(tex, 0));
      uv = mix(vec2(1.0), uv / texSize, lessThan(uv, vec2(${Ha})));
      quadOffset.xy = (uv0 - anchorPosition) * 2.0 * combinedSize;

      ${I(u,$`
          float angle = radians(materialRotation + rotation);
          float cosAngle = cos(angle);
          float sinAngle = sin(angle);
          mat2 rotate = mat2(cosAngle, -sinAngle, sinAngle,  cosAngle);

          quadOffset.xy = rotate * quadOffset.xy;
        `)}

      quadOffset.xy = (quadOffset.xy + screenOffsetScaled) / viewport.zw * posProj.w;
  `,f=s?a?$`posProj = alignToPixelOrigin(posProj, viewport.zw) + quadOffset;`:$`posProj += quadOffset;
if (inputSize.x == size.x) {
posProj = alignToPixelOrigin(posProj, viewport.zw);
}`:$`posProj += quadOffset;`;d.main.add($`
    ${C}
    ${c?"vcolor = interpolateVVColor(featureAttribute.y) * materialColor;":"vcolor = color / 255.0 * materialColor;"}

    ${I(y===10,$`vcolor.a = 1.0;`)}

    bool alphaDiscard = vcolor.a < ${$.float(te)};
    ${I(a,`alphaDiscard = alphaDiscard && outlineColor.a < ${$.float(te)};`)}
    if (alphaDiscard) {
      // "early discard" if both symbol color (= fill) and outline color (if applicable) are transparent
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    } else {
      ${f}
      gl_Position = posProj;
    }

    vtc = uv;

    ${I(r,$`debugBorderCoords = vec4(uv01, 1.5 / combinedSize);`)}
    vsize = inputSize;
  `),g.uniforms.add(new st("tex",P=>P.texture)),p&&!v&&g.uniforms.add(new Dt("depthMap",P=>P.mainDepth),new Me("occludedOpacity",P=>P.hudOccludedFragmentOpacity));const z=r?$`(isBorder > 0.0 ? 0.0 : ${$.float(te)})`:$.float(te),O=$`
    ${I(r,$`float isBorder = float(any(lessThan(debugBorderCoords.xy, debugBorderCoords.zw)) || any(greaterThan(debugBorderCoords.xy, 1.0 - debugBorderCoords.zw)));`)}

    vec2 samplePos = vtc;

    ${I(h,$`
      float txSize = float(textureSize(tex, 0).x);
      float texelSize = 1.0 / txSize;

      // Calculate how much we have to add/subtract to/from each texel to reach the size of an onscreen pixel
      vec2 scaleFactor = (vsize - txSize) * texelSize;
      samplePos += (vec2(1.0, -1.0) * texelSize) * scaleFactor;`)}

    ${a?$`
      vec4 fillPixelColor = vcolor;

      // Get distance in output units (i.e. pixels)

      float sdf = texture(tex, samplePos).r;
      float pixelDistance = sdf * vsize.x;

      // Create smooth transition from the icon into its outline
      float fillAlphaFactor = clamp(0.5 - pixelDistance, 0.0, 1.0);
      fillPixelColor.a *= fillAlphaFactor;

      if (outlineSize > 0.25) {
        vec4 outlinePixelColor = outlineColor;
        float clampedOutlineSize = min(outlineSize, 0.5*vsize.x);

        // Create smooth transition around outline
        float outlineAlphaFactor = clamp(0.5 - (abs(pixelDistance) - 0.5*clampedOutlineSize), 0.0, 1.0);
        outlinePixelColor.a *= outlineAlphaFactor;

        if (
          outlineAlphaFactor + fillAlphaFactor < ${z} ||
          fillPixelColor.a + outlinePixelColor.a < ${$.float(te)}
        ) {
          discard;
        }

        // perform un-premultiplied over operator (see https://en.wikipedia.org/wiki/Alpha_compositing#Description)
        float compositeAlpha = outlinePixelColor.a + fillPixelColor.a * (1.0 - outlinePixelColor.a);
        vec3 compositeColor = vec3(outlinePixelColor) * outlinePixelColor.a +
          vec3(fillPixelColor) * fillPixelColor.a * (1.0 - outlinePixelColor.a);

        ${I(!v,$`fragColor = vec4(compositeColor, compositeAlpha);`)}
      } else {
        if (fillAlphaFactor < ${z}) {
          discard;
        }

        ${I(!v,$`fragColor = premultiplyAlpha(fillPixelColor);`)}
      }

      // visualize SDF:
      // fragColor = vec4(clamp(-pixelDistance/vsize.x*2.0, 0.0, 1.0), clamp(pixelDistance/vsize.x*2.0, 0.0, 1.0), 0.0, 1.0);
      `:$`
          vec4 texColor = texture(tex, samplePos, -0.5);
          if (texColor.a < ${z}) {
            discard;
          }
          ${I(!v,$`fragColor = texColor * premultiplyAlpha(vcolor);`)}
          `}

    ${I(p&&!v,$`
        float zSample = texelFetch(depthMap, ivec2(gl_FragCoord.xy), 0).x;
        if (zSample < gl_FragCoord.z) {
          fragColor *= occludedOpacity;
        }
        `)}

    ${I(!v&&r,$`fragColor = mix(fragColor, vec4(1.0, 0.0, 1.0, 1.0), isBorder * 0.5);`)}
  `;switch(y){case 0:case 1:e.outputs.add("fragColor","vec4",0),y===1&&e.outputs.add("fragEmission","vec4",1),m===1&&e.outputs.add("fragAlpha","float",y===1?2:1),g.main.add($`
        ${O}
        ${I(m===2,$`fragColor.rgb /= fragColor.a;`)}
        ${I(y===1,$`fragEmission = vec4(0.0);`)}
        ${I(m===1,$`fragAlpha = fragColor.a;`)}`);break;case 10:g.main.add($`
        ${O}
        outputObjectAndLayerIdColor();`);break;case 9:e.include(_o,o),g.main.add($`
        ${O}
        outputHighlight(${I(x,$`voccluded == 1.0`,$`false`)});`)}return e}function mt(o){return o.outlineColor[3]>0&&o.outlineSize>0}function ve(o){return o.textureIsSignedDistanceField?Ia(o.anchorPosition,o.distanceFieldBoundingBox,Ce):co(Ce,o.anchorPosition),Ce}function Ia(o,e,a){Xe(a,o[0]*(e[2]-e[0])+e[0],o[1]*(e[3]-e[1])+e[1])}const Ce=Ye(),ye=32e3,Ha=$.float(ye),Ba=Object.freeze(Object.defineProperty({__proto__:null,build:Et,calculateAnchorPosition:ve,fullUV:ye},Symbol.toStringTag,{value:"Module"}));class Ga extends Eo{constructor(e,a){super(e,a,new Uo(Ba,()=>sa(()=>Promise.resolve().then(()=>Za),void 0)),fa([Ut,Ht()].map(ra))),this.primitiveType=a.occlusionPass?et.POINTS:et.TRIANGLE_STRIP}initializePipeline(e){const{oitPass:a,hasPolygonOffset:t,draped:i,output:s,depthTestEnabled:n,occlusionPass:r}=e,l=n&&!i&&a!==1&&!r&&s!==9;return la({blending:Vt(s)?Ho(a,!0):null,depthTest:n&&!i?{func:515}:null,depthWrite:l?ua:null,drawBuffers:Io(a,s),colorWrite:ca,polygonOffset:t?qa:null})}}const qa={factor:0,units:-4},Ut=Ft().vec2u8("uv0",{glNormalized:!0}),It=Ft().vec3f("position").vec3f("normal").vec4i16("uvi").vec4u8("color").vec2f("size").f32("rotation").vec4f("centerOffsetAndDistance").vec4f("featureAttribute"),La=It.clone().vec4u8("olidColor");function Ht(){return Ro()?La:It}class _ extends Bo{constructor(e){super(),this.spherical=e,this.screenCenterOffsetUnitsEnabled=!1,this.occlusionTestEnabled=!0,this.signedDistanceFieldEnabled=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVerticalOffset=!1,this.hasScreenSizePerspective=!1,this.hasRotation=!1,this.debugDrawLabelBorder=!1,this.hasPolygonOffset=!1,this.depthTestEnabled=!0,this.pixelSnappingEnabled=!0,this.draped=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.occlusionPass=!1,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!0,this.isFocused=!0,this.olidColorInstanced=!1,this.textureCoordinateType=0,this.emissionSource=0,this.discardInvisibleFragments=!0,this.hasVVInstancing=!1,this.snowCover=!1}}U([E()],_.prototype,"screenCenterOffsetUnitsEnabled",void 0),U([E()],_.prototype,"occlusionTestEnabled",void 0),U([E()],_.prototype,"signedDistanceFieldEnabled",void 0),U([E()],_.prototype,"sampleSignedDistanceFieldTexelCenter",void 0),U([E()],_.prototype,"hasVVSize",void 0),U([E()],_.prototype,"hasVVColor",void 0),U([E()],_.prototype,"hasVerticalOffset",void 0),U([E()],_.prototype,"hasScreenSizePerspective",void 0),U([E()],_.prototype,"hasRotation",void 0),U([E()],_.prototype,"debugDrawLabelBorder",void 0),U([E()],_.prototype,"hasPolygonOffset",void 0),U([E()],_.prototype,"depthTestEnabled",void 0),U([E()],_.prototype,"pixelSnappingEnabled",void 0),U([E()],_.prototype,"draped",void 0),U([E()],_.prototype,"terrainDepthTest",void 0),U([E()],_.prototype,"cullAboveTerrain",void 0),U([E()],_.prototype,"occlusionPass",void 0),U([E()],_.prototype,"occludedFragmentFade",void 0),U([E()],_.prototype,"horizonCullingEnabled",void 0),U([E()],_.prototype,"isFocused",void 0);class Ii extends Go{constructor(e,a){super(e,Ja),this.produces=new Map([[13,t=>_e(t)&&!this.parameters.drawAsLabel],[14,t=>_e(t)&&this.parameters.drawAsLabel],[12,()=>this.parameters.occlusionTest],[18,t=>this.parameters.draped&&_e(t)]]),this._visible=!0,this._configuration=new _(a)}getConfiguration(e,a){const t=this.parameters.draped;return super.getConfiguration(e,a,this._configuration),this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.hasVerticalOffset=!!this.parameters.verticalOffset,this._configuration.hasScreenSizePerspective=!!this.parameters.screenSizePerspective,this._configuration.screenCenterOffsetUnitsEnabled=this.parameters.centerOffsetUnits==="screen",this._configuration.hasPolygonOffset=this.parameters.polygonOffset,this._configuration.draped=t,this._configuration.occlusionTestEnabled=this.parameters.occlusionTest,this._configuration.pixelSnappingEnabled=this.parameters.pixelSnappingEnabled,this._configuration.signedDistanceFieldEnabled=this.parameters.textureIsSignedDistanceField,this._configuration.sampleSignedDistanceFieldTexelCenter=this.parameters.sampleSignedDistanceFieldTexelCenter,this._configuration.hasRotation=this.parameters.hasRotation,this._configuration.hasVVSize=!!this.parameters.vvSize,this._configuration.hasVVColor=!!this.parameters.vvColor,this._configuration.occlusionPass=a.slot===12,this._configuration.occludedFragmentFade=!t&&this.parameters.occludedFragmentFade,this._configuration.horizonCullingEnabled=this.parameters.horizonCullingEnabled,this._configuration.isFocused=this.parameters.isFocused,this._configuration.depthTestEnabled=this.parameters.depthEnabled||a.slot===12,Vt(e)&&(this._configuration.debugDrawLabelBorder=!!qo.LABELS_SHOW_BORDER),this._configuration.oitPass=a.oitPass,this._configuration.terrainDepthTest=a.terrainDepthTest,this._configuration.cullAboveTerrain=a.cullAboveTerrain,this._configuration}intersect(e,a,t,i,s,n){const{options:{selectionMode:r,hud:l,excludeLabels:c},point:u,camera:p}=t,{parameters:h}=this;if(!r||!l||c&&h.isLabel||!e.visible||!u||!p)return;const b=e.attributes.get("featureAttribute"),y=b==null?null:tt(b.data,Le),{scaleX:m,scaleY:d}=ke(y,h,p.pixelRatio);Pt(Ae,a),e.attributes.has("featureAttribute")&&Wa(Ae);const g=e.attributes.get("position"),v=e.attributes.get("size"),x=e.attributes.get("normal"),C=e.attributes.get("rotation"),f=e.attributes.get("centerOffsetAndDistance");Tt(g.size>=3);const z=ve(h),O=this.parameters.centerOffsetUnits==="screen";for(let P=0;P<g.data.length/g.size;P++){const B=P*g.size;oe(A,g.data[B],g.data[B+1],g.data[B+2]),re(A,A,a),re(A,A,p.viewMatrix);const w=P*f.size;if(oe(T,f.data[w],f.data[w+1],f.data[w+2]),!O&&(A[0]+=T[0],A[1]+=T[1],T[2]!==0)){const V=T[2];q(T,A),W(A,A,G(T,T,V))}const j=P*x.size;if(oe(se,x.data[j],x.data[j+1],x.data[j+2]),Ge(se,Ae,p,we),Ne(this.parameters,A,we,p,ge),p.applyProjection(A,D),D[0]>-1){O&&(T[0]||T[1])&&(D[0]+=T[0]*p.pixelRatio,T[1]!==0&&(D[1]+=ge.alignmentEvaluator.apply(T[1])*p.pixelRatio),p.unapplyProjection(D,A)),D[0]+=this.parameters.screenOffset[0]*p.pixelRatio,D[1]+=this.parameters.screenOffset[1]*p.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]);const V=P*v.size;R[0]=v.data[V],R[1]=v.data[V+1],ge.evaluator.applyVec2(R,R);const J=qt*p.pixelRatio;let le=0;h.textureIsSignedDistanceField&&(le=Math.min(h.outlineSize,.5*R[0])*p.pixelRatio/2),R[0]*=m,R[1]*=d;const Q=P*C.size,N=h.rotation+C.data[Q];if(qe(u,D[0],D[1],R,J,le,N,h,z)){const ie=t.ray;if(re(De,A,zt(Gt,p.viewMatrix)),D[0]=u[0],D[1]=u[1],p.unprojectFromRenderScreen(D,A)){const S=F();k(S,ie.direction);const me=1/be(S);G(S,S,me),n(Ot(ie.origin,A)*me,S,-1,De)}}}}}intersectDraped(e,a,t,i,s){const n=e.attributes.get("position"),r=e.attributes.get("size"),l=e.attributes.get("rotation"),c=this.parameters,u=ve(c),p=e.attributes.get("featureAttribute"),h=p==null?null:tt(p.data,Le),{scaleX:b,scaleY:y}=ke(h,c,e.screenToWorldRatio),m=Xa*e.screenToWorldRatio;for(let d=0;d<n.data.length/n.size;d++){const g=d*n.size,v=n.data[g],x=n.data[g+1],C=d*r.size;R[0]=r.data[C],R[1]=r.data[C+1];let f=0;c.textureIsSignedDistanceField&&(f=Math.min(c.outlineSize,.5*R[0])*e.screenToWorldRatio/2),R[0]*=b,R[1]*=y;const z=d*l.size,O=c.rotation+l.data[z];qe(t,v,x,R,m,f,O,c,u)&&i(s.distance,s.normal,-1)}}createBufferWriter(){return new Qa}applyShaderOffsetsView(e,a,t,i,s,n,r){const l=Ge(a,t,s,we);return this._applyVerticalGroundOffsetView(e,l,s,r),Ne(this.parameters,r,l,s,n),this._applyPolygonOffsetView(r,l,i[3],s,r),this._applyCenterOffsetView(r,i,r),r}applyShaderOffsetsNDC(e,a,t,i,s){return this._applyCenterOffsetNDC(e,a,t,i),s!=null&&k(s,i),this._applyPolygonOffsetNDC(i,a,t,i),i}_applyPolygonOffsetView(e,a,t,i,s){const n=i.aboveGround?1:-1;let r=Math.sign(t);r===0&&(r=n);const l=n*r;if(this.parameters.shaderPolygonOffset<=0)return k(s,e);const c=ho(Math.abs(a.cosAngle),.01,1),u=1-Math.sqrt(1-c*c)/c/i.viewport[2];return G(s,e,l>0?u:1/u),s}_applyVerticalGroundOffsetView(e,a,t,i){const s=be(e),n=t.aboveGround?1:-1,r=t.computeRenderPixelSizeAtDist(s)*Rt,l=G(A,a.normal,n*r);return L(i,e,l),i}_applyCenterOffsetView(e,a,t){const i=this.parameters.centerOffsetUnits!=="screen";return t!==e&&k(t,e),i&&(t[0]+=a[0],t[1]+=a[1],a[2]&&(q(se,t),go(t,t,G(se,se,a[2])))),t}_applyCenterOffsetNDC(e,a,t,i){const s=this.parameters.centerOffsetUnits!=="screen";return i!==e&&k(i,e),s||(i[0]+=a[0]/t.fullWidth*2,i[1]+=a[1]/t.fullHeight*2),i}_applyPolygonOffsetNDC(e,a,t,i){const s=this.parameters.shaderPolygonOffset;if(e!==i&&k(i,e),s){const n=t.aboveGround?1:-1,r=n*Math.sign(a[3]);i[2]-=(r||n)*s}return i}set visible(e){this._visible=e}get visible(){const{color:e,outlineSize:a,outlineColor:t}=this.parameters,i=e[3]>=te||a>=te&&t[3]>=te;return this._visible&&i}createGLMaterial(e){return new ka(e)}calculateRelativeScreenBounds(e,a,t=wt()){return Na(this.parameters,e,a,t),t[2]=t[0]+e[0],t[3]=t[1]+e[1],t}}class ka extends Zo{constructor(e){super({...e,...e.material.parameters})}beginSlot(e){return this.updateTexture(this._material.parameters.textureId),this._material.setParameters(this.textureBindParameters),this.getTechnique(Ga,e)}}function Na(o,e,a,t){t[0]=o.anchorPosition[0]*-e[0]+o.screenOffset[0]*a,t[1]=o.anchorPosition[1]*-e[1]+o.screenOffset[1]*a}function Ge(o,e,a,t){return Fa(e)&&(e=Pt(Ya,e)),vo(t.normal,o,e),re(t.normal,t.normal,a.viewInverseTransposeMatrix),t.cosAngle=We(Bt,Ka),t}function Wa(o){const e=o[0],a=o[1],t=o[2],i=o[3],s=o[4],n=o[5],r=o[6],l=o[7],c=o[8],u=1/Math.sqrt(e*e+a*a+t*t),p=1/Math.sqrt(i*i+s*s+n*n),h=1/Math.sqrt(r*r+l*l+c*c);return o[0]=e*u,o[1]=a*u,o[2]=t*u,o[3]=i*p,o[4]=s*p,o[5]=n*p,o[6]=r*h,o[7]=l*h,o[8]=c*h,o}function qe(o,e,a,t,i,s,n,r,l){let c=e-i-t[0]*l[0],u=c+t[0]+2*i,p=a-i-t[1]*l[1],h=p+t[1]+2*i;const b=r.distanceFieldBoundingBox;return r.textureIsSignedDistanceField&&b!=null&&(c+=t[0]*b[0],p+=t[1]*b[1],u-=t[0]*(1-b[2]),h-=t[1]*(1-b[3]),c-=s,u+=s,p-=s,h+=s),Xe(xt,e,a),mo(xe,o,xt,xo(n)),xe[0]>c&&xe[0]<u&&xe[1]>p&&xe[1]<h}const ge=new Lo,A=F(),se=F(),D=Ve(),Bt=F(),De=F(),xe=Ye(),xt=Ye(),Ae=$t(),Ya=$t(),Gt=bt(),Pe=Ve(),T=F(),He=F(),Le=Ve(),we={normal:Bt,cosAngle:0},qt=1,Xa=2,R=St(0,0),Ka=yt(0,0,1);class Ja extends ko{constructor(){super(...arguments),this.renderOccluded=1,this.isDecoration=!1,this.color=ot(1,1,1,1),this.polygonOffset=!1,this.anchorPosition=St(.5,.5),this.screenOffset=[0,0],this.shaderPolygonOffset=1e-5,this.textureIsSignedDistanceField=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.outlineColor=ot(1,1,1,1),this.outlineSize=0,this.distanceFieldBoundingBox=Ve(),this.rotation=0,this.hasRotation=!1,this.vvSizeEnabled=!1,this.vvSize=null,this.vvColor=null,this.vvOpacity=null,this.vvSymbolAnchor=null,this.vvSymbolRotationMatrix=null,this.hasSlicePlane=!1,this.pixelSnappingEnabled=!0,this.occlusionTest=!0,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!1,this.centerOffsetUnits="world",this.drawAsLabel=!1,this.depthEnabled=!0,this.isFocused=!0,this.focusStyle="bright",this.draped=!1,this.isLabel=!1}get hasVVSize(){return!!this.vvSize}get hasVVColor(){return!!this.vvColor}get hasVVOpacity(){return!!this.vvOpacity}}class Qa{constructor(){this.layout=Ut,this.instanceLayout=Ht()}elementCount(e){return e.get("position").indices.length}elementCountBaseInstance(e){return e.get("uv0").indices.length}write(e,a,t,i,s,n){const{position:r,normal:l,color:c,size:u,rotation:p,centerOffsetAndDistance:h,featureAttribute:b,uvi:y}=s;Yo(t.get("position"),e,r,n),Xo(t.get("normal"),a,l,n);const m=t.get("position").indices.length;let d=0,g=0,v=ye,x=ye;const C=t.get("uvi")?.data;C&&C.length>=4&&(d=C[0],g=C[1],v=C[2],x=C[3]);for(let f=0;f<m;++f){const z=n+f;y.setValues(z,d,g,v,x)}if(Ko(t.get("color"),4,c,n),rt(t.get("size"),u,n),Jo(t.get("rotation"),p,n),t.get("centerOffsetAndDistance")?lt(t.get("centerOffsetAndDistance"),h,n):ct(h,n,m),t.get("featureAttribute")?lt(t.get("featureAttribute"),b,n):ct(b,n,m),i!=null){const f=t.get("position")?.indices;if(f){const z=f.length,O=s.getField("olidColor",na);Qo(i,O,z,n)}}return{numVerticesPerItem:1,numItems:m}}writeBaseInstance(e,a){const{uv0:t}=a;rt(e.get("uv0"),t,0)}intersect(e,a,t,i,s,n,r){const{options:{selectionMode:l,hud:c,excludeLabels:u},point:p,camera:h}=i;if(!l||!c||u&&a.isLabel||!p)return;const b=this.instanceLayout.createView(e),{position:y,normal:m,rotation:d,size:g,featureAttribute:v,centerOffsetAndDistance:x}=b,C=a.centerOffsetUnits==="screen",f=ve(a);if(y==null||m==null||d==null||g==null||x==null||h==null)return;const z=v==null?null:v.getVec(0,Le),{scaleX:O,scaleY:P}=ke(z,a,h.pixelRatio),B=y.count;for(let w=0;w<B;w++){if(y.getVec(w,A),t!=null&&L(A,A,t),re(A,A,h.viewMatrix),x.getVec(w,Pe),oe(T,Pe[0],Pe[1],Pe[2]),!C&&(A[0]+=T[0],A[1]+=T[1],T[2]!==0)){const j=T[2];q(T,A),W(A,A,G(T,T,j))}if(m.getVec(w,se),Ge(se,Ae,h,we),Ne(a,A,we,h,ge),h.applyProjection(A,D),D[0]>-1){C&&(T[0]||T[1])&&(D[0]+=T[0]*h.pixelRatio,T[1]!==0&&(D[1]+=ge.alignmentEvaluator.apply(T[1])*h.pixelRatio),h.unapplyProjection(D,A)),D[0]+=a.screenOffset[0]*h.pixelRatio,D[1]+=a.screenOffset[1]*h.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]),g.getVec(w,R),ge.evaluator.applyVec2(R,R);const j=qt*h.pixelRatio;let V=0;a.textureIsSignedDistanceField&&(V=Math.min(a.outlineSize,.5*R[0])*h.pixelRatio/2),R[0]*=O,R[1]*=P;const J=d.get(w),le=a.rotation+J;if(qe(p,D[0],D[1],R,j,V,le,a,f)){const Q=i.ray;if(re(De,A,zt(Gt,h.viewMatrix)),D[0]=p[0],D[1]=p[1],h.unprojectFromRenderScreen(D,A)){const N=F();k(N,Q.direction);const ie=1/be(N);G(N,N,ie),r(Ot(Q.origin,A)*ie,N,w,De)}}}}}}function ke(o,e,a){return o==null||e.vvSize==null?{scaleX:a,scaleY:a}:(No(He,e,o),{scaleX:He[0]*a,scaleY:He[1]*a})}function Ne(o,e,a,t,i){if(!o.verticalOffset?.screenLength){const l=be(e);return i.update(a.cosAngle,l,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),e}const s=be(e),n=o.screenSizePerspectiveAlignment??o.screenSizePerspective,r=Wo(t,s,o.verticalOffset,a.cosAngle,n,o.screenSizePerspectiveMinPixelReferenceSize);return i.update(a.cosAngle,s,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),G(a.normal,a.normal,r),L(e,e,a.normal)}function Hi(o){return o.type==="point"}const Za=Object.freeze(Object.defineProperty({__proto__:null,build:Et,calculateAnchorPosition:ve,fullUV:ye},Symbol.toStringTag,{value:"Module"}));export{yi as A,Pi as D,Oi as E,zi as G,_i as M,Ci as Q,bi as U,$i as Z,Ti as a,Ui as b,Vi as c,_a as d,Si as e,ji as f,gt as g,Di as h,Ii as i,Mi as j,ga as k,Qe as l,Ri as m,Ea as n,Fi as o,Da as p,Va as q,Ai as r,Hi as t,Ma as u,wi as w,Ei as y};
