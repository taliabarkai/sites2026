"""Minimal GH_IO binary archive reader. Usage: ghio.py <raw-deflated-archive.bin> <out.json>"""
import sys,struct,uuid,json,zlib,base64
class R:
    def __init__(s,d): s.d=d; s.p=0
    def u(s,f,n): v=struct.unpack_from(f,s.d,s.p); s.p+=n; return v
    def i32(s): return s.u('<i',4)[0]
    def str(s):
        n=0;sh=0
        while True:
            b=s.d[s.p]; s.p+=1; n|=(b&0x7f)<<sh; sh+=7
            if not b&0x80: break
        v=s.d[s.p:s.p+n].decode('utf-8','replace'); s.p+=n; return v
    def bytes(s,n): v=s.d[s.p:s.p+n]; s.p+=n; return v
def item(r,t):
    if t==1: return bool(r.bytes(1)[0])
    if t==2: return r.bytes(1)[0]
    if t==3: return r.i32()
    if t==4: return r.u('<q',8)[0]
    if t==5: return r.u('<f',4)[0]
    if t==6: return r.u('<d',8)[0]
    if t==8: return r.u('<q',8)[0]
    if t==9: return str(uuid.UUID(bytes_le=r.bytes(16)))
    if t==10: return r.str()
    if t in(20,37):
        n=r.i32(); b=r.bytes(n); return {'__bytes':len(b),'_raw':b}
    if t==21: n=r.i32(); return list(r.u('<%dd'%n,8*n))
    if t in(30,32): return list(r.u('<2i',8))
    if t in(31,33): return list(r.u('<2f',8))
    if t==34: return list(r.u('<4i',16))
    if t==35: return list(r.u('<4f',16))
    if t==36: return list(r.bytes(4))
    if t==50: return list(r.u('<2d',16))
    if t==51: return list(r.u('<3d',24))
    if t==52: return list(r.u('<4d',32))
    if t==60: return list(r.u('<2d',16))
    if t==61: return list(r.u('<4d',32))
    if t in(70,71): return list(r.u('<6d',48))
    if t==72: return list(r.u('<9d',72))
    if t==80: return list(r.u('<3i',12))
    raise ValueError('type %d at %d'%(t,r.p))
def chunk(r):
    name=r.str(); idx=r.i32(); ni=r.i32(); nc=r.i32()
    c={'name':name,'index':idx,'items':[],'chunks':[]}
    for _ in range(ni):
        k=r.str(); ki=r.i32(); t=r.i32(); c['items'].append([k,ki,t,item(r,t)])
    for _ in range(nc): c['chunks'].append(chunk(r))
    return c
def parse(d): return chunk(R(d))
def nested_archive(b):
    # ClusterDocument byte arrays: try raw deflate at small offsets
    for off in range(0,64):
        for w in(-15,15):
            try:
                o=zlib.decompressobj(w).decompress(b[off:])
                if len(o)>100: return o
            except Exception: pass
    return None
def clean(c):
    out={'name':c['name']}
    if c['index']!=-1: out['index']=c['index']
    it={}
    for k,ki,t,v in c['items']:
        if isinstance(v,dict) and '_raw' in v:
            b=v['_raw']
            if k=='ClusterDocument':
                a=nested_archive(b); v={'__cluster':clean(parse(a))} if a else {'__bytes':len(b)}
            else: v={'__bytes':len(b)}
        key=k if ki==-1 else f'{k}[{ki}]'
        it[key]=v
    if it: out['items']=it
    if c['chunks']: out['chunks']=[clean(x) for x in c['chunks']]
    return out
if __name__=='__main__':
    t=clean(parse(open(sys.argv[1],'rb').read()))
    json.dump(t,open(sys.argv[2],'w'),indent=1)
    print('ok')
