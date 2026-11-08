
def add_preset(preset_name, 
    font_size, 
    defined_features,
    stone_type,
    loop_scheme_index,
    add_stone_scheme_index
    ):

    preset_map[preset_name] = {}
    print("f", font_size)
    preset_map[preset_name]["font_size"] = font_size if font_size in available_sizes else "0"
    preset_map[preset_name]["stone_type"] = stone_type
    preset_map[preset_name]["loop_scheme_index"] = loop_scheme_index
    preset_map[preset_name]["add_stone_scheme_index"] = add_stone_scheme_index

    preset_map[preset_name]["features"] = {}
    for feature in FEATURE_POOL:
        included = False if not feature in defined_features else True

        preset_map[preset_name]["features"][feature] = included

def get_size_map():
    size_map = {}

    for line in SIZES:
        str_sizes = line.split("=")
        art_size = str_sizes[0].strip()
        rhi_size = str_sizes[1].strip()
        size_map[art_size] = rhi_size

    return size_map


size_map = get_size_map()
available_sizes = list(size_map.keys())
print("\nAVAILABLE SIZES: ", available_sizes)
preset_map = {}

# ===============================================================================
# PRESETS
# ===============================================================================
add_preset(
    preset_name="DEFAULT", 
    font_size= "6",
    defined_features = [],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="TEST", 
    font_size= "11.2",
    defined_features = [],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

#region CNC
add_preset(
    preset_name="CNC_9.5", 
    font_size= "9.5",
    defined_features = [],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="CNC_9.5_CURL", 
    font_size= "9.5",
    defined_features = ["Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="CNC_11.2", 
    font_size= "11.2",
    defined_features = [],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="CNC_11.2_LEFT-LOOP", 
    font_size= "11.2",
    defined_features = [],
    stone_type = None,
    loop_scheme_index = 3,
    add_stone_scheme_index = None,
    )


add_preset(
    preset_name="CNC_11.2_EMBED-DIA", 
    font_size= "11.2",
    defined_features = ["Embedded Stone"],
    stone_type = "DIAMOND",
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="CNC_11.2_CURL", 
    font_size= "11.2",
    defined_features = ["Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="CNC_11.2_CURL_EMBED-DIA", 
    font_size= "11.2",
    defined_features = ["Curled Last Letter", "Embedded Stone"],
    stone_type = "DIAMOND",
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="CNC_11.2_CURL_MID-LOOPS", 
    font_size= "11.2",
    defined_features = ["Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 2,
    add_stone_scheme_index = None,
    )
#endregion

#region LC
add_preset(
    preset_name="LC_6", 
    font_size= "6",
    defined_features = ["Offset Slots"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_6_CURL", 
    font_size= "6",
    defined_features = ["Offset Slots", "Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_6_LEFT-LOOP", 
    font_size= "6",
    defined_features = ["Offset Slots"],
    stone_type = None,
    loop_scheme_index = 3,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_7.5", 
    font_size= "7.5",
    defined_features = ["Offset Slots"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_7.5_CURL", 
    font_size= "7.5",
    defined_features = ["Offset Slots", "Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_7.5_SQUASHED", 
    font_size= "7.5",
    defined_features = ["Offset Slots"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )


add_preset(
    preset_name="LC_9.5_EMBED-DIA", 
    font_size= "9.5",
    defined_features = ["Offset Slots", "Embedded Stone"],
    stone_type = "DIAMOND",
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_9.5_EMBED-SQR", 
    font_size= "9.5",
    defined_features = ["Offset Slots", "Embedded Stone"],
    stone_type = "SQUARE",
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_9.5_CURL", 
    font_size= "9.5",
    defined_features = ["Offset Slots", "Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )


add_preset(
    preset_name="LC_9.5_CURL_EMBED-SQR", 
    font_size= "9.5",
    defined_features = ["Offset Slots", "Embedded Stone", "Curled Last Letter"],
    stone_type = "SQUARE",
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_9.5_CURL_ADD-SQR", 
    font_size= "9.5",
    defined_features = ["Offset Slots", "Curled Last Letter"],
    stone_type = "SQUARE",
    loop_scheme_index = 0,
    add_stone_scheme_index = 1,
    )

add_preset(
    preset_name="LC_9.5_CURL_MID-LOOPS", 
    font_size= "9.5",
    defined_features = ["Offset Slots", "Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 2,
    add_stone_scheme_index = None,
    )


add_preset(
    preset_name="LC_11.2", 
    font_size= "11.2",
    defined_features = ["Offset Slots"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_11.2_CURL", 
    font_size= "11.2",
    defined_features = ["Offset Slots", "Curled Last Letter"],
    stone_type = None,
    loop_scheme_index = 0,
    add_stone_scheme_index = None,
    )

add_preset(
    preset_name="LC_11.2_ADD-SQR",
    font_size= "11.2",
    defined_features = ["Offset Slots"],
    stone_type = "SQUARE",
    loop_scheme_index = 0,
    add_stone_scheme_index = 1,
    )



#endregion

# ===============================================================================
# CURRENT PRESET
# ===============================================================================

current_preset = preset_map[PRESET]

font_art_size = current_preset["font_size"]
font_rhino_size = size_map[font_art_size]

curled_last_letter = current_preset["features"]["Curled Last Letter"]
first_letter_embedded_stone = current_preset["features"]["Embedded Stone"]
offset_slots = current_preset["features"]["Offset Slots"]

stone_type = current_preset["stone_type"]
loop_scheme_index = current_preset["loop_scheme_index"]
add_stone_scheme_index = current_preset["add_stone_scheme_index"]
