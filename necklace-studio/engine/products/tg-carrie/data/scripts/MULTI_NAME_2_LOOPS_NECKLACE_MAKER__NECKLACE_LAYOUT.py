import Rhino.Geometry as rg
ChainLines = []
ChainLengths = []
AdditionPlanes = []
AdditionCenters = []
StartIsName = []
EndIsName = []
StartIsAddition = []
EndIsAddition = []
total_length = max(
    0.001,
    float(TotalLength)
)
samples = max(
    4,
    int(Samples)
)
# AdditionWidth is now a LIST:
# one width per internal addition / gap between names.
#
# Backward compatibility:
#   []        -> width 0.0
#   [0.8]     -> use 0.8 for every addition
#   [0.8,1.2] -> first addition uses 0.8, second uses 1.2, etc.
try:
    addition_widths = [
        max(0.0, float(w))
        for w in AdditionWidth
        if w is not None
    ]
except:
    try:
        addition_widths = [
            max(0.0, float(AdditionWidth))
        ]
    except:
        addition_widths = []
def get_addition_width(addition_index):
    if not addition_widths:
        return 0.0
    # One supplied value keeps the old behavior:
    # same width everywhere.
    if len(addition_widths) == 1:
        return addition_widths[0]
    # With multiple widths, match them by addition order.
    if 0 <= addition_index < len(addition_widths):
        return addition_widths[addition_index]
    # Missing width = no reserved addition space.
    return 0.0
preview_tail_length = max(
    0.001,
    float(PreviewTailLength)
)
single_name_lift = float(
    SingleNameLift
)
# --------------------------------------------------
# OPTIONAL ADDITION FOR SINGLE-NAME PRODUCTS
# --------------------------------------------------
# SingleNameAddition: bool, Item
# SingleNameAdditionSide: int, Item (0 = Left, 1 = Right)
# SingleNameAdditionDistance: float, Item
#
# AdditionWidth[0] is used for the single-name addition width.
try:
    single_name_addition = bool(SingleNameAddition)
except:
    single_name_addition = False
try:
    single_name_addition_side = int(SingleNameAdditionSide)
except:
    single_name_addition_side = 0
single_name_addition_side = 1 if single_name_addition_side == 1 else 0
try:
    single_name_addition_distance = max(
        0.0,
        float(SingleNameAdditionDistance)
    )
except:
    single_name_addition_distance = 0.0
# --------------------------------------------------
# HELPERS
# --------------------------------------------------
def guide_point_at_fraction(curve, u):
    u = max(
        0.0,
        min(1.0, u)
    )
    ok, t = curve.NormalizedLengthParameter(u)
    if not ok:
        return None
    return curve.PointAt(t)
def guide_plane_at_fraction(curve, u):
    u = max(
        0.0,
        min(1.0, u)
    )
    ok, t = curve.NormalizedLengthParameter(u)
    if not ok:
        return None
    point = curve.PointAt(t)
    tangent = curve.TangentAt(t)
    if not tangent.Unitize():
        return None
    x_axis = rg.Vector3d(
        tangent
    )
    y_axis = rg.Vector3d.CrossProduct(
        rg.Vector3d.ZAxis,
        x_axis
    )
    if not y_axis.Unitize():
        y_axis = rg.Vector3d.YAxis
    return rg.Plane(
        point,
        x_axis,
        y_axis
    )
def guide_fraction_at_point(
    curve,
    point
):
    if curve is None or point is None:
        return None
    ok, t = curve.ClosestPoint(
        point
    )
    if not ok:
        return None
    total = curve.GetLength()
    if total <= 1e-9:
        return None
    domain = curve.Domain
    if t <= domain.T0:
        return 0.0
    if t >= domain.T1:
        return 1.0
    partial = curve.GetLength(
        rg.Interval(
            domain.T0,
            t
        )
    )
    return (
        partial /
        total
    )
# Optional smoothing. Disconnected inputs preserve original behavior.
try:
    smooth_chain = bool(SmoothChain)
except (NameError, TypeError):
    smooth_chain = False
try:
    chain_smoothness = max(0.0, min(1.0, float(ChainSmoothness)))
except (NameError, TypeError, ValueError):
    chain_smoothness = 0.0

def build_segment(guide, u0, u1, start_point, end_point, sample_count):
    if start_point is None or end_point is None:
        return None
    n = max(4, int(sample_count))
    start_point = rg.Point3d(start_point)
    end_point = rg.Point3d(end_point)
    guide_start = guide_point_at_fraction(guide, u0)
    guide_end = guide_point_at_fraction(guide, u1)
    if guide_start is None or guide_end is None:
        return None
    start_delta = start_point - guide_start
    end_delta = end_point - guide_end
    points = []
    for i in range(n + 1):
        f = float(i) / n
        u = u0 + (u1 - u0) * f
        p = guide_point_at_fraction(guide, u)
        if p is None:
            return None
        if smooth_chain and chain_smoothness > 0.0:
            # Smoothstep blends endpoint displacement through the
            # segment, rather than creating sharp endpoint kinks.
            eased = f * f * (3.0 - 2.0 * f)
            start_weight = (1.0 - chain_smoothness) * (1.0 - f) ** 8 + chain_smoothness * (1.0 - eased)
            end_weight = (1.0 - chain_smoothness) * f ** 8 + chain_smoothness * eased
            p = p + start_delta * start_weight + end_delta * end_weight
        points.append(p)
    points[0] = start_point
    points[-1] = end_point
    try:
        return rg.Curve.CreateInterpolatedCurve(points, 3)
    except:
        return None

def build_straight_tail(
    start_point,
    end_point
):
    if (
        start_point is None
        or end_point is None
    ):
        return None
    if start_point.DistanceTo(
        end_point
    ) <= 1e-9:
        return None
    return rg.LineCurve(
        rg.Point3d(start_point),
        rg.Point3d(end_point)
    )
def straight_plane_at_point(point, direction):
    if point is None:
        return None
    x_axis = rg.Vector3d(direction)
    if not x_axis.Unitize():
        return None
    y_axis = rg.Vector3d.CrossProduct(
        rg.Vector3d.ZAxis,
        x_axis
    )
    if not y_axis.Unitize():
        y_axis = rg.Vector3d.YAxis
    return rg.Plane(
        rg.Point3d(point),
        x_axis,
        y_axis
    )
def add_chain_segment(
    curve,
    start_is_name,
    end_is_name,
    start_is_addition=False,
    end_is_addition=False
):
    if curve is None:
        return
    if curve.GetLength() <= 1e-9:
        return
    ChainLines.append(
        curve
    )
    ChainLengths.append(
        curve.GetLength()
    )
    StartIsName.append(
        bool(start_is_name)
    )
    EndIsName.append(
        bool(end_is_name)
    )
    StartIsAddition.append(
        bool(start_is_addition)
    )
    EndIsAddition.append(
        bool(end_is_addition)
    )
# --------------------------------------------------
# MAIN
# --------------------------------------------------
if (
    GuideCurve
    and StraightChainLines
    and MovedLeft
    and MovedRight
):
    count = len(
        StraightChainLines
    )
    name_count = min(
        len(MovedLeft),
        len(MovedRight)
    )
    guide_length = GuideCurve.GetLength()
    single_name = (
        name_count == 1
    )
    # ------------------------------------------------
    # FIND FIRST / LAST NAME LOCATION ON GUIDE
    # ------------------------------------------------
    first_name_u = guide_fraction_at_point(
        GuideCurve,
        MovedLeft[0]
    )
    last_name_u = guide_fraction_at_point(
        GuideCurve,
        MovedRight[name_count - 1]
    )
    # Fallbacks
    if first_name_u is None:
        first_name_u = 0.0
    if last_name_u is None:
        last_name_u = 1.0
    # ------------------------------------------------
    # PREVIEW TAIL LIMITS
    # ------------------------------------------------
    if guide_length > 1e-9:
        tail_u = (
            preview_tail_length /
            guide_length
        )
    else:
        tail_u = 0.0
    preview_start_u = max(
        0.0,
        first_name_u - tail_u
    )
    preview_end_u = min(
        1.0,
        last_name_u + tail_u
    )
    # ------------------------------------------------
    # PROCESS ORIGINAL CHAIN SECTIONS
    # ------------------------------------------------
    for i, straight_curve in enumerate(
        StraightChainLines
    ):
        if straight_curve is None:
            continue
        # ==========================================
        # FIRST OUTER CHAIN
        # preview start -> NAME
        # ==========================================
        if i == 0:
            name_point = MovedLeft[0]
            # --------------------------------------
            # ONE NAME:
            # straight / flatter chain tail
            # --------------------------------------
            if single_name:
                plane = guide_plane_at_fraction(
                    GuideCurve,
                    first_name_u
                )
                if plane is None:
                    continue
                direction = rg.Vector3d(
                    plane.XAxis
                )
                if not direction.Unitize():
                    continue
                # Move outward to the LEFT
                tail_start = (
                    rg.Point3d(name_point)
                    -
                    direction * preview_tail_length
                )
                # Slight upward angle for single-name preview
                tail_start.Y += single_name_lift
                use_single_addition_here = (
                    single_name_addition
                    and single_name_addition_side == 0
                    and AdditionEnabled
                    and get_addition_width(0) > 0.0
                )
                if use_single_addition_here:
                    addition_width = get_addition_width(0)
                    outward = (
                        rg.Point3d(tail_start)
                        - rg.Point3d(name_point)
                    )
                    available_length = outward.Length
                    if outward.Unitize() and available_length > addition_width:
                        half_width = addition_width * 0.5
                        center_distance = max(
                            half_width,
                            min(
                                single_name_addition_distance,
                                available_length - half_width
                            )
                        )
                        addition_center = (
                            rg.Point3d(name_point)
                            + outward * center_distance
                        )
                        outer_edge = (
                            addition_center
                            + outward * half_width
                        )
                        name_edge = (
                            addition_center
                            - outward * half_width
                        )
                        addition_plane = straight_plane_at_point(
                            addition_center,
                            -outward
                        )
                        if addition_plane is not None:
                            AdditionPlanes.append(addition_plane)
                            AdditionCenters.append(addition_plane.Origin)
                        # OUTER TAIL -> ADDITION
                        outer_curve = build_straight_tail(
                            tail_start,
                            outer_edge
                        )
                        add_chain_segment(
                            outer_curve,
                            False,
                            False,
                            False,
                            True
                        )
                        # ADDITION -> NAME
                        inner_curve = build_straight_tail(
                            name_edge,
                            name_point
                        )
                        add_chain_segment(
                            inner_curve,
                            False,
                            True,
                            True,
                            False
                        )
                        # Prevent the normal outer-chain call below
                        # from creating a duplicate full segment.
                        curve = None
                    else:
                        curve = build_straight_tail(
                            tail_start,
                            name_point
                        )
                else:
                    curve = build_straight_tail(
                        tail_start,
                        name_point
                    )
            # --------------------------------------
            # MULTIPLE NAMES:
            # follow existing necklace guide
            # --------------------------------------
            else:
                start_point = guide_point_at_fraction(
                    GuideCurve,
                    preview_start_u
                )
                curve = build_segment(
                    GuideCurve,
                    preview_start_u,
                    first_name_u,
                    start_point,
                    name_point,
                    samples
                )
            add_chain_segment(
                curve,
                False,
                True
            )
        # ==========================================
        # LAST OUTER CHAIN
        # NAME -> preview end
        # ==========================================
        elif i == count - 1:
            name_point = MovedRight[
                name_count - 1
            ]
            # --------------------------------------
            # ONE NAME:
            # straight / flatter chain tail
            # --------------------------------------
            if single_name:
                plane = guide_plane_at_fraction(
                    GuideCurve,
                    last_name_u
                )
                if plane is None:
                    continue
                direction = rg.Vector3d(
                    plane.XAxis
                )
                if not direction.Unitize():
                    continue
                # Move outward to the RIGHT
                tail_end = (
                    rg.Point3d(name_point)
                    +
                    direction * preview_tail_length
                )
                # Slight upward angle for single-name preview
                tail_end.Y += single_name_lift
                use_single_addition_here = (
                    single_name_addition
                    and single_name_addition_side == 1
                    and AdditionEnabled
                    and get_addition_width(0) > 0.0
                )
                if use_single_addition_here:
                    addition_width = get_addition_width(0)
                    outward = (
                        rg.Point3d(tail_end)
                        - rg.Point3d(name_point)
                    )
                    available_length = outward.Length
                    if outward.Unitize() and available_length > addition_width:
                        half_width = addition_width * 0.5
                        center_distance = max(
                            half_width,
                            min(
                                single_name_addition_distance,
                                available_length - half_width
                            )
                        )
                        addition_center = (
                            rg.Point3d(name_point)
                            + outward * center_distance
                        )
                        name_edge = (
                            addition_center
                            - outward * half_width
                        )
                        outer_edge = (
                            addition_center
                            + outward * half_width
                        )
                        addition_plane = straight_plane_at_point(
                            addition_center,
                            outward
                        )
                        if addition_plane is not None:
                            AdditionPlanes.append(addition_plane)
                            AdditionCenters.append(addition_plane.Origin)
                        # NAME -> ADDITION
                        inner_curve = build_straight_tail(
                            name_point,
                            name_edge
                        )
                        add_chain_segment(
                            inner_curve,
                            True,
                            False,
                            False,
                            True
                        )
                        # ADDITION -> OUTER TAIL
                        outer_curve = build_straight_tail(
                            outer_edge,
                            tail_end
                        )
                        add_chain_segment(
                            outer_curve,
                            False,
                            False,
                            True,
                            False
                        )
                        curve = None
                    else:
                        curve = build_straight_tail(
                            name_point,
                            tail_end
                        )
                else:
                    curve = build_straight_tail(
                        name_point,
                        tail_end
                    )
            # --------------------------------------
            # MULTIPLE NAMES:
            # follow existing necklace guide
            # --------------------------------------
            else:
                end_point = guide_point_at_fraction(
                    GuideCurve,
                    preview_end_u
                )
                curve = build_segment(
                    GuideCurve,
                    last_name_u,
                    preview_end_u,
                    name_point,
                    end_point,
                    samples
                )
            add_chain_segment(
                curve,
                True,
                False
            )
        # ==========================================
        # BETWEEN TWO NAMES
        # ==========================================
        else:
            # Internal segment index:
            # i = 1 -> addition 0
            # i = 2 -> addition 1
            # etc.
            addition_index = i - 1
            diamond_width = get_addition_width(
                addition_index
            )
            start_point = MovedRight[
                i - 1
            ]
            end_point = MovedLeft[
                i
            ]
            # --------------------------------------
            # ORIGINAL LOCATION OF INTERNAL SEGMENT
            # --------------------------------------
            start = straight_curve.PointAtStart
            end = straight_curve.PointAtEnd
            u0 = (
                start.X /
                total_length
            )
            u1 = (
                end.X /
                total_length
            )
            u0 = max(
                0.0,
                min(1.0, u0)
            )
            u1 = max(
                0.0,
                min(1.0, u1)
            )
            if u1 < u0:
                u0, u1 = u1, u0
            # --------------------------------------
            # NO DIAMOND
            # NAME -> NAME
            # --------------------------------------
            if (
                not AdditionEnabled
                or diamond_width <= 0.0
                or guide_length <= 1e-9
            ):
                curve = build_segment(
                    GuideCurve,
                    u0,
                    u1,
                    start_point,
                    end_point,
                    samples
                )
                add_chain_segment(
                    curve,
                    True,
                    True
                )
            # --------------------------------------
            # DIAMOND
            # --------------------------------------
            else:
                center_u = (
                    u0 + u1
                ) * 0.5
                half_u = (
                    diamond_width * 0.5 /
                    guide_length
                )
                left_u = (
                    center_u - half_u
                )
                right_u = (
                    center_u + half_u
                )
                left_u = max(
                    u0,
                    left_u
                )
                right_u = min(
                    u1,
                    right_u
                )
                diamond_left = guide_point_at_fraction(
                    GuideCurve,
                    left_u
                )
                diamond_right = guide_point_at_fraction(
                    GuideCurve,
                    right_u
                )
                diamond_plane = guide_plane_at_fraction(
                    GuideCurve,
                    center_u
                )
                # Optional solved stone plane from GRAVITY LAYOUT v3.
                # The plane controls BOTH visual placement and chain ends.
                try:
                    solved_plane = GravityAdditionPlanes[addition_index]
                    if solved_plane is not None:
                        diamond_plane = rg.Plane(solved_plane)
                        axis = rg.Vector3d(diamond_plane.XAxis)
                        axis.Unitize()
                        diamond_left = diamond_plane.Origin - axis * (diamond_width * 0.5)
                        diamond_right = diamond_plane.Origin + axis * (diamond_width * 0.5)
                        # Parameter values only control guide shape;
                        # final endpoint locations remain exact.
                        left_u_found = guide_fraction_at_point(GuideCurve, diamond_left)
                        right_u_found = guide_fraction_at_point(GuideCurve, diamond_right)
                        if left_u_found is not None:
                            left_u = max(u0, min(u1, left_u_found))
                        if right_u_found is not None:
                            right_u = max(u0, min(u1, right_u_found))
                except (NameError, IndexError, TypeError, AttributeError):
                    pass
                if diamond_plane is not None:
                    AdditionPlanes.append(
                        diamond_plane
                    )
                    AdditionCenters.append(
                        diamond_plane.Origin
                    )
                # ----------------------------------
                # NAME -> DIAMOND
                # ----------------------------------
                if diamond_left is not None:
                    left_curve = build_segment(
                        GuideCurve,
                        u0,
                        left_u,
                        start_point,
                        diamond_left,
                        samples
                    )
                    add_chain_segment(
                        left_curve,
                        True,
                        False,
                        False,
                        True
                    )
                # ----------------------------------
                # DIAMOND -> NAME
                # ----------------------------------
                if diamond_right is not None:
                    right_curve = build_segment(
                        GuideCurve,
                        right_u,
                        u1,
                        diamond_right,
                        end_point,
                        samples
                    )
                    add_chain_segment(
                        right_curve,
                        False,
                        True,
                        True,
                        False
                    )
