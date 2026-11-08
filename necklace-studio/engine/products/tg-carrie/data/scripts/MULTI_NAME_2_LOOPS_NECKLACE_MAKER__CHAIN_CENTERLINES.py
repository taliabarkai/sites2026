import Rhino.Geometry as rg


length = float(TotalLength)

StartPoint = rg.Point3d(0, 0, 0)
EndPoint = rg.Point3d(length, 0, 0)

ChainLines = []
ChainLengths = []

count = min(len(LeftPoints), len(RightPoints))

if count > 0:

    # Start -> first inscription
    line = rg.LineCurve(
        StartPoint,
        LeftPoints[0]
    )

    ChainLines.append(line)
    ChainLengths.append(line.GetLength())

    # Between inscriptions
    for i in range(count - 1):

        line = rg.LineCurve(
            RightPoints[i],
            LeftPoints[i + 1]
        )

        ChainLines.append(line)
        ChainLengths.append(line.GetLength())

    # Last inscription -> end
    line = rg.LineCurve(
        RightPoints[count - 1],
        EndPoint
    )

    ChainLines.append(line)
    ChainLengths.append(line.GetLength())