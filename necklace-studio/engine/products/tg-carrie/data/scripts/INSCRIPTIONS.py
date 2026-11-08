
# Clean inscriptions
inscriptions = [s.strip() for s in inscriptions if s.strip()]

# Always capitalize first letter
def cap_first_let(text):
    if not text:
        return ""
    
    lets = [l for l in text]
    lets[0] = lets[0].upper()
    result = ''.join(lets)
    return result

inscriptions = [cap_first_let(s) for s in inscriptions]

count = len(inscriptions)

text1 = inscriptions[0] if count > 0 else ""
text2 = inscriptions[1] if count > 1 else ""
text3 = inscriptions[2] if count > 2 else ""
text4 = inscriptions[3] if count > 3 else ""
text5 = inscriptions[4] if count > 4 else ""


# ==============================
# NECKLACE TYPE
# ==============================
if "LEFT" in PRESET or "RIGHT" in PRESET:
    single_loop_flag = True
    multi_loop_flag = False
else:
    single_loop_flag = False
    multi_loop_flag = True


# ==============================
# 3D STONE TYPE
# ==============================
if stone_type == "DIAMOND":
    stone_type = 1
elif stone_type == "SQUARE":
    stone_type = 2
else:
    stone_type = 0