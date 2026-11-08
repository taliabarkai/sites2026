import Rhino.Geometry as rg


ChainLine = None
TargetPoints = []
MoveVectors = []


spacing = max(
    0.001,
    float(NameSpacing)
)

tail = max(
    0.001,
    float(PreviewTailLength)
)

rise = max(
    0.0,
    float(ChainRise)
)

samples = max(
    10,
    int(Samples)
)


# --------------------------------------------------
# BASIC CHECK
# --------------------------------------------------

if Enable and LoopPoints:

    name_count = len(
        LoopPoints
    )


    # ------------------------------------------------
    # WIDTH OCCUPIED BY THE NAMES
    # ------------------------------------------------

    names_width = (
        float(name_count - 1)
        * spacing
    )


    total_width = (
        names_width
        +
        tail * 2.0
    )


    half_width = (
        total_width * 0.5
    )


    # ------------------------------------------------
    # CHAIN SHAPE
    #
    # Center = lowest point.
    # Ends rise upward by ChainRise.
    # ------------------------------------------------

    chain_points = []


    for i in range(
        samples + 1
    ):

        f = (
            float(i)
            /
            float(samples)
        )

        x = (
            -half_width
            +
            total_width * f
        )


        if half_width > 1e-9:

            normalized_x = (
                x / half_width
            )

        else:

            normalized_x = 0.0


        y = (
            rise
            *
            normalized_x
            *
            normalized_x
        )


        point = rg.Point3d(
            x,
            y,
            0.0
        )

        chain_points.append(
            point
        )


    # ------------------------------------------------
    # CREATE CONTINUOUS CHAIN CURVE
    # ------------------------------------------------

    if len(chain_points) >= 2:

        ChainLine = rg.Curve.CreateInterpolatedCurve(
            chain_points,
            3
        )


    # ------------------------------------------------
    # NAME ATTACHMENT POSITIONS
    # ------------------------------------------------

    if ChainLine is not None:

        first_name_x = (
            -names_width * 0.5
        )


        for i, loop_point in enumerate(
            LoopPoints
        ):

            if loop_point is None:
                continue


            target_x = (
                first_name_x
                +
                float(i) * spacing
            )


            # Find point on chain at this X.
            #
            # Because our chain is generated
            # analytically, calculate the same Y.

            if half_width > 1e-9:

                normalized_x = (
                    target_x /
                    half_width
                )

            else:

                normalized_x = 0.0


            target_y = (
                rise
                *
                normalized_x
                *
                normalized_x
            )


            target = rg.Point3d(
                target_x,
                target_y,
                0.0
            )


            TargetPoints.append(
                target
            )


            move = (
                target
                -
                loop_point
            )


            MoveVectors.append(
                move
            )