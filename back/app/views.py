from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import File, Node, Leaf
import json
from json.decoder import JSONDecodeError

@csrf_exempt
def files_list(request):
    if request.method == 'GET':
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
        'id': leaf['local_id'], 
        'parentId': leaf['parent_id'], 
        'children': [], 
        'leafSize': leaf['leaf_size'], 
        'offsetX': leaf['offset_x'], 
        'offsetY': leaf['offset_y']
    } for leaf in Leaf.objects.all().values()]
    # print(tree, leaves)
    for leaf in leaves:
        if leaf['parentId'] == leaf['id']:
            tree.append(leaf)
            leaves.remove(leaf)
    # print(tree, leaves)
    for leaf in leaves:
        if leaf['parentId'] == leaf['id']:
            tree.append(leaf)
            leaves.remove(leaf)
    # print(tree, leaves)
    return _add_children(tree, leaves)

def _flatten(tree):
    ret = []
    for leaf in tree:
        ret.append(leaf)
        ret += _flatten(leaf['children'])
    return ret

@csrf_exempt
def create_file(request):
    if request.method == 'POST':
        file = File()
        file.save()
        node = Node(file=file, local_id=0)
        node.save()
        leaf = Leaf(file=file, local_id=0, parent_id=0)
        leaf.save()
        return HttpResponse(f'posted file({file.id})')
    return HttpResponseNotAllowed(['POST'])

@csrf_exempt
def file(request, file_id):
    if request.method == 'GET':
        file = File.objects.get(id=file_id)
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
            'elements': [{
                'id':node['local_id'], 
                'x':node['x'], 
                'y':node['y'], 
                'width':node['width'], 
                'height':node['height'], 
                'text':node['text']
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
    elif request.method == 'PATCH':
        try:
            data = request.body.decode()
            data = json.loads(data)
            file = File.objects.get(id=file_id)
            if 'zoomRatio' in data:
                file.zoom_ratio = data['zoomRatio']
            if 'x' in data:
                file.x = data['x']
            if 'y' in data:
                file.y = data['y']
            if 'nodeWidth' in data:
                file.node_width = data['nodeWidth']
            if 'nodeHeight' in data:
                file.node_height = data['nodeHeight']
            if 'lastId' in data:
                file.last_id = data['lastId']
            if 'selectedId' in data:
                file.selected_id = data['selectedId']
            if 'elements' in data:
                for element in data['elements']:
                    node, _ = Node.objects.get_or_create(file=file, local_id=element['id'])
                    node.x = element['x']
                    node.y = element['y']
                    node.width = element['width']
                    node.height = element['height']
                    node.text = element['text']
                    node.save()
            if 'tree' in data:
                tree = _flatten(data['tree'])
                for node in tree:
                    leaf, _ = Leaf.objects.get_or_create(file=file, local_id=node['id'])
                    leaf.parent_id = node['parentId']
                    leaf.leaf_size = node['leafSize']
                    leaf.offset_x = node['offsetX']
                    leaf.offset_y = node['offsetY']
                    leaf.save()
            file.save()
        except (KeyError, JSONDecodeError) as e:
            return HttpResponseBadRequest()
        return HttpResponse(f'updated file({file_id})')
    elif request.method == 'DELETE':
        File.objects.get(id=file_id).delete()
        return HttpResponse(f'deleted file({file_id})')

    return HttpResponseNotAllowed(['GET', 'PATCH', 'DELETE'])