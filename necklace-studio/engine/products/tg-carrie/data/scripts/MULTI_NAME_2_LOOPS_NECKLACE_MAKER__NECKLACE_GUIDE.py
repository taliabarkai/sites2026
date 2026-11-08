import Rhino.Geometry as rg


GuideCurve = None
GuidePoints = []
ActualLength = 0.0


# ------------------------------------------------------------
# INPUTS
# ------------------------------------------------------------

length = max(1.0, float(TotalLength))
depth = max(0.0, float(Depth))
samples = max(10, int(Samples))


# ------------------------------------------------------------
# GUIDE POINTS
# ------------------------------------------------------------

points = []

for i in range(samples + 1):

    u = float(i) / float(samples)

    x_norm = u * 2.0 - 1.0

    x = u * length
    y = depth * x_norm * x_norm

    points.append(
        rg.Point3d(x, y, 0.0)
    )


# ------------------------------------------------------------
# CREATE NURBS CURVE
# ------------------------------------------------------------

curve = rg.NurbsCurve.Create(
    False,      # periodic
    3,          # degree
    points
)


# ------------------------------------------------------------
# SCALE TO EXACT CURVE LENGTH
# ------------------------------------------------------------

if curve is not None and curve.IsValid:

    current_length = curve.GetLength()

    if current_length > 1e-9:

        scale = length / current_length

        xform = rg.Transform.Scale(
            rg.Point3d.Origin,
            scale
        )

        curve.Transform(xform)


    # --------------------------------------------------------
    # OUTPUT
    # --------------------------------------------------------

    if curve.IsValid:

        GuideCurve = curve
        ActualLength = curve.GetLength()

        parameters = curve.DivideByCount(
            samples,
            True
        )

        if parameters:
            GuidePoints = [
                curve.PointAt(t)
                for t in parameters
            ]