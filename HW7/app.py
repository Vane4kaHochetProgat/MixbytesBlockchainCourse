import os
import sys

if len(sys.argv) == 4:
    file = sys.argv[1]
    if not sys.argv[2].isnumeric():
        print("Second argument must be a number of tickets")
        exit(1)
    number = sys.argv[2]
    if not sys.argv[2].isnumeric():
        print("Third argument must be a seed number")
        exit(1)
    seed = sys.argv[3]
    os.environ['PYTHONHASHSEED'] = seed
    os.execv(sys.executable, ['python3'] + ["main.py"] + [file, number])
else:
    print("Program needs three arguments")
    exit(0)
