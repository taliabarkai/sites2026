import Rhino.Geometry as rg
import math


GeometryOut = []
Transforms = []
Points = []
MovedLeft = []
MovedRight = []


if GuideCurve:

    count = min(
        len(Geometry),
        len(LeftConnections),
        len(RightConnections),
        len(Positions)
    )

    for i in range(count):

        geo = Geometry[i]
        left = LeftConnections[i]
        right = RightConnections[i]
        x = float(Positions[i])

        if geo is None or left is None or right is None:
            continue


        # --------------------------------------------
        # POSITION ON GUIDE
        # --------------------------------------------

        u = x / float(TotalLength)

        u = max(
            0.0,
            min(1.0, u)
        )

        ok, t = GuideCurve.NormalizedLengthParameter(
            u
        )

        if not ok:
            continue

        target_point = GuideCurve.PointAt(t)

        tangent = GuideCurve.TangentAt(t)

        if not tangent.Unitize():
            continue


        # --------------------------------------------
        # ROTATION
        # --------------------------------------------

        angle = math.atan2(
            tangent.Y,
            tangent.X
        )

        source_center = rg.Point3d(
            x,
            0.0,
            0.0
        )

        rotation = rg.Transform.Rotation(
            angle,
            rg.Vector3d.ZAxis,
            source_center
        )


        # --------------------------------------------
        # TRANSLATION
        # --------------------------------------------

        rotated_center = rg.Point3d(
            source_center
        )

        rotated_center.Transform(
            rotation
        )

        move = (
            target_point -
            rotated_center
        )

        translation = rg.Transform.Translation(
            move
        )

        xform = (
            translation *
            rotation
        )


        # --------------------------------------------
        # NAME GEOMETRY
        # --------------------------------------------

        try:
            moved_geo = geo.Duplicate()

        except:
            try:
                moved_geo = geo.DuplicateGeometry()
            except:
                moved_geo = None

        if moved_geo is None:
            continue

        moved_geo.Transform(
            xform
        )


        # --------------------------------------------
        # CONNECTION POINTS
        # --------------------------------------------

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
        # OUTPUTS
        # --------------------------------------------

        GeometryOut.append(
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

        Points.append(
            target_point
        )


Geometry = GeometryOut