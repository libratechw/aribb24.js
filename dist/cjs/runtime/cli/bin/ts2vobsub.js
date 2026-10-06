#!/usr/bin/env node
Object.defineProperty(exports,Symbol.toStringTag,{value:`Module`});const e=require(`../../../lib/parser/parser.js`),t=require(`../../common/colortable.js`),n=require(`../../common/renderer/canvas/renderer-option.js`),r=require(`../../common/namedcolor.js`),i=require(`../../common/renderer/canvas/renderer-strategy.js`),a=require(`../../../util/concat.js`),o=require(`../../../lib/demuxer/mpegts/index.js`),s=require(`../exit.js`),c=require(`../stream.js`),l=require(`../args.js`),u=require(`../info.js`),d=require(`../../../lib/encoder/vobsub/index.js`),f=require(`../../../lib/muxer/vobsub/index.js`),p=require(`../file.js`);var m=e=>{let t=Math.floor(e*1e3)-Math.floor(e)*1e3,n=Math.floor(e)%60,r=Math.floor(e/60)%60;return`${(Math.floor(e/3600)%60).toString(10).padStart(2,`0`)}:${r.toString(10).padStart(2,`0`)}:${n.toString(10).padStart(2,`0`)}:${t.toString(10).padStart(3,`0`)}`},h=(n,a,o,c,l,u,f)=>{let p=1/0,m=1/0,h=0,g=0,_=0,v=new Set([`#00000000`]);for(let n of a){if(n.tag===`ClearScreen`){_=n.time;continue}p=Math.min(p,n.state.margin[0]+n.state.position[0]),m=Math.min(m,n.state.margin[1]+n.state.position[1]-e.ARIBB24Parser.box(n.state)[1]),h=Math.max(h,n.state.margin[0]+n.state.position[0]+e.ARIBB24Parser.box(n.state)[0]),g=Math.max(g,n.state.margin[1]+n.state.position[1]),v.add(u.color.background?r.default.get(u.color.background)??u.color.background:t.default[n.state.background]),v.add(u.color.foreground?r.default.get(u.color.foreground)??u.color.foreground:t.default[n.state.foreground]),n.state.ornament!=null&&v.add(u.color.stroke?r.default.get(u.color.stroke)??u.color.stroke:t.default[n.state.ornament])}let y=[p,m],b=[h-p,g-m];if(b[0]===-1/0||b[1]===-1/0)return null;o=_>0?_:o;let x=Array.from(v.values());if(x.length>4)return console.error(`Maxium SPU simultaneous displays color exceeded!`),s.exit(-1);for(;x.length<4;)x.push(`#00000000`);let S=f.createCanvas(c[0],c[1]);i.default(S,f.Path2D,[1,1],a,l,u);let C=S.getContext(`2d`).getImageData(y[0],y[1],b[0],b[1]);return d.encode(y[0],y[1],b[0],b[1],C.data,o,x,n)},g=[{long:`--input`,short:`-i`,help:`Specify Input File (.ts)`,action:`default`},{long:`--output`,short:`-o`,help:`Specify Output Sub File (.sub)`,action:`default`},{long:`--index`,short:`-x`,help:`Specify Output Idx File (.idx)`,action:`default`},{long:`--stroke`,short:`-s`,help:`Specify forced stroke`,action:`default`},{long:`--background`,short:`-b`,help:`Specify background color`,action:`default`},{long:`--foreground`,short:`-p`,help:`Specify foreground color`,action:`default`},{long:`--font`,short:`-f`,help:`Specify font`,action:`default`},{long:`--glyph`,short:`-g`,help:`Specify use Embedded Glyph`,action:`store_true`},{long:`--language`,short:`-l`,help:`Specify language`,action:`default`},{long:`--help`,short:`-h`,help:`Show help message`,action:`help`}],_=async(e,t,n)=>{let r=null,i=null,a=null;for(let o of e){if(o.tag!==`Caption`)continue;let e=o.data;if(e.tag===`CaptionManagement`)i=typeof t==`number`?t:[...e.languages].sort(({lang:e},{lang:t})=>e-t).filter(({iso_639_language_code:e})=>e===t)?.[0]?.lang??null,r=e;else if(r==null)continue;else{let t=r.languages.find(t=>t.lang===e.lang);if(t==null||i!==e.lang)continue;let s=u.getTokenizeInformation(t.iso_639_language_code,t.TCS,`UNKNOWN`);if(s==null)continue;let[c,l,d]=s;a?.(o),a=e=>n(t,c,l,d,o,e)}a?.(null)}};(async()=>{let i=l.parseArgs(l.args(),g,`ts2vobsub`,`MPEG-TS ARIB Caption (Profile A) to VOBSUB (DVD-Video)`),u=i.input??`-`,d=i.output??null,v=i.index??null;if(d==null||v==null)return console.error(`Please Specify Output Sub/Idx file`),s.exit(-1);let y=i.stroke??null,b=i.background??null,x=i.foreground??`white`,S=i.font??`'Hiragino Maru Gothic Pro', 'BIZ UDGothic', 'Yu Gothic Medium', 'IPAGothic', sans-serif`,C=Number.isNaN(Number.parseInt(i.language))?i.language??0:Number.parseInt(i.language),w=i.glyph?(await Promise.resolve().then(()=>require(`../../common/additional-symbols-glyph.js`)).catch(()=>({default:new Map}))).default:new Map,T=await import(`@napi-rs/canvas`).catch(()=>(console.error(`Please install @napi-rs/canvas`),s.exit(-1))),E=(await c.writableStream(d)).getWriter(),D=[];for await(let e of o.default(await c.readableStream(u)))D.push(e);let O=new Set([`#000000`]),k=[-1,-1];if(_(D,C,(i,a,o,s,c)=>{let l=new e.ARIBB24Parser(s,{magnification:2}),u=n.CanvasRendererOption.from({font:{normal:S},replace:{glyph:w},color:{stroke:y,background:b,foreground:x}});i.iso_639_language_code;for(let e of l.parse(o.tokenize(c.data))){let n=u.color.background?r.default.get(u.color.background)??u.color.background:t.default[e.state.background];O.add(n.slice(0,7));let i=u.color.foreground?r.default.get(u.color.foreground)??u.color.foreground:t.default[e.state.foreground];if(O.add(i.slice(0,7)),e.state.ornament!=null){let n=u.color.stroke?r.default.get(u.color.stroke)??u.color.stroke:t.default[e.state.ornament];O.add(n.slice(0,7))}}k=l.currentState().plane}),k[0]<0||k[1]<0)return console.error(`Caption not found...`),s.exit(-1);let A=Array.from(O.values());if(A.length>16)return console.error(`Maxium SUP palette size exceeded!`),s.exit(-1);for(;A.length<16;)A.push(`#000000`);let j=0,M=[];_(D,C,(t,r,i,o,s,c)=>{let l=new e.ARIBB24Parser(o,{magnification:2}),u=n.CanvasRendererOption.from({font:{normal:S},replace:{glyph:w},color:{stroke:y,background:b,foreground:x}}),d={association:r,language:t.iso_639_language_code},p=c==null?null:(Math.floor((c.pts-s.pts)*9e4)+2**33)%2**33/9e4,m=h(A,l.parse(i.tokenize(s.data)),p,l.currentState().plane,d,u,T);if(m==null)return;let g=f.makePS(f.makePES(a.default(Uint8Array.from([32]).buffer,m),Math.floor(s.pts*9e4)),Math.floor(s.pts*9e4));M.push([s.pts,j]),j+=g.byteLength,E.write(new Uint8Array(g))}),E.close();let N=``;N+=`# VobSub index file, v7 (do not modify this line!)
`,N+=`

`,N+=`# Settings
`,N+=`
`,N+=`# Original frame size
`,N+=`size: ${k[0]}x${k[1]}\n`,N+=`
`,N+=`# Origin, relative to the upper-left corner, can be overloaded by aligment
`,N+=`org: 0, 0
`,N+=`
`,N+=`# Image scaling (hor,ver), origin is at the upper-left corner or at the alignment coord (x, y)
`,N+=`scale: 100%, 100%
`,N+=`
`,N+=`# Alpha blending
`,N+=`alpha: 100%
`,N+=`
`,N+=`# Smoothing for very blocky images (use OLD for no filtering)
`,N+=`smooth: OFF
`,N+=`
`,N+=`# In millisecs
`,N+=`fadein/out: 0, 0
`,N+=`
`,N+=`# Force subtitle placement relative to (org.x, org.y)
`,N+=`align: OFF at LEFT TOP
`,N+=`
`,N+=`# For correcting non-progressive desync. (in millisecs or hh:mm:ss:ms)
`,N+=`# Note: Not effective in DirectVobSub, use "delay: ... " instead.
`,N+=`time offset: 0
`,N+=`
`,N+=`# ON: displays only forced subtitles, OFF: shows everything
`,N+=`forced subs: OFF
`,N+=`
`,N+=`# The original palette of the DVD
`,N+=`palette: ${A.map(e=>e.slice(1).toLowerCase()).join(`, `)}\n`,N+=`
`,N+=`# Custom colors (transp idxs and the four colors)
`,N+=`custom colors: OFF, tridx: 1000, colors: ffffff, faff1a, 24e731, 000000
`,N+=`
`,N+=`# Language index in use
`,N+=`langidx: 0
`,N+=`
`,N+=`# ARIB
`,N+=`id: und, index: 0
`,N+=`# Decomment next line to activate alternative name in DirectVobSub / Windows Media Player 6.x
`,N+=`# alt: ARIB
`,N+=`# Vob/Cell ID: 1, 4 (PTS: 1221921)
`;for(let[e,t]of M)N+=`timestamp: ${m(e)}, filepos: ${t.toString(16).padStart(8,`0`)}\n`;p.writeFS(v,N)})();