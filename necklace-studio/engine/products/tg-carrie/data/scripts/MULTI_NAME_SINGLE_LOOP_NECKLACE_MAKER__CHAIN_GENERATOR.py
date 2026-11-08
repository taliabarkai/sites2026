import Rhino.Geometry as rg
import math


Links = []
LinkPoints = []
LinkPlanes = []
LinkCounts = []
ActualPitches = []


pitch = max(
    0.001,
    float(LinkPitch)
)

source_plane = rg.Plane.WorldXY


# --------------------------------------------------
# KEEP EACH CURVE TOGETHER WITH ITS END TYPE
# --------------------------------------------------

segments = []

if Enable:

    for index, curve in enumerate(ChainLines):

        if curve is None:
            continue

        start_is_name = (
            bool(StartIsName[index])
            if index < len(StartIsName)
            else False
        )

        end_is_name = (
            bool(EndIsName[index])
            if index < len(EndIsName)
            else False
        )

        segments.append(
            (
                curve,
                start_is_name,
                end_is_name
            )
        )


    segment_count = len(
        segments
    )


    # --------------------------------------------------
    # GENERATE LINKS
    # --------------------------------------------------

    for segment_index, data in enumerate(
        segments
    ):

        curve, start_is_name, end_is_name = data


        length = curve.GetLength()

        if length <= 1e-9:
            continue


        # --------------------------------------------
        # NUMBER OF SPACES
        # --------------------------------------------

        ideal_spaces = (
            length /
            pitch
        )

        spaces = max(
            2,
            int(round(ideal_spaces))
        )


        is_first_segment = (
            segment_index == 0
        )

        is_last_segment = (
            segment_index ==
            segment_count - 1
        )

        is_middle_segment = (
            not is_first_segment
            and not is_last_segment
        )


        # --------------------------------------------
        # MIDDLE SEGMENTS NEED EVEN PARITY
        # --------------------------------------------

        if (
            is_middle_segment
            and spaces % 2 != 0
        ):

            lower = spaces - 1
            upper = spaces + 1

            if lower < 2:

                spaces = upper

            else:

                lower_pitch = (
                    length /
                    float(lower)
                )

                upper_pitch = (
                    length /
                    float(upper)
                )

                lower_error = abs(
                    lower_pitch -
                    pitch
                )

                upper_error = abs(
                    upper_pitch -
                    pitch
                )

                spaces = (
                    lower
                    if lower_error <= upper_error
                    else upper
                )


        actual_pitch = (
            length /
            float(spaces)
        )


        LinkCounts.append(
            spaces - 1
        )

        ActualPitches.append(
            actual_pitch
        )


        # --------------------------------------------
        # CREATE LINKS
        # --------------------------------------------

        for i in range(
            1,
            spaces
        ):

            distance = (
                float(i) *
                actual_pitch
            )

            normalized = (
                distance /
                length
            )


            ok, t = curve.NormalizedLengthParameter(
                normalized
            )

            if not ok:
                continue


            point = curve.PointAt(
                t
            )

            tangent = curve.TangentAt(
                t
            )

            if not tangent.Unitize():
                continue


            # ----------------------------------------
            # PLANE FOLLOWS CHAIN CURVE
            # ----------------------------------------

            x_axis = rg.Vector3d(
                tangent
            )

            y_axis = rg.Vector3d.CrossProduct(
                rg.Vector3d.ZAxis,
                x_axis
            )

            if not y_axis.Unitize():
                y_axis = rg.Vector3d.YAxis


            plane = rg.Plane(
                point,
                x_axis,
                y_axis
            )


            # ----------------------------------------
            # LINK PARITY
            # ----------------------------------------

            if is_first_segment:

                rotate90 = (
                    (spaces - i) % 2 == 1
                )

            else:

                rotate90 = (
                    i % 2 == 1
                )


            if rotate90:

                plane.Rotate(
                    math.radians(90.0),
                    plane.XAxis
                )


            LinkPoints.append(
                point
            )

            LinkPlanes.append(
                plane
            )


            # ----------------------------------------
            # IS THIS LINK ATTACHED TO A NAME?
            # ----------------------------------------

            is_first_link = (
                i == 1
            )

            is_last_link = (
                i == spaces - 1
            )


            use_connection_link = (
                (
                    start_is_name
                    and is_first_link
                )
                or
                (
                    end_is_name
                    and is_last_link
                )
            )


            # ----------------------------------------
            # SELECT GEOMETRY
            # ----------------------------------------

            if (
                use_connection_link
                and ConnectionLinkGeometry is not None
            ):

                source_geo = ConnectionLinkGeometry

            else:

                source_geo = LinkGeometry


            if source_geo is None:
                continue


            # ----------------------------------------
            # DUPLICATE
            # ----------------------------------------

            try:

                geo = source_geo.Duplicate()

            except:

                try:

                    geo = source_geo.DuplicateGeometry()

                except:

                    geo = None


            if geo is None:
                continue


            # ----------------------------------------
            # PLACE GEOMETRY
            # ----------------------------------------

            xform = rg.Transform.PlaneToPlane(
                source_plane,
                plane
            )

            geo.Transform(
                xform
            )


            Links.append(
                geo
            )