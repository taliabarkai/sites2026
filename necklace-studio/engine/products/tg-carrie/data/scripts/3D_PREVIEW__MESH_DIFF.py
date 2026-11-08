import Rhino.Geometry as rg


A = [mesh for mesh in A if mesh] if A else []
B = [mesh for mesh in B if mesh] if B else []


if not A:
    result = []

elif not B:
    result = A

else:
    diff = rg.Mesh.CreateBooleanDifference(
        A,
        B
    )

    result = list(diff) if diff else []