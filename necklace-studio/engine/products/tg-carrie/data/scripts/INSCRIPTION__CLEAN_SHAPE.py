import Rhino.Geometry as rg


if not breps:
    breps = []

if not loops:
    loops = []

if not sockets:
    sockets = []


plane = rg.Plane.WorldXY
tolerance = 0.001


#-------------------------------------------------------------------------------------
# FUNCTIONS
#-------------------------------------------------------------------------------------

def get_outer_curve(brep):

    edges = [
        edge.DuplicateCurve()
        for edge in brep.Edges
    ]

    joined = rg.Curve.JoinCurves(
        edges,
        tolerance
    )

    if not joined:
        return None

    if len(joined) == 1:
        return joined[0]

    closed = [
        c
        for c in joined
        if c.IsClosed
    ]

    if not closed:
        return None

    return max(
        closed,
        key=lambda c: rg.AreaMassProperties.Compute(c).Area
    )


def to_list(item):

    if item is None:
        return []

    if isinstance(item, (list, tuple)):
        return list(item)

    try:
        return list(item)

    except TypeError:
        return [item]


def get_center(geos):

    bbox = rg.BoundingBox.Empty

    for geo in geos:

        if geo is None:
            continue

        bbox.Union(
            geo.GetBoundingBox(True)
        )

    return bbox.Center


def get_biggest_surface(srfs):

    if not srfs:
        return None

    return max(
        srfs,
        key=rg.Brep.GetArea
    )


def curve_relationship(curve_a, curve_b):
    """
    Pure RhinoCommon planar containment test.

    Returns:
        rg.RegionContainment
    """

    if curve_a is None or curve_b is None:
        return None

    if not curve_a.IsClosed or not curve_b.IsClosed:
        return None

    try:

        return rg.Curve.PlanarClosedCurveRelationship(
            curve_a,
            curve_b,
            plane,
            tolerance
        )

    except:
        return None


def curve_is_inside(curve_a, curve_b):
    """
    True when curve_a is inside curve_b.
    """

    rel = curve_relationship(
        curve_a,
        curve_b
    )

    return (
        rel == rg.RegionContainment.AInsideB
    )

"""
def step_split(breps):
    '''
    Split each brep by the next one and return
    cleaned breps without leftovers.
    '''

    result = []

    if not breps:
        return []

    if len(breps) == 1:
        return breps[0]


    for i in range(
        0,
        len(breps) - 1
    ):

        a_crv = get_outer_curve(
            breps[i]
        )

        b_crv = get_outer_curve(
            breps[i + 1]
        )

        rel = curve_relationship(
            a_crv,
            b_crv
        )

        print(
            "CURVE RELATION:",
            rel
        )


        success, curves, points = (
            rg.Intersect.Intersection.BrepBrep(
                breps[i],
                breps[i + 1],
                tolerance
            )
        )


        splits = rg.Brep.Split(
            breps[i],
            breps[i + 1],
            tolerance
        )


        print(
            "PAIR:",
            i,
            i + 1
        )

        print(
            "INTERSECTION:",
            success
        )

        print(
            "INTERSECTION CURVES:",
            len(curves)
            if curves
            else 0
        )

        print(
            "INTERSECTION POINTS:",
            len(points)
            if points
            else 0
        )

        print(
            "SPLITS COUNT:",
            len(splits)
            if splits
            else 0
        )


        shape = get_biggest_surface(
            splits
        )

        print(
            "SHAPE:",
            shape
        )

        if shape:
            result.append(
                shape
            )


    last_shape = breps[-1]

    if last_shape:
        result.append(
            last_shape
        )

    return result
"""

def step_split(breps):
    """
    Split each Brep by the next one.
    Keep the largest piece after splitting.
    Preserve the original if no usable result is returned.
    Always return a list.
    """

    if not breps:
        return []

    result = []

    for i in range(len(breps) - 1):
        current = breps[i]
        cutter = breps[i + 1]

        splits = current.Split(
            cutter,
            tolerance
        )

        count = len(splits) if splits else 0

        print("PAIR: {} -> {}".format(i, i + 1))
        print("SPLITS COUNT: {}".format(count))

        shape = None

        if count == 1:
            shape = splits[0]

        elif count > 1:
            shape = get_biggest_surface(splits)

        if shape is None:
            print("Keeping original Brep: {}".format(i))
            shape = current

        result.append(shape)

    result.append(breps[-1])

    return result

def join_breps(breps):
    """
    Join a list of breps.
    """

    breps = [
        b
        for b in breps
        if b
    ]

    if not breps:
        return None

    if len(breps) == 1:
        return breps[0]

    joined = rg.Brep.JoinBreps(
        breps,
        tolerance
    )

    if not joined:
        return None

    if len(joined) == 1:
        return joined[0]

    return None


def merge_faces(brep):

    if brep:
        brep.MergeCoplanarFaces(
            tolerance
        )


def inner_outer(crvs):
    """
    Separate curves into:

    inner:
        curve is inside at least one other curve

    outer:
        curve is not inside any other curve

    Pure RhinoCommon implementation.
    """

    inner = []
    outer = []

    crvs = [
        c
        for c in crvs
        if c is not None
    ]


    for i, curve_a in enumerate(crvs):

        is_inner = False

        for j, curve_b in enumerate(crvs):

            if i == j:
                continue

            if curve_is_inside(
                curve_a,
                curve_b
            ):

                is_inner = True
                break


        if is_inner:

            inner.append(
                curve_a
            )

        else:

            outer.append(
                curve_a
            )


    return (
        inner,
        outer
    )


#-------------------------------------------------------------------------------------
# MAIN
#-------------------------------------------------------------------------------------

clean_breps = step_split(
    breps
)


clean_breps = to_list(
    clean_breps
)

clean_breps = [
    c
    for c in clean_breps
    if c
]


print(
    "CLEANED:",
    clean_breps
)


brep_shape = join_breps(
    clean_breps
)


success = bool(
    brep_shape
)

if success:

    merge_faces(
        brep_shape
    )


    center = get_center(
        clean_breps
    )


    # Create curves from brep
    crvs = to_list(
        rg.Brep.CreateContourCurves(
            brep_shape,
            plane
        )
    )


    loops = to_list(
        loops
    )


    # Separate inner and outer curves
    inner_crvs, outer_crvs = inner_outer(
        crvs + loops
    )

    # Filter small inner curves
    filtered_inner = []

    for c in inner_crvs:

        amp = rg.AreaMassProperties.Compute(
            c
        )

        if amp and amp.Area > min_area:

            filtered_inner.append(
                c
            )


    inner_crvs = filtered_inner


    # Add sockets to outer curves
    if sockets:

        outer_crvs.extend(
            to_list(sockets)
        )


    # Boolean union
    union_result = rg.Curve.CreateBooleanUnion(
        outer_crvs
    )

    outer_crvs = to_list(
        union_result
    )


else:
    loops = to_list(loops)


    # Separate inner and outer curves
    inner_crvs, outer_crvs = inner_outer(
        loops
    )