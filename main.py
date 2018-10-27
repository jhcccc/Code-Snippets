import sys
from collections import Counter
mindmap = open(sys.argv[1],'r')
essay = open("EssayDraft.txt","w+")
lines = mindmap.readlines()
for line in lines:
    c=Counter(line)
    if c['\t']>=3:
        line = line.lstrip()
        essay.write(line)