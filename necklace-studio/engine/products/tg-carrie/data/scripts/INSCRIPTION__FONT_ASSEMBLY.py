import json

import Rhino.Geometry as rg
from Grasshopper import DataTree
from Grasshopper.Kernel.Data import GH_Path
import System


# ============================================================
# EXPECTED GRASSHOPPER INPUTS
# ============================================================
#
# Enable              : bool      Item
# Text                : str       Item
# JsonText            : str       Item
# Height              : float     Item
#
# AlternativesFirst   : str       List
# AlternativesSecond  : str       List
# Finites             : str       List
# Curled              : str       List
# Curl                : bool      Item
# StoneFirst          : bool      Item
#   Stone target priority: first i, otherwise first j, otherwise first glyph.
# KerningGroups       : str       List
#
# OverrideValue       : float     Item
#
# MissingCurve        : Curve     List
#   Internalized replacement geometry for missing glyphs.
#   Geometry must be drawn in SOURCE FONT units,
#   centered around X=0, with baseline Y=0.
#
# MissingWidth        : float     Item
#   Width in SOURCE FONT UNITS used when a glyph is missing.
#
#
# OUTPUTS
# ============================================================
#
# PivotPoints
# Curves
# Slots
# Stones
# Missing
# GlyphNames
# InheritanceNames
# GlyphCurves
# GlyphSlots
# GlyphStones
# Info
#
# ============================================================


Curves = []
Slots = []
Stones = []

GlyphCurves = DataTree[System.Object]()
GlyphSlots = DataTree[System.Object]()
GlyphStones = DataTree[System.Object]()

PivotPoints = []

Missing = []
GlyphNames = []
InheritanceNames = []

Info = ""


# ============================================================
# HELPERS
# ============================================================

def parse_json(value):

    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    return json.loads(value)


def parse_kerning_groups(value):

    if value is None:
        return {}

    if isinstance(value, str):
        raw_items = [value]
    else:
        try:
            raw_items = list(value)
        except:
            raw_items = [value]

    result = {}

    for item in raw_items:

        if item is None:
            continue

        text = str(item)
        text = text.replace("\r", "\n")

        for line in text.split("\n"):

            line = line.strip()

            if not line:
                continue

            if "=" not in line:
                continue

            main_char, variants = line.split(
                "=",
                1
            )

            main_char = main_char.strip()
            variants = variants.strip()

            if len(main_char) != 1:
                continue

            cleaned = []

            for ch in variants:

                if ch == main_char:
                    continue

                if ch not in cleaned:
                    cleaned.append(ch)

            result[main_char] = "".join(
                cleaned
            )

    return result


def resolve_live_kerning_groups(
    json_data,
    live_value,
):

    live_groups = parse_kerning_groups(
        live_value
    )

    if live_groups:
        return live_groups

    stored = json_data.get(
        "kerning_groups",
        {}
    )

    if isinstance(
        stored,
        dict
    ):
        return stored

    return {}


def normalize_tokens(value):

    if value is None:
        return set()

    if isinstance(value, str):

        text = value.replace(
            "\r",
            "\n"
        )

        text = text.replace(
            "\n",
            ","
        )

        raw_items = text.split(",")

    else:

        try:
            raw_items = list(value)
        except:
            raw_items = [value]

    result = set()

    for item in raw_items:

        if item is None:
            continue

        token = str(item).strip()

        token = token.replace(
            "\r",
            "\n"
        )

        token = token.replace(
            "\n",
            ","
        )

        for part in token.split(","):

            part = part.strip()

            if part:
                result.add(part)

    return result


def deserialize_nurbs_curve(data):

    points = data["points"]

    degree = int(
        data["degree"]
    )

    order = degree + 1

    rational = bool(
        data.get(
            "is_rational",
            False
        )
    )

    point_count = len(
        points
    )

    crv = rg.NurbsCurve(
        3,
        rational,
        order,
        point_count,
    )

    for i, item in enumerate(
        points
    ):

        point = rg.Point3d(
            float(item["x"]),
            float(item["y"]),
            float(
                item.get(
                    "z",
                    0.0
                )
            ),
        )

        weight = float(
            item.get(
                "weight",
                1.0
            )
        )

        crv.Points.SetPoint(
            i,
            point,
            weight,
        )

    knots = data["knots"]

    if len(knots) != crv.Knots.Count:

        raise RuntimeError(
            "Knot-count mismatch. JSON={} Rhino={}".format(
                len(knots),
                crv.Knots.Count,
            )
        )

    for i, value in enumerate(
        knots
    ):

        crv.Knots[i] = float(
            value
        )

    return crv


def transform_curve(
    curve,
    scale,
    pivot_x,
):

    crv = curve.DuplicateCurve()

    if abs(
        scale - 1.0
    ) > 1e-12:

        crv.Transform(
            rg.Transform.Scale(
                rg.Point3d.Origin,
                scale,
            )
        )

    crv.Transform(
        rg.Transform.Translation(
            float(pivot_x),
            0.0,
            0.0,
        )
    )

    return crv


def choose_glyph_names(
    text,
    characters,
    alternatives_first,
    alternatives_second,
    finites,
    curled,
    curl_enabled,
    stone_first,
):
    """
    Return two parallel lists:

        result
            Actual glyphs to DRAW.

        inheritance_names
            Glyph identities used as fallback for slots/stones
            and pair-based data.

    When StoneFirst is True, choose ONE stone glyph using:

        1. first "i" in the text
        2. otherwise first "j"
        3. otherwise the first character

    If that position used AlternativesFirst, use *_stone_alt.
    Otherwise use *_stone.

    The stone glyph inherits from whatever glyph would have been used
    at that position before the stone substitution.
    """

    if not text:
        return [], []

    result = [
        ch for ch in text
    ]

    used_alternative_first = [
        False for _ in text
    ]

    # --------------------------------------------------------
    # PAIR-DRIVEN ALTERNATES
    # --------------------------------------------------------

    for i in range(
        len(text) - 1
    ):

        left = text[i]
        right = text[i + 1]

        pair = (
            left
            + right
        )

        if pair in alternatives_first:

            candidate = (
                left
                + "1"
            )

            if candidate in characters:

                result[i] = candidate

                used_alternative_first[i] = True

        if pair in alternatives_second:

            candidate = (
                right
                + "1"
            )

            if candidate in characters:

                result[i + 1] = candidate

    # --------------------------------------------------------
    # LAST GLYPH
    #
    # CURL HAS PRIORITY OVER FINITE
    # --------------------------------------------------------

    last_index = (
        len(text)
        - 1
    )

    last_char = text[
        last_index
    ]

    curl_was_used = False

    if (
        curl_enabled
        and last_char in curled
    ):

        candidate = (
            last_char
            + "_curl"
        )

        if candidate in characters:

            result[
                last_index
            ] = candidate

            curl_was_used = True

    if (
        not curl_was_used
        and last_char in finites
    ):

        candidate = (
            "_"
            + last_char
        )

        if candidate in characters:

            result[
                last_index
            ] = candidate

    # --------------------------------------------------------
    # INHERITANCE SNAPSHOT
    # --------------------------------------------------------

    inheritance_names = list(
        result
    )

    # --------------------------------------------------------
    # STONE TARGET
    #
    # Priority:
    #   i -> j -> first character
    #
    # Stone is applied LAST so it has final priority at the
    # selected position.
    # --------------------------------------------------------

    if (
        stone_first
        and len(text) > 0
    ):

        stone_index = 0

        if "i" in text:

            stone_index = text.index(
                "i"
            )

        elif "j" in text:

            stone_index = text.index(
                "j"
            )

        stone_char = text[
            stone_index
        ]

        if used_alternative_first[
            stone_index
        ]:

            candidate = (
                stone_char
                + "_stone_alt"
            )

        else:

            candidate = (
                stone_char
                + "_stone"
            )

        if candidate in characters:

            result[
                stone_index
            ] = candidate

    return (
        result,
        inheritance_names
    )


def pair_key(
    left_id,
    right_id,
):
    """
    Backward-compatible kerning key.

    Normal one-character kerning identities keep the existing numeric
    Unicode key format, e.g. i+a -> "105|97".

    Named special glyph identities use readable keys, e.g.
    i+a_curl -> "i|a_curl".
    """

    left_id = str(left_id)
    right_id = str(right_id)

    if len(left_id) == 1 and len(right_id) == 1:
        return (
            str(ord(left_id))
            + "|"
            + str(ord(right_id))
        )

    return left_id + "|" + right_id


def get_kerning_groups(data):

    try:

        return resolve_live_kerning_groups(
            data,
            KerningGroups
        )

    except:

        stored = data.get(
            "kerning_groups",
            {}
        )

        return (
            stored
            if isinstance(
                stored,
                dict
            )
            else {}
        )


def get_canonical_char(
    data,
    ch,
):

    groups = get_kerning_groups(
        data
    )

    if ch in groups:
        return ch

    for main_char, variants in groups.items():

        if ch in str(
            variants
        ):
            return main_char

    return ch


def get_kerning_aliases(data):
    """
    Optional explicit named-glyph aliases stored in JSON.

    Example:
        "kerning_aliases": {
            "a1": "a"
        }

    The script also has the simple built-in conventions used by this
    font system:
        a1  -> a
        _o  -> o

    Named special variants such as a_curl / a_square are NOT aliased
    automatically, so they receive their own kerning identity.
    """

    aliases = data.get(
        "kerning_aliases",
        {}
    )

    return aliases if isinstance(
        aliases,
        dict
    ) else {}


def get_kerning_id(
    data,
    glyph_name,
    original_char=None,
):
    """
    Resolve the kerning identity for the ACTUAL glyph being drawn.

    Examples:
        a       -> a
        à       -> a          via KerningGroups
        a1      -> a          normal alternate
        à1      -> a          normal alternate + KerningGroups
        _o      -> o          finite/final variation
        a_curl  -> a_curl     unique kerning
        a_square-> a_square   unique kerning
    """

    name = str(
        glyph_name or ""
    )

    aliases = get_kerning_aliases(
        data
    )

    if name in aliases:
        alias = str(
            aliases[name]
        )

        if len(alias) == 1:
            return get_canonical_char(
                data,
                alias
            )

        return alias

    # Single Unicode glyph: use the existing character groups.
    if len(name) == 1:
        return get_canonical_char(
            data,
            name
        )

    # Normal pair alternate: a1 -> a, à1 -> a.
    if name.endswith("1") and len(name) > 1:
        base = name[:-1]

        if len(base) == 1:
            return get_canonical_char(
                data,
                base
            )

    # Finite/final form: _o -> o, _à -> a.
    if name.startswith("_") and len(name) > 1:
        base = name[1:]

        if len(base) == 1:
            return get_canonical_char(
                data,
                base
            )

    # Any other named glyph is intentionally unique.
    # a_curl, a_square, etc. land here.
    return name


def get_pair_spacing(
    data,
    left_glyph_name,
    right_glyph_name,
    left_original_char=None,
    right_original_char=None,
):
    """
    Resolve kerning from the ACTUAL selected glyphs.

    Normal variants collapse to their shared identity.
    Special named variants keep their own identity.

    Existing Unicode pairs remain fully backward compatible.
    """

    pairs = data.get(
        "pairs",
        {}
    )

    left_id = get_kerning_id(
        data,
        left_glyph_name,
        left_original_char
    )

    right_id = get_kerning_id(
        data,
        right_glyph_name,
        right_original_char
    )

    item = pairs.get(
        pair_key(
            left_id,
            right_id
        )
    )

    if item is not None:
        return float(
            item.get(
                "raw_spacing",
                0.0
            )
        )

    # Special named variants inherit the base pair only when NO
    # dedicated pair has been defined yet. This makes a newly-created
    # a_curl usable immediately, while allowing its own kerning later.
    #
    # For the base fallback we use the original input characters,
    # canonicalized by the existing Unicode KerningGroups.
    if (
        left_original_char is not None
        and right_original_char is not None
    ):
        base_left = get_canonical_char(
            data,
            str(left_original_char)
        )

        base_right = get_canonical_char(
            data,
            str(right_original_char)
        )

        base_item = pairs.get(
            pair_key(
                base_left,
                base_right
            )
        )

        if base_item is not None:
            return float(
                base_item.get(
                    "raw_spacing",
                    0.0
                )
            )

    return 0.0


def get_glyph_geometry_role(
    glyph,
    role,
):

    geometry = glyph.get(
        "geometry",
        {}
    )

    if not isinstance(
        geometry,
        dict
    ):
        return []

    values = geometry.get(
        role,
        []
    )

    return (
        values
        if isinstance(
            values,
            list
        )
        else []
    )


def get_glyph_geometry_role_with_fallback(
    glyph,
    fallback_glyph,
    role,
):
    """
    Exact glyph data wins whenever the role key exists.

    If the exact StoneFirst glyph does not define the role at all,
    inherit it from the non-stone glyph it replaced.

    An explicitly present empty list counts as an override and blocks
    inheritance.
    """

    geometry = glyph.get("geometry", {}) if isinstance(glyph, dict) else {}

    if isinstance(geometry, dict) and role in geometry:
        values = geometry.get(role, [])
        return values if isinstance(values, list) else []

    if fallback_glyph is not None:
        return get_glyph_geometry_role(fallback_glyph, role)

    return []


def add_geometry_role_to_outputs(
    curve_data_list,
    scale,
    pivot_x,
    flat_output,
    tree_output,
    glyph_path,
):

    for curve_data in curve_data_list:

        source_curve = deserialize_nurbs_curve(
            curve_data
        )

        placed = transform_curve(
            source_curve,
            scale,
            pivot_x,
        )

        flat_output.append(
            placed
        )

        tree_output.Add(
            placed,
            glyph_path
        )


def normalize_curve_input(value):

    if value is None:
        return []

    try:
        items = list(value)
    except:
        items = [value]

    curves = []

    for item in items:

        if isinstance(
            item,
            rg.Curve
        ):

            curves.append(
                item.DuplicateCurve()
            )

    if not curves:
        return []

    # --------------------------------------------------------
    # FIND COMBINED BOUNDING BOX
    # --------------------------------------------------------

    bbox = rg.BoundingBox.Unset

    for curve in curves:

        current = curve.GetBoundingBox(
            True
        )

        if not bbox.IsValid:
            bbox = current
        else:
            bbox.Union(
                current
            )

    if not bbox.IsValid:
        return curves

    # --------------------------------------------------------
    # NORMALIZE MISSING SYMBOL
    #
    # X:
    #   center geometry around X = 0
    #
    # Y:
    #   put bottom of geometry on baseline Y = 0
    # --------------------------------------------------------

    center_x = (
        float(bbox.Min.X)
        + float(bbox.Max.X)
    ) * 0.5

    bottom_y = float(
        bbox.Min.Y
    )

    transform = rg.Transform.Translation(
        -center_x,
        -bottom_y,
        0.0
    )

    result = []

    for curve in curves:

        curve.Transform(
            transform
        )

        result.append(
            curve
        )

    return result


def place_missing_geometry(
    curves,
    scale,
    pivot_x,
    flat_output,
    tree_output,
    glyph_path,
):
    """
    MissingCurve is stored in SOURCE FONT units.

    It is:
        1. scaled exactly like normal glyph geometry
        2. translated to the missing-character pivot
    """

    scale_transform = rg.Transform.Scale(
        rg.Point3d.Origin,
        float(scale)
    )

    move_transform = rg.Transform.Translation(
        float(pivot_x),
        0.0,
        0.0
    )

    for curve in curves:

        dup = curve.DuplicateCurve()

        if abs(
            scale - 1.0
        ) > 1e-12:

            dup.Transform(
                scale_transform
            )

        dup.Transform(
            move_transform
        )

        flat_output.append(
            dup
        )

        tree_output.Add(
            dup,
            glyph_path
        )


# ============================================================
# MAIN
# ============================================================

if not Enable:

    Info = "Set Enable = True."


elif not JsonText:

    Info = "JsonText is empty."


elif Text is None:

    Info = "Text is None."


elif Height is None or Height <= 0:

    Info = (
        "Height must be greater than 0."
    )


else:

    try:

        # ----------------------------------------------------
        # LOAD FONT
        # ----------------------------------------------------

        data = parse_json(
            JsonText
        )

        if data is None:

            raise RuntimeError(
                "Could not parse JsonText."
            )

        if data.get(
            "format"
        ) != "rhino-curve-font-v2":

            raise RuntimeError(
                "Expected rhino-curve-font-v2 JSON."
            )

        characters = data.get(
            "characters",
            {}
        )

        missing_curves = normalize_curve_input(
            MissingCurve
        )

        # ----------------------------------------------------
        # SETTINGS
        # ----------------------------------------------------

        alternatives_first = normalize_tokens(
            AlternativesFirst
        )

        alternatives_second = normalize_tokens(
            AlternativesSecond
        )

        finites = normalize_tokens(
            Finites
        )

        curled = normalize_tokens(
            Curled
            )

        # ----------------------------------------------------
        # SCALE
        # ----------------------------------------------------

        source_reference_height = float(
            data[
                "font"
            ][
                "source_reference_height"
            ]
        )

        scale = (
            float(Height)
            / source_reference_height
        )

        # ----------------------------------------------------
        # OVERRIDE VALUE
        # ----------------------------------------------------

        try:

            override_value = float(
                OverrideValue
            )

        except:

            override_value = float(
                data[
                    "font"
                ].get(
                    "override_value",
                    1.0
                )
            )

        # ----------------------------------------------------
        # MISSING CHARACTER WIDTH
        # ----------------------------------------------------

        try:

            missing_width = float(
                MissingWidth
            )

            if missing_width < 0:
                missing_width = 0.0

        except:

            missing_width = (
                source_reference_height
                * 0.5
            )

        # ----------------------------------------------------
        # RESOLVE ACTUAL GLYPH NAMES
        # ----------------------------------------------------

        GlyphNames, InheritanceNames = choose_glyph_names(
            Text,
            characters,
            alternatives_first,
            alternatives_second,
            finites,
            curled,
            Curl,
            StoneFirst,
        )

        # ----------------------------------------------------
        # STONE TARGET INFO
        # ----------------------------------------------------

        stone_target_index = None
        stone_target_char = None

        if (
            bool(StoneFirst)
            and Text
        ):

            if "i" in Text:

                stone_target_index = Text.index(
                    "i"
                )

            elif "j" in Text:

                stone_target_index = Text.index(
                    "j"
                )

            else:

                stone_target_index = 0

            stone_target_char = Text[
                stone_target_index
            ]

        # ----------------------------------------------------
        # BUILD LAYOUT
        # ----------------------------------------------------

        layout = []

        for glyph_index, glyph_name in enumerate(GlyphNames):

            glyph = characters.get(
                glyph_name
            )

            inheritance_name = InheritanceNames[glyph_index]
            fallback_glyph = characters.get(inheritance_name)

            if glyph is None:

                if glyph_name not in Missing:

                    Missing.append(
                        glyph_name
                    )

                layout.append({
                    "glyph": None,
                    "fallback_glyph": fallback_glyph,
                    "width": missing_width,
                    "missing": True,
                })

            else:

                layout.append({
                    "glyph": glyph,
                    "fallback_glyph": fallback_glyph,
                    "width": float(
                        glyph["width"]
                    ),
                    "missing": False,
                })

        # ----------------------------------------------------
        # PLACE GLYPHS
        # ----------------------------------------------------

        pivot_x = 0.0

        placed_count = 0
        missing_count = 0

        for i, item in enumerate(
            layout
        ):

            glyph = item[
                "glyph"
            ]

            fallback_glyph = item.get(
                "fallback_glyph"
            )

            is_missing = item[
                "missing"
            ]

            # ------------------------------------------------
            # PIVOT
            # ------------------------------------------------

            PivotPoints.append(
                rg.Point3d(
                    float(pivot_x),
                    0.0,
                    0.0
                )
            )

            glyph_path = GH_Path(
                i
            )

            # ------------------------------------------------
            # DRAW GLYPH / MISSING MARKER
            # ------------------------------------------------

            if not is_missing:

                add_geometry_role_to_outputs(
                    get_glyph_geometry_role(
                        glyph,
                        "base"
                    ),
                    scale,
                    pivot_x,
                    Curves,
                    GlyphCurves,
                    glyph_path,
                )

                add_geometry_role_to_outputs(
                    get_glyph_geometry_role_with_fallback(
                        glyph,
                        fallback_glyph,
                        "_slots"
                    ),
                    scale,
                    pivot_x,
                    Slots,
                    GlyphSlots,
                    glyph_path,
                )

                add_geometry_role_to_outputs(
                    get_glyph_geometry_role_with_fallback(
                        glyph,
                        fallback_glyph,
                        "_stones"
                    ),
                    scale,
                    pivot_x,
                    Stones,
                    GlyphStones,
                    glyph_path,
                )

                placed_count += 1

            else:

                missing_count += 1

                place_missing_geometry(
                    missing_curves,
                    scale,
                    pivot_x,
                    Curves,
                    GlyphCurves,
                    glyph_path,
                )

            # ------------------------------------------------
            # MOVE TO NEXT GLYPH
            # ------------------------------------------------

            if i >= len(
                layout
            ) - 1:

                continue

            next_item = layout[
                i + 1
            ]

            current_width = float(
                item["width"]
            )

            next_width = float(
                next_item["width"]
            )

            # ------------------------------------------------
            # KERNING
            #
            # Missing glyph behaves like a space:
            # no pair kerning on either side.
            # ------------------------------------------------

            if (
                item["missing"]
                or next_item["missing"]
            ):

                raw_spacing = 0.0

            else:

                raw_spacing = get_pair_spacing(
                    data,
                    GlyphNames[i],
                    GlyphNames[i + 1],
                    Text[i],
                    Text[i + 1],
                )

            pivot_x += (
                (
                    current_width * 0.5
                    + raw_spacing * override_value
                    + next_width * 0.5
                )
                * scale
            )

        # ----------------------------------------------------
        # INFO
        # ----------------------------------------------------

        Info = (
            "TEXT: {}\n"
            "GLYPHS: {}\n"
            "INHERITANCE GLYPHS: {}\n"
            "HEIGHT: {}\n"
            "SOURCE REFERENCE HEIGHT: {}\n"
            "SCALE: {}\n"
            "MISSING WIDTH: {}\n"
            "MISSING CURVES: {}\n"
            "PLACED GLYPHS: {}\n"
            "MISSING GLYPHS: {}\n"
            "CURVES: {}\n"
            "SLOTS: {}\n"
            "STONES: {}\n"
            "MISSING: {}\n"
            "ALTERNATIVES FIRST: {}\n"
            "ALTERNATIVES SECOND: {}\n"
            "FINITES: {}\n"
            "CURLED: {}\n"
            "CURL ENABLED: {}\n"
            "STONE FIRST: {}\n"
            "STONE TARGET INDEX: {}\n"
            "STONE TARGET CHAR: {}\n"
            "KERNING GROUPS: {}"
        ).format(
            Text,
            ", ".join(
                GlyphNames
            ),
            ", ".join(
                InheritanceNames
            ),
            Height,
            source_reference_height,
            scale,
            missing_width,
            len(missing_curves),
            placed_count,
            missing_count,
            len(Curves),
            len(Slots),
            len(Stones),
            repr(Missing),
            sorted(
                alternatives_first
            ),
            sorted(
                alternatives_second
            ),
            sorted(
                finites
            ),
            sorted(
                curled
            ),
            bool(Curl),
            bool(StoneFirst),
            stone_target_index,
            stone_target_char,
            get_kerning_groups(
                data
            ),
        )

    except Exception as ex:

        print(ex)

        Info = (
            "ERROR:\n{}"
        ).format(
            ex
        )