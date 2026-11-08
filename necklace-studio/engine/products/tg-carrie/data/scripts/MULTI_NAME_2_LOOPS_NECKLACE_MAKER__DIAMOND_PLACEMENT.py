import Rhino.Geometry as rg


DiamondSockets = []
Diamonds = []
Debug = []


# ============================================================
# HELPERS
# ============================================================

def duplicate_geometry(source_geo):
    if source_geo is None:
        return None

    try:
        return source_geo.DuplicateGeometry()
    except:
        pass

    try:
        return source_geo.Duplicate()
    except:
        pass

    return None


def get_branch(tree, branch_index):
    """
    Return one branch as a Python list.

    DiamondGeometry is expected as Tree access.
    Branch {0} = diamond type 0
    Branch {1} = diamond type 1
    etc.
    """

    if tree is None:
        return []

    try:
        branch_count = tree.BranchCount
    except:
        return []

    if branch_count <= 0:
        return []

    branch_index = int(branch_index)

    if branch_index < 0 or branch_index >= branch_count:
        return []

    try:
        return list(
            tree.Branch(branch_index)
        )
    except:
        return []


# ============================================================
# MAIN
# ============================================================

if Enabled and DiamondGeometry and DiamondPlanes:

    source_plane = rg.Plane.WorldXY

    try:
        branch_count = DiamondGeometry.BranchCount
    except:
        branch_count = 0


    Debug.append(
        "DIAMOND TYPES: {}".format(
            branch_count
        )
    )

    Debug.append(
        "PLACEMENTS: {}".format(
            len(DiamondPlanes)
        )
    )


    # --------------------------------------------------------
    # OPTIONAL INDICES
    # --------------------------------------------------------

    try:
        indices = list(DiamondIndices)
    except:
        indices = []


    if not indices:
        Debug.append(
            "DiamondIndices empty -> using branch 0 everywhere"
        )


    # ========================================================
    # PLACE EACH DIAMOND
    # ========================================================

    for plane_index, plane in enumerate(
        DiamondPlanes
    ):

        if plane is None:
            continue


        # ----------------------------------------------------
        # SELECT DIAMOND TYPE
        # ----------------------------------------------------

        if plane_index < len(indices):

            try:
                diamond_type = int(
                    indices[plane_index]
                )
            except:
                diamond_type = 0

        else:
            diamond_type = 0


        # Invalid index -> fallback to branch 0
        if (
            diamond_type < 0
            or
            diamond_type >= branch_count
        ):
            Debug.append(
                "Plane {}: invalid DiamondIndex {} -> using 0".format(
                    plane_index,
                    diamond_type
                )
            )

            diamond_type = 0


        geometry = get_branch(
            DiamondGeometry,
            diamond_type
        )


        if not geometry:
            Debug.append(
                "Plane {}: branch {} is empty".format(
                    plane_index,
                    diamond_type
                )
            )

            continue


        # Middle geometry = actual diamond
        diamond_index = len(geometry) // 2


        # ----------------------------------------------------
        # TRANSFORM
        # ----------------------------------------------------

        xform = rg.Transform.PlaneToPlane(
            source_plane,
            plane
        )


        for geo_index, source_geo in enumerate(
            geometry
        ):

            geo = duplicate_geometry(
                source_geo
            )

            if geo is None:
                continue


            geo.Transform(
                xform
            )


            # ------------------------------------------------
            # SORT OUTPUT
            # ------------------------------------------------

            if geo_index == 0:

                Diamonds.append(
                    geo
                )

            else:

                DiamondSockets.append(
                    geo
                )