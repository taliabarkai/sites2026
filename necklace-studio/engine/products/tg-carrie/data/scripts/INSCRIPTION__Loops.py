import json
import traceback

import Rhino.Geometry as rg
from Grasshopper import DataTree
from Grasshopper.Kernel.Data import GH_Path
import System


# ============================================================
# GRASSHOPPER INPUTS
# ============================================================
#
# Run
#   Type Hint : bool
#   Access    : Item
#
# FontJson
#   Type Hint : str
#   Access    : Item
#
# AnchorsJson
#   Type Hint : str
#   Access    : Item
#
# GlyphNames
#   Type Hint : str
#   Access    : List
#   Actual glyphs from Font Assembly.
#
# InheritanceNames
#   Type Hint : str
#   Access    : List
#   Inheritance glyphs from Font Assembly.
#
# PivotPoints
#   Type Hint : Point3d
#   Access    : List
#
# Height
#   Type Hint : float
#   Access    : Item
#
# AdditionGeo
#   Type Hint : No Type Hint
#   Access    : List
#
# AdditionPivot
#   Type Hint : Point3d
#   Access    : Item
#
#
# ============================================================
# OUTPUTS
# ============================================================
#
# out
# Additions
# AdditionTree
# AnchorPoints
# Roles
# UsedGlyphs
# Missing
# Info
#
# ============================================================


out = None

Additions = []
AdditionTree = DataTree[System.Object]()
AnchorPoints = []
Roles = []
UsedGlyphs = []
Missing = []
Info = ""


# ============================================================
# HELPERS
# ============================================================

def parse_json(value):

    if value is None:
        return None

    text = str(value).strip()

    if not text:
        return None

    return json.loads(text)


def normalize_list(value):

    if value is None:
        return []

    if isinstance(value, str):
        return [value]

    try:
        return list(value)
    except:
        return [value]


def duplicate_geometry(geo):

    if geo is None:
        return None

    try:
        return geo.Duplicate()
    except:
        pass

    try:
        return geo.DuplicateGeometry()
    except:
        pass

    return geo


def get_anchor(
    anchor_data,
    glyph_name,
    role,
):

    return (
        anchor_data
        .get("anchors", {})
        .get(glyph_name, {})
        .get(role)
    )


def resolve_anchor(
    anchor_data,
    glyph_name,
    inheritance_name,
    role,
):
    """
    Lookup priority:

        1. Exact displayed glyph
        2. Inheritance glyph
        3. Missing

    Example:
        GlyphName        = S_stone
        InheritanceName  = S

        Try:
            S_stone / FIRST

        then:
            S / FIRST
    """

    exact = get_anchor(
        anchor_data,
        glyph_name,
        role,
    )

    if exact is not None:

        return (
            exact,
            glyph_name,
            False,
        )

    if (
        inheritance_name
        and inheritance_name != glyph_name
    ):

        inherited = get_anchor(
            anchor_data,
            inheritance_name,
            role,
        )

        if inherited is not None:

            return (
                inherited,
                inheritance_name,
                True,
            )

    return (
        None,
        None,
        False,
    )


def place_addition(
    geometry,
    addition_pivot,
    target_point,
):
    """
    Translate fixed-size addition geometry so AdditionPivot
    coincides with target_point.

    No scaling is applied to AdditionGeo.
    """

    result = []

    source = rg.Point3d(
        float(addition_pivot.X),
        float(addition_pivot.Y),
        float(addition_pivot.Z),
    )

    target = rg.Point3d(
        float(target_point.X),
        float(target_point.Y),
        float(target_point.Z),
    )

    transform = rg.Transform.Translation(
        target - source
    )

    for item in normalize_list(
        geometry
    ):

        dup = duplicate_geometry(
            item
        )

        if dup is None:
            continue

        try:

            dup.Transform(
                transform
            )

            result.append(
                dup
            )

        except:
            pass

    return result


def compute_world_anchor(
    local_anchor,
    glyph_pivot,
    scale,
):
    """
    AnchorsJson stores coordinates in SOURCE FONT coordinates,
    local to the glyph pivot.

    world anchor =
        glyph pivot
        + local anchor * font scale
    """

    local_x = float(
        local_anchor["x"]
    )

    local_y = float(
        local_anchor["y"]
    )

    return rg.Point3d(
        float(glyph_pivot.X)
        + local_x * scale,

        float(glyph_pivot.Y)
        + local_y * scale,

        float(glyph_pivot.Z),
    )


# ============================================================
# MAIN
# ============================================================

if not Run:

    Info = "Set Run = True."

else:

    try:

        # ----------------------------------------------------
        # FONT JSON
        # ----------------------------------------------------

        font_data = parse_json(
            FontJson
        )

        if font_data is None:

            raise RuntimeError(
                "FontJson is empty."
            )

        if font_data.get(
            "format"
        ) != "rhino-curve-font-v2":

            raise RuntimeError(
                "FontJson must be rhino-curve-font-v2."
            )

        # ----------------------------------------------------
        # ADDITION ANCHORS JSON
        # ----------------------------------------------------

        anchor_data = parse_json(
            AnchorsJson
        )

        if anchor_data is None:

            raise RuntimeError(
                "AnchorsJson is empty."
            )

        if anchor_data.get(
            "format"
        ) != "addition-anchors-v2":

            raise RuntimeError(
                "AnchorsJson must be addition-anchors-v2."
            )

        # ----------------------------------------------------
        # INPUT LISTS
        # ----------------------------------------------------

        glyph_names = normalize_list(
            GlyphNames
        )

        inheritance_names = normalize_list(
            InheritanceNames
        )

        pivot_points = normalize_list(
            PivotPoints
        )

        if not glyph_names:

            raise RuntimeError(
                "GlyphNames is empty."
            )

        if not inheritance_names:

            raise RuntimeError(
                "InheritanceNames is empty."
            )

        if not pivot_points:

            raise RuntimeError(
                "PivotPoints is empty."
            )

        if len(glyph_names) != len(pivot_points):

            raise RuntimeError(
                "GlyphNames count ({}) does not match "
                "PivotPoints count ({}).".format(
                    len(glyph_names),
                    len(pivot_points),
                )
            )

        if len(inheritance_names) != len(glyph_names):

            raise RuntimeError(
                "InheritanceNames count ({}) does not match "
                "GlyphNames count ({}).".format(
                    len(inheritance_names),
                    len(glyph_names),
                )
            )

        if AdditionPivot is None:

            raise RuntimeError(
                "AdditionPivot is required."
            )

        if Height is None or float(
            Height
        ) <= 0:

            raise RuntimeError(
                "Height must be greater than 0."
            )

        # ----------------------------------------------------
        # SCALE
        # ----------------------------------------------------

        source_reference_height = float(
            font_data[
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
        # FIRST / LAST REQUESTS
        # ----------------------------------------------------

        placement_requests = [
            (
                "FIRST",
                0,
            ),
            (
                "LAST",
                len(glyph_names) - 1,
            ),
        ]

        branch_index = 0
        resolution_log = []

        for role, glyph_index in placement_requests:

            glyph_name = str(
                glyph_names[
                    glyph_index
                ]
            )

            inheritance_name = str(
                inheritance_names[
                    glyph_index
                ]
            )

            glyph_pivot = pivot_points[
                glyph_index
            ]

            # ------------------------------------------------
            # EXACT -> INHERITED LOOKUP
            # ------------------------------------------------

            anchor, source_glyph, inherited = resolve_anchor(
                anchor_data,
                glyph_name,
                inheritance_name,
                role,
            )

            if anchor is None:

                if inheritance_name != glyph_name:

                    Missing.append(
                        "{} / {} "
                        "(inheritance: {})".format(
                            glyph_name,
                            role,
                            inheritance_name,
                        )
                    )

                else:

                    Missing.append(
                        "{} / {}".format(
                            glyph_name,
                            role,
                        )
                    )

                resolution_log.append(
                    "{}: {} -> MISSING".format(
                        role,
                        glyph_name,
                    )
                )

                continue

            # ------------------------------------------------
            # WORLD ANCHOR
            # ------------------------------------------------

            world_anchor = compute_world_anchor(
                anchor,
                glyph_pivot,
                scale,
            )

            # ------------------------------------------------
            # PLACE ADDITION
            # ------------------------------------------------

            placed_geometry = place_addition(
                AdditionGeo,
                AdditionPivot,
                world_anchor,
            )

            path = GH_Path(
                branch_index
            )

            for geo in placed_geometry:

                Additions.append(
                    geo
                )

                AdditionTree.Add(
                    geo,
                    path,
                )

            AnchorPoints.append(
                world_anchor
            )

            Roles.append(
                role
            )

            UsedGlyphs.append(
                glyph_name
            )

            if inherited:

                resolution_log.append(
                    "{}: {} -> inherited from {}".format(
                        role,
                        glyph_name,
                        source_glyph,
                    )
                )

            else:

                resolution_log.append(
                    "{}: {} -> exact".format(
                        role,
                        glyph_name,
                    )
                )

            branch_index += 1

        # ----------------------------------------------------
        # OUTPUT
        # ----------------------------------------------------

        out = Additions

        # ----------------------------------------------------
        # INFO
        # ----------------------------------------------------

        Info = (
            "SCHEME: {}\n"
            "FORMAT: {}\n"
            "FONT: {}\n"
            "HEIGHT: {}\n"
            "SCALE: {}\n"
            "GLYPH COUNT: {}\n"
            "INHERITANCE COUNT: {}\n"
            "PLACED ADDITIONS: {}\n"
            "ROLES: {}\n"
            "USED GLYPHS: {}\n"
            "MISSING: {}\n"
            "\n"
            "ANCHOR RESOLUTION:\n{}"
        ).format(
            anchor_data.get(
                "name",
                ""
            ),
            anchor_data.get(
                "format",
                ""
            ),
            font_data.get(
                "font",
                {}
            ).get(
                "name",
                ""
            ),
            Height,
            scale,
            len(
                glyph_names
            ),
            len(
                inheritance_names
            ),
            len(
                Roles
            ),
            repr(
                Roles
            ),
            repr(
                UsedGlyphs
            ),
            repr(
                Missing
            ),
            "\n".join(
                resolution_log
            ),
        )

    except Exception as ex:

        print(ex)
        traceback.print_exc()

        Info = (
            "ERROR:\n{}"
        ).format(
            ex
        )

diagnostics = (
    "Run: {}\n"
    "FontJson: {}\n"
    "AnchorsJson: {}\n"
    "GlyphNames: {}\n"
    "InheritanceNames: {}\n"
    "PivotPoints: {}\n"
    "AdditionGeo: {}\n"
    "AdditionPivot: {}\n"
    "Height: {}\n"
    "Additions: {}\n"
    "Info:\n{}"
).format(
    Run,
    "OK" if FontJson else "EMPTY",
    "OK" if AnchorsJson else "EMPTY",
    len(GlyphNames) if GlyphNames else 0,
    len(InheritanceNames) if InheritanceNames else 0,
    len(PivotPoints) if PivotPoints else 0,
    len(AdditionGeo) if AdditionGeo else 0,
    "OK" if AdditionPivot is not None else "NONE",
    Height,
    len(Additions),
    Info
)