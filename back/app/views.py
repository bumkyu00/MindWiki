from django.http import HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from .models import File, Node, Leaf

def files_list(request):
    if request.method == 'GET':
        print(File.objects.all())
        files_list = [{'id': file['id'], 'name': file['name']} for file in File.objects.all().values()]
        return JsonResponse(files_list, safe=False)
    return HttpResponseNotAllowed(['GET'])

def _add_children(roots, leaves):
    for root in roots:
        root['children'] = _add_children(list(filter(lambda leaf: root['id'] == leaf['parentId'], leaves)), leaves)
    return roots

def _build_tree():
    tree = []
    leaves = [{
        'id': leaf.id, 
        'parentId': leaf.parent_id, 
        'children': [], 
        'leafSize': leaf.leaf_size, 
        'offsetX': leaf.offset_x, 
        'offsetY': leaf.offset_y
    } for leaf in Leaf.objects.all().values()]
    for leaf in leaves:
        if leaf['parentId'] == leaf['id']:
            tree.append(leaf)
            leaves.remove(leaf)
    return _add_children(tree, leaves)
    
def file(request):
    if request.method == 'GET':
        file = File.objects.get(id=request.GET.get('id'))
        file = {
            'frameWidth': None,
            'frameHeight': None,
            'zoomRatio': file.zoom_ratio,
            'x': file.x, 
            'y': file.y,
            'dragged': False,
            'origX': 0,
            'origY': 0,
            'clickX': 0,
            'clickY': 0,
            'nodes': [{
                'id':node.id, 
                'x':node.x, 
                'y':node.y, 
                'width':node.width, 
                'height':node.height, 
                'text':node.text
                } for node in Node.objects.all().values()
            ],
            'tree': _build_tree(),
            'nodeWidth': file.node_width,
            'nodeHeight': file.node_height,
            'lastId': file.last_id,
            'selectedId': file.selected_id,
            'writingId': None,
        }
        return JsonResponse(file, safe=False)
    return HttpResponseNotAllowed(['GET'])