import json

import Rhino.Geometry as rg
import Rhino.Geometry.Intersect as rgi

from Grasshopper import DataTree
from Grasshopper.Kernel.Data import GH_Path
import System


# ============================================================
# INPUTS
# ============================================================
#
# Enable            : bool  Item
# OffsetSlot        : bool  Item
# CombosFirst       : str   List
# CombosSecond      : str   List
# Extension         : float Item
# Tolerance         : float Item
# OffsetDistance    : float Item
# Outlines          : Curve List
# LetterSlots       : Curve List
# GlyphNames        : str   List
# InheritanceNames  : str   List
#   Same length/order as GlyphNames.
#   Used as fallback pair identities.
#
# Pair naming:
#   f + i        -> fi
#   f + i_curl   -> f|i_curl
#   A_stone + b  -> A_stone|b
#
# FontJson          : str   Item
# SlotJson          : str   Item
#
# OUTPUTS
# ============================================================
# GlyphSlots     : follows OffsetSlot
# OffsetSlots    : pair slots only, always offset
# OffsetLetterSlots : incoming LetterSlots only, always offset
# SlotPairs
# SlotOwners
# Info
# ============================================================


GlyphSlots = DataTree[rg.Curve]()
OffsetSlots = DataTree[rg.Curve]()
OffsetLetterSlots = DataTree[rg.Curve]()
SlotPairs = []
SlotOwners = []
Info = ""


# ============================================================
# BASIC HELPERS
# ============================================================

def parse_json(value):
    if value is None:
        return None
    text = str(value).strip()
    if not text:
        return None
    return json.loads(text)


def normalize_strings(value):
    if value is None:
        return set()

    if isinstance(value, str):
        raw_items = [value]
    else:
        try:
            raw_items = list(value)
        except:
            raw_items = [value]

    result = set()

    for item in raw_items:
        if item is None:
            continue
        text = str(item).replace("\r", "\n").replace("\n", ",")
        for part in text.split(","):
            part = part.strip()
            if part:
                result.add(part)

    return result


def clean_curves(value):
    if value is None:
        return []
    try:
        items = list(value)
    except:
        items = [value]
    return [x for x in items if isinstance(x, rg.Curve)]


def clean_names(value):
    if value is None:
        return []
    try:
        items = list(value)
    except:
        items = [value]
    return [str(x) for x in items]


def clean_letter_slots_preserve_indices(value):
    """
    Return LetterSlots as a flat list WITHOUT removing empty items.

    Index alignment is important:
        LetterSlots[i] belongs to GlyphNames[i].

    Any non-curve item becomes None instead of being removed.
    """
    if value is None:
        return []

    try:
        items = list(value)
    except:
        items = [value]

    result = []

    for item in items:
        if isinstance(item, rg.Curve):
            result.append(item)
            continue

        try:
            unwrapped = item.Value
        except:
            unwrapped = None

        if isinstance(unwrapped, rg.Curve):
            result.append(unwrapped)
        else:
            result.append(None)

    return result


def make_pair_name(left_name, right_name):
    """
    Pair key convention shared with SLOT DESIGNER.

    Ordinary one-character glyphs keep the old compact form:
        f + i -> fi

    Named glyphs use an explicit separator:
        f + i_curl   -> f|i_curl
        A_stone + b  -> A_stone|b
    """

    left_name = str(left_name)
    right_name = str(right_name)

    if (
        len(left_name) == 1
        and len(right_name) == 1
    ):
        return left_name + right_name

    return left_name + "|" + right_name


def get_manual_pairs(slot_data):
    if not isinstance(slot_data, dict):
        return {}
    if slot_data.get("format") != "pair-slot-overrides-v1":
        return {}
    pairs = slot_data.get("pairs", {})
    return pairs if isinstance(pairs, dict) else {}


# ============================================================
# MANUAL SLOT DESERIALIZATION / PLACEMENT
# ============================================================

def deserialize_slot_curve(data):
    points = data["points"]
    degree = int(data["degree"])
    rational = bool(data.get("is_rational", False))

    curve = rg.NurbsCurve(
        3,
        rational,
        degree + 1,
        len(points)
    )

    for i, item in enumerate(points):
        point = rg.Point3d(
            float(item["x"]),
            float(item["y"]),
            float(item.get("z", 0.0))
        )
        weight = float(item.get("weight", 1.0))
        curve.Points.SetPoint(i, point, weight)

    knots = data["knots"]

    if len(knots) != curve.Knots.Count:
        raise RuntimeError("Manual slot knot-count mismatch.")

    for i, value in enumerate(knots):
        curve.Knots[i] = float(value)

    return curve


def get_outline_pivot_x(outline):
    bbox = outline.GetBoundingBox(True)
    if not bbox.IsValid:
        raise RuntimeError("Could not calculate outline bounding box.")
    return (float(bbox.Min.X) + float(bbox.Max.X)) * 0.5


def get_current_glyph_scale(
    outline,
    source_glyph_name,
    font_characters,
):
    """
    source_glyph_name is deliberately the glyph from which the saved
    slot was inherited.  Example:

        actual owner outline = A_stone
        saved slot source    = A

    This is what lets A_stone inherit a slot saved for A.
    """

    glyph = font_characters.get(source_glyph_name)

    if glyph is None:
        raise RuntimeError(
            "Source glyph '{}' is not in FontJson.".format(source_glyph_name)
        )

    source_width = float(glyph.get("width", 0.0))

    if source_width <= 1e-12:
        raise RuntimeError(
            "Source glyph '{}' has invalid width.".format(source_glyph_name)
        )

    bbox = outline.GetBoundingBox(True)

    if not bbox.IsValid:
        raise RuntimeError("Could not calculate placed outline bbox.")

    placed_width = float(bbox.Max.X - bbox.Min.X)

    return placed_width / source_width


def stored_slot_to_world(
    curve_data,
    owner_outline,
    source_owner_name,
    font_characters,
):
    curve = deserialize_slot_curve(curve_data)

    scale = get_current_glyph_scale(
        owner_outline,
        source_owner_name,
        font_characters
    )

    pivot_x = get_outline_pivot_x(owner_outline)

    if abs(scale - 1.0) > 1e-12:
        curve.Transform(
            rg.Transform.Scale(
                rg.Point3d.Origin,
                scale
            )
        )

    curve.Transform(
        rg.Transform.Translation(
            pivot_x,
            0.0,
            0.0
        )
    )

    return curve


# ============================================================
# INTERSECTION HELPERS
# ============================================================

def unique_parameters(values, tolerance):
    if not values:
        return []

    values = sorted(values)
    result = [values[0]]

    for value in values[1:]:
        if abs(value - result[-1]) > tolerance:
            result.append(value)

    return result


def point_inside_curve(point, closed_curve, tolerance):
    containment = closed_curve.Contains(
        point,
        rg.Plane.WorldXY,
        tolerance
    )

    return (
        containment == rg.PointContainment.Inside
        or containment == rg.PointContainment.Coincident
    )


def get_inside_segments(owner, other, tolerance):
    events = rgi.Intersection.CurveCurve(
        owner,
        other,
        tolerance,
        tolerance
    )

    if events is None:
        return []

    parameters = []

    for event in events:
        if event.IsPoint:
            parameters.append(float(event.ParameterA))
        elif event.IsOverlap:
            parameters.append(float(event.OverlapA.T0))
            parameters.append(float(event.OverlapA.T1))

    parameters = unique_parameters(parameters, tolerance * 0.1)

    if len(parameters) < 2:
        return []

    try:
        segments = owner.Split(parameters)
    except:
        return []

    if not segments:
        return []

    result = []

    for segment in segments:
        if segment is None:
            continue

        domain = segment.Domain
        midpoint = segment.PointAt(
            (float(domain.T0) + float(domain.T1)) * 0.5
        )

        if point_inside_curve(midpoint, other, tolerance):
            result.append(segment)

    return result


def get_longest_curve(curves):
    if not curves:
        return None

    longest = None
    longest_length = -1.0

    for curve in curves:
        try:
            length = float(curve.GetLength())
        except:
            continue

        if length > longest_length:
            longest_length = length
            longest = curve

    return longest


# ============================================================
# ARC-LENGTH EXTENSION
# ============================================================

def get_arc_length_to_parameter(curve, parameter):
    domain = curve.Domain

    if parameter <= domain.T0:
        return 0.0

    if parameter >= domain.T1:
        return float(curve.GetLength())

    part = curve.Trim(domain.T0, parameter)
    return 0.0 if part is None else float(part.GetLength())


def parameter_at_arc_length(curve, length):
    total = float(curve.GetLength())
    length = max(0.0, min(float(length), total))

    success, parameter = curve.LengthParameter(length)
    return float(parameter) if success else None


def extend_slot_along_owner(owner, segment, extension, tolerance):
    if segment is None:
        return None

    extension = max(0.0, float(extension))

    if extension <= tolerance:
        return segment.DuplicateCurve()

    success_start, t_start = owner.ClosestPoint(segment.PointAtStart)
    success_end, t_end = owner.ClosestPoint(segment.PointAtEnd)

    if not success_start or not success_end:
        return segment.DuplicateCurve()

    t_start = float(t_start)
    t_end = float(t_end)
    total_length = float(owner.GetLength())

    length_start = get_arc_length_to_parameter(owner, t_start)
    length_end = get_arc_length_to_parameter(owner, t_end)

    if owner.IsClosed:
        segment_length = float(segment.GetLength())
        direct_length = abs(length_end - length_start)
        wrapped_length = total_length - direct_length

        use_wrapped = (
            abs(wrapped_length - segment_length)
            < abs(direct_length - segment_length)
        )

        if use_wrapped:
            if length_start < length_end:
                length_start += total_length
            else:
                length_end += total_length

    forward = length_end >= length_start

    if forward:
        new_start_length = length_start - extension
        new_end_length = length_end + extension
    else:
        new_start_length = length_start + extension
        new_end_length = length_end - extension

    if owner.IsClosed:
        new_start_length %= total_length
        new_end_length %= total_length
    else:
        new_start_length = max(0.0, min(new_start_length, total_length))
        new_end_length = max(0.0, min(new_end_length, total_length))

    new_t_start = parameter_at_arc_length(owner, new_start_length)
    new_t_end = parameter_at_arc_length(owner, new_end_length)

    if new_t_start is None or new_t_end is None:
        return segment.DuplicateCurve()

    if not owner.IsClosed:
        if new_t_start > new_t_end:
            new_t_start, new_t_end = new_t_end, new_t_start

        result = owner.Trim(new_t_start, new_t_end)
        return result if result is not None else segment.DuplicateCurve()

    if new_t_start <= new_t_end:
        result = owner.Trim(new_t_start, new_t_end)
        return result if result is not None else segment.DuplicateCurve()

    part_a = owner.Trim(new_t_start, owner.Domain.T1)
    part_b = owner.Trim(owner.Domain.T0, new_t_end)

    if part_a is None or part_b is None:
        return segment.DuplicateCurve()

    joined = rg.Curve.JoinCurves([part_a, part_b], tolerance)

    if joined and len(joined) > 0:
        return joined[0]

    return segment.DuplicateCurve()


def make_pair_slot(owner, other, extension, tolerance):
    inside_segments = get_inside_segments(owner, other, tolerance)
    segment = get_longest_curve(inside_segments)

    if segment is None:
        return None

    return extend_slot_along_owner(
        owner,
        segment,
        extension,
        tolerance
    )


# ============================================================
# CLOSED ONE-SIDED OFFSET
# ============================================================

def choose_offset_curve(curves):
    if not curves:
        return None

    longest = None
    longest_length = -1.0

    for curve in curves:
        if curve is None:
            continue
        try:
            length = float(curve.GetLength())
        except:
            continue
        if length > longest_length:
            longest_length = length
            longest = curve

    return longest


def align_offset_direction(base_curve, offset_curve):
    if offset_curve is None:
        return None

    result = offset_curve.DuplicateCurve()

    normal_distance = (
        base_curve.PointAtStart.DistanceTo(result.PointAtStart)
        + base_curve.PointAtEnd.DistanceTo(result.PointAtEnd)
    )

    reversed_distance = (
        base_curve.PointAtStart.DistanceTo(result.PointAtEnd)
        + base_curve.PointAtEnd.DistanceTo(result.PointAtStart)
    )

    if reversed_distance < normal_distance:
        result.Reverse()

    return result


def make_round_cap(point_a, point_b, tangent, outward_sign):
    center = rg.Point3d(
        (point_a.X + point_b.X) * 0.5,
        (point_a.Y + point_b.Y) * 0.5,
        (point_a.Z + point_b.Z) * 0.5,
    )

    radius = point_a.DistanceTo(point_b) * 0.5

    if radius <= 1e-12:
        return None

    tangent = rg.Vector3d(tangent)
    tangent.Z = 0.0

    if not tangent.Unitize():
        return None

    middle = center + tangent * radius * float(outward_sign)

    try:
        arc = rg.Arc(point_a, middle, point_b)
        return rg.ArcCurve(arc) if arc.IsValid else None
    except:
        return None


def make_closed_offset_slot(slot_curve, offset_distance, side, tolerance):
    if slot_curve is None:
        return None

    distance = abs(float(offset_distance))

    if distance <= tolerance:
        return slot_curve.DuplicateCurve()

    positive = choose_offset_curve(
        slot_curve.Offset(
            rg.Plane.WorldXY,
            distance,
            tolerance,
            rg.CurveOffsetCornerStyle.Round
        )
    )

    negative = choose_offset_curve(
        slot_curve.Offset(
            rg.Plane.WorldXY,
            -distance,
            tolerance,
            rg.CurveOffsetCornerStyle.Round
        )
    )

    candidates = [c for c in (positive, negative) if c is not None]

    if not candidates:
        return slot_curve.DuplicateCurve()

    success, t = slot_curve.NormalizedLengthParameter(0.5)

    if not success:
        return slot_curve.DuplicateCurve()

    base_point = slot_curve.PointAt(t)
    tangent = slot_curve.TangentAt(t)
    tangent.Z = 0.0

    if not tangent.Unitize():
        return slot_curve.DuplicateCurve()

    left_candidate = None
    right_candidate = None
    left_score = None
    right_score = None

    for candidate in candidates:
        success_cp, candidate_t = candidate.ClosestPoint(base_point)

        if not success_cp:
            continue

        candidate_point = candidate.PointAt(candidate_t)
        vector = candidate_point - base_point
        vector.Z = 0.0

        cross_z = tangent.X * vector.Y - tangent.Y * vector.X

        if cross_z > 0:
            if left_candidate is None or cross_z > left_score:
                left_candidate = candidate
                left_score = cross_z

        elif cross_z < 0:
            if right_candidate is None or cross_z < right_score:
                right_candidate = candidate
                right_score = cross_z

    side = str(side or "right").strip().lower()
    offset_curve = left_candidate if side == "left" else right_candidate

    if offset_curve is None:
        return slot_curve.DuplicateCurve()

    offset_curve = align_offset_direction(slot_curve, offset_curve)

    end_cap = make_round_cap(
        slot_curve.PointAtEnd,
        offset_curve.PointAtEnd,
        slot_curve.TangentAtEnd,
        1.0
    )

    start_cap = make_round_cap(
        offset_curve.PointAtStart,
        slot_curve.PointAtStart,
        slot_curve.TangentAtStart,
        -1.0
    )

    if end_cap is None or start_cap is None:
        return slot_curve.DuplicateCurve()

    reverse_offset = offset_curve.DuplicateCurve()
    reverse_offset.Reverse()

    joined = rg.Curve.JoinCurves(
        [
            slot_curve.DuplicateCurve(),
            end_cap,
            reverse_offset,
            start_cap,
        ],
        tolerance
    )

    if joined and len(joined) > 0:
        return joined[0]

    return slot_curve.DuplicateCurve()


# ============================================================
# PAIR INHERITANCE
# ============================================================

def resolve_lookup_pair(
    actual_first,
    actual_second,
    inherit_first,
    inherit_second,
    manual_pairs,
    combos_first,
    combos_second,
):
    """
    Priority:

      1. Exact manual pair
      2. Inherited manual pair
      3. Exact automatic combo
      4. Inherited automatic combo

    Returns:
        mode, lookup_pair, owner_label, inherited
    """

    actual_pair = make_pair_name(
        actual_first,
        actual_second
    )

    inherited_pair = make_pair_name(
        inherit_first,
        inherit_second
    )

    if isinstance(manual_pairs.get(actual_pair), dict):
        owner = str(manual_pairs[actual_pair].get("owner", "")).lower()
        return "manual", actual_pair, owner, False

    if (
        inherited_pair != actual_pair
        and isinstance(manual_pairs.get(inherited_pair), dict)
    ):
        owner = str(manual_pairs[inherited_pair].get("owner", "")).lower()
        return "manual", inherited_pair, owner, True

    if actual_pair in combos_first:
        return "auto", actual_pair, "first", False

    if actual_pair in combos_second:
        return "auto", actual_pair, "second", False

    if inherited_pair != actual_pair:
        if inherited_pair in combos_first:
            return "auto", inherited_pair, "first", True
        if inherited_pair in combos_second:
            return "auto", inherited_pair, "second", True

    return None, None, None, False


# ============================================================
# AUTOMATIC LETTER SLOT OFFSET SIDE
# ============================================================

def detect_letter_slot_side(slot_curve, outline, tolerance):
    """
    Automatically choose which side of an open standalone LetterSlot
    should be offset.

    We test both closed offset results and choose the one whose
    offset boundary lies more inside the glyph outline.

    This avoids a manual left/right input.
    """

    if slot_curve is None or outline is None:
        return "right"

    distance_test = max(
        float(tolerance) * 5.0,
        0.001
    )

    candidates = {}

    for side in ("left", "right"):
        try:
            closed = make_closed_offset_slot(
                slot_curve,
                distance_test,
                side,
                tolerance
            )
        except:
            closed = None

        if closed is None:
            continue

        try:
            success, t = closed.NormalizedLengthParameter(0.5)
            if not success:
                continue

            p = closed.PointAt(t)

            containment = outline.Contains(
                p,
                rg.Plane.WorldXY,
                tolerance
            )

            # Prefer the side whose offset lies inside/coincident
            # with the glyph outline.
            score = 0

            if containment == rg.PointContainment.Inside:
                score = 2
            elif containment == rg.PointContainment.Coincident:
                score = 1

            candidates[side] = score

        except:
            continue

    if not candidates:
        return "right"

    left_score = candidates.get("left", -1)
    right_score = candidates.get("right", -1)

    return "left" if left_score > right_score else "right"


# ============================================================
# MAIN
# ============================================================

if not Enable:
    Info = "Set Enable = True."

else:
    try:
        outlines = clean_curves(Outlines)
        glyph_names = clean_names(GlyphNames)
        inheritance_names = clean_names(InheritanceNames)
        letter_slots = clean_letter_slots_preserve_indices(
            LetterSlots
        )

        combos_first = normalize_strings(CombosFirst)
        combos_second = normalize_strings(CombosSecond)

        font_data = parse_json(FontJson)

        if font_data is None:
            raise RuntimeError("FontJson is empty.")

        if font_data.get("format") != "rhino-curve-font-v2":
            raise RuntimeError("FontJson must be rhino-curve-font-v2.")

        font_characters = font_data.get("characters", {})

        slot_data = parse_json(SlotJson)
        manual_pairs = get_manual_pairs(slot_data)

        if len(outlines) != len(glyph_names):
            raise RuntimeError(
                "Outlines / GlyphNames count mismatch.\n"
                "Outlines: {}\nGlyphNames: {}".format(
                    len(outlines),
                    len(glyph_names)
                )
            )

        # Backward compatibility: if the new input is unconnected,
        # simply behave exactly like the old script.
        if not inheritance_names:
            inheritance_names = list(glyph_names)

        if len(inheritance_names) != len(glyph_names):
            raise RuntimeError(
                "InheritanceNames / GlyphNames count mismatch.\n"
                "InheritanceNames: {}\nGlyphNames: {}".format(
                    len(inheritance_names),
                    len(glyph_names)
                )
            )

        for i, outline in enumerate(outlines):
            if not outline.IsClosed:
                raise RuntimeError(
                    "Outline {} ('{}') is not closed.".format(
                        i,
                        glyph_names[i]
                    )
                )

        try:
            tolerance = float(Tolerance)
            if tolerance <= 0:
                raise ValueError()
        except:
            tolerance = 0.001

        try:
            extension = max(0.0, float(Extension))
        except:
            extension = 0.0

        try:
            offset_distance = max(0.0, float(OffsetDistance))
        except:
            offset_distance = 0.0

        use_offset = bool(OffsetSlot)

        # ====================================================
        # EXISTING LETTER SLOTS
        # ====================================================
        # LetterSlots is a flat list aligned with GlyphNames.
        # Empty items are preserved so indices do not shift.
        # Existing letter slots are copied into GlyphSlots first;
        # generated pair slots are then added to the same branches.
        # ====================================================

        letter_slot_count = 0

        for i, slot in enumerate(letter_slots):
            if i >= len(glyph_names):
                break

            if slot is None:
                continue

            # Automatically determine the correct offset side
            # from the slot relative to its glyph outline.
            auto_letter_side = detect_letter_slot_side(
                slot,
                outlines[i],
                tolerance
            )

            # Build the actual offset version of the incoming
            # standalone letter slot.
            offset_letter_slot = make_closed_offset_slot(
                slot,
                offset_distance,
                auto_letter_side,
                tolerance
            )

            if offset_letter_slot is None:
                continue

            # GlyphSlots follows OffsetSlot, exactly like pair slots.
            glyph_letter_slot = (
                offset_letter_slot.DuplicateCurve()
                if use_offset
                else slot.DuplicateCurve()
            )

            GlyphSlots.Add(
                glyph_letter_slot,
                GH_Path(i)
            )

            # OffsetLetterSlots contains ONLY incoming standalone
            # LetterSlots, always as the offset version.
            OffsetLetterSlots.Add(
                offset_letter_slot.DuplicateCurve(),
                GH_Path(i)
            )

            letter_slot_count += 1

        checked_pairs = 0
        requested_pairs = 0
        manual_pair_count = 0
        manual_slot_count = 0
        automatic_slot_count = 0
        inherited_pair_count = 0
        no_intersection_pairs = []
        inheritance_log = []

        for i in range(len(glyph_names) - 1):
            actual_first = glyph_names[i]
            actual_second = glyph_names[i + 1]
            inherit_first = inheritance_names[i]
            inherit_second = inheritance_names[i + 1]

            actual_pair = make_pair_name(
                actual_first,
                actual_second
            )

            checked_pairs += 1

            mode, lookup_pair, owner_label, inherited = resolve_lookup_pair(
                actual_first,
                actual_second,
                inherit_first,
                inherit_second,
                manual_pairs,
                combos_first,
                combos_second,
            )

            if mode is None:
                continue

            requested_pairs += 1

            if inherited:
                inherited_pair_count += 1
                inheritance_log.append(
                    "{} <- {}".format(actual_pair, lookup_pair)
                )

            if owner_label == "first":
                owner_index = i
                owner_outline = outlines[i]
                other_outline = outlines[i + 1]
                source_owner_name = (
                    inherit_first if inherited else actual_first
                )
                automatic_side = "right"

            elif owner_label == "second":
                owner_index = i + 1
                owner_outline = outlines[i + 1]
                other_outline = outlines[i]
                source_owner_name = (
                    inherit_second if inherited else actual_second
                )
                automatic_side = "left"

            else:
                raise RuntimeError(
                    "Pair '{}' has invalid owner '{}'.".format(
                        lookup_pair,
                        owner_label
                    )
                )

            # =================================================
            # MANUAL SLOT DESIGNER DATA
            # =================================================
            if mode == "manual":
                manual = manual_pairs[lookup_pair]
                stored_slots = manual.get("slots", [])

                if not isinstance(stored_slots, list):
                    stored_slots = []

                manual_pair_count += 1

                for slot_item in stored_slots:
                    # v5 format:
                    # {
                    #   "flip_offset": bool,
                    #   "curve": {...}
                    # }
                    #
                    # Older versions are still accepted.
                    if isinstance(slot_item, dict) and "curve" in slot_item:
                        curve_data = slot_item["curve"]
                        flip_offset = bool(slot_item.get("flip_offset", False))

                        legacy_side = str(
                            slot_item.get("offset_side", "auto")
                        ).strip().lower()
                    else:
                        curve_data = slot_item
                        flip_offset = False
                        legacy_side = "auto"

                    slot = stored_slot_to_world(
                        curve_data,
                        owner_outline,
                        source_owner_name,
                        font_characters
                    )

                    actual_side = automatic_side

                    # Old JSON with explicit offset_side still works.
                    if legacy_side in ("left", "right"):
                        actual_side = legacy_side
                    elif flip_offset:
                        actual_side = (
                            "left"
                            if automatic_side == "right"
                            else "right"
                        )

                    if slot is None:
                        continue

                    # Always build the offset version.
                    offset_slot = make_closed_offset_slot(
                        slot,
                        offset_distance,
                        actual_side,
                        tolerance
                    )

                    if offset_slot is None:
                        continue

                    # GlyphSlots follows the OffsetSlot input.
                    glyph_slot = (
                        offset_slot.DuplicateCurve()
                        if use_offset
                        else slot.DuplicateCurve()
                    )

                    GlyphSlots.Add(
                        glyph_slot,
                        GH_Path(owner_index)
                    )

                    # OffsetSlots is ALWAYS offset.
                    OffsetSlots.Add(
                        offset_slot.DuplicateCurve(),
                        GH_Path(owner_index)
                    )

                    SlotPairs.append(actual_pair)
                    SlotOwners.append(owner_index)
                    manual_slot_count += 1

                continue

            # =================================================
            # AUTOMATIC FALLBACK
            # =================================================
            slot = make_pair_slot(
                owner_outline,
                other_outline,
                extension,
                tolerance
            )

            if slot is None:
                no_intersection_pairs.append(actual_pair)
                continue

            # Always build the offset version.
            offset_slot = make_closed_offset_slot(
                slot,
                offset_distance,
                automatic_side,
                tolerance
            )

            if offset_slot is None:
                continue

            # GlyphSlots follows the OffsetSlot input.
            glyph_slot = (
                offset_slot.DuplicateCurve()
                if use_offset
                else slot.DuplicateCurve()
            )

            GlyphSlots.Add(
                glyph_slot,
                GH_Path(owner_index)
            )

            # OffsetSlots is ALWAYS offset.
            OffsetSlots.Add(
                offset_slot.DuplicateCurve(),
                GH_Path(owner_index)
            )

            SlotPairs.append(actual_pair)
            SlotOwners.append(owner_index)
            automatic_slot_count += 1

        Info = (
            "GLYPHS: {}\n"
            "INHERITANCE GLYPHS: {}\n"
            "ADJACENT PAIRS CHECKED: {}\n"
            "REQUESTED SLOT PAIRS: {}\n"
            "INPUT LETTER SLOTS: {}\n"
            "PASSED-THROUGH LETTER SLOTS (BOTH OUTPUTS): {}\n"
            "GENERATED GLYPH SLOTS: {}\n"
            "GENERATED PAIR OFFSET SLOTS: {}\n"
            "GENERATED LETTER OFFSET SLOTS: {}\n"
            "INHERITED PAIRS USED: {}\n"
            "INHERITANCE: {}\n"
            "\n"
            "MANUAL OVERRIDE PAIRS USED: {}\n"
            "MANUAL SLOTS GENERATED: {}\n"
            "AUTOMATIC SLOTS GENERATED: {}\n"
            "\n"
            "EXTENSION (AUTO ONLY): {}\n"
            "OFFSET SLOT: {}\n"
            "OFFSET DISTANCE: {}\n"
            "TOLERANCE: {}\n"
            "\n"
            "AVAILABLE MANUAL PAIRS: {}\n"
            "COMBOS FIRST / RIGHT: {}\n"
            "COMBOS SECOND / LEFT: {}\n"
            "\n"
            "SLOT PAIRS: {}\n"
            "SLOT OWNERS: {}\n"
            "AUTO REQUESTED BUT NO VALID INTERSECTION: {}"
        ).format(
            glyph_names,
            inheritance_names,
            checked_pairs,
            requested_pairs,
            len(letter_slots),
            letter_slot_count,
            GlyphSlots.DataCount,
            OffsetSlots.DataCount,
            OffsetLetterSlots.DataCount,
            inherited_pair_count,
            inheritance_log,
            manual_pair_count,
            manual_slot_count,
            automatic_slot_count,
            extension,
            use_offset,
            offset_distance,
            tolerance,
            sorted(manual_pairs.keys()),
            sorted(combos_first),
            sorted(combos_second),
            SlotPairs,
            SlotOwners,
            no_intersection_pairs,
        )

    except Exception as ex:
        print(ex)
        Info = "ERROR:\n{}".format(ex)