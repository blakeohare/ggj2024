# Build Script
# This compiles the raw game code into a redistributable plain-HTML/JS web bundle.
import base64
import json
import os
import shutil
import sys

def file_read_text(path):
    c = open(path.replace('/', os.sep), 'rt')
    t = c.read().replace('\r\n', '\n')
    c.close()
    return t

def file_read_base64(path):
    c = open(path.replace('/', os.sep), 'rb')
    b = c.read()
    c.close()
    return base64.b64encode(b).decode('ascii')

def file_write_text(path, content):
    c = open(path.replace('/', os.sep), 'wt', newline = '\n')
    c.write(content)
    c.close()

def get_file_paths(path):
    output = []
    get_file_paths_impl(path, '', output)
    return output

def get_file_paths_impl(abs, rel, output):
    for file in os.listdir(abs.replace('/', os.sep)):
        file_abs = abs + '/' + file
        file_rel = file if rel == '' else (rel + '/' + file)
        if os.path.isdir(file_abs):
            get_file_paths_impl(file_abs, file_rel, output)
        else:
            output.append(file_rel)

def main(args):
    if not os.path.isdir('bin'):
        os.mkdir('bin')

    build_resources()
    build_roflang()

    print("Done")

def build_roflang():
    files = get_file_paths('rofl')
    lookup = {}
    for file in files:
        if file.endswith('.js'):
            lookup[file] = file_read_text('rofl/' + file)

    sb = []
    do_inclusions('index.js', lookup, sb)

    final_code = ''.join(sb).strip() + '\n'
    file_write_text('bin/rofl.js', final_code)

def simplify_path(path):
    parts = path.split('/')
    sb = []
    for part in parts:
        if part == '' or part == '.':
            pass
        elif part == '..':
            sb.pop()
        else:
            sb.append(part)
    return '/'.join(sb)

def do_inclusions(path, lookup, sb):
    path = simplify_path(path)
    code = lookup[path]

    parts = code.split('TEXT_INCLUDE(\'')
    sb.append(parts[0])
    for part in parts[1:]:
        subparts = part.split('\')')
        next_file_path = path + '/../' + subparts[0]
        rest_code = '\')'.join(subparts[1:])
        if rest_code[:1] == ';':
            rest_code = rest_code[1:]
        do_inclusions(next_file_path, lookup, sb)
        sb.append(rest_code)

def build_resources():
    game_files = get_file_paths('game')
    game_file_lookup = {}
    for file in game_files:
        if file.endswith('.rofl'):
            game_file_lookup[file] = file_read_text('game/' + file)
        elif file.endswith('.png'):
            game_file_lookup[file] = file_read_base64('game/' + file)
        else:
            pass

    file_write_text('bin/resources.js', ''.join([
        'const GAME_RESOURCES = ',
        json.dumps(game_file_lookup, indent = '  '),
        ';\n',
    ]))

if __name__ == "__main__":
    main(sys.argv[1:])
