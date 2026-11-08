
addition_json = None
addition_geo = []
addition_pivot = None

out = []


# ------------------------------------------------------------
# HELPERS
# ------------------------------------------------------------

def get_branch(tree, index):
    if tree is None:
        return []

    if index is None:
        return []

    try:
        index = int(index)
    except:
        return []

    if index < 0:
        return []

    if index >= tree.BranchCount:
        return []

    return list(tree.Branch(index))


def first_or_none(items):
    if not items:
        return None

    return items[0]


# ------------------------------------------------------------
# ADDITION SCHEME
# ------------------------------------------------------------

print("scheme index: ", scheme_index)

addition_json_branch = get_branch(
    JSONS,
    scheme_index
)

addition_geo_branch = get_branch(
    GEOS,
    scheme_index
)

addition_pivot_branch = get_branch(
    PIVOTS,
    scheme_index
)


addition_json = first_or_none(
    addition_json_branch
)

addition_geo = addition_geo_branch

addition_pivot = first_or_none(
    addition_pivot_branch
)

