# Draws the sub-page header objects in the hero drawing's manner: weathered sandstone, thin ink line, flat colour.
import random, math
INK='#3b2a12'; ST='#e6bd68'; ST_L='#f0cf85'; ST_D='#b98c40'; SAND='#f3ca7b'; BLUE='#0078BF'; NIGHT='#17389a'; CLOAK='#f6f0dc'
def pts(p): return ' '.join(f'{x:.1f},{y:.1f}' for x,y in p)
def poly(p,fill,sw=1.6,extra=''): return f'<polygon points="{pts(p)}" fill="{fill}" stroke="{INK}" stroke-width="{sw}" stroke-linejoin="round"{extra}/>'
def inside(pt,p):
    x,y=pt; c=False
    for i in range(len(p)):
        (x1,y1),(x2,y2)=p[i],p[(i+1)%len(p)]
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1: c=not c
    return c
def texture(p,rnd,n=40,holes=()):
    xs=[a for a,_ in p]; ys=[b for _,b in p]; o=[]
    k=0
    while k<n:
        x=rnd.uniform(min(xs),max(xs)); y=rnd.uniform(min(ys),max(ys))
        if not inside((x,y),p) or any(inside((x,y),h) for h in holes): continue
        k+=1
        if rnd.random()<.8: o.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r=".7" fill="{INK}" opacity=".45"/>')
        else:
            a=rnd.uniform(0,6.28); l=rnd.uniform(4,9); x2=x+math.cos(a)*l; y2=y+math.sin(a)*l; x3=x2+math.cos(a+.9)*l*.6; y3=y2+math.sin(a+.9)*l*.6
            if inside((x2,y2),p) and inside((x3,y3),p) and not any(inside((x2,y2),h) or inside((x3,y3),h) for h in holes):
                o.append(f'<path d="M{x:.1f} {y:.1f}L{x2:.1f} {y2:.1f}L{x3:.1f} {y3:.1f}" fill="none" stroke="{INK}" stroke-width=".8" opacity=".6" stroke-linecap="round"/>')
    return ''.join(o)
def slab(p,off,rnd,n=40):
    ox,oy=off; o=[]
    for i in range(len(p)):
        a,b=p[i],p[(i+1)%len(p)]
        o.append(poly([a,b,(b[0]+ox,b[1]+oy),(a[0]+ox,a[1]+oy)],ST_D,1.4))
    o.append(poly(p,ST)); o.append(texture(p,rnd,n))
    return ''.join(o)
def ground(y,rnd,w=240,rocks=()):
    o=[f'<path class="gs" d="M4 {y}h{w-8}" stroke="{INK}" stroke-width="1.4" stroke-linecap="round"/>']
    for _ in range(26):
        x=rnd.uniform(8,w-8); yy=y+rnd.uniform(3,14); o.append(f'<circle class="gf" cx="{x:.1f}" cy="{yy:.1f}" r=".7" fill="{INK}" opacity=".4"/>')
    for (x,s) in rocks:
        p=[(x,y),(x+4*s,y-9*s),(x+10*s,y-13*s),(x+15*s,y-6*s),(x+20*s,y-8*s),(x+25*s,y)]
        o.append(poly(p,ST_D,1.3)); o.append(f'<path d="M{x+10*s:.1f} {y-13*s:.1f}L{x+11*s:.1f} {y}" stroke="{INK}" stroke-width=".8" opacity=".6"/>')
    return ''.join(o)
def svg(body,style=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 180" width="240" height="180"><style>@media(prefers-color-scheme:dark){{.gs{{stroke:#c9a55a}}.gf{{fill:#c9a55a}}}}{style}</style>'+body+'</svg>\n'
RM='@media(prefers-reduced-motion:reduce){*{animation:none!important}}'

# 1. Stone pointer, floating over its shadow (services)
r=random.Random(7)
P=[(62,14),(176,58),(134,74),(170,128),(142,144),(108,90),(80,122)]
body=ground(160,r,rocks=[(18,.8),(196,1)])
body+=f'<ellipse class="sh gf" cx="128" cy="160" rx="46" ry="3.2" fill="{INK}" opacity=".35"/>'
body+='<g class="fl">'+slab(P,(7,11),r,46)+'</g>'
open('img/art-pointer.svg','w').write(svg(body,'.fl{animation:f 6s ease-in-out infinite alternate}.sh{transform-origin:128px 160px;animation:s 6s ease-in-out infinite alternate}@keyframes f{to{transform:translateY(-7px)}}@keyframes s{to{transform:scaleX(.86)}}'+RM))

# 2. Three arches rising from the sand (pricing: three packages)
r=random.Random(3); gy=160; cx=52; body=''
for R,w in ((134,20),(92,18),(52,16)):
    d=f'M{cx} {gy-R}A{R} {R} 0 0 1 {cx+R} {gy}'
    body+=f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="{w+3}"/><path d="{d}" fill="none" stroke="{ST}" stroke-width="{w}"/>'
    di=f'M{cx} {gy-R+w*.28}A{R-w*.28} {R-w*.28} 0 0 1 {cx+R-w*.28} {gy}'
    body+=f'<path d="{di}" fill="none" stroke="{ST_D}" stroke-width="{w*.44}"/>'
    dl=f'M{cx} {gy-R+w*.06}A{R-w*.06} {R-w*.06} 0 0 1 {cx+R-w*.06} {gy}'
    body+=f'<path d="{dl}" fill="none" stroke="{INK}" stroke-width=".9" opacity=".7"/>'
    for _ in range(int(R/7)):
        a=r.uniform(.08,1.5); rr=R+r.uniform(.1,.42)*w; x=cx+math.sin(a)*rr; y=gy-math.cos(a)*rr
        body+=f'<circle cx="{x:.1f}" cy="{y:.1f}" r=".7" fill="{INK}" opacity=".45"/>'
    a=r.uniform(.5,1.1)
    x1=cx+math.sin(a)*(R+w/2); y1=gy-math.cos(a)*(R+w/2); x2=cx+math.sin(a+.05)*(R+.05*w); y2=gy-math.cos(a+.05)*(R+.05*w)
    body+=f'<path d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}" stroke="{INK}" stroke-width=".9" opacity=".7"/>'
body=f'<clipPath id="c"><rect x="{cx}" y="0" width="200" height="{gy}"/></clipPath><g clip-path="url(#c)">'+body+'</g>'
pil=[(cx-26,gy),(cx-26,8),(cx+2,8),(cx+2,gy)]
body+=poly([(cx-26,gy),(cx-26,8),(cx-34,3),(cx-34,gy)],ST_D,1.4)+poly([(cx-26,8),(cx+2,8),(cx-6,3),(cx-34,3)],ST_D,1.4)+poly(pil,ST)+texture(pil,r,22)
body+=ground(gy,r,rocks=[(214,.7)])
open('img/art-arches.svg','w').write(svg(body))

# 3. The traveller and the trail of footprints (process)
r=random.Random(5); gy=150
body=ground(gy-24,r,rocks=[(180,1.1),(206,.6)])
for i,(x,y) in enumerate([(22,174),(38,167),(50,172),(66,163),(78,167),(94,158)]):
    body+=f'<ellipse class="fp gf" style="animation-delay:{i*.5:.1f}s" cx="{x}" cy="{y}" rx="3.6" ry="1.8" fill="{INK}" opacity=".55" transform="rotate(-24 {x} {y})"/>'
body+=f'<ellipse class="gf" cx="140" cy="{gy+3}" rx="26" ry="2.6" fill="{INK}" opacity=".3"/>'
body+='<g transform="translate(-28 -30) scale(1.2)">'
body+=f'<path d="M118 {gy}C116 118 122 84 130 68C134 60 146 60 150 68C158 86 162 118 160 {gy}C150 {gy+4} 128 {gy+4} 118 {gy}Z" fill="{CLOAK}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>'
for d in ('M128 96C126 116 126 134 127 150','M138 90C137 112 138 132 138 152','M148 94C150 114 151 134 151 150'):
    body+=f'<path d="{d}" fill="none" stroke="{INK}" stroke-width=".9" opacity=".55" stroke-linecap="round"/>'
body+=f'<path d="M130 62C130 50 150 50 150 62C150 70 146 74 140 74C134 74 130 70 130 62Z" fill="{CLOAK}" stroke="{INK}" stroke-width="1.6"/>'
body+=f'<g class="sc"><path d="M128 72C136 78 146 78 153 72L156 78C166 80 172 86 178 94L170 92L172 100C164 96 158 90 152 84C144 88 134 86 127 80Z" fill="{BLUE}" stroke="{INK}" stroke-width="1.4" stroke-linejoin="round"/></g>'
body+=f'<path d="M132 {gy+1}h8M144 {gy+1}h8" stroke="{INK}" stroke-width="3" stroke-linecap="round"/></g>'
open('img/art-traveller.svg','w').write(svg(body,'.fp{animation:p 3.6s ease-out infinite both}@keyframes p{0%,8%{opacity:0}16%,100%{opacity:.55}}.sc{transform-origin:153px 76px;animation:w 3.2s ease-in-out infinite alternate}@keyframes w{to{transform:rotate(-5deg) skewX(-4deg)}}'+RM))

# 4. The gateway: a stone browser window with the night sky inside (demos)
r=random.Random(11); gy=162
O=[(54,gy),(54,30),(196,30),(196,gy)]; H=[(74,gy),(74,62),(176,62),(176,gy)]
body=ground(gy,r,rocks=[(8,1),(206,.9)])
for a,b in ((O[0],O[1]),(O[1],O[2])):
    body+=poly([a,b,(b[0]-10,b[1]-7),(a[0]-10,a[1]-7 if a[1]<gy else a[1])],ST_D,1.4)
body+=f'<path fill-rule="evenodd" d="M54 {gy}V30H196V{gy}ZM74 {gy}V62H176V{gy}Z" fill="{ST}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round"/>'
body+=f'<rect x="74" y="62" width="102" height="{gy-62}" fill="{NIGHT}" stroke="{INK}" stroke-width="1.6"/>'
body+=poly([(176,62),(166,69),(166,gy),(176,gy)],ST_D,1.3)
body+=poly([(74,62),(176,62),(166,69),(74,69)],ST_D,1.3)
rs=random.Random(2)
for i in range(22):
    x=rs.uniform(80,160); y=rs.uniform(76,gy-22); big=i%6==0
    body+=f'<circle class="st" style="animation-delay:{rs.uniform(0,4):.1f}s" cx="{x:.1f}" cy="{y:.1f}" r="{1.5 if big else .8}" fill="#fff"/>'
body+=f'<path d="M74 {gy-10}C96 {gy-18} 120 {gy-8} 166 {gy-14}V{gy}H74Z" fill="{SAND}" stroke="{INK}" stroke-width="1.2"/>'
for x in (66,78,90): body+=f'<circle cx="{x}" cy="46" r="3.6" fill="{ST_D}" stroke="{INK}" stroke-width="1.3"/>'
body+=f'<rect x="104" y="41" width="82" height="10" fill="{ST_D}" stroke="{INK}" stroke-width="1.3"/>'
body+=texture(O,r,44,holes=[[(72,gy),(72,60),(178,60),(178,gy)],[(60,38),(60,54),(190,54),(190,38)]])
open('img/art-gateway.svg','w').write(svg(body,'.st{animation:t 4s ease-in-out infinite alternate}@keyframes t{to{opacity:.25}}'+RM))
