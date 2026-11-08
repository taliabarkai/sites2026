count = max(1, min(5, int(NameCount)))
length = float(TotalLength)

Positions = []

for i in range(count):
    x = length * float(i + 1) / float(count + 1)
    Positions.append(x)