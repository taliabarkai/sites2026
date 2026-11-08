import Rhino.Geometry as rg


def get_center(geo):
    """Return bounding-box center of geometry."""
    bbox = geo.GetBoundingBox(True)
    return bbox.Center


def move_to_marker(geo, marker):
    """Duplicate geometry and move its center to marker center."""
    
    if geo is None or marker is None:
        return None

    source_center = get_center(geo)
    target_center = get_center(marker)

    vector = target_center - source_center

    moved = geo.Duplicate()
    moved.Transform(rg.Transform.Translation(vector))

    return moved


# --------------------------------------------------
# Choose stone geometry
# --------------------------------------------------

stone_geo = None

if stone_type:
    stone_type_clean = stone_type.strip().upper()

    if stone_type_clean == "SQUARE":
        stone_geo = SQUARE

    elif stone_type_clean == "DIAMOND":
        stone_geo = DIAMOND


# --------------------------------------------------
# Place stones
# --------------------------------------------------

Stones = []

if stone_geo is not None and stone_markers:
    for marker in stone_markers:
        moved = move_to_marker(stone_geo, marker)

        if moved is not None:
            Stones.append(moved)