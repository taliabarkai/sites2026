import Rhino.Geometry as rg


MovedGeometry = []
MovedLeft = []
MovedRight = []
Transforms = []
MoveVectors = []

Debug = []


if Enable:

    count = min(
        len(Geometry),
        len(LeftConnections),
        len(RightConnections),
        len(Positions)
    )

    Debug.append("COUNT = {}".format(count))


    for i in range(count):

        geo = Geometry[i]
        left = LeftConnections[i]
        right = RightConnections[i]
        target_x = float(Positions[i])


        if geo is None:
            Debug.append("{}: GEO NONE".format(i))
            continue

        if left is None:
            Debug.append("{}: LEFT NONE".format(i))
            continue

        if right is None:
            Debug.append("{}: RIGHT NONE".format(i))
            continue


        Debug.append(
            "{}: TYPE = {}".format(
                i,
                geo.GetType().FullName
            )
        )


        # --------------------------------------------
        # CURRENT CENTER
        # --------------------------------------------

        center = rg.Point3d(
            (left.X + right.X) * 0.5,
            (left.Y + right.Y) * 0.5,
            (left.Z + right.Z) * 0.5
        )


        # --------------------------------------------
        # TARGET
        # --------------------------------------------

        target = rg.Point3d(
            target_x,
            0.0,
            0.0
        )


        move = rg.Vector3d(
            target.X - center.X,
            target.Y - center.Y,
            target.Z - center.Z
        )


        xform = rg.Transform.Translation(
            move
        )


        # --------------------------------------------
        # EXPLICIT DUPLICATION
        # --------------------------------------------

        moved_geo = None

        if isinstance(geo, rg.Mesh):

            moved_geo = geo.DuplicateMesh()

        elif isinstance(geo, rg.Brep):

            moved_geo = geo.DuplicateBrep()

        elif isinstance(geo, rg.Curve):

            moved_geo = geo.DuplicateCurve()

        elif isinstance(geo, rg.Extrusion):

            moved_geo = geo.Duplicate()

        else:

            try:
                moved_geo = geo.DuplicateGeometry()
            except Exception as ex:
                Debug.append(
                    "{}: DUPLICATE FAILED: {}".format(
                        i,
                        str(ex)
                    )
                )


        if moved_geo is None:

            Debug.append(
                "{}: DUPLICATE RETURNED NONE".format(i)
            )

            continue


        # --------------------------------------------
        # TRANSFORM
        # --------------------------------------------

        success = moved_geo.Transform(
            xform
        )

        Debug.append(
            "{}: TRANSFORM = {}".format(
                i,
                success
            )
        )


        moved_left = rg.Point3d(
            left
        )

        moved_right = rg.Point3d(
            right
        )

        moved_left.Transform(
            xform
        )

        moved_right.Transform(
            xform
        )


        # --------------------------------------------
        # OUTPUT
        # --------------------------------------------

        MovedGeometry.append(
            moved_geo
        )

        MovedLeft.append(
            moved_left
        )

        MovedRight.append(
            moved_right
        )

        Transforms.append(
            xform
        )

        MoveVectors.append(
            move
        )


else:

    Debug.append(
        "ENABLE = FALSE"
    )

Debug = "\n".join(Debug)