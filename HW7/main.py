import sys

with open(sys.argv[1], 'r') as file:
    data = file.read().split('\n')
    for string in data:
        print(f"{string} {hash(string) % int(sys.argv[2])}")
