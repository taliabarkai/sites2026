import Rhino.Geometry as rg


if not crvs:
    crvs = []

inner = []
outer = []

tol = 0.001


for i, crv_a in enumerate(crvs):

    is_inner = False

    for j, crv_b in enumerate(crvs):

        if i == j:
            continue

        relation = rg.Curve.PlanarClosedCurveRelationship(
            crv_a,
            crv_b,
            rg.Plane.WorldXY,
            tol
        )

        # crv_a is inside crv_b
        if relation == rg.RegionContainment.AInsideB:
            is_inner = True
            break

    if is_inner:
        inner.append(crv_a)
    else:
        outer.append(crv_a)