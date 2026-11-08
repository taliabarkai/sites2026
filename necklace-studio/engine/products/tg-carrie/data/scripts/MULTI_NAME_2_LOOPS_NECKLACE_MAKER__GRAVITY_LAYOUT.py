import Rhino.Geometry as rg
import math

# GRAVITY LAYOUT v1 - 2D lightweight position-based relaxation
# ChainLengths must contain N+1 values in order:
# outer-left -> name0, name0 -> name1, ..., nameN-1 -> outer-right.
# This is a visual approximation, not a physical equilibrium solver.

GeometryOut = []
MovedLeftOut = []
MovedRightOut = []
Transforms = []
Points = []
Info = []
AdditionPlanes = []
AdditionCenters = []


def vec(a, b):
    return [b[0] - a[0], b[1] - a[1]]


def length(v):
    return math.hypot(v[0], v[1])


def unit(v, fallback=(1.0, 0.0)):
    d = length(v)
    if d < 1e-10:
        return [fallback[0], fallback[1]]
    return [v[0] / d, v[1] / d]


def rot(v, angle):
    c, s = math.cos(angle), math.sin(angle)
    return [c * v[0] - s * v[1], s * v[0] + c * v[1]]


def endpoint(i, side, centers, angles, offsets):
    o = rot(offsets[i][side], angles[i])
    return [centers[i][0] + o[0], centers[i][1] + o[1]]


def duplicate(g):
    try:
        return g.DuplicateGeometry()
    except:
        try:
            return g.Duplicate()
        except:
            return None


def make_output(geo, left, right, original_center, new_center, angle):
    pivot = rg.Point3d(original_center[0], original_center[1], original_center[2])
    rotation = rg.Transform.Rotation(angle, rg.Vector3d.ZAxis, pivot)
    translation = rg.Transform.Translation(
        new_center[0] - original_center[0],
        new_center[1] - original_center[1],
        0.0
    )
    xform = translation * rotation
    g = duplicate(geo)
    if g is None:
        return None
    g.Transform(xform)
    l = rg.Point3d(left)
    r = rg.Point3d(right)
    l.Transform(xform)
    r.Transform(xform)
    return g, l, r, xform


try:
    n = min(len(Geometry), len(MovedLeft), len(MovedRight))
except:
    n = 0

valid = n > 0 and GuideCurve is not None
if valid:
    for i in range(n):
        if Geometry[i] is None or MovedLeft[i] is None or MovedRight[i] is None:
            valid = False
            Info.append('Missing geometry or connection at name {}'.format(i))
            break

if valid:
    try:
        gravity = max(0.0, min(1.0, float(GravityStrength)))
    except:
        gravity = 0.5
    try:
        iterations = max(1, min(150, int(Iterations)))
    except:
        iterations = 30
    enabled = bool(Enabled)

    left_anchor = GuideCurve.PointAtStart
    right_anchor = GuideCurve.PointAtEnd
    anchor_l = [left_anchor.X, left_anchor.Y]
    anchor_r = [right_anchor.X, right_anchor.Y]

    original = []
    centers = []
    offsets = []
    angles = [0.0] * n
    for i in range(n):
        l = MovedLeft[i]
        r = MovedRight[i]
        center = [(l.X + r.X) * 0.5, (l.Y + r.Y) * 0.5, (l.Z + r.Z) * 0.5]
        original.append(center)
        centers.append([center[0], center[1]])
        offsets.append([
            [l.X - center[0], l.Y - center[1]],
            [r.X - center[0], r.Y - center[1]]
        ])

    # Build rigid objects: NAME, STONE, NAME, ... .
    # A stone is a lightweight rigid bar of AdditionWidth with two
    # connection points; no diamond meshes are simulated.
    try:
        widths_in = [max(0.0, float(v)) for v in AdditionWidth if v is not None]
    except:
        try:
            widths_in = [max(0.0, float(AdditionWidth))]
        except:
            widths_in = []
    widths = ([widths_in[0]] * (n - 1) if len(widths_in) == 1
              else [widths_in[i] if i < len(widths_in) else 0.0
                    for i in range(n - 1)])
    try:
        addition_weight = max(0.0, float(AdditionWeight))
    except:
        addition_weight = 0.3

    # Stone centers initially sit on the guide near the middle of
    # the two adjacent name connection points.
    objects = []
    for i in range(n):
        objects.append({
            'kind': 'name', 'index': i,
            'center': centers[i][:], 'angle': 0.0,
            'offsets': offsets[i], 'weight': 1.0
        })
        if i < n - 1 and widths[i] > 1e-8:
            midpoint = rg.Point3d(
                (MovedRight[i].X + MovedLeft[i + 1].X) * 0.5,
                (MovedRight[i].Y + MovedLeft[i + 1].Y) * 0.5, 0.0)
            ok, t = GuideCurve.ClosestPoint(midpoint)
            gp = GuideCurve.PointAt(t) if ok else midpoint
            tangent = GuideCurve.TangentAt(t) if ok else rg.Vector3d.XAxis
            angle = math.atan2(tangent.Y, tangent.X)
            half = widths[i] * 0.5
            objects.append({
                'kind': 'stone', 'index': i,
                'center': [gp.X, gp.Y], 'angle': angle,
                'offsets': [[-half, 0.0], [half, 0.0]],
                'weight': addition_weight
            })

    def obj_endpoint(j, side):
        obj = objects[j]
        o = rot(obj['offsets'][side], obj['angle'])
        return [obj['center'][0] + o[0], obj['center'][1] + o[1]]

    def span_points(k):
        a = anchor_l if k == 0 else obj_endpoint(k - 1, 1)
        b = anchor_r if k == len(objects) else obj_endpoint(k, 0)
        return a, b

    measured = [length(vec(*span_points(k)))
                for k in range(len(objects) + 1)]
    try:
        supplied = [float(x) for x in ChainLengths]
    except:
        supplied = []
    # N+1 lengths are the OLD unsplit spans; these do not map to
    # N+stones+1 chain spans. Do not add stone widths to them.
    # Preserve actual initial chain gaps for the joint solver.
    targets = measured[:]
    if len(objects) == n and len(supplied) == n + 1 and all(v > 0 for v in supplied):
        targets = supplied
        Info.append('Using supplied N+1 chain targets')
    else:
        Info.append('Using measured individual chain targets (stone-aware)')

    if enabled and gravity > 0.0:
        for iteration in range(iterations):
            for obj in objects:
                obj['center'][1] -= 0.12 * gravity * obj['weight']
            for sweep in range(3):
                for k in range(len(objects) + 1):
                    pa, pb = span_points(k)
                    d = vec(pa, pb)
                    dist = length(d)
                    if dist < 1e-9:
                        continue
                    err = dist - targets[k]
                    ux, uy = d[0] / dist, d[1] / dist
                    ai = k - 1 if k > 0 else None
                    bi = k if k < len(objects) else None
                    wa = objects[ai]['weight'] if ai is not None else 0.0
                    wb = objects[bi]['weight'] if bi is not None else 0.0
                    total = wa + wb
                    if total < 1e-9:
                        continue
                    # Mass-inspired inverse weights, fixed anchors.
                    ca = (1.0 / max(0.05, wa)) if ai is not None else 0.0
                    cb = (1.0 / max(0.05, wb)) if bi is not None else 0.0
                    denom = ca + cb
                    if denom < 1e-9:
                        continue
                    for j, side, sign, share in (
                        (ai, 1, 1.0, ca / denom),
                        (bi, 0, -1.0, cb / denom)
                    ):
                        if j is None:
                            continue
                        obj = objects[j]
                        step = 0.7 * err * share
                        obj['center'][0] += sign * step * ux
                        obj['center'][1] += sign * step * uy
                        arm = rot(obj['offsets'][side], obj['angle'])
                        torque = arm[0] * (sign * err * uy) - arm[1] * (sign * err * ux)
                        inertia = max(1.0, arm[0] ** 2 + arm[1] ** 2)
                        obj['angle'] += max(-0.035, min(0.035, 0.05 * torque / inertia))
            for obj in objects:
                if obj['kind'] == 'stone':
                    obj['angle'] *= 0.995

    # Copy relaxed name state back into the original output contract.
    for obj in objects:
        if obj['kind'] == 'name':
            i = obj['index']
            centers[i] = obj['center']
            angles[i] = obj['angle']
        else:
            i = obj['index']
            center = obj['center']
            angle = obj['angle']
            plane = rg.Plane(
                rg.Point3d(center[0], center[1], 0.0),
                rg.Vector3d.XAxis, rg.Vector3d.YAxis)
            plane.Rotate(angle, plane.ZAxis)
            AdditionPlanes.append(plane)
            AdditionCenters.append(plane.Origin)
    for i in range(n):
        item = make_output(Geometry[i], MovedLeft[i], MovedRight[i], original[i], centers[i], angles[i])
        if item is None:
            Info.append('Could not duplicate name {}'.format(i))
            continue
        g, l, r, xform = item
        GeometryOut.append(g)
        MovedLeftOut.append(l)
        MovedRightOut.append(r)
        Transforms.append(xform)
        Points.append(rg.Point3d(centers[i][0], centers[i][1], original[i][2]))

    residuals = [abs(length(vec(*span_points(k))) - targets[k]) for k in range(len(objects) + 1)]
    Info.append('Names: {}, Stones: {}'.format(n, len(AdditionPlanes)))
    Info.append('Iterations: {}'.format(iterations if enabled else 0))
    Info.append('Maximum chain length error: {:.4f}'.format(max(residuals)))
    Info.append('Mode: joint name+stone relaxation' if enabled else 'Mode: passthrough')
else:
    Info.append('Missing GuideCurve or name geometry/connection inputs')

# Alias to match the old NAME LAYOUT output convention.
Geometry = GeometryOut
MovedLeft = MovedLeftOut
MovedRight = MovedRightOut
