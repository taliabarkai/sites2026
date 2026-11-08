"""
Extract everything the TypeScript engine needs from a TG-CARRIE-style .gh file.

    python -I extract_gh.py <definition.gh> <out_dir>

Offline, run by a developer whenever Oleg changes the definition. Needs only
`rhino3dm` (MIT, McNeel's free reader) to decode internalised geometry; no
Rhino licence. The runtime engine never touches Rhino or this script.

Writes:
    font.json        glyph NURBS (base/_slots/_stones), widths, kerning pairs
    anchors.json     every addition-anchors-v2 scheme, keyed by panel name
    slots.json       pair-slot-overrides-v1, verbatim
    config.json      sliders, panels, presets (by executing MAIN), schemes
    assets.json      fixed geometry: loops, sockets, missing glyph, chain links
    scripts/*.py     Oleg's script sources, for reference while porting
"""
import base64
import json
import os
import re
import struct
import sys
import zlib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ghio  # noqa: E402
import rhino3dm  # noqa: E402


# ---------------------------------------------------------------- tree access

def items(chunk):
    return {(k if ki == -1 else f"{k}[{ki}]"): v for k, ki, t, v in chunk["items"]}


def sub(chunk, name):
    return [c for c in chunk["chunks"] if c["name"] == name]


def walk(chunk):
    yield chunk
    for c in chunk["chunks"]:
        yield from walk(c)


def objects(doc):
    for c in walk(doc):
        if c["name"] == "DefinitionObjects":
            for o in sub(c, "Object"):
                cont = sub(o, "Container")
                if cont:
                    yield cont[0]
            return


def cluster_doc(container):
    v = items(container).get("ClusterDocument")
    if not v:
        return None
    raw = ghio.nested_archive(v["_raw"])
    return ghio.parse(raw) if raw else None


def by_nick(doc, nick, name=None):
    out = []
    for c in objects(doc):
        it = items(c)
        if it.get("NickName") == nick and (name is None or it.get("Name") == name):
            out.append(c)
    return out


# ---------------------------------------------------------------- geometry

def decode_ondata(raw):
    """GH stores RhinoCommon objects as .NET BinaryFormatter around an opennurbs archive."""
    b = zlib.decompress(raw, -15)
    tn = re.search(rb"(Rhino\.Geometry\.\w+)", b).group(1).decode()
    j = b.find(b"\x10\x27\x00\x00")  # version == 10000
    ver, a3, onv = struct.unpack_from("<iii", b, j)
    k = b.find(b"\x0f", j + 12)
    _id, n = struct.unpack_from("<ii", b, k + 1)
    assert b[k + 9] == 2, "expected a byte array"
    data = b[k + 10:k + 10 + n]
    obj = rhino3dm.CommonObject.Decode(
        {"version": ver, "archive3dm": a3, "opennurbs": onv, "data": base64.b64encode(data).decode()}
    )
    return tn, obj


def r(x, nd=6):
    return round(float(x), nd)


def curve_json(crv):
    """Every curve leaves as one NURBS: degree, homogeneous-free points + weights, Rhino knots."""
    n = crv.ToNurbsCurve()
    pts = []
    for i in range(len(n.Points)):
        p = n.Points[i]  # Point4d, homogeneous
        w = p.W if n.IsRational else 1.0
        pts.append([r(p.X / w), r(p.Y / w), r(p.Z / w), r(w)])
    knots = [r(n.Knots[i], 9) for i in range(len(n.Knots))]
    return {"type": "nurbs", "degree": n.Degree, "rational": bool(n.IsRational),
            "closed": bool(crv.IsClosed), "points": pts, "knots": knots}


def mesh_json(mesh):
    mesh.Faces.ConvertQuadsToTriangles()
    pos = []
    for i in range(len(mesh.Vertices)):
        v = mesh.Vertices[i]
        pos += [r(v.X), r(v.Y), r(v.Z)]
    idx = []
    for i in range(mesh.Faces.Count):
        f = mesh.Faces[i]
        idx += [f[0], f[1], f[2]]
    return {"type": "mesh", "positions": pos, "indices": idx}


def brep_json(brep):
    meshes = []
    for mp in (rhino3dm.MeshType.Any, rhino3dm.MeshType.Default, rhino3dm.MeshType.Render):
        for i in range(len(brep.Faces)):
            m = brep.Faces[i].GetMesh(mp)
            if m:
                meshes.append(mesh_json(m))
        if meshes:
            break
    bb = brep.GetBoundingBox()
    return {"type": "brep", "faceMeshes": meshes,
            "bbox": [r(bb.Min.X), r(bb.Min.Y), r(bb.Min.Z), r(bb.Max.X), r(bb.Max.Y), r(bb.Max.Z)]}


def geometry_json(raw):
    tn, obj = decode_ondata(raw)
    if obj is None:
        return {"type": "undecodable", "rhinoType": tn}
    if isinstance(obj, rhino3dm.Curve):
        out = curve_json(obj)
    elif isinstance(obj, rhino3dm.Mesh):
        out = mesh_json(obj)
    elif isinstance(obj, rhino3dm.Brep):
        out = brep_json(obj)
    else:
        out = {"type": "other"}
    out["rhinoType"] = tn.split(".")[-1]
    return out


def persistent(container):
    """Values internalised on a param: strings, numbers, points, geometry."""
    pd = sub(container, "PersistentData")
    if not pd:
        return []
    out = []
    for c in walk(pd[0]):
        if c["name"] != "Item":
            continue
        it = items(c)
        if "ON_Data" in it:
            out.append(geometry_json(it["ON_Data"]["_raw"]))
            continue
        vals = {k: v for k, v in it.items() if k not in ("TypeName",)}
        if "string" in vals:  # GH_String: {null_string, string}
            out.append(None if vals.get("null_string") is True else vals["string"])
            continue
        if len(vals) == 1:
            out.append(next(iter(vals.values())))
        else:
            out.append(vals)
    return out


def slider_value(container):
    s = sub(container, "Slider")
    return items(s[0]).get("Value") if s else None


# ---------------------------------------------------------------- scripts

def script_sources(doc, prefix, out):
    for c in objects(doc):
        it = items(c)
        for s in sub(c, "Script"):
            si = items(s)
            text = si.get("Text")
            if text:
                src = base64.b64decode(text).decode("utf-8")
                title = si.get("Title") or it.get("NickName") or "script"
                out.setdefault(f"{prefix}{title}", src)
        cd = cluster_doc(c)
        if cd:
            script_sources(cd, f"{prefix}{it.get('NickName')}__", out)


# ---------------------------------------------------------------- main

def main(gh_path, out_dir):
    raw = open(gh_path, "rb").read()
    root = ghio.parse(zlib.decompress(raw, -15))
    os.makedirs(out_dir, exist_ok=True)

    def one(nick, name=None):
        found = by_nick(root, nick, name)
        if not found:
            raise SystemExit(f"missing object {nick!r}")
        return found[0]

    def text(nick):
        v = items(one(nick)).get("UserText")
        if v is None:
            vals = persistent(one(nick))
            v = vals[0] if vals else ""
        return v

    # ---- font
    font = json.loads(persistent(one("FONT_JSON"))[0])
    assert font["format"] == "rhino-curve-font-v2"
    glyphs = {}
    for name, g in font["characters"].items():
        geom = g.get("geometry", {})
        entry = {"width": g["width"]}
        for role in ("base", "_slots", "_stones"):
            if role in geom:  # presence matters: an explicit empty list blocks inheritance
                entry[role] = [
                    {"degree": c["degree"], "rational": c.get("is_rational", False),
                     "closed": c.get("is_closed", False),
                     "points": [[p["x"], p["y"], p.get("weight", 1.0)] for p in c["points"]],
                     "knots": c["knots"]}
                    for c in geom[role]
                ]
        glyphs[name] = entry
    font_out = {
        "format": "tg-font-v1",
        "name": font["font"]["name"],
        "sourceReferenceHeight": font["font"]["source_reference_height"],
        "overrideValue": font["font"].get("override_value"),
        "glyphs": glyphs,
        "pairs": {k: v["raw_spacing"] for k, v in font["pairs"].items()},
        "kerningAliases": font.get("kerning_aliases", {}),
    }
    json.dump(font_out, open(os.path.join(out_dir, "font.json"), "w"), separators=(",", ":"))

    # ---- addition schemes (loops, stone additions)
    scheme_names = [s.strip() for s in text("ADDITION SCHEMES").replace("\r", "").split("\n") if s.strip()]
    geo_nicks = ["Loop 2.5 mm", "Stone socket", "Loop 2.5 mm", "Loop 3 mm"]  # Entwine order {0;0..3}
    geo_objs = by_nick(root, "Loop 2.5 mm", "Geometry") + by_nick(root, "Stone socket", "Geometry") + by_nick(root, "Loop 3 mm", "Geometry")
    # Resolve Entwine wiring instead of trusting canvas order.
    guid_of = {items(c)["InstanceGuid"]: c for c in objects(root)}

    def entwine_inputs(nick_hint):
        for c in objects(root):
            if items(c).get("Name") != "Entwine":
                continue
            ins = []
            params = sub(c, "param_input")
            for pd in sub(c, "ParameterData"):  # variable-parameter components
                params += [p for p in pd["chunks"] if p["name"] == "InputParam"]
            for p in params:
                srcs = [v for k, v in items(p).items() if k.startswith("Source[")]
                ins.append(guid_of.get(srcs[0]) if srcs else None)
            if ins and ins[0] is not None and items(ins[0]).get("Name") == nick_hint:
                yield ins

    n = len(scheme_names)
    json_branches = next(e for e in entwine_inputs("Text") if len(e) == n and "JSON" in items(e[0])["NickName"])
    geo_branches = next(e for e in entwine_inputs("Geometry") if len(e) == n)
    pivot_branches = next(e for e in entwine_inputs("Point") if len(e) == n)
    anchors_out, schemes = {}, []
    for i, name in enumerate(scheme_names):
        anchor_json = json.loads(persistent(json_branches[i])[0])
        anchors_out[name] = anchor_json
        piv = persistent(pivot_branches[i])[0]
        schemes.append({
            "index": i, "name": name, "anchorsJson": items(json_branches[i])["NickName"],
            "geometry": persistent(geo_branches[i]),
            "pivot": piv,
        })
    json.dump(anchors_out, open(os.path.join(out_dir, "anchors.json"), "w"), separators=(",", ":"))

    # ---- pair slots
    slots = json.loads(persistent(one("SLOTS_JSON"))[0])
    json.dump(slots, open(os.path.join(out_dir, "slots.json"), "w"), separators=(",", ":"))

    # ---- presets: execute MAIN exactly as Grasshopper would
    main_src = None
    for c in objects(root):
        for s in sub(c, "Script"):
            if items(s).get("Title") == "MAIN":
                main_src = base64.b64decode(items(s)["Text"]).decode("utf-8")
    env = {
        "PRESET": "DEFAULT",
        "FONT": text("BASE FONT NAME"),
        "VARIANT": text("FONT VARIANT"),
        "ADDITION_SCHEMES": scheme_names,
        "FEATURE_POOL": [s.strip() for s in text("FEATURE_POOL").replace("\r", "").split("\n") if s.strip()],
        "SIZES": [s for s in text("SIZES (ARTCAM TO RHINO)").replace("\r", "").split("\n") if s.strip()],
        "print": lambda *a, **k: None,
    }
    exec(compile(main_src, "MAIN", "exec"), env)
    presets = env["preset_map"]
    size_map = env["size_map"]

    def csv_panel(nick):
        return [s.strip() for s in text(nick).replace("\r", "\n").replace("\n", ",").split(",") if s.strip()]

    config = {
        "format": "tg-config-v1",
        "font": text("BASE FONT NAME"),
        "sizes": {k: float(v) for k, v in size_map.items()},
        "presets": presets,
        "schemes": [{k: v for k, v in s.items() if k != "geometry"} for s in schemes],
        "alternativesFirst": csv_panel("Alternatives First []1"),
        "alternativesSecond": csv_panel("Alternatives Second []1"),
        "finites": csv_panel("Finites alternatives _[]"),
        "curled": csv_panel("Curled letters"),
        "kerningGroupsText": text("KERNING GROUPS"),
        "slotCombosFirst": csv_panel("SLOT COMBO FIRST"),
        "slotCombosSecond": csv_panel("SLOT COMBO SECOND"),
        "sliders": {
            "overrideValue": slider_value(one("OVERRIDE_VALUE")),
            "missingGlyphWidth": slider_value(one("MISSING GLYPH WIDTH")),
            "slotExtension": slider_value(one("SLOT EXTENSIONS")),
            "offsetDistance": slider_value(one("OFFSET DISTANCE")),
        },
    }

    # Values that live inside clusters.
    insc = cluster_doc(by_nick(root, "INSCRIPTION", "Cluster")[0])
    config["sliders"]["minHoleArea"] = slider_value(by_nick(insc, "min area")[0])
    prev = cluster_doc(by_nick(root, "3D PREVIEW", "Cluster")[0])
    for c in objects(prev):
        it = items(c)
        if it.get("Name") == "Number Slider" and slider_value(c) and slider_value(c) > 0.5:
            config["sliders"]["thickness"] = slider_value(c)
    # The 2-loop necklace maker's LINK PITCH (the single-loop one has its own 0.2).
    maker = [c for c in by_nick(root, "LINK PITCH", "Number Slider") if slider_value(c) > 0.5]
    config["sliders"]["linkPitch"] = slider_value(maker[0])
    json.dump(config, open(os.path.join(out_dir, "config.json"), "w"), indent=1, ensure_ascii=False)

    # ---- fixed assets
    assets = {
        "format": "tg-assets-v1",
        "schemes": [{"name": s["name"], "geometry": s["geometry"], "pivot": s["pivot"]} for s in schemes],
        "missingGlyph": persistent(one("Missing - Glyph")),
        "chainLink": persistent(one("CHAIN LINK")),
        "connectionLink": persistent(one("CONNECTION LINK")),
        "stoneMarkers": {
            "SQUARE": persistent(by_nick(insc, "SQUARE")[0]),
            "DIAMOND": persistent(by_nick(insc, "DIAMOND")[0]),
        },
    }
    json.dump(assets, open(os.path.join(out_dir, "assets.json"), "w"), separators=(",", ":"))

    # ---- script sources for reference
    srcs = {}
    script_sources(root, "", srcs)
    sd = os.path.join(out_dir, "scripts")
    os.makedirs(sd, exist_ok=True)
    for title, src in srcs.items():
        fn = re.sub(r"[^A-Za-z0-9_]+", "_", title).strip("_") + ".py"
        open(os.path.join(sd, fn), "w").write(src)

    print(json.dumps({
        "glyphs": len(glyphs), "pairs": len(font_out["pairs"]), "schemes": [s["name"] for s in schemes],
        "presets": len(presets), "sizes": config["sizes"], "sliders": config["sliders"],
        "scripts": len(srcs),
    }, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
